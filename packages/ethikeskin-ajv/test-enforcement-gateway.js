'use strict';

const pruefung = require('node:assert/strict');
const { hasheEreignis } = require('./ethikeskin-policy-pipeline');
const { erstelleVollzugsschleuse } = require('./ethikeskin-enforcement-gateway');

const EREIGNIS = {
  query_event_id: '1c9d6f2a-77b1-4a6e-9c3f-2b8e5d4a1f77',
  text: 'Wir koennen miteinander handeln.'
};

function freigabe(ereignis = EREIGNIS, abweichungen = {}) {
  return {
    freigegeben: true,
    wirksame_entscheidung: 'erlaubt',
    ursache: 'keine',
    entscheidung: {
      entscheidungs_id: '8f14e45f-ea0d-4b2c-9f21-6a1b2c3d4e5f',
      anfrage_ref: {
        query_event_id: ereignis.query_event_id,
        eingangs_hash: hasheEreignis(ereignis)
      },
      gueltigkeit: { gueltig_bis: '2026-08-16T13:00:00.000Z' }
    },
    vollzug: { wirksame_entscheidung: 'erlaubt', fehlende_auflagen: [] },
    ...abweichungen
  };
}

(async () => {
  const protokoll = [];
  let handlungen = 0;
  const schleuse = erstelleVollzugsschleuse({
    fuehreStreckeAus: async (ereignis) => freigabe(ereignis),
    protokolliere: async (eintrag) => protokoll.push(eintrag),
    jetzt: () => new Date('2026-08-16T12:30:00.000Z')
  });

  const erfolg = await schleuse({
    anfrageEreignis: EREIGNIS,
    fuehreAus: async () => { handlungen += 1; return { ok: true }; }
  });
  pruefung.equal(erfolg.ausgefuehrt, true);
  pruefung.equal(handlungen, 1);
  pruefung.equal(protokoll[0].typ, 'freigabe_vor_vollzug');
  pruefung.equal(protokoll[1].typ, 'vollzug_erfolgreich');

  handlungen = 0;
  const verweigert = await erstelleVollzugsschleuse({
    fuehreStreckeAus: async () => ({ freigegeben: false, wirksame_entscheidung: 'verweigert', ursache: 'anfrage_ungueltig' }),
    protokolliere: async () => {},
    jetzt: () => new Date('2026-08-16T12:30:00.000Z')
  })({ anfrageEreignis: EREIGNIS, fuehreAus: async () => { handlungen += 1; } });
  pruefung.equal(verweigert.ausgefuehrt, false);
  pruefung.equal(handlungen, 0);

  const abgelaufen = await erstelleVollzugsschleuse({
    fuehreStreckeAus: async (ereignis) => freigabe(ereignis),
    protokolliere: async () => {},
    jetzt: () => new Date('2026-08-16T13:00:00.000Z')
  })({ anfrageEreignis: EREIGNIS, fuehreAus: async () => { handlungen += 1; } });
  pruefung.equal(abgelaufen.ursache, 'entscheidung_abgelaufen');

  const hashAbweichung = await erstelleVollzugsschleuse({
    fuehreStreckeAus: async () => freigabe({ ...EREIGNIS, text: 'anderer Inhalt' }),
    protokolliere: async () => {},
    jetzt: () => new Date('2026-08-16T12:30:00.000Z')
  })({ anfrageEreignis: EREIGNIS, fuehreAus: async () => { handlungen += 1; } });
  pruefung.equal(hashAbweichung.ursache, 'eingangs_hash_abweichend');

  const offeneAuflage = await erstelleVollzugsschleuse({
    fuehreStreckeAus: async (ereignis) => freigabe(ereignis, {
      vollzug: { wirksame_entscheidung: 'erlaubt', fehlende_auflagen: ['AUF-103'] }
    }),
    protokolliere: async () => {},
    jetzt: () => new Date('2026-08-16T12:30:00.000Z')
  })({ anfrageEreignis: EREIGNIS, fuehreAus: async () => { handlungen += 1; } });
  pruefung.equal(offeneAuflage.ursache, 'auflage_nicht_erfuellt');

  const protokollAusfall = await erstelleVollzugsschleuse({
    fuehreStreckeAus: async (ereignis) => freigabe(ereignis),
    protokolliere: async () => { throw new Error('Protokoll offline'); },
    jetzt: () => new Date('2026-08-16T12:30:00.000Z')
  })({ anfrageEreignis: EREIGNIS, fuehreAus: async () => { handlungen += 1; } });
  pruefung.equal(protokollAusfall.ursache, 'protokoll_nicht_verfuegbar');

  const streckenAusfall = await erstelleVollzugsschleuse({
    fuehreStreckeAus: async () => { throw new Error('Strecke offline'); },
    protokolliere: async () => {},
    jetzt: () => new Date('2026-08-16T12:30:00.000Z')
  })({ anfrageEreignis: EREIGNIS, fuehreAus: async () => { handlungen += 1; } });
  pruefung.equal(streckenAusfall.ursache, 'strecke_ausnahme');

  const handlungsAusfall = await erstelleVollzugsschleuse({
    fuehreStreckeAus: async (ereignis) => freigabe(ereignis),
    protokolliere: async () => {},
    jetzt: () => new Date('2026-08-16T12:30:00.000Z')
  })({ anfrageEreignis: EREIGNIS, fuehreAus: async () => { throw new Error('Handlung fehlgeschlagen'); } });
  pruefung.equal(handlungsAusfall.freigegeben, true);
  pruefung.equal(handlungsAusfall.ausgefuehrt, false);
  pruefung.equal(handlungsAusfall.ursache, 'handlung_fehlgeschlagen');

  console.log('EthikeSkin Vollzugsschleuse: 8 Pruefungen bestanden');
})().catch((fehler) => {
  console.error(fehler);
  process.exitCode = 1;
});
