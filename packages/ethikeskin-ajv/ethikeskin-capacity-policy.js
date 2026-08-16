'use strict';

const OBLIGATIONS = Object.freeze({
  TIME_BUDGET: 'AUF-101',
  STAGED_EXIT: 'AUF-102',
  PARTNER: 'AUF-103',
  THROUGHPUT: 'AUF-104',
  REMOVABLE: 'AUF-105',
  SUPERVISION: 'AUF-106'
});

const ENUMS = Object.freeze({
  schadensschwere: ['I', 'II', 'III'],
  reversibilitaet: ['reversibel', 'teilreversibel', 'irreversibel'],
  expositionsregime: ['tropfen', 'spritzer', 'immersion'],
  containment: ['ausschliessend', 'dosiert', 'einlassend_temperierend'],
  trageform: ['integriert', 'koerpergebunden', 'handgehalten_teilbar', 'umgebungsgebunden']
});

function requireObject(value, field) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${field} muss ein Objekt sein`);
  }
  return value;
}

function requireEnum(input, field) {
  if (!ENUMS[field].includes(input[field])) {
    throw new TypeError(`${field} ist ungueltig oder fehlt`);
  }
}

function deriveCapacity(input) {
  requireObject(input, 'kapazitaet');
  Object.keys(ENUMS).forEach((field) => requireEnum(input, field));

  const obligations = new Set();
  const reasons = [];
  let protection = 'wirksam';

  if (input.schadensschwere === 'III') {
    if (input.reversibilitaet === 'reversibel') {
      throw new Error('Schadensschwere III darf nicht als reversibel deklariert werden');
    }
    requireObject(input.versorgung, 'versorgung');
    obligations.add(OBLIGATIONS.SUPERVISION);
  }

  if (input.expositionsregime === 'spritzer') {
    if (!['E1', 'E2', 'E3'].includes(input.lastklasse)) {
      throw new Error('Spritzer-Regime erfordert lastklasse E1, E2 oder E3');
    }
    if (typeof input.ueberschritten !== 'boolean') {
      throw new Error('Spritzer-Regime erfordert ueberschritten als Boolean');
    }
  }

  if (input.expositionsregime === 'immersion') {
    if (input.trageform === 'handgehalten_teilbar') {
      throw new Error('Immersion ist mit handgehalten_teilbar unvereinbar');
    }
    const dauer = requireObject(input.dauer, 'dauer');
    const ausstieg = requireObject(input.ausstieg, 'ausstieg');
    const versorgung = requireObject(input.versorgung, 'versorgung');
    if (!Number.isInteger(dauer.zeitbudget_min) || dauer.zeitbudget_min < 1) {
      throw new Error('Immersion erfordert ein positives zeitbudget_min');
    }
    if (ausstieg.protokoll_erforderlich !== true || !Array.isArray(ausstieg.stufen) || ausstieg.stufen.length === 0) {
      throw new Error('Immersion erfordert ein gestuftes Ausstiegsprotokoll');
    }
    if (versorgung.partner_pflicht !== true) {
      throw new Error('Immersion erfordert partner_pflicht');
    }
    obligations.add(OBLIGATIONS.TIME_BUDGET);
    obligations.add(OBLIGATIONS.STAGED_EXIT);
    obligations.add(OBLIGATIONS.PARTNER);
  }

  if (input.containment === 'einlassend_temperierend') {
    const throughput = requireObject(input.durchsatz, 'durchsatz');
    if (typeof throughput.limit_pro_stunde !== 'number' || throughput.limit_pro_stunde < 0) {
      throw new Error('Einlassendes Containment erfordert ein Durchsatzlimit');
    }
    obligations.add(OBLIGATIONS.THROUGHPUT);
    if (throughput.ausgetauscht === true || throughput.gemessen > throughput.limit_pro_stunde) {
      protection = 'aufgehoben';
      reasons.push('durchsatz_ueberschritten_oder_ausgetauscht');
    }
  }

  if (input.dauer && input.dauer.budget_erschoepft === true) {
    protection = 'aufgehoben';
    reasons.push('zeitbudget_erschoepft');
  }

  if (input.ueberschritten === true) {
    protection = 'aufgehoben';
    reasons.push('lastklasse_ueberschritten');
  }

  if (input.trageform === 'handgehalten_teilbar') {
    const umbrella = requireObject(input.schirm, 'schirm');
    if (umbrella.weglegbar_jederzeit !== true) {
      throw new Error('Handgehaltener Schutz muss jederzeit weglegbar sein');
    }
    obligations.add(OBLIGATIONS.REMOVABLE);
  }

  return Object.freeze({
    schutzwirkung: protection,
    auflagen_erzwungen: Object.freeze([...obligations].sort()),
    gruende: Object.freeze(reasons)
  });
}

function enforceEffectiveDecision(policyDecision, derivedCapacity) {
  requireObject(policyDecision, 'policyDecision');
  requireObject(derivedCapacity, 'derivedCapacity');
  if (derivedCapacity.schutzwirkung === 'aufgehoben') {
    return Object.freeze({
      ...policyDecision,
      wirksame_entscheidung: 'verweigert',
      fail_closed: Object.freeze({
        ausgeloest: true,
        ursache: 'schutzwirkung_aufgehoben',
        standardentscheidung: 'verweigert'
      })
    });
  }
  return Object.freeze({ ...policyDecision });
}

module.exports = Object.freeze({ OBLIGATIONS, deriveCapacity, enforceEffectiveDecision });
