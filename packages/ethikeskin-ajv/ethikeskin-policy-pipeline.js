'use strict';

const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');
const queryEventModule = require('./ethikeskin-v13-query-event');
const { buildPolicyDecision, enforceObligations } = require('./ethikeskin-policy-decision');

function canonicalize(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function hashEvent(event) {
  return createHash('sha256').update(canonicalize(event), 'utf8').digest('hex');
}

function resolveQueryValidator(moduleValue = queryEventModule) {
  const candidates = [
    moduleValue && moduleValue.validateQueryEvent,
    moduleValue && moduleValue.validate,
    moduleValue && moduleValue.validator,
    typeof moduleValue === 'function' ? moduleValue : null
  ];
  const validator = candidates.find((candidate) => typeof candidate === 'function');
  if (!validator) {
    throw new TypeError('ethikeskin-v13-query-event exportiert keinen erkennbaren Validator');
  }
  return validator;
}

function normalizeValidation(result, validator) {
  if (typeof result === 'boolean') {
    return { valid: result, errors: result ? [] : (validator.errors || []) };
  }
  if (result && typeof result === 'object' && typeof result.valid === 'boolean') {
    return { valid: result.valid, errors: result.errors || [] };
  }
  throw new TypeError('Query-Validator muss Boolean oder { valid, errors } liefern');
}

function createPolicySchemaValidator() {
  const schemasDir = path.resolve(__dirname, '../../schemas');
  const capacitySchema = JSON.parse(fs.readFileSync(
    path.join(schemasDir, 'ethikeskin-v1.4.1-kapazitaet.schema.json'), 'utf8'
  ));
  const policySchema = JSON.parse(fs.readFileSync(
    path.join(schemasDir, 'ethikeskin-v1.4-policy-decision.schema.json'), 'utf8'
  ));

  const ajv = new Ajv2020({ allErrors: true, strict: false });
  ajv.addFormat('uuid', /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  ajv.addFormat('date-time', (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value)));
  ajv.addSchema(capacitySchema);
  return ajv.compile(policySchema);
}

function extractQueryEventId(queryEvent) {
  const id = queryEvent && (
    queryEvent.query_event_id ||
    queryEvent.event_id ||
    queryEvent.id
  );
  return typeof id === 'string' && id.length > 0 ? id : null;
}

function createPolicyPipeline(options = {}) {
  const queryValidator = options.validateQueryEvent || resolveQueryValidator();
  const evaluate = options.evaluate;
  if (typeof evaluate !== 'function') {
    throw new TypeError('createPolicyPipeline erfordert evaluate(queryEvent, context)');
  }
  const validatePolicy = options.validatePolicyDecision || createPolicySchemaValidator();

  return function runPolicyPipeline(queryEvent, context = {}) {
    let queryValidation;
    try {
      queryValidation = normalizeValidation(queryValidator(queryEvent), queryValidator);
    } catch (error) {
      return Object.freeze({
        accepted: false,
        wirksame_entscheidung: 'verweigert',
        phase: 'query_validation',
        ursache: 'query_validator_fehler',
        errors: Object.freeze([error.message])
      });
    }

    if (!queryValidation.valid) {
      return Object.freeze({
        accepted: false,
        wirksame_entscheidung: 'verweigert',
        phase: 'query_validation',
        ursache: 'query_event_ungueltig',
        errors: Object.freeze(queryValidation.errors)
      });
    }

    const queryEventId = extractQueryEventId(queryEvent);
    if (!queryEventId) {
      return Object.freeze({
        accepted: false,
        wirksame_entscheidung: 'verweigert',
        phase: 'query_validation',
        ursache: 'query_event_id_fehlt',
        errors: Object.freeze(['Kein query_event_id, event_id oder id vorhanden'])
      });
    }

    let evaluation;
    try {
      evaluation = evaluate(Object.freeze({ ...queryEvent }), Object.freeze({ ...context }));
    } catch (error) {
      return Object.freeze({
        accepted: false,
        wirksame_entscheidung: 'verweigert',
        phase: 'policy_evaluation',
        ursache: 'evaluator_fehler',
        errors: Object.freeze([error.message])
      });
    }

    let decision;
    try {
      decision = buildPolicyDecision({
        ...evaluation,
        query_event_id: queryEventId,
        eingangs_hash: hashEvent(queryEvent)
      });
    } catch (error) {
      return Object.freeze({
        accepted: false,
        wirksame_entscheidung: 'verweigert',
        phase: 'decision_build',
        ursache: 'decision_build_fehler',
        errors: Object.freeze([error.message])
      });
    }

    const validPolicy = validatePolicy(decision);
    if (!validPolicy) {
      return Object.freeze({
        accepted: false,
        wirksame_entscheidung: 'verweigert',
        phase: 'policy_validation',
        ursache: 'policy_decision_ungueltig',
        errors: Object.freeze(validatePolicy.errors || [])
      });
    }

    const fulfilled = Array.isArray(context.erfuellte_auflagen) ? context.erfuellte_auflagen : [];
    const enforcement = enforceObligations(decision, fulfilled);

    return Object.freeze({
      accepted: enforcement.wirksame_entscheidung === 'erlaubt',
      wirksame_entscheidung: enforcement.wirksame_entscheidung,
      phase: 'enforcement',
      ursache: enforcement.fail_closed.ursache,
      policy_decision: decision,
      enforcement
    });
  };
}

module.exports = Object.freeze({
  canonicalize,
  hashEvent,
  resolveQueryValidator,
  createPolicySchemaValidator,
  createPolicyPipeline
});
