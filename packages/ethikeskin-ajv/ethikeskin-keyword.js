// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 Maximilian Heiler (Logik-Institut, ORCID 0009-0003-2785-1710)
// ============================================================================
// @hikeskin — ethikeskin-core · natives Ajv-Plugin (v0.4)
// Registriert das Core-Keyword  x-psy-achse  in einer Ajv-Instanz.
//
//   const Ajv = require("ajv");
//   const ethikeskin = require("./ethikeskin-keyword");
//   const ajv = ethikeskin(new Ajv({ allErrors: true, strict: false }));
//
// NEU in v0.4: GEWICHTETE VALENZ (Zwei-Schichten-Architektur)
//   • Schicht A — Assertion/Veto: harte K-Regeln + x-schutzkern. UNGEWICHTET,
//     absorbierend, nicht saldierbar. Logik unverändert gegenüber v0.3.
//   • Schicht B — Bewertung/Grad: gewichteter, normierter Valenz-Score.
//     Gewichte wirken NUR hier und NUR im nicht-FAIL-Bereich.
//
// Kalibrierung v0.4 (2026-07-15): (1) Gewichte normativ/überschreibbar,
// (2) Mehrfachprofile = MAXIMUM je Achse, (3) Deckel 0 < w <= 3,
// (4) pass_valenz_min profilunabhängig, (5) Soft-Band-Trigger ungewichtet.
//
// NICHT_VERHANDELBAR: FAIL-Kanten sind gesperrt, nicht saldierbar.
// ============================================================================

const LAST_ACHSEN      = ["stresslast", "komplexitaetslast", "ueberwachungsdruck"];
const RESSOURCE_ACHSEN = ["erholungsfaehigkeit", "selbstwirksamkeitsstuetzung"];
const ALLE_ACHSEN      = [...LAST_ACHSEN, ...RESSOURCE_ACHSEN];

const GEWICHT_DECKEL = 3;   // 0 < w_a <= 3  (Kalibrierung #3)

const DEFAULT_CFG = {
  version: "0.4",
  skala: { min: 0, max: 10 },
  grenzwerte: {
    standard: {
      stresslast: [4, 8], komplexitaetslast: [5, 8], ueberwachungsdruck: [4, 7],
      erholungsfaehigkeit: [5, 2], selbstwirksamkeitsstuetzung: [5, 2],
    },
    vulnerabel: {
      stresslast: [3, 6], komplexitaetslast: [4, 7], ueberwachungsdruck: [3, 5],
      erholungsfaehigkeit: [6, 3], selbstwirksamkeitsstuetzung: [6, 3],
    },
  },
  stress_kopplung: { verstaerker: ["ueberwachungsdruck", "komplexitaetslast"], teiler: 4, untergrenze: 3 },
  pass_valenz_min: 5,

  // --- v0.4: Gewichtsprofile (Schicht B) -----------------------------------
  gewichte: {
    quelle: "normativ",
    profile: {
      standard:   { stresslast: 1.0, komplexitaetslast: 1.0, ueberwachungsdruck: 1.0,
                    erholungsfaehigkeit: 1.0, selbstwirksamkeitsstuetzung: 1.0 },
      vulnerabel: { stresslast: 1.0, komplexitaetslast: 1.0, ueberwachungsdruck: 2.0,
                    erholungsfaehigkeit: 1.5, selbstwirksamkeitsstuetzung: 1.5 },
      arbeit:     { stresslast: 1.5, ueberwachungsdruck: 2.5 },
    },
  },
  aggregation: { modus: "gewichtet_normiert", profil_quelle: "band", kombination: "max" },
};

// Meta-Schema, das die Keyword-*Konfiguration* selbst wohlgeformt hält (v0.4).
// NEU: gewichte + aggregation. Der Deckel wird zusätzlich zur Laufzeit erzwungen
// (loeseGewichte), das Meta-Schema kann Einzelgewichte statisch begrenzen.
const CONFIG_METASCHEMA = {
  type: "object",
  properties: {
    version: { type: "string" },
    skala: { type: "object" },
    grenzwerte: { type: "object" },
    stress_kopplung: {
      type: "object",
      properties: {
        verstaerker: { type: "array", items: { type: "string" } },
        teiler: { type: "number", exclusiveMinimum: 0 },
        untergrenze: { type: "number", minimum: 0 },
      },
    },
    pass_valenz_min: { type: "number" },
    vulnerabel: { type: "boolean" },
    domaene: { type: ["string", "null"] },
    gewichte: {
      type: "object",
      properties: {
        quelle: { enum: ["normativ", "empirisch"] },
        profile: {
          type: "object",
          // jedes Profil ist eine Achse->Gewicht-Abbildung, jedes Gewicht 0 < w <= 3
          additionalProperties: {
            type: "object",
            additionalProperties: { type: "number", exclusiveMinimum: 0, maximum: GEWICHT_DECKEL },
          },
        },
      },
      additionalProperties: false,
    },
    aggregation: {
      type: "object",
      properties: {
        modus: { enum: ["gewichtet_normiert", "ungewichtet"] },
        profil_quelle: { type: "string" },
        kombination: { enum: ["max"] },
      },
    },
  },
  additionalProperties: true,
};

