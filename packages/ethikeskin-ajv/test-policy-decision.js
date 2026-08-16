'use strict';

const assert = require('node:assert/strict');
const { buildPolicyDecision, enforceObligations } = require('./ethikeskin-policy-decision');

const HASH = 'a'.repeat(64);
const ID = '1c9d6f2a-77b1-4a6e-9c3f-2b8e5d4a1f77';

function base(overrides = {}) {
  return {
    query_event_id: ID,
    eingangs_hash: HASH,
    entscheidung: 'erlaubt',
    regel_id: 'ESK-001-kapazitaet-geprueft',
    regel_version: '1.0.0',
    begruendung_code: 'alle_pruefungen_bestanden',
    begruendung_text: 'Kapazität und Expositionsregime wurden vollständig geprüft.',
    zeitpunkt: '2026-08-16T11:40:00.000Z',
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

const allowed = buildPolicyDecision(base());
assert.equal(allowed.wirksame_entscheidung, 'erlaubt');
assert.equal(allowed.fail_closed.ausgeloest, false);
assert.equal(allowed.gueltigkeit.nach_ablauf, 'verweigert');

const indeterminate = buildPolicyDecision(base({ entscheidung: 'unbestimmt' }));
assert.equal(indeterminate.wirksame_entscheidung, 'verweigert');
assert.equal(indeterminate.fail_closed.ursache, 'entscheidung_unbestimmt');

const notApplicable = buildPolicyDecision(base({ entscheidung: 'nicht_zutreffend' }));
assert.equal(notApplicable.wirksame_entscheidung, 'verweigert');
assert.equal(notApplicable.fail_closed.ursache, 'keine_regel_zutreffend');

const immersion = buildPolicyDecision(base({
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
}));
assert.deepEqual(immersion.auflagen.map((item) => item.auflage_id), [
  'AUF-101', 'AUF-102', 'AUF-103', 'AUF-104', 'AUF-106'
]);

const blockedByObligations = enforceObligations(immersion, ['AUF-101', 'AUF-102']);
assert.equal(blockedByObligations.wirksame_entscheidung, 'verweigert');
assert.equal(blockedByObligations.fail_closed.ursache, 'auflage_nicht_erfuellbar');
assert.deepEqual(blockedByObligations.fehlende_auflagen, ['AUF-103', 'AUF-104', 'AUF-106']);

const fulfilled = enforceObligations(immersion, immersion.auflagen.map((item) => item.auflage_id));
assert.equal(fulfilled.wirksame_entscheidung, 'erlaubt');
assert.deepEqual(fulfilled.fehlende_auflagen, []);

const molten = buildPolicyDecision(base({
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
}));
assert.equal(molten.wirksame_entscheidung, 'verweigert');
assert.equal(molten.fail_closed.ursache, 'schutzwirkung_aufgehoben');

assert.throws(() => buildPolicyDecision(base({ eingangs_hash: 'ungültig' })), /SHA-256/);
assert.throws(() => buildPolicyDecision(base({ begruendung_text: 'zu kurz' })), /mindestens 20/);

console.log('EthikeSkin policy decision: 8 tests passed');
