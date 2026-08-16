'use strict';

const AUFLAGEN = Object.freeze({
  ZEITBUDGET: 'AUF-101',
  AUSSTIEG: 'AUF-102',
  PARTNER: 'AUF-103',
  DURCHSATZ: 'AUF-104',
  ABLEGBARKEIT: 'AUF-105',
  VERSORGUNG: 'AUF-106'
});

const WERTEBEREICHE = Object.freeze({
  schadensschwere: ['I', 'II', 'III'],
  reversibilitaet: ['reversibel', 'teilreversibel', 'irreversibel'],
  expositionsregime: ['tropfen', 'spritzer', 'immersion'],
  containment: ['ausschliessend', 'dosiert', 'einlassend_temperierend'],
  trageform: ['integriert', 'koerpergebunden', 'handgehalten_teilbar', 'umgebungsgebunden']
});

function verlangeObjekt(wert, feld) {
  if (!wert || typeof wert !== 'object' || Array.isArray(wert)) {
    throw new TypeError(`${feld} muss ein Objekt sein`);
  }
  return wert;
}

function verlangeWert(eingabe, feld) {
  if (!WERTEBEREICHE[feld].includes(eingabe[feld])) {
    throw new TypeError(`${feld} ist ungueltig oder fehlt`);
  }
}

function leiteKapazitaetAb(eingabe) {
  verlangeObjekt(eingabe, 'kapazitaet');
  Object.keys(WERTEBEREICHE).forEach((feld) => verlangeWert(eingabe, feld));

  const auflagen = new Set();
  const gruende = [];
  let schutzwirkung = 'wirksam';

  if (eingabe.schadensschwere === 'III') {
    if (eingabe.reversibilitaet === 'reversibel') {
      throw new Error('Schadensschwere III darf nicht als reversibel deklariert werden');
    }
    verlangeObjekt(eingabe.versorgung, 'versorgung');
    auflagen.add(AUFLAGEN.VERSORGUNG);
  }

  if (eingabe.expositionsregime === 'spritzer') {
    if (!['E1', 'E2', 'E3'].includes(eingabe.lastklasse)) {
      throw new Error('Spritzer-Regime erfordert lastklasse E1, E2 oder E3');
    }
    if (typeof eingabe.ueberschritten !== 'boolean') {
      throw new Error('Spritzer-Regime erfordert ueberschritten als Wahrheitswert');
    }
  }

  if (eingabe.expositionsregime === 'immersion') {
    if (eingabe.trageform === 'handgehalten_teilbar') {
      throw new Error('Immersion ist mit handgehalten_teilbar unvereinbar');
    }
    const dauer = verlangeObjekt(eingabe.dauer, 'dauer');
    const ausstieg = verlangeObjekt(eingabe.ausstieg, 'ausstieg');
    const versorgung = verlangeObjekt(eingabe.versorgung, 'versorgung');
    if (!Number.isInteger(dauer.zeitbudget_min) || dauer.zeitbudget_min < 1) {
      throw new Error('Immersion erfordert ein positives zeitbudget_min');
    }
    if (ausstieg.protokoll_erforderlich !== true || !Array.isArray(ausstieg.stufen) || ausstieg.stufen.length === 0) {
      throw new Error('Immersion erfordert ein gestuftes Ausstiegsprotokoll');
    }
    if (versorgung.partner_pflicht !== true) {
      throw new Error('Immersion erfordert partner_pflicht');
    }
    auflagen.add(AUFLAGEN.ZEITBUDGET);
    auflagen.add(AUFLAGEN.AUSSTIEG);
    auflagen.add(AUFLAGEN.PARTNER);
  }

  if (eingabe.containment === 'einlassend_temperierend') {
    const durchsatz = verlangeObjekt(eingabe.durchsatz, 'durchsatz');
    if (typeof durchsatz.limit_pro_stunde !== 'number' || durchsatz.limit_pro_stunde < 0) {
      throw new Error('Einlassendes Containment erfordert ein Durchsatzlimit');
    }
    auflagen.add(AUFLAGEN.DURCHSATZ);
    if (durchsatz.ausgetauscht === true || durchsatz.gemessen > durchsatz.limit_pro_stunde) {
      schutzwirkung = 'aufgehoben';
      gruende.push('durchsatz_ueberschritten_oder_ausgetauscht');
    }
  }

  if (eingabe.dauer && eingabe.dauer.budget_erschoepft === true) {
    schutzwirkung = 'aufgehoben';
    gruende.push('zeitbudget_erschoepft');
  }

  if (eingabe.ueberschritten === true) {
    schutzwirkung = 'aufgehoben';
    gruende.push('lastklasse_ueberschritten');
  }

  if (eingabe.trageform === 'handgehalten_teilbar') {
    const schirm = verlangeObjekt(eingabe.schirm, 'schirm');
    if (schirm.weglegbar_jederzeit !== true) {
      throw new Error('Handgehaltener Schutz muss jederzeit weglegbar sein');
    }
    auflagen.add(AUFLAGEN.ABLEGBARKEIT);
  }

  return Object.freeze({
    schutzwirkung,
    auflagen_erzwungen: Object.freeze([...auflagen].sort()),
    gruende: Object.freeze(gruende)
  });
}

function erzwingeWirksameEntscheidung(entscheidung, kapazitaetsableitung) {
  verlangeObjekt(entscheidung, 'entscheidung');
  verlangeObjekt(kapazitaetsableitung, 'kapazitaetsableitung');
  if (kapazitaetsableitung.schutzwirkung === 'aufgehoben') {
    return Object.freeze({
      ...entscheidung,
      wirksame_entscheidung: 'verweigert',
      fail_closed: Object.freeze({
        ausgeloest: true,
        ursache: 'schutzwirkung_aufgehoben',
        standardentscheidung: 'verweigert'
      })
    });
  }
  return Object.freeze({ ...entscheidung });
}

module.exports = Object.freeze({ AUFLAGEN, WERTEBEREICHE, leiteKapazitaetAb, erzwingeWirksameEntscheidung });
