'use strict';

const { randomUUID } = require('node:crypto');
const { deriveCapacity } = require('./ethikeskin-capacity-policy');

const OBLIGATION_TEXT = Object.freeze({
  'AUF-101': 'Zeitbudget festlegen, überwachen und vor Erschöpfung aussteigen',
  'AUF-102': 'Gestuftes Ausstiegsprotokoll vollständig ausführen',
  'AUF-103': 'Partner- oder Vier-Augen-Prinzip sicherstellen',
  'AUF-104': 'Durchsatz messen und innerhalb des Limits halten',
  'AUF-105': 'Jederzeitige Weglegbarkeit des externen Schutzes gewährleisten',
  'AUF-106': 'Versorgung oder Supervision für die Exposition bereitstellen'
});

const RAW_DECISIONS = new Set(['erlaubt', 'verweigert', 'unbestimmt', 'nicht_zutreffend']);

function requireString(value, field) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`${field} muss eine nichtleere Zeichenkette sein`);
  }
}

function failClosedCause(rawDecision, derivedCapacity) {
  if (derivedCapacity.schutzwirkung === 'aufgehoben') return 'schutzwirkung_aufgehoben';
  if (rawDecision === 'unbestimmt') return 'entscheidung_unbestimmt';
  if (rawDecision === 'nicht_zutreffend') return 'keine_regel_zutreffend';
  return 'keine';
}

function buildPolicyDecision(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('input muss ein Objekt sein');
  }
  if (!RAW_DECISIONS.has(input.entscheidung)) {
    throw new TypeError('entscheidung ist ungültig');
  }
  requireString(input.query_event_id, 'query_event_id');
  if (!/^[a-f0-9]{64}$/.test(input.eingangs_hash || '')) {
    throw new TypeError('eingangs_hash muss SHA-256 in Kleinschreibung sein');
  }
  requireString(input.regel_id, 'regel_id');
  requireString(input.begruendung_code, 'begruendung_code');
  if (typeof input.begruendung_text !== 'string' || input.begruendung_text.length < 20) {
    throw new TypeError('begruendung_text muss mindestens 20 Zeichen enthalten');
  }

  const capacity = deriveCapacity(input.kapazitaet);
  const cause = failClosedCause(input.entscheidung, capacity);
  const failClosed = cause !== 'keine';
  const effective = input.entscheidung === 'erlaubt' && !failClosed ? 'erlaubt' : 'verweigert';
  const now = input.zeitpunkt ? new Date(input.zeitpunkt) : new Date();
  if (Number.isNaN(now.getTime())) throw new TypeError('zeitpunkt ist ungültig');
  const ttl = Number.isInteger(input.ttl_sekunden) ? input.ttl_sekunden : 300;
  if (ttl < 1 || ttl > 86400) throw new RangeError('ttl_sekunden muss zwischen 1 und 86400 liegen');

  const obligations = capacity.auflagen_erzwungen.map((id) => Object.freeze({
    auflage_id: id,
    beschreibung: OBLIGATION_TEXT[id] || `Blockierende Auflage ${id} erfüllen`,
    blockierend: true
  }));

  return Object.freeze({
    schema_version: '1.4.0',
    entscheidungs_id: input.entscheidungs_id || randomUUID(),
    zeitpunkt: now.toISOString(),
    anfrage_ref: Object.freeze({
      query_event_id: input.query_event_id,
      eingangs_hash: input.eingangs_hash
    }),
    entscheidung: input.entscheidung,
    wirksame_entscheidung: effective,
    regel: Object.freeze({
      regel_id: input.regel_id,
      regel_version: input.regel_version || '1.0.0'
    }),
    begruendung: Object.freeze({
      code: input.begruendung_code,
      text: input.begruendung_text
    }),
    kapazitaet: Object.freeze({ ...input.kapazitaet }),
    kapazitaetsableitung: capacity,
    auflagen: Object.freeze(obligations),
    fail_closed: Object.freeze({
      ausgeloest: failClosed,
      ursache: cause,
      standardentscheidung: 'verweigert'
    }),
    gueltigkeit: Object.freeze({
      ttl_sekunden: ttl,
      gueltig_bis: new Date(now.getTime() + ttl * 1000).toISOString(),
      nach_ablauf: 'verweigert'
    })
  });
}

function enforceObligations(policyDecision, fulfilledIds = []) {
  const fulfilled = new Set(fulfilledIds);
  const missing = policyDecision.auflagen
    .filter((obligation) => obligation.blockierend && !fulfilled.has(obligation.auflage_id))
    .map((obligation) => obligation.auflage_id);

  if (policyDecision.wirksame_entscheidung === 'erlaubt' && missing.length > 0) {
    return Object.freeze({
      ...policyDecision,
      wirksame_entscheidung: 'verweigert',
      fail_closed: Object.freeze({
        ausgeloest: true,
        ursache: 'auflage_nicht_erfuellbar',
        standardentscheidung: 'verweigert'
      }),
      fehlende_auflagen: Object.freeze(missing)
    });
  }
  return Object.freeze({ ...policyDecision, fehlende_auflagen: Object.freeze(missing) });
}

module.exports = Object.freeze({ OBLIGATION_TEXT, buildPolicyDecision, enforceObligations });
