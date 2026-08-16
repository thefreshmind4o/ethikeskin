'use strict';

const pruefung = require('node:assert/strict');
const { hasheEreignis, erstelleEntscheidungsstrecke } = require('./ethikeskin-entscheidungsstrecke');

const KENNUNG = '1c9d6f2a-77b1-4a6e-9c3f-2b8e5d4a1f77';
const EREIGNIS = { query_event_id: KENNUNG, text: 'Wir koennen miteinander handeln.' };

function auswertung(abweichungen = {}) {
  return {
    entscheidung: 'erlaubt',
    regel_id: 'ESK-001-kapazitaet-geprueft',
    regel_version: '1.0.0',
    begruendung_code: 'alle_pruefungen_bestanden',
    begruendung_text: 'Kapazitaet und Expositionsregime wurden vollstaendig geprueft.',
    zeitpunkt: '2026-08-16T12:20:00.000Z',
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

pruefung.equal(hasheEreignis({ b: 2, a: 1 }), hasheEreignis({ a: 1, b: 2 }));

const freigabestrecke = erstelleEntscheidungsstrecke({
  pruefeAnfrage: () => true,
  werteAus: () => auswertung()
});
const freigabe = freigabestrecke(EREIGNIS);
pruefung.equal(freigabe.freigegeben, true);
pruefung.equal(freigabe.phase, 'vollzug');
pruefung.equal(freigabe.entscheidung.anfrage_ref.eingangs_hash, hasheEreignis(EREIGNIS));

const ungueltigeAnfrage = erstelleEntscheidungsstrecke({
  pruefeAnfrage: () => ({ gueltig: false, fehler: ['text fehlt'] }),
  werteAus: () => auswertung()
})(EREIGNIS);
pruefung.equal(ungueltigeAnfrage.freigegeben, false);
pruefung.equal(ungueltigeAnfrage.ursache, 'anfrage_ungueltig');

const ohneKennung = freigabestrecke({ text: 'ohne Kennung' });
pruefung.equal(ohneKennung.freigegeben, false);
pruefung.equal(ohneKennung.ursache, 'anfrage_kennung_fehlt');

const regelwerkAusfall = erstelleEntscheidungsstrecke({
  pruefeAnfrage: () => true,
  werteAus: () => { throw new Error('Regelwerk offline'); }
})(EREIGNIS);
pruefung.equal(regelwerkAusfall.freigegeben, false);
pruefung.equal(regelwerkAusfall.ursache, 'regelwerk_fehler');

const immersionsstrecke = erstelleEntscheidungsstrecke({
  pruefeAnfrage: () => true,
  werteAus: () => auswertung({
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
  })
});
const blockiert = immersionsstrecke(EREIGNIS, { erfuellte_auflagen: ['AUF-101'] });
pruefung.equal(blockiert.freigegeben, false);
pruefung.equal(blockiert.ursache, 'auflage_nicht_erfuellbar');

const erfuellt = immersionsstrecke(EREIGNIS, {
  erfuellte_auflagen: ['AUF-101', 'AUF-102', 'AUF-103', 'AUF-104', 'AUF-106']
});
pruefung.equal(erfuellt.freigegeben, true);

const stahlstrecke = erstelleEntscheidungsstrecke({
  pruefeAnfrage: () => true,
  werteAus: () => auswertung({
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
})(EREIGNIS, { erfuellte_auflagen: ['AUF-106'] });
pruefung.equal(stahlstrecke.freigegeben, false);
pruefung.equal(stahlstrecke.ursache, 'schutzwirkung_aufgehoben');

console.log('EthikeSkin Entscheidungsstrecke: 8 Pruefungen bestanden');