function achsenTyp(a) { return LAST_ACHSEN.includes(a) ? "LAST" : "RESSOURCE"; }
function valenz(dim, typ) {
  const s = dim.richtung === "REDUZIERT" ? +1 : dim.richtung === "ERHOEHT" ? -1 : 0;
  return (typ === "RESSOURCE" ? -s : s) * dim.intensitaet;
}

// --- v0.4: Gewichtsauflösung (MAXIMUM je Achse, Deckel 0 < w <= 3) ----------
function loeseGewichte(gewCfg, aktiveProfile) {
  const profile = gewCfg?.profile ?? {};
  const w = {};
  for (const a of ALLE_ACHSEN) {
    const werte = aktiveProfile.map((name) => profile[name]?.[a]).filter((v) => typeof v === "number");
    const wa = werte.length ? Math.max(...werte) : 1.0;
    if (!(wa > 0)) throw new Error(`Gewicht ${a}=${wa} verletzt Untergrenze (0 < w)`);
    if (wa > GEWICHT_DECKEL) throw new Error(`Gewicht ${a}=${wa} verletzt Deckel (w <= ${GEWICHT_DECKEL})`);
    w[a] = wa;
  }
  return w;
}

// --- v0.4: gewichteter, normierter Valenz-Score -----------------------------
// V_gew = (Σ w_a·v_a / Σ w_a)·n ; Gleichgewicht => V_gew == Σ v_a (== v0.3).
function valenzScore(p, w, modus) {
  const roh = ALLE_ACHSEN.reduce((s, a) => s + valenz(p[a], achsenTyp(a)), 0);
  if (modus === "ungewichtet") return { score: roh, roh, w: null };
  let num = 0, wsum = 0;
  for (const a of ALLE_ACHSEN) { num += w[a] * valenz(p[a], achsenTyp(a)); wsum += w[a]; }
  return { score: +(num / wsum * ALLE_ACHSEN.length).toFixed(4), roh, w };
}

