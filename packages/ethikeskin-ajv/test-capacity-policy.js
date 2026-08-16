'use strict';

const assert = require('node:assert/strict');
const { deriveCapacity, enforceEffectiveDecision } = require('./ethikeskin-capacity-policy');

function base(overrides = {}) {
  return {
    schadensschwere: 'I',
    reversibilitaet: 'reversibel',
    expositionsregime: 'tropfen',
    containment: 'ausschliessend',
    trageform: 'integriert',
    ...overrides
  };
}

const hood = deriveCapacity(base());
assert.equal(hood.schutzwirkung, 'wirksam');
assert.deepEqual(hood.auflagen_erzwungen, []);

const umbrella = deriveCapacity(base({
  trageform: 'handgehalten_teilbar',
  schirm: { weglegbar_jederzeit: true, versagt_bei: ['seitenlast'] }
}));
assert.deepEqual(umbrella.auflagen_erzwungen, ['AUF-105']);

const immersion = deriveCapacity(base({
  schadensschwere: 'III',
  reversibilitaet: 'irreversibel',
  expositionsregime: 'immersion',
  containment: 'einlassend_temperierend',
  trageform: 'umgebungsgebunden',
  dauer: { zeitbudget_min: 50, budget_erschoepft: false },
  durchsatz: { limit_pro_stunde: 3, gemessen: 2, ausgetauscht: false },
  ausstieg: { protokoll_erforderlich: true, stufen: [{ stufe: 'abschluss', dauer_min: 3 }] },
  versorgung: { partner_pflicht: true, partner_ref: 'buddy-1' }
}));
assert.equal(immersion.schutzwirkung, 'wirksam');
assert.deepEqual(immersion.auflagen_erzwungen, ['AUF-101', 'AUF-102', 'AUF-103', 'AUF-104', 'AUF-106']);

const exchanged = deriveCapacity(base({
  containment: 'einlassend_temperierend',
  durchsatz: { limit_pro_stunde: 3, gemessen: 4, ausgetauscht: true }
}));
assert.equal(exchanged.schutzwirkung, 'aufgehoben');
assert.ok(exchanged.gruende.includes('durchsatz_ueberschritten_oder_ausgetauscht'));

const denied = enforceEffectiveDecision(
  { entscheidung: 'erlaubt', wirksame_entscheidung: 'erlaubt' },
  exchanged
);
assert.equal(denied.wirksame_entscheidung, 'verweigert');
assert.equal(denied.fail_closed.ursache, 'schutzwirkung_aufgehoben');

assert.throws(() => deriveCapacity(base({
  expositionsregime: 'immersion',
  trageform: 'handgehalten_teilbar'
})), /unvereinbar/);

assert.throws(() => deriveCapacity(base({
  schadensschwere: 'III',
  reversibilitaet: 'reversibel',
  versorgung: { partner_pflicht: true }
})), /nicht als reversibel/);

console.log('EthikeSkin capacity policy: 7 tests passed');
