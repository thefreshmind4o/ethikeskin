'use strict';

const assert = require('assert');
const { validateQueryEvent } = require('./ethikeskin-v13-query-event');
function base() { return { query_id: 'q-20260808-a1b2c3d4', ethikeskin_version: 'v1.3', zugeordnete_achsen: ['PSY', 'SOZ', 'ASTRO'], kopplung_id: 'coupling:11', richtung: { ausgewiesen: true, source_axis: 'PSY', target_axis: 'SOZ' }, vetos_geprueft: [], blockiert: { ist_blockiert: false, eskalationsstufe: null }, vulnerabilitaets_pruefung: { asymmetrie_erkannt: false, vulnerable_position: null, zuerst_bewertet: false, leitplanke_c_bezug: false, vulnerabilitaets_zuerst_status: 'offen' }, r_es_pruefung: [] }; }
assert.equal(validateQueryEvent(base()).valid, true);
const missingDirection = base(); missingDirection.richtung = { ausgewiesen: false, source_axis: null, target_axis: null }; assert.equal(validateQueryEvent(missingDirection).valid, false);
const hardFail = base(); hardFail.vetos_geprueft = [{ regel: 'RICHTUNG_AUSWEISEN', ergebnis: 'fail' }]; assert.equal(validateQueryEvent(hardFail).valid, false); hardFail.blockiert = { ist_blockiert: true, eskalationsstufe: 'block' }; assert.equal(validateQueryEvent(hardFail).valid, true);
const autonomy = base(); autonomy.vetos_geprueft = [{ regel: 'AUTONOMIE_WAHREN', ergebnis: 'fail' }]; autonomy.blockiert = { ist_blockiert: true, eskalationsstufe: 'block' }; assert.equal(validateQueryEvent(autonomy).valid, false); autonomy.blockiert.eskalationsstufe = 'human_review'; assert.equal(validateQueryEvent(autonomy).valid, true);
const vulnerable = base(); vulnerable.vulnerabilitaets_pruefung = { asymmetrie_erkannt: true, vulnerable_position: 'Kind', zuerst_bewertet: true, leitplanke_c_bezug: true, vulnerabilitaets_zuerst_status: 'fail' }; vulnerable.blockiert = { ist_blockiert: true, eskalationsstufe: 'human_review' }; assert.equal(validateQueryEvent(vulnerable).valid, true);
const autoimmune = base(); autoimmune.r_es_pruefung = [{ id: 'R-ES-004', verdikt: 'verletzt', autoimmunitaet: true }]; assert.equal(validateQueryEvent(autoimmune).valid, false);
console.log('EthikeSkin v1.3 query-event tests: 6/6 passed');
