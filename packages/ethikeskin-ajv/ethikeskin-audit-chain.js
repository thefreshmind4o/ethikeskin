'use strict';

const { createHash } = require('node:crypto');
const { kanonisiere } = require('./ethikeskin-policy-pipeline');

const URSPRUNG = '0'.repeat(64);

function hashe(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function eintragsHash(eintrag) {
  return hashe(kanonisiere({
    index: eintrag.index,
    zeitpunkt: eintrag.zeitpunkt,
    typ: eintrag.typ,
    vorgaenger_hash: eintrag.vorgaenger_hash,
    inhalt_hash: eintrag.inhalt_hash
  }));
}

function istVerweigerung(typ) {
  return typeof typ === 'string' && (typ === 'deny' || typ.startsWith('deny_'));
}

function erstellePruefkette(optionen = {}) {
  const eintraege = Array.isArray(optionen.eintraege) ? [...optionen.eintraege] : [];
  const jetzt = typeof optionen.jetzt === 'function' ? optionen.jetzt : () => new Date();
  const maxNichtVerweigerungProSekunde = Number.isFinite(optionen.max_nicht_deny_pro_sekunde)
    ? optionen.max_nicht_deny_pro_sekunde
    : Infinity;
  let verworfen = 0;

  function kopf() {
    return eintraege.length === 0 ? URSPRUNG : eintraege[eintraege.length - 1].eintrag_hash;
  }

  function juengsteNichtVerweigerungen(jetztMs) {
    return eintraege.filter((eintrag) => !istVerweigerung(eintrag.typ) && jetztMs - Date.parse(eintrag.zeitpunkt) < 1000).length;
  }

  function haengeAn(satz = {}) {
    const typ = typeof satz.typ === 'string' && satz.typ.length > 0 ? satz.typ : 'unbekannt';
    const zeitpunkt = satz.zeitpunkt ? new Date(satz.zeitpunkt) : jetzt();
    const jetztMs = zeitpunkt.getTime();
    if (!Number.isFinite(jetztMs)) throw new TypeError('zeitpunkt ist ungueltig');

    if (!istVerweigerung(typ) && juengsteNichtVerweigerungen(jetztMs) >= maxNichtVerweigerungProSekunde) {
      verworfen += 1;
      return Object.freeze({ angehaengt: false, ursache: 'ratenlimit', verworfen });
    }

    const inhalt = satz.inhalt === undefined ? {} : satz.inhalt;
    const eintrag = {
      index: eintraege.length,
      zeitpunkt: zeitpunkt.toISOString(),
      typ,
      vorgaenger_hash: kopf(),
      inhalt_hash: hashe(kanonisiere(inhalt))
    };
    eintrag.eintrag_hash = eintragsHash(eintrag);
    const festgeschrieben = Object.freeze(eintrag);
    eintraege.push(festgeschrieben);
    return Object.freeze({ angehaengt: true, eintrag: festgeschrieben });
  }

  function pruefe() {
    let erwarteterVorgaenger = URSPRUNG;
    for (let i = 0; i < eintraege.length; i += 1) {
      const eintrag = eintraege[i];
      if (eintrag.index !== i) return Object.freeze({ gueltig: false, bruch_bei: i, grund: 'index_abweichend' });
      if (eintrag.vorgaenger_hash !== erwarteterVorgaenger) return Object.freeze({ gueltig: false, bruch_bei: i, grund: 'kette_unterbrochen' });
      if (eintrag.eintrag_hash !== eintragsHash(eintrag)) return Object.freeze({ gueltig: false, bruch_bei: i, grund: 'eintrag_veraendert' });
      erwarteterVorgaenger = eintrag.eintrag_hash;
    }
    return Object.freeze({ gueltig: true, laenge: eintraege.length, kopf: kopf() });
  }

  function verankere() {
    return Object.freeze({ kopf: kopf(), laenge: eintraege.length, zeitpunkt: jetzt().toISOString() });
  }

  function abzug() {
    return Object.freeze(eintraege.map((eintrag) => Object.freeze({ ...eintrag })));
  }

  function statistik() {
    return Object.freeze({
      gesamt: eintraege.length,
      verweigerungen: eintraege.filter((eintrag) => istVerweigerung(eintrag.typ)).length,
      verworfen
    });
  }

  return Object.freeze({ haengeAn, pruefe, verankere, kopf, abzug, statistik });
}

module.exports = Object.freeze({ URSPRUNG, erstellePruefkette });
