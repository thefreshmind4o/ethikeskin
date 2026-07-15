// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 Maximilian Heiler (Logik-Institut, ORCID 0009-0003-2785-1710)
// ============================================================================
// @hikeskin — ethikeskin-core · natives Ajv-Plugin (v0.3)
// Registriert das Core-Keyword  x-psy-achse  in einer Ajv-Instanz.
//
//   const Ajv = require("ajv");
//   const ethikeskin = require("./ethikeskin-keyword");
//   const ajv = ethikeskin(new Ajv({ allErrors: true, strict: false }));
//
// Das Keyword steht im Schema auf dem Objekt, das die fünf psy-Achsen hält.
// Sein Wert ist die Keyword-Konfiguration (Grenzwerte, Kopplung).
// Assertion: jede K-Regel -> Instanz ungültig (hartes FAIL).
// NICHT_VERHANDELBAR: FAIL-Kanten sind gesperrt, nicht saldierbar.
// ============================================================================

const LAST_ACHSEN      = ["stresslast", "komplexitaetslast", "ueberwachungsdruck"];
const RESSOURCE_ACHSEN = ["erholungsfaehigkeit", "selbstwirksamkeitsstuetzung"];
const ALLE_ACHSEN      = [...LAST_ACHSEN, ...RESSOURCE_ACHSEN];

const DEFAULT_CFG = {
  version: "0.3",
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
};

// Meta-Schema, das die Keyword-*Konfiguration* selbst wohlgeformt hält (v0.3-Kandidat, hier umgesetzt)
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
    vulnerabel: { type: "boolean" }, // erlaubt, den Kontext im Schema festzuschreiben
  },
  additionalProperties: true,
};

function achsenTyp(a) { return LAST_ACHSEN.includes(a) ? "LAST" : "RESSOURCE"; }
function valenz(dim, typ) {
  const s = dim.richtung === "REDUZIERT" ? +1 : dim.richtung === "ERHOEHT" ? -1 : 0;
  return (typ === "RESSOURCE" ? -s : s) * dim.intensitaet;
}

// Kern-Auswertung. Gibt { state, log, errors[] } zurück.
function auswerten(p, cfg, vulnerabel) {
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
  push("INIT", null, "PASS", `Start (band=${band})`);

  // Strukturprüfung
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
  if (errors.length) return { state: "FAIL", log, errors };

  // K-STRESS (dynamischer Kipppunkt Überwachung × Komplexität)
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
  // K-UEBER
  if (p.ueberwachungsdruck.intensitaet >= G.ueberwachungsdruck[1]) {
    push("K-UEBER", state, "FAIL", `ueberwachungsdruck KRITISCH`);
    fail("K-UEBER", `ueberwachungsdruck ${p.ueberwachungsdruck.intensitaet} >= G_hard ${G.ueberwachungsdruck[1]} (KRITISCH)`);
    state = "FAIL";
  }
  // K-STRESS-RAW
  if (p.stresslast.richtung === "ERHOEHT" && p.ausgleich_dokumentiert === false) {
    push("K-STRESS-RAW", state, "FAIL", `Stress ERHOEHT ohne Ausgleich`);
    fail("K-STRESS-RAW", `stresslast ERHOEHT ohne dokumentierten Ausgleich`);
    state = "FAIL";
  }
  // K-RESSOURCE
  for (const a of RESSOURCE_ACHSEN) {
    if (p[a].intensitaet <= G[a][1]) {
      push("K-RESSOURCE", state, "FAIL", `${a} <= G_hard`);
      fail("K-RESSOURCE", `${a} ${p[a].intensitaet} <= G_hard ${G[a][1]}`);
      state = "FAIL";
    }
  }

  // Aggregation (monoton: PASS nie über bestehendes PRUEFEN heben)
  if (state !== "FAIL") {
    let soft = 0;
    for (const a of LAST_ACHSEN) if (p[a].intensitaet >= G[a][0]) soft++;
    const sum = ALLE_ACHSEN.reduce((s, a) => s + valenz(p[a], achsenTyp(a)), 0);
    if (soft >= 1 || sum < 0) {
      if (state !== "PRUEFEN") push("AGG/PRUEFEN", state, "PRUEFEN", `${soft} Lastachse(n) im Soft-Band, Σvalenz=${sum}`);
      state = "PRUEFEN";
    } else if (state === "PASS" && sum >= passMin) {
      push("AGG/PASS", state, "PASS", `Σvalenz=${sum} >= ${passMin}`);
    }
  }
  return { state, log, errors };
}

// Ajv-Plugin: registriert das Keyword und gibt die Ajv-Instanz zurück.
module.exports = function ethikeskinPlugin(ajv) {
  ajv.addKeyword({
    keyword: "x-psy-achse",
    // Der Keyword-Wert IST die Konfiguration; validiert wird der gleichnamige Datenzweig.
    metaSchema: CONFIG_METASCHEMA,
    // errors + data-basierte Validierung
    validate: function validateXPsyAchse(schemaCfg, data /*, parentSchema, dataCxt */) {
      const cfg = { ...DEFAULT_CFG, ...(schemaCfg && typeof schemaCfg === "object" ? schemaCfg : {}) };
      const vulnerabel = !!cfg.vulnerabel;
      const { state, log, errors } = auswerten(data, cfg, vulnerabel);

      // Verdikt + Log an die Validierungsfunktion anhängen (introspizierbar)
      validateXPsyAchse.verdikt = { state, marker: { PASS: "🟩", PRUEFEN: "🟨", FAIL: "🟥" }[state], log };

      if (state === "FAIL") {
        validateXPsyAchse.errors = errors.map((e) => ({
          keyword: "x-psy-achse",
          message: `[${e.regel}] ${e.message}`,
          params: { regel: e.regel },
        }));
        return false;
      }
      return true; // PASS und PRUEFEN sind schema-gültig; PRUEFEN = "NUR_UNTER_AUFLAGEN"
    },
    errors: true,
  });
  return ajv;
};

module.exports.DEFAULT_CFG = DEFAULT_CFG;
module.exports.auswerten = auswerten;
