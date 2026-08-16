'use strict';

const assert = require('node:assert/strict');
const { hashEvent, createPolicyPipeline } = require('./ethikeskin-policy-pipeline');

const ID = '1c9d6f2a-77b1-4a6e-9c3f-2b8e5d4a1f77';
const EVENT = { query_event_id: ID, text: 'Wir können miteinander handeln.' };

function evaluation(overrides = {}) {
  return {
    entscheidung: 'erlaubt',
    regel_id: 'ESK-001-kapazitaet-geprueft',
    regel_version: '1.0.0',
    begruendung_code: 'alle_pruefungen_bestanden',
    begruendung_text: 'Kapazität und Expositionsregime wurden vollständig geprüft.',
    zeitpunkt: '2026-08-16T12:20:00.000Z',
    ttl_sekunden: 300,
    kapazitaet: {
      schadensschwere: 'I',
      reversibilitaet: 'reversibel',
      expositionsregime: 'tropfen',
      containment: 'ausschliessend',
      trageform: 'integriert'
    },
    ...overrides
  };
}

assert.equal(hashEvent({ b: 2, a: 1 }), hashEvent({ a: 1, b: 2 }));

const allowPipeline = createPolicyPipeline({
  validateQueryEvent: () => true,
  evaluate: () => evaluation()
});
const allowed = allowPipeline(EVENT);
assert.equal(allowed.accepted, true);
assert.equal(allowed.phase, 'enforcement');
assert.equal(allowed.policy_decision.anfrage_ref.eingangs_hash, hashEvent(EVENT));

const invalidQueryPipeline = createPolicyPipeline({
  validateQueryEvent: () => ({ valid: false, errors: ['text fehlt'] }),
  evaluate: () => evaluation()
});
const invalidQuery = invalidQueryPipeline(EVENT);
assert.equal(invalidQuery.accepted, false);
assert.equal(invalidQuery.ursache, 'query_event_ungueltig');

const missingId = allowPipeline({ text: 'ohne ID' });
assert.equal(missingId.accepted, false);
assert.equal(missingId.ursache, 'query_event_id_fehlt');

const brokenEvaluator = createPolicyPipeline({
  validateQueryEvent: () => true,
  evaluate: () => { throw new Error('Regelwerk offline'); }
});
const evaluatorFailure = brokenEvaluator(EVENT);
assert.equal(evaluatorFailure.accepted, false);
assert.equal(evaluatorFailure.ursache, 'evaluator_fehler');

const immersionPipeline = createPolicyPipeline({
  validateQueryEvent: () => true,
  evaluate: () => evaluation({
    kapazitaet: {
      schadensschwere: 'III',
      reversibilitaet: 'irreversibel',
      expositionsregime: 'immersion',
      containment: 'einlassend_temperierend',
      trageform: 'umgebungsgebunden',
      dauer: { zeitbudget_min: 50, budget_erschoepft: false },
      durchsatz: { limit_pro_stunde: 3, gemessen: 2, ausgetauscht: false },
      ausstieg: { protokoll_erforderlich: true, stufen: [{ stufe: 'abschluss', dauer_min: 3 }] },
      versorgung: { partner_pflicht: true, partner_ref: 'buddy-1' }
    }
  })
});
const blocked = immersionPipeline(EVENT, { erfuellte_auflagen: ['AUF-101'] });
assert.equal(blocked.accepted, false);
assert.equal(blocked.ursache, 'auflage_nicht_erfuellbar');

const fulfilledIds = ['AUF-101', 'AUF-102', 'AUF-103', 'AUF-104', 'AUF-106'];
const fulfilled = immersionPipeline(EVENT, { erfuellte_auflagen: fulfilledIds });
assert.equal(fulfilled.accepted, true);

const moltenPipeline = createPolicyPipeline({
  validateQueryEvent: () => true,
  evaluate: () => evaluation({
    kapazitaet: {
      schadensschwere: 'III',
      reversibilitaet: 'irreversibel',
      expositionsregime: 'spritzer',
      containment: 'ausschliessend',
      trageform: 'koerpergebunden',
      lastklasse: 'E3',
      ueberschritten: true,
      versorgung: { partner_pflicht: false, supervision_ref: 'fachaufsicht-1' }
    }
  })
});
const molten = moltenPipeline(EVENT, { erfuellte_auflagen: ['AUF-106'] });
assert.equal(molten.accepted, false);
assert.equal(molten.ursache, 'schutzwirkung_aufgehoben');

console.log('EthikeSkin policy pipeline: 8 tests passed');
