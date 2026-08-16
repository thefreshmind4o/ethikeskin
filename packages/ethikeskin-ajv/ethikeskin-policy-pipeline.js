'use strict';

const { createHash } = require('node:crypto');
const dateisystem = require('node:fs');
const pfade = require('node:path');
const Ajv2020 = require('ajv/dist/2020');
const anfrageModul = require('./ethikeskin-v13-query-event');
const { baueEntscheidung, pruefeAuflagen } = require('./ethikeskin-policy-decision');

function kanonisiere(wert) {
  if (Array.isArray(wert)) return `[${wert.map(kanonisiere).join(',')}]`;
  if (wert && typeof wert === 'object') {
    return `{${Object.keys(wert).sort().map((schluessel) => `${JSON.stringify(schluessel)}:${kanonisiere(wert[schluessel])}`).join(',')}}`;
  }
  return JSON.stringify(wert);
}

function hasheEreignis(ereignis) {
  return createHash('sha256').update(kanonisiere(ereignis), 'utf8').digest('hex');
}

function ermittleAnfrageValidierer(modul = anfrageModul) {
  const kandidaten = [
    modul && modul.pruefeAnfrage,
    modul && modul.validateQueryEvent,
    modul && modul.validate,
    modul && modul.validator,
    typeof modul === 'function' ? modul : null
  ];
  const validierer = kandidaten.find((kandidat) => typeof kandidat === 'function');
  if (!validierer) {
    throw new TypeError('ethikeskin-v13-query-event exportiert keinen erkennbaren Validierer');
  }
  return validierer;
}

function normalisiereBefund(befund, validierer) {
  if (typeof befund === 'boolean') {
    return { gueltig: befund, fehler: befund ? [] : (validierer.errors || []) };
  }
  if (befund && typeof befund === 'object' && typeof befund.valid === 'boolean') {
    return { gueltig: befund.valid, fehler: befund.errors || [] };
  }
  if (befund && typeof befund === 'object' && typeof befund.gueltig === 'boolean') {
    return { gueltig: befund.gueltig, fehler: befund.fehler || [] };
  }
  throw new TypeError('Anfrage-Validierer muss Wahrheitswert oder Befundobjekt liefern');
}

function erstelleEntscheidungsValidierer() {
  const schemaOrdner = pfade.resolve(__dirname, '../../schemas');
  const kapazitaetsSchema = JSON.parse(dateisystem.readFileSync(
    pfade.join(schemaOrdner, 'ethikeskin-v1.4.1-kapazitaet.schema.json'), 'utf8'
  ));
  const entscheidungsSchema = JSON.parse(dateisystem.readFileSync(
    pfade.join(schemaOrdner, 'ethikeskin-v1.4-policy-decision.schema.json'), 'utf8'
  ));

  const ajv = new Ajv2020({ allErrors: true, strict: false });
  ajv.addFormat('uuid', /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  ajv.addFormat('date-time', (wert) => typeof wert === 'string' && !Number.isNaN(Date.parse(wert)));
  ajv.addSchema(kapazitaetsSchema);
  return ajv.compile(entscheidungsSchema);
}

function ermittleAnfrageKennung(anfrageEreignis) {
  const kennung = anfrageEreignis && (
    anfrageEreignis.query_event_id ||
    anfrageEreignis.event_id ||
    anfrageEreignis.id
  );
  return typeof kennung === 'string' && kennung.length > 0 ? kennung : null;
}

function verweigere(ursache, phase, zusatz = {}) {
  return Object.freeze({
    freigegeben: false,
    wirksame_entscheidung: 'verweigert',
    phase,
    ursache,
    ...zusatz
  });
}

function erstelleEntscheidungsstrecke(optionen = {}) {
  const pruefeAnfrage = optionen.pruefeAnfrage || ermittleAnfrageValidierer();
  const werteAus = optionen.werteAus;
  if (typeof werteAus !== 'function') {
    throw new TypeError('erstelleEntscheidungsstrecke erfordert werteAus(anfrageEreignis, kontext)');
  }
  const pruefeEntscheidung = optionen.pruefeEntscheidung || erstelleEntscheidungsValidierer();

  return function fuehreStreckeAus(anfrageEreignis, kontext = {}) {
    let befund;
    try {
      befund = normalisiereBefund(pruefeAnfrage(anfrageEreignis), pruefeAnfrage);
    } catch (fehler) {
      return verweigere('anfrage_validierer_fehler', 'anfrage_pruefung', { fehler: Object.freeze([fehler.message]) });
    }

    if (!befund.gueltig) {
      return verweigere('anfrage_ungueltig', 'anfrage_pruefung', { fehler: Object.freeze(befund.fehler) });
    }

    const anfrageKennung = ermittleAnfrageKennung(anfrageEreignis);
    if (!anfrageKennung) {
      return verweigere('anfrage_kennung_fehlt', 'anfrage_pruefung', {
        fehler: Object.freeze(['Kein query_event_id, event_id oder id vorhanden'])
      });
    }

    let auswertung;
    try {
      auswertung = werteAus(Object.freeze({ ...anfrageEreignis }), Object.freeze({ ...kontext }));
    } catch (fehler) {
      return verweigere('regelwerk_fehler', 'regelauswertung', { fehler: Object.freeze([fehler.message]) });
    }

    let entscheidung;
    try {
      entscheidung = baueEntscheidung({
        ...auswertung,
        query_event_id: anfrageKennung,
        eingangs_hash: hasheEreignis(anfrageEreignis)
      });
    } catch (fehler) {
      return verweigere('entscheidungsaufbau_fehler', 'entscheidungsaufbau', { fehler: Object.freeze([fehler.message]) });
    }

    if (!pruefeEntscheidung(entscheidung)) {
      return verweigere('entscheidung_schemawidrig', 'entscheidungspruefung', {
        fehler: Object.freeze(pruefeEntscheidung.errors || [])
      });
    }

    const erfuellt = Array.isArray(kontext.erfuellte_auflagen) ? kontext.erfuellte_auflagen : [];
    const vollzug = pruefeAuflagen(entscheidung, erfuellt);

    return Object.freeze({
      freigegeben: vollzug.wirksame_entscheidung === 'erlaubt',
      wirksame_entscheidung: vollzug.wirksame_entscheidung,
      phase: 'vollzug',
      ursache: vollzug.fail_closed.ursache,
      entscheidung,
      vollzug
    });
  };
}

module.exports = Object.freeze({
  kanonisiere,
  hasheEreignis,
  ermittleAnfrageValidierer,
  erstelleEntscheidungsValidierer,
  erstelleEntscheidungsstrecke
});
