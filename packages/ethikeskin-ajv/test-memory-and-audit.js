'use strict';

const assert = require('node:assert/strict');
const { createExposureMemory } = require('./ethikeskin-exposure-memory');
const { createAuditChain, GENESIS } = require('./ethikeskin-audit-chain');

const SUBJECT = 'pseudo-001';
const T0 = '2026-08-16T10:00:00.000Z';

const empty = createExposureMemory({ now: () => new Date(T0) });
const emptyState = empty.state(SUBJECT);
assert.equal(emptyState.restsaettigung, 0);
assert.equal(emptyState.gesperrt, false);

const memory = createExposureMemory({ now: () => new Date(T0) });
memory.record(SUBJECT, { expositionsregime: 'immersion', dauer_min: 60, zeitpunkt: T0 });
const afterDive = memory.state(SUBJECT, new Date(T0));
assert.equal(afterDive.restsaettigung, 1);
assert.equal(afterDive.gesperrt, true);
assert.equal(afterDive.gesperrt_bis, '2026-08-16T13:00:00.000Z');

const afterLockout = memory.state(SUBJECT, new Date('2026-08-16T13:00:01.000Z'));
assert.equal(afterLockout.gesperrt, false);
assert.ok(afterLockout.restsaettigung < 1);

const afterHalfLife = memory.state(SUBJECT, new Date('2026-08-16T16:00:00.000Z'));
assert.ok(Math.abs(afterHalfLife.restsaettigung - 0.5) < 0.001);

const applied = memory.applyToCapacity({
  schadensschwere: 'III',
  reversibilitaet: 'irreversibel',
  expositionsregime: 'immersion',
  containment: 'einlassend_temperierend',
  trageform: 'umgebungsgebunden',
  dauer: { zeitbudget_min: 50 },
  durchsatz: { limit_pro_stunde: 3, gemessen: 0, ausgetauscht: false }
}, SUBJECT, new Date('2026-08-16T10:30:00.000Z'));
assert.equal(applied.kapazitaet.dauer.budget_erschoepft, true);
assert.equal(applied.kapazitaet.durchsatz.gemessen, 1);

memory.forget(SUBJECT);
assert.equal(memory.state(SUBJECT).ereignisse, 0);

const chain = createAuditChain({ now: () => new Date(T0) });
assert.equal(chain.head(), GENESIS);
const first = chain.append({ typ: 'permit_before_execution', payload: { a: 1, b: 2 } });
const second = chain.append({ typ: 'deny', payload: { b: 2, a: 1 } });
assert.equal(first.appended, true);
assert.equal(second.eintrag.prev_hash, first.eintrag.entry_hash);
assert.equal(first.eintrag.payload_hash, second.eintrag.payload_hash);
assert.equal(chain.verify().valid, true);

const limited = createAuditChain({ now: () => new Date(T0), max_nicht_deny_pro_sekunde: 1 });
limited.append({ typ: 'execution_success', zeitpunkt: T0 });
const droppedResult = limited.append({ typ: 'execution_success', zeitpunkt: T0 });
const denyResult = limited.append({ typ: 'deny', zeitpunkt: T0 });
assert.equal(droppedResult.appended, false);
assert.equal(denyResult.appended, true);
assert.equal(limited.statistik().verworfen, 1);

const tampered = createAuditChain({ now: () => new Date(T0) });
tampered.append({ typ: 'deny', payload: { grund: 'original' } });
tampered.append({ typ: 'deny', payload: { grund: 'zweiter' } });
const mutable = tampered.snapshot().map((entry) => ({ ...entry }));
mutable[0].payload_hash = '0'.repeat(64);
const replay = createAuditChain({ entries: mutable, now: () => new Date(T0) });
const verdict = replay.verify();
assert.equal(verdict.valid, false);
assert.equal(verdict.bruch_bei, 0);
assert.equal(verdict.grund, 'eintrag_veraendert');

const anchored = chain.anchor();
assert.equal(anchored.laenge, 2);
assert.equal(anchored.kopf, chain.head());

console.log('EthikeSkin memory and audit chain: 9 tests passed');
