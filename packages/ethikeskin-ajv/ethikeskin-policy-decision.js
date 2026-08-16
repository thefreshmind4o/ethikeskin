'use strict';

const { randomUUID } = require('node:crypto');
const { leiteKapazitaetAb } = require('./ethikeskin-capacity-policy');

const AUFLAGEN_TEXT = Object.freeze({
  'AUF-101': 'Zeitbudget festlegen, ueberwachen und vor Erschoepfung aussteigen',
  'AUF-102': 'Gestuftes Ausstiegsprotokoll vollstaendig ausfuehren',
  'AUF-103': 'Partner- oder Vier-Augen-Prinzip sicherstellen',
  'AUF-104': 'Durchsatz messen und innerhalb des Limits halten',
  'AUF-105': 'Jederzeitige Weglegbarkeit des externen Schutzes gewaehrleisten',
  'AUF-106': 'Versorgung oder Supervision fuer die Exposition bereitstellen'
});

const ROHENTSCHEIDUNGEN = new Set(['erlaubt', 'verweigert', 'unbestimmt', 'nicht_zutreffend']);

function verlangeText(wert, feld) {
  if (typeof wert !== 'string' || wert.length === 0) {
    throw new TypeError(`${feld} muss eine nichtleere Zeichenkette sein`);
  }
}

function ermittleFailClosedUrsache(rohentscheidung, kapazitaetsableitung) {
  if (kapazitaetsableitung.schutzwirkung === 'aufgehoben') return 'schutzwirkung_aufgehoben';
  if (rohentscheidung === 'unbestimmt') return 'entscheidung_unbestimmt';
  if (rohentscheidung === 'nicht_zutreffend') return 'keine_regel_zutreffend';
  return 'keine';
}

function baueEntscheidung(eingabe) {
  if (!eingabe || typeof eingabe !== 'object' || Array.isArray(eingabe)) {
    throw new TypeError('eingabe muss ein Objekt sein');
  }
  if (!ROHENTSCHEIDUNGEN.has(eingabe.entscheidung)) {
    throw new TypeError('entscheidung ist ungueltig');
  }
  verlangeText(eingabe.query_event_id, 'query_event_id');
  if (!/^[a-f0-9]{64}$/.test(eingabe.eingangs_hash || '')) {
    throw new TypeError('eingangs_hash muss SHA-256 in Kleinschreibung sein');
  }
  verlangeText(eingabe.regel_id, 'regel_id');
  verlangeText(eingabe.begruendung_code, 'begruendung_code');
  if (typeof eingabe.begruendung_text !== 'string' || eingabe.begruendung_text.length < 20) {
    throw new TypeError('begruendung_text muss mindestens 20 Zeichen enthalten');
  }

  const kapazitaetsableitung = leiteKapazitaetAb(eingabe.kapazitaet);
  const ursache = ermittleFailClosedUrsache(eingabe.entscheidung, kapazitaetsableitung);
  const failClosed = ursache !== 'keine';
  const wirksam = eingabe.entscheidung === 'erlaubt' && !failClosed ? 'erlaubt' : 'verweigert';
  const zeitpunkt = eingabe.zeitpunkt ? new Date(eingabe.zeitpunkt) : new Date();
  if (Number.isNaN(zeitpunkt.getTime())) throw new TypeError('zeitpunkt ist ungueltig');
  const ttl = Number.isInteger(eingabe.ttl_sekunden) ? eingabe.ttl_sekunden : 300;
  if (ttl < 1 || ttl > 86400) throw new RangeError('ttl_sekunden muss zwischen 1 und 86400 liegen');

  const auflagen = kapazitaetsableitung.auflagen_erzwungen.map((kennung) => Object.freeze({
    auflage_id: kennung,
    beschreibung: AUFLAGEN_TEXT[kennung] || `Blockierende Auflage ${kennung} erfuellen`,
    blockierend: true
  }));

  return Object.freeze({
    schema_version: '1.4.0',
    entscheidungs_id: eingabe.entscheidungs_id || randomUUID(),
    zeitpunkt: zeitpunkt.toISOString(),
    anfrage_ref: Object.freeze({
      query_event_id: eingabe.query_event_id,
      eingangs_hash: eingabe.eingangs_hash
    }),
    entscheidung: eingabe.entscheidung,
    wirksame_entscheidung: wirksam,
    regel: Object.freeze({
      regel_id: eingabe.regel_id,
      regel_version: eingabe.regel_version || '1.0.0'
    }),
    begruendung: Object.freeze({
      code: eingabe.begruendung_code,
      text: eingabe.begruendung_text
    }),
    kapazitaet: Object.freeze({ ...eingabe.kapazitaet }),
    kapazitaetsableitung,
    auflagen: Object.freeze(auflagen),
    fail_closed: Object.freeze({
      ausgeloest: failClosed,
      ursache,
      standardentscheidung: 'verweigert'
    }),
    gueltigkeit: Object.freeze({
      ttl_sekunden: ttl,
      gueltig_bis: new Date(zeitpunkt.getTime() + ttl * 1000).toISOString(),
      nach_ablauf: 'verweigert'
    })
  });
}

function pruefeAuflagen(entscheidung, erfuellteKennungen = []) {
  const erfuellt = new Set(erfuellteKennungen);
  const fehlend = entscheidung.auflagen
    .filter((auflage) => auflage.blockierend && !erfuellt.has(auflage.auflage_id))
    .map((auflage) => auflage.auflage_id);

  if (entscheidung.wirksame_entscheidung === 'erlaubt' && fehlend.length > 0) {
    return Object.freeze({
      ...entscheidung,
      wirksame_entscheidung: 'verweigert',
      fail_closed: Object.freeze({
        ausgeloest: true,
        ursache: 'auflage_nicht_erfuellbar',
        standardentscheidung: 'verweigert'
      }),
      fehlende_auflagen: Object.freeze(fehlend)
    });
  }
  return Object.freeze({ ...entscheidung, fehlende_auflagen: Object.freeze(fehlend) });
}

module.exports = Object.freeze({ AUFLAGEN_TEXT, baueEntscheidung, pruefeAuflagen });
