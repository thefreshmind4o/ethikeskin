'use strict';

const assert = require('node:assert/strict');
const { hashEvent } = require('./ethikeskin-policy-pipeline');
const { createEnforcementGateway } = require('./ethikeskin-enforcement-gateway');

const EVENT = {
  query_event_id: '1c9d6f2a-77b1-4a6e-9c3f-2b8e5d4a1f77',
  text: 'Wir können miteinander handeln.'
};

function allowedResult(event = EVENT, overrides = {}) {
  return {
    accepted: true,
    wirksame_entscheidung: 'erlaubt',
    ursache: 'keine',
    policy_decision: {
      entscheidungs_id: '8f14e45f-ea0d-4b2c-9f21-6a1b2c3d4e5f',
      anfrage_ref: {
        query_event_id: event.query_event_id,
        eingangs_hash: hashEvent(event)
      },
      gueltigkeit: {
        gueltig_bis: '2026-08-16T13:00:00.000Z'
      }
    },
    enforcement: {
      wirksame_entscheidung: 'erlaubt',
      fehlende_auflagen: []
    },
    ...overrides
  };
}

(async () => {
  const auditLog = [];
  let executions = 0;
  const gateway = createEnforcementGateway({
    runPolicyPipeline: async (event) => allowedResult(event),
    audit: async (record) => auditLog.push(record),
    now: () => new Date('2026-08-16T12:30:00.000Z')
  });

  const success = await gateway({
    queryEvent: EVENT,
    execute: async () => { executions += 1; return { ok: true }; }
  });
  assert.equal(success.executed, true);
  assert.equal(executions, 1);
  assert.equal(auditLog[0].typ, 'permit_before_execution');
  assert.equal(auditLog[1].typ, 'execution_success');

  executions = 0;
  const deniedGateway = createEnforcementGateway({
    runPolicyPipeline: async () => ({ accepted: false, wirksame_entscheidung: 'verweigert', ursache: 'query_event_ungueltig' }),
    audit: async () => {},
    now: () => new Date('2026-08-16T12:30:00.000Z')
  });
  const denied = await deniedGateway({ queryEvent: EVENT, execute: async () => { executions += 1; } });
  assert.equal(denied.executed, false);
  assert.equal(executions, 0);

  const expiredGateway = createEnforcementGateway({
    runPolicyPipeline: async (event) => allowedResult(event),
    audit: async () => {},
    now: () => new Date('2026-08-16T13:00:00.000Z')
  });
  const expired = await expiredGateway({ queryEvent: EVENT, execute: async () => { executions += 1; } });
  assert.equal(expired.ursache, 'entscheidung_abgelaufen');

  const mismatchGateway = createEnforcementGateway({
    runPolicyPipeline: async () => allowedResult({ ...EVENT, text: 'anderer Inhalt' }),
    audit: async () => {},
    now: () => new Date('2026-08-16T12:30:00.000Z')
  });
  const mismatch = await mismatchGateway({ queryEvent: EVENT, execute: async () => { executions += 1; } });
  assert.equal(mismatch.ursache, 'eingangs_hash_abweichend');

  const obligationGateway = createEnforcementGateway({
    runPolicyPipeline: async (event) => allowedResult(event, {
      enforcement: { wirksame_entscheidung: 'erlaubt', fehlende_auflagen: ['AUF-103'] }
    }),
    audit: async () => {},
    now: () => new Date('2026-08-16T12:30:00.000Z')
  });
  const obligation = await obligationGateway({ queryEvent: EVENT, execute: async () => { executions += 1; } });
  assert.equal(obligation.ursache, 'auflage_nicht_erfuellt');

  const auditFailureGateway = createEnforcementGateway({
    runPolicyPipeline: async (event) => allowedResult(event),
    audit: async () => { throw new Error('Audit offline'); },
    now: () => new Date('2026-08-16T12:30:00.000Z')
  });
  const auditFailure = await auditFailureGateway({ queryEvent: EVENT, execute: async () => { executions += 1; } });
  assert.equal(auditFailure.ursache, 'audit_nicht_verfuegbar');

  const pipelineFailureGateway = createEnforcementGateway({
    runPolicyPipeline: async () => { throw new Error('Pipeline offline'); },
    audit: async () => {},
    now: () => new Date('2026-08-16T12:30:00.000Z')
  });
  const pipelineFailure = await pipelineFailureGateway({ queryEvent: EVENT, execute: async () => { executions += 1; } });
  assert.equal(pipelineFailure.ursache, 'pipeline_ausnahme');

  const actionFailureGateway = createEnforcementGateway({
    runPolicyPipeline: async (event) => allowedResult(event),
    audit: async () => {},
    now: () => new Date('2026-08-16T12:30:00.000Z')
  });
  const actionFailure = await actionFailureGateway({
    queryEvent: EVENT,
    execute: async () => { throw new Error('Aktion fehlgeschlagen'); }
  });
  assert.equal(actionFailure.accepted, true);
  assert.equal(actionFailure.executed, false);
  assert.equal(actionFailure.ursache, 'ausfuehrung_fehlgeschlagen');

  console.log('EthikeSkin enforcement gateway: 8 tests passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