// Kern-Auswertung. Gibt { state, log, errors[], valenz } zurück.
function auswerten(p, cfg, vulnerabel, domaene = null) {
  const band = vulnerabel ? "vulnerabel" : "standard";
  const G = { ...DEFAULT_CFG.grenzwerte[band], ...(cfg.grenzwerte?.[band] || {}) };
  const kop = { ...DEFAULT_CFG.stress_kopplung, ...(cfg.stress_kopplung || {}) };
  const skala = { ...DEFAULT_CFG.skala, ...(cfg.skala || {}) };
  const passMin = cfg.pass_valenz_min ?? DEFAULT_CFG.pass_valenz_min;

  const log = [];
  const push = (regel, von, nach, grund) => log.push({ t: log.length, regel, von, nach, grund });
  const errors = [];
  const fail = (regel, msg) => { errors.push({ regel, message: msg }); };
  let state = "PASS";
  push("INIT", null, "PASS", `Start (band=${band}${domaene ? ", domaene=" + domaene : ""})`);

  // ======================= SCHICHT A — VETO (ungewichtet) ==================
  for (const a of ALLE_ACHSEN) {
    const d = p?.[a];
    if (!d) { fail("STRUKTUR", `Achse '${a}' fehlt`); continue; }
    if (typeof d.intensitaet !== "number" || d.intensitaet < skala.min || d.intensitaet > skala.max)
      fail("STRUKTUR", `${a}.intensitaet ausserhalb [${skala.min},${skala.max}]`);
    if (!d.begruendung || !String(d.begruendung).length) {
      push("TRANSPARENZ_PFLICHT", state, "PRUEFEN", `${a}.begruendung fehlt`);
      if (state !== "FAIL") state = "PRUEFEN";
    }
  }
  if (errors.length) return { state: "FAIL", log, errors, valenz: null };

  const gHard = G.stresslast[1];
  const verst = kop.verstaerker.reduce((s, a) => s + p[a].intensitaet, 0);
  const abzug = Math.ceil(verst / kop.teiler);
  const gEff = Math.max(kop.untergrenze, gHard - abzug);
  push("K-STRESS/CALC", null, null, `G_stress_eff = ${gHard} - ceil(${verst}/${kop.teiler})=${abzug} => ${gEff}`);
  if (p.stresslast.intensitaet >= gEff) {
    push("K-STRESS", state, "FAIL", `stresslast ${p.stresslast.intensitaet} >= G_stress_eff ${gEff}`);
    fail("K-STRESS", `stresslast ${p.stresslast.intensitaet} >= dynamischer Grenzwert ${gEff} (Kopplung Ueberwachung+Komplexitaet)`);
    state = "FAIL";
  }
  if (p.ueberwachungsdruck.intensitaet >= G.ueberwachungsdruck[1]) {
    push("K-UEBER", state, "FAIL", `ueberwachungsdruck KRITISCH`);
    fail("K-UEBER", `ueberwachungsdruck ${p.ueberwachungsdruck.intensitaet} >= G_hard ${G.ueberwachungsdruck[1]} (KRITISCH)`);
    state = "FAIL";
  }
  if (p.stresslast.richtung === "ERHOEHT" && p.ausgleich_dokumentiert === false) {
    push("K-STRESS-RAW", state, "FAIL", `Stress ERHOEHT ohne Ausgleich`);
    fail("K-STRESS-RAW", `stresslast ERHOEHT ohne dokumentierten Ausgleich`);
    state = "FAIL";
  }
  for (const a of RESSOURCE_ACHSEN) {
    if (p[a].intensitaet <= G[a][1]) {
      push("K-RESSOURCE", state, "FAIL", `${a} <= G_hard`);
      fail("K-RESSOURCE", `${a} ${p[a].intensitaet} <= G_hard ${G[a][1]}`);
      state = "FAIL";
    }
  }

  // ======================= SCHICHT B — GRAD (gewichtet) ====================
  let scoreInfo = null;
  if (state !== "FAIL") {
    const aggr = { ...DEFAULT_CFG.aggregation, ...(cfg.aggregation || {}) };
    const modus = aggr.modus || "gewichtet_normiert";
    const aktiveProfile = [band, ...(domaene ? [domaene] : [])];
    const w = modus === "ungewichtet" ? null : loeseGewichte(cfg.gewichte || DEFAULT_CFG.gewichte, aktiveProfile);
    if (w) push("GEWICHTE", null, null, `Profile [${aktiveProfile.join(", ")}] (max, Deckel ${GEWICHT_DECKEL})`);

    // Soft-Band-Trigger UNGEWICHTET (Kalibrierung #5)
    let soft = 0;
    for (const a of LAST_ACHSEN) if (p[a].intensitaet >= G[a][0]) soft++;

    scoreInfo = valenzScore(p, w, modus);
    push("VALENZ", null, null, `V_gew=${scoreInfo.score} (roh Σ=${scoreInfo.roh}, modus=${modus})`);

    if (soft >= 1 || scoreInfo.score < 0) {
      if (state !== "PRUEFEN") push("AGG/PRUEFEN", state, "PRUEFEN", `${soft} Lastachse(n) im Soft-Band, V_gew=${scoreInfo.score}`);
      state = "PRUEFEN";
    } else if (state === "PASS" && scoreInfo.score >= passMin) {
      push("AGG/PASS", state, "PASS", `V_gew=${scoreInfo.score} >= ${passMin}`);
    }
  }
  return { state, log, errors, valenz: scoreInfo };
}

// Ajv-Plugin
module.exports = function ethikeskinPlugin(ajv) {
  ajv.addKeyword({
    keyword: "x-psy-achse",
    metaSchema: CONFIG_METASCHEMA,
    validate: function validateXPsyAchse(schemaCfg, data /*, parentSchema, dataCxt */) {
      const cfg = { ...DEFAULT_CFG, ...(schemaCfg && typeof schemaCfg === "object" ? schemaCfg : {}) };
      const vulnerabel = !!cfg.vulnerabel;
      const domaene = cfg.domaene || null;
      let res;
      try {
        res = auswerten(data, cfg, vulnerabel, domaene);
      } catch (e) {
        // Konfigurationsfehler (z. B. Deckelverletzung) => als Assertion-Fehler melden.
        validateXPsyAchse.errors = [{ keyword: "x-psy-achse", message: `[KONFIG] ${e.message}`, params: { regel: "KONFIG" } }];
        return false;
      }
      const { state, log, errors, valenz } = res;
      validateXPsyAchse.verdikt = { state, marker: { PASS: "🟩", PRUEFEN: "🟨", FAIL: "🟥" }[state], valenz, log };
      if (state === "FAIL") {
        validateXPsyAchse.errors = errors.map((e) => ({
          keyword: "x-psy-achse", message: `[${e.regel}] ${e.message}`, params: { regel: e.regel },
        }));
        return false;
      }
      return true;
    },
    errors: true,
  });
  return ajv;
};

module.exports.DEFAULT_CFG = DEFAULT_CFG;
module.exports.auswerten = auswerten;
module.exports.loeseGewichte = loeseGewichte;
module.exports.valenzScore = valenzScore;
module.exports.GEWICHT_DECKEL = GEWICHT_DECKEL;
