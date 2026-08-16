'use strict';

const pruefung = require('node:assert/strict');
const { leiteKapazitaetAb, erzwingeWirksameEntscheidung } = require('./ethikeskin-kapazitaetsregelwerk');

function grundfall(abweichungen = {}) {
  return {
    schadensschwere: 'I',
    reversibilitaet: 'reversibel',
    expositionsregime: 'tropfen',
    containment: 'ausschliessend',
    trageform: 'integriert',
    ...abweichungen
  };
}

const kapuze = leiteKapazitaetAb(grundfall());
pruefung.equal(kapuze.schutzwirkung, 'wirksam');
pruefung.deepEqual(kapuze.auflagen_erzwungen, []);

const schirm = leiteKapazitaetAb(grundfall({
  trageform: 'handgehalten_teilbar',
  schirm: { weglegbar_jederzeit: true, versagt_bei: ['seitenlast'] }
}));
pruefung.deepEqual(schirm.auflagen_erzwungen, ['AUF-105']);

const immersion = leiteKapazitaetAb(grundfall({
  schadensschwere: 'III',
  reversibilitaet: 'irreversibel',
  expositionsregime: 'immersion',
  containment: 'einlassend_temperierend',
  trageform: 'umgebungsgebunden',
  dauer: { zeitbudget_min: 50, budget_erschoepft: false },
  durchsatz: { limit_pro_stunde: 3, gemessen: 2, ausgetauscht: false },
  ausstieg: { protokoll_erforderlich: true, stufen: [{ stufe: 'abschluss', dauer_min: 3 }] },
  versorgung: { partner_pflicht: true, partner_ref: 'begleitung-1' }
}));
pruefung.equal(immersion.schutzwirkung, 'wirksam');
pruefung.deepEqual(immersion.auflagen_erzwungen, ['AUF-101', 'AUF-102', 'AUF-103', 'AUF-104', 'AUF-106']);

const ausgetauscht = leiteKapazitaetAb(grundfall({
  containment: 'einlassend_temperierend',
  durchsatz: { limit_pro_stunde: 3, gemessen: 4, ausgetauscht: true }
}));
pruefung.equal(ausgetauscht.schutzwirkung, 'aufgehoben');
pruefung.ok(ausgetauscht.gruende.includes('durchsatz_ueberschritten_oder_ausgetauscht'));

const verweigert = erzwingeWirksameEntscheidung(
  { entscheidung: 'erlaubt', wirksame_entscheidung: 'erlaubt' },
  ausgetauscht
);
pruefung.equal(verweigert.wirksame_entscheidung, 'verweigert');
pruefung.equal(verweigert.fail_closed.ursache, 'schutzwirkung_aufgehoben');

pruefung.throws(() => leiteKapazitaetAb(grundfall({
  expositionsregime: 'immersion',
  trageform: 'handgehalten_teilbar'
})), /unvereinbar/);

pruefung.throws(() => leiteKapazitaetAb(grundfall({
  schadensschwere: 'III',
  reversibilitaet: 'reversibel',
  versorgung: { partner_pflicht: true }
})), /nicht als reversibel/);

console.log('EthikeSkin Kapazitaetsregelwerk: 7 Pruefungen bestanden');
