// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 Maximilian Heiler (Logik-Institut, ORCID 0009-0003-2785-1710)
const Ajv = require("ajv");
const ethikeskin = require("./ethikeskin-keyword");

const ajv = ethikeskin(new Ajv({ allErrors: true, strict: false }));

const dim = (richtung, intensitaet, begruendung = "belegt") => ({ richtung, intensitaet, begruendung });

// Schema-Fabrik: x-psy-achse-Keyword auf dem Achsen-Objekt, Konfig optional (vulnerabel)
function schema(vulnerabel = false) {
  return {
    $id: `https://logik-institut.org/schemas/instanz/${vulnerabel ? "vuln" : "std"}`,
    type: "object",
    properties: {
      "x-psy-achse": {
        type: "object",
        "x-psy-achse": { vulnerabel }, // Keyword-Konfiguration (nutzt Defaults + Kontext)
      },
    },
  };
}

const validateStd  = ajv.compile(schema(false));
const validateVuln = ajv.compile(schema(true));

function run(name, achse, vulnerabel = false) {
  const fn = vulnerabel ? validateVuln : validateStd;
  const instanz = { "x-psy-achse": achse };
  const ok = fn(instanz);
  // Verdikt/Log liegen an der Keyword-Validierungsfunktion (introspizierbar)
  const kw = ajv.getKeyword("x-psy-achse");
  const verdikt = kw.validate.verdikt;
  console.log(`\n=== ${name} ===  ajv.valid=${ok}  ->  ${verdikt.marker} ${verdikt.state}`);
  if (!ok && fn.errors) fn.errors.forEach((e) => console.log("   ⨯", e.message));
  verdikt.log.forEach((l) => console.log(`   t=${l.t} ${l.regel} ${l.von ?? "-"}->${l.nach ?? "-"} | ${l.grund}`));
  return { ok, state: verdikt.state };
}

const results = [];
results.push(["A", run("A hohe Kopplung (6/6/6)", {
  stresslast: dim("ERHOEHT", 6), komplexitaetslast: dim("ERHOEHT", 6), ueberwachungsdruck: dim("ERHOEHT", 6),
  erholungsfaehigkeit: dim("ERHOEHT", 7), selbstwirksamkeitsstuetzung: dim("ERHOEHT", 6), ausgleich_dokumentiert: true,
}).state]);
results.push(["B", run("B niedrige Kopplung (6/2/2)", {
  stresslast: dim("ERHOEHT", 6), komplexitaetslast: dim("REDUZIERT", 2), ueberwachungsdruck: dim("REDUZIERT", 2),
  erholungsfaehigkeit: dim("ERHOEHT", 7), selbstwirksamkeitsstuetzung: dim("ERHOEHT", 6), ausgleich_dokumentiert: true,
}).state]);
results.push(["C", run("C sauberes PASS", {
  stresslast: dim("REDUZIERT", 1), komplexitaetslast: dim("REDUZIERT", 2), ueberwachungsdruck: dim("REDUZIERT", 1),
  erholungsfaehigkeit: dim("ERHOEHT", 8), selbstwirksamkeitsstuetzung: dim("ERHOEHT", 8), ausgleich_dokumentiert: true,
}).state]);
results.push(["D", run("D Ueberwachung KRITISCH (ueber=7)", {
  stresslast: dim("REDUZIERT", 2), komplexitaetslast: dim("REDUZIERT", 2), ueberwachungsdruck: dim("ERHOEHT", 7),
  erholungsfaehigkeit: dim("ERHOEHT", 8), selbstwirksamkeitsstuetzung: dim("ERHOEHT", 8), ausgleich_dokumentiert: true,
}).state]);
results.push(["E", run("E Selbstwirksamkeit-Defizit (=2)", {
  stresslast: dim("REDUZIERT", 2), komplexitaetslast: dim("REDUZIERT", 2), ueberwachungsdruck: dim("REDUZIERT", 2),
  erholungsfaehigkeit: dim("ERHOEHT", 7), selbstwirksamkeitsstuetzung: dim("REDUZIERT", 2), ausgleich_dokumentiert: true,
}).state]);
results.push(["F", run("F vulnerabel 🛡 (6/2/2)", {
  stresslast: dim("ERHOEHT", 6), komplexitaetslast: dim("REDUZIERT", 2), ueberwachungsdruck: dim("REDUZIERT", 2),
  erholungsfaehigkeit: dim("ERHOEHT", 7), selbstwirksamkeitsstuetzung: dim("ERHOEHT", 6), ausgleich_dokumentiert: true,
}, true).state]);
results.push(["G", run("G fehlende begruendung", {
  stresslast: { richtung: "REDUZIERT", intensitaet: 2, begruendung: "" },
  komplexitaetslast: dim("REDUZIERT", 2), ueberwachungsdruck: dim("REDUZIERT", 2),
  erholungsfaehigkeit: dim("ERHOEHT", 8), selbstwirksamkeitsstuetzung: dim("ERHOEHT", 8), ausgleich_dokumentiert: true,
}).state]);

// Paritätsprüfung gegen erwartete Verdikte aus v0.2
const erwartet = { A: "FAIL", B: "PRUEFEN", C: "PASS", D: "FAIL", E: "FAIL", F: "FAIL", G: "PRUEFEN" };
let ok = true;
console.log("\n----- PARITÄT ggü. v0.2 Referenz-Validator -----");
for (const [id, state] of results) {
  const pass = state === erwartet[id];
  ok = ok && pass;
  console.log(`  ${id}: ajv=${state}  erwartet=${erwartet[id]}  ${pass ? "✓" : "✗ ABWEICHUNG"}`);
}
console.log(ok ? "\n✅ Alle 7 Fälle: Ajv-Plugin identisch zum Referenz-Validator." : "\n❌ Abweichung gefunden.");
process.exit(ok ? 0 : 1);
