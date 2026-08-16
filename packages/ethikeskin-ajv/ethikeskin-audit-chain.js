'use strict';

const { createHash } = require('node:crypto');
const { canonicalize } = require('./ethikeskin-policy-pipeline');

const GENESIS = '0'.repeat(64);

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function entryHash(entry) {
  return sha256(canonicalize({
    index: entry.index,
    zeitpunkt: entry.zeitpunkt,
    typ: entry.typ,
    prev_hash: entry.prev_hash,
    payload_hash: entry.payload_hash
  }));
}

function isDeny(typ) {
  return typeof typ === 'string' && (typ === 'deny' || typ.startsWith('deny_'));
}

function createAuditChain(options = {}) {
  const entries = Array.isArray(options.entries) ? [...options.entries] : [];
  const now = typeof options.now === 'function' ? options.now : () => new Date();
  const maxNonDenyPerSecond = Number.isFinite(options.max_nicht_deny_pro_sekunde)
    ? options.max_nicht_deny_pro_sekunde
    : Infinity;
  let dropped = 0;

  function head() {
    return entries.length === 0 ? GENESIS : entries[entries.length - 1].entry_hash;
  }

  function recentNonDeny(nowMs) {
    return entries.filter((entry) => !isDeny(entry.typ) && nowMs - Date.parse(entry.zeitpunkt) < 1000).length;
  }

  function append(record = {}) {
    const typ = typeof record.typ === 'string' && record.typ.length > 0 ? record.typ : 'unbekannt';
    const at = record.zeitpunkt ? new Date(record.zeitpunkt) : now();
    const nowMs = at.getTime();
    if (!Number.isFinite(nowMs)) throw new TypeError('zeitpunkt ist ungueltig');

    if (!isDeny(typ) && recentNonDeny(nowMs) >= maxNonDenyPerSecond) {
      dropped += 1;
      return Object.freeze({ appended: false, ursache: 'ratenlimit', verworfen: dropped });
    }

    const payload = record.payload === undefined ? {} : record.payload;
    const entry = {
      index: entries.length,
      zeitpunkt: at.toISOString(),
      typ,
      prev_hash: head(),
      payload_hash: sha256(canonicalize(payload))
    };
    entry.entry_hash = entryHash(entry);
    const frozen = Object.freeze(entry);
    entries.push(frozen);
    return Object.freeze({ appended: true, eintrag: frozen });
  }

  function verify() {
    let expectedPrev = GENESIS;
    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];
      if (entry.index !== i) return Object.freeze({ valid: false, bruch_bei: i, grund: 'index_abweichend' });
      if (entry.prev_hash !== expectedPrev) return Object.freeze({ valid: false, bruch_bei: i, grund: 'kette_unterbrochen' });
      if (entry.entry_hash !== entryHash(entry)) return Object.freeze({ valid: false, bruch_bei: i, grund: 'eintrag_veraendert' });
      expectedPrev = entry.entry_hash;
    }
    return Object.freeze({ valid: true, laenge: entries.length, kopf: head() });
  }

  function anchor() {
    return Object.freeze({ kopf: head(), laenge: entries.length, zeitpunkt: now().toISOString() });
  }

  function snapshot() {
    return Object.freeze(entries.map((entry) => Object.freeze({ ...entry })));
  }

  function statistik() {
    return Object.freeze({
      gesamt: entries.length,
      deny: entries.filter((entry) => isDeny(entry.typ)).length,
      verworfen: dropped
    });
  }

  return Object.freeze({ append, verify, anchor, head, snapshot, statistik });
}

module.exports = Object.freeze({ GENESIS, createAuditChain });
