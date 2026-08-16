'use strict';

const DEFAULT_PROFILE = Object.freeze({
  tropfen: Object.freeze({ halbwertszeit_min: 30, referenz_min: 240, sperre_min: 0 }),
  spritzer: Object.freeze({ halbwertszeit_min: 120, referenz_min: 120, sperre_min: 60 }),
  immersion: Object.freeze({ halbwertszeit_min: 360, referenz_min: 60, sperre_min: 180 })
});

const REGIMES = Object.freeze(Object.keys(DEFAULT_PROFILE));

function toMs(value) {
  const ms = value instanceof Date ? value.getTime() : Date.parse(value);
  if (!Number.isFinite(ms)) throw new TypeError('Ungueltiger Zeitpunkt');
  return ms;
}

function decay(value, elapsedMin, halfLifeMin) {
  if (halfLifeMin <= 0) return 0;
  return value * Math.pow(0.5, elapsedMin / halfLifeMin);
}

function createExposureMemory(options = {}) {
  const profile = Object.freeze({ ...DEFAULT_PROFILE, ...(options.profil || {}) });
  const now = typeof options.now === 'function' ? options.now : () => new Date();
  const store = options.store instanceof Map ? options.store : new Map();
  const maxEvents = Number.isInteger(options.max_ereignisse) ? options.max_ereignisse : 500;

  function subjectKey(subjectRef) {
    if (typeof subjectRef !== 'string' || subjectRef.length === 0) {
      throw new TypeError('subjectRef muss eine pseudonyme, nichtleere Zeichenkette sein');
    }
    return subjectRef;
  }

  function record(subjectRef, event = {}) {
    const key = subjectKey(subjectRef);
    const regime = event.expositionsregime;
    if (!REGIMES.includes(regime)) {
      throw new TypeError('expositionsregime muss tropfen, spritzer oder immersion sein');
    }
    const dauerMin = Number.isFinite(event.dauer_min) && event.dauer_min >= 0 ? event.dauer_min : 0;
    const menge = Number.isFinite(event.menge) && event.menge >= 0 ? event.menge : 1;
    const at = toMs(event.zeitpunkt || now());

    const entries = store.get(key) || [];
    const next = entries.concat([Object.freeze({ regime, dauer_min: dauerMin, menge, at })]);
    store.set(key, next.slice(-maxEvents));
    return state(key, new Date(at));
  }

  function state(subjectRef, at) {
    const key = subjectKey(subjectRef);
    const nowMs = toMs(at || now());
    const entries = store.get(key) || [];

    let saturation = 0;
    let consumedMin = 0;
    let throughputLastHour = 0;
    let lockUntil = 0;

    entries.forEach((entry) => {
      const elapsedMin = (nowMs - entry.at) / 60000;
      if (elapsedMin < 0) return;
      const conf = profile[entry.regime];
      const contribution = conf.referenz_min > 0 ? entry.dauer_min / conf.referenz_min : 0;
      saturation += decay(contribution, elapsedMin, conf.halbwertszeit_min);
      consumedMin += decay(entry.dauer_min, elapsedMin, conf.halbwertszeit_min);
      if (elapsedMin <= 60) throughputLastHour += entry.menge;
      if (conf.sperre_min > 0) {
        lockUntil = Math.max(lockUntil, entry.at + conf.sperre_min * 60000);
      }
    });

    const locked = lockUntil > nowMs;
    return Object.freeze({
      subjekt: key,
      stand: new Date(nowMs).toISOString(),
      restsaettigung: Math.min(1, Number(saturation.toFixed(6))),
      verbrauchte_zeit_min: Math.round(consumedMin),
      durchsatz_letzte_stunde: Number(throughputLastHour.toFixed(6)),
      gesperrt: locked,
      gesperrt_bis: locked ? new Date(lockUntil).toISOString() : null,
      ereignisse: entries.length
    });
  }

  function applyToCapacity(kapazitaet, subjectRef, at) {
    if (!kapazitaet || typeof kapazitaet !== 'object' || Array.isArray(kapazitaet)) {
      throw new TypeError('kapazitaet muss ein Objekt sein');
    }
    const memory = state(subjectRef, at);
    const result = { ...kapazitaet };

    if (result.dauer && typeof result.dauer === 'object') {
      const budget = result.dauer.zeitbudget_min;
      const remainingFactor = 1 - memory.restsaettigung;
      const effectiveBudget = Number.isInteger(budget)
        ? Math.max(0, Math.floor(budget * remainingFactor))
        : budget;
      result.dauer = {
        ...result.dauer,
        zeitbudget_min: Number.isInteger(effectiveBudget) && effectiveBudget > 0 ? effectiveBudget : budget,
        verbrauchte_zeit_min: memory.verbrauchte_zeit_min,
        budget_erschoepft: memory.gesperrt ||
          memory.restsaettigung >= 1 ||
          (Number.isInteger(budget) && memory.verbrauchte_zeit_min >= budget)
      };
    }

    if (result.durchsatz && typeof result.durchsatz === 'object') {
      result.durchsatz = {
        ...result.durchsatz,
        gemessen: memory.durchsatz_letzte_stunde
      };
    }

    return Object.freeze({ kapazitaet: Object.freeze(result), gedaechtnis: memory });
  }

  function forget(subjectRef) {
    return store.delete(subjectKey(subjectRef));
  }

  return Object.freeze({ record, state, applyToCapacity, forget, profil: profile });
}

module.exports = Object.freeze({ DEFAULT_PROFILE, createExposureMemory });
