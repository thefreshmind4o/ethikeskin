'use strict';

const pruefung = require('node:assert/strict');
const { baueEntscheidung, pruefeAuflagen } = require('./ethikeskin-policy-decision');

const HASH = 'a'.repeat(64);
const KENNUNG = '1c9d6f2a-77b1-4a6e-9c3f-2b8e5d4a1f77';

function grundfall(abweichungen = {}) {
  return {
    query_event_id: KENNUNG,
    eingangs_hash: HASH,
    entscheidung: 'erlaubt',
    regel_id: 'ESK-001-kapazitaet-geprueft',
    regel_version: '1.0.0',
    begruendung_code: 'alle_pruefungen_bestanden',
    begruendung_text: 'Kapazitaet und Expositionsregime wurden vollstaendig geprueft.',
    zeitpunkt: '2026-08-16T11:40:00.000Z',
    ttl_sekunden: 300,
    kapazitaet: {
      schadensschwere: 'I',
      reversibilitaet: 'reversibel',
      expositionsregime: 'tropfen',
      containment: 'ausschliessend',
      trageform: 'integriert'
    },
    ...abweichungen
  };
}

const erlaubt = baueEntscheidung(grundfall());
pruefung.equal(erlaubt.wirksame_entscheidung, 'erlaubt');
pruefung.equal(erlaubt.fail_closed.ausgeloest, false);
pruefung.equal(erlaubt.gueltigkeit.nach_ablauf, 'verweigert');

const unbestimmt = baueEntscheidung(grundfall({ entscheidung: 'unbestimmt' }));
pruefung.equal(unbestimmt.wirksame_entscheidung, 'verweigert');
pruefung.equal(unbestimmt.fail_closed.ursache, 'entscheidung_unbestimmt');

const nichtZutreffend = baueEntscheidung(grundfall({ entscheidung: 'nicht_zutreffend' }));
pruefung.equal(nichtZutreffend.wirksame_entscheidung, 'verweigert');
pruefung.equal(nichtZutreffend.fail_closed.ursache, 'keine_regel_zutreffend');

const immersion = baueEntscheidung(grundfall({
  kapazitaet: {
    schadensschwere: 'III',
    reversibilitaet: 'irreversibel',
    expositionsregime: 'immersion',
    containment: 'einlassend_temperierend',
    trageform: 'umgebungsgebunden',
    dauer: { zeitbudget_min: 50, budget_erschoepft: false },
    durchsatz: { limit_pro_stunde: 3, gemessen: 2, ausgetauscht: false },
    ausstieg: { protokoll_erforderlich: true, stufen: [{ stufe: 'abschluss', dauer_min: 3 }] },
    versorgung: { partner_pflicht: true, partner_ref: 'begleitung-1' }
  }
}));
pruefung.deepEqual(immersion.auflagen.map((auflage) => auflage.auflage_id), [
  'AUF-101', 'AUF-102', 'AUF-103', 'AUF-104', 'AUF-106'
]);

const blockiert = pruefeAuflagen(immersion, ['AUF-101', 'AUF-102']);
pruefung.equal(blockiert.wirksame_entscheidung, 'verweigert');
pruefung.equal(blockiert.fail_closed.ursache, 'auflage_nicht_erfuellbar');
pruefung.deepEqual(blockiert.fehlende_auflagen, ['AUF-103', 'AUF-104', 'AUF-106']);

const erfuellt = pruefeAuflagen(immersion, immersion.auflagen.map((auflage) => auflage.auflage_id));
pruefung.equal(erfuellt.wirksame_entscheidung, 'erlaubt');
pruefung.deepEqual(erfuellt.fehlende_auflagen, []);

const stahlspritzer = baueEntscheidung(grundfall({
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
pruefung.equal(stahlspritzer.wirksame_entscheidung, 'verweigert');
pruefung.equal(stahlspritzer.fail_closed.ursache, 'schutzwirkung_aufgehoben');

pruefung.throws(() => baueEntscheidung(grundfall({ eingangs_hash: 'ungueltig' })), /SHA-256/);
pruefung.throws(() => baueEntscheidung(grundfall({ begruendung_text: 'zu kurz' })), /mindestens 20/);

console.log('EthikeSkin Entscheidungsobjekt: 8 Pruefungen bestanden');
