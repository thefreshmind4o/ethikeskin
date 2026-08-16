'use strict';

const { hashEvent } = require('./ethikeskin-policy-pipeline');

function deny(ursache, phase, extras = {}) {
  return Object.freeze({
    accepted: false,
    executed: false,
    wirksame_entscheidung: 'verweigert',
    phase,
    ursache,
    ...extras
  });
}

function createEnforcementGateway(options = {}) {
  const runPolicyPipeline = options.runPolicyPipeline;
  const audit = options.audit;
  const now = typeof options.now === 'function' ? options.now : () => new Date();

  if (typeof runPolicyPipeline !== 'function') {
    throw new TypeError('runPolicyPipeline muss eine Funktion sein');
  }
  if (typeof audit !== 'function') {
    throw new TypeError('audit muss eine Funktion sein; ohne Audit kein Vollzug');
  }

  async function safeAudit(record) {
    try {
      await audit(Object.freeze({ ...record }));
      return true;
    } catch (_) {
      return false;
    }
  }

  return async function enforce(request = {}) {
    const queryEvent = request.queryEvent;
    const context = request.context || {};
    const execute = request.execute;

    if (!queryEvent || typeof queryEvent !== 'object' || Array.isArray(queryEvent)) {
      const result = deny('query_event_fehlt', 'gateway_input');
      await safeAudit({ typ: 'deny', ursache: result.ursache, phase: result.phase });
      return result;
    }
    if (typeof execute !== 'function') {
      const result = deny('execute_fehlt', 'gateway_input');
      await safeAudit({ typ: 'deny', ursache: result.ursache, phase: result.phase });
      return result;
    }

    let pipelineResult;
    try {
      pipelineResult = await runPolicyPipeline(queryEvent, context);
    } catch (error) {
      const result = deny('pipeline_ausnahme', 'pipeline', { errors: Object.freeze([error.message]) });
      await safeAudit({ typ: 'deny', ursache: result.ursache, phase: result.phase });
      return result;
    }

    const allowed = pipelineResult &&
      pipelineResult.accepted === true &&
      pipelineResult.wirksame_entscheidung === 'erlaubt' &&
      pipelineResult.enforcement &&
      pipelineResult.enforcement.wirksame_entscheidung === 'erlaubt';

    if (!allowed) {
      const result = deny(
        pipelineResult && pipelineResult.ursache ? pipelineResult.ursache : 'pipeline_nicht_freigegeben',
        'enforcement',
        { policy_result: pipelineResult || null }
      );
      await safeAudit({ typ: 'deny', ursache: result.ursache, phase: result.phase });
      return result;
    }

    const decision = pipelineResult.policy_decision;
    if (!decision || !decision.anfrage_ref || !decision.gueltigkeit) {
      const result = deny('policy_nachweis_unvollstaendig', 'pre_execution');
      await safeAudit({ typ: 'deny', ursache: result.ursache, phase: result.phase });
      return result;
    }

    const currentHash = hashEvent(queryEvent);
    if (currentHash !== decision.anfrage_ref.eingangs_hash) {
      const result = deny('eingangs_hash_abweichend', 'pre_execution');
      await safeAudit({ typ: 'deny', ursache: result.ursache, phase: result.phase });
      return result;
    }

    const expiry = Date.parse(decision.gueltigkeit.gueltig_bis);
    const nowValue = now();
    const nowMs = nowValue instanceof Date ? nowValue.getTime() : new Date(nowValue).getTime();
    if (!Number.isFinite(expiry) || !Number.isFinite(nowMs) || nowMs >= expiry) {
      const result = deny('entscheidung_abgelaufen', 'pre_execution');
      await safeAudit({ typ: 'deny', ursache: result.ursache, phase: result.phase });
      return result;
    }

    const missing = pipelineResult.enforcement.fehlende_auflagen || [];
    if (!Array.isArray(missing) || missing.length > 0) {
      const result = deny('auflage_nicht_erfuellt', 'pre_execution', {
        fehlende_auflagen: Object.freeze(Array.isArray(missing) ? [...missing] : ['unbestimmt'])
      });
      await safeAudit({ typ: 'deny', ursache: result.ursache, phase: result.phase });
      return result;
    }

    const auditAccepted = await safeAudit({
      typ: 'permit_before_execution',
      entscheidungs_id: decision.entscheidungs_id,
      query_event_id: decision.anfrage_ref.query_event_id,
      eingangs_hash: currentHash,
      gueltig_bis: decision.gueltigkeit.gueltig_bis
    });
    if (!auditAccepted) {
      return deny('audit_nicht_verfuegbar', 'pre_execution');
    }

    try {
      const output = await execute(Object.freeze({
        queryEvent: Object.freeze({ ...queryEvent }),
        context: Object.freeze({ ...context }),
        policyDecision: decision
      }));
      await safeAudit({
        typ: 'execution_success',
        entscheidungs_id: decision.entscheidungs_id,
        eingangs_hash: currentHash
      });
      return Object.freeze({
        accepted: true,
        executed: true,
        wirksame_entscheidung: 'erlaubt',
        phase: 'executed',
        ursache: 'keine',
        entscheidungs_id: decision.entscheidungs_id,
        output
      });
    } catch (error) {
      await safeAudit({
        typ: 'execution_failure',
        entscheidungs_id: decision.entscheidungs_id,
        eingangs_hash: currentHash,
        fehler: error.message
      });
      return Object.freeze({
        accepted: true,
        executed: false,
        wirksame_entscheidung: 'erlaubt',
        phase: 'execution_failure',
        ursache: 'ausfuehrung_fehlgeschlagen',
        entscheidungs_id: decision.entscheidungs_id,
        errors: Object.freeze([error.message])
      });
    }
  };
}

module.exports = Object.freeze({ createEnforcementGateway });
