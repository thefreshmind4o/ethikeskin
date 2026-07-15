// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 Maximilian Heiler (Logik-Institut, ORCID 0009-0003-2785-1710)
//
// v0.4-Testsuite (self-contained, nur Ajv als peer dependency):
//   Teil 1 — Verdikt-Parität A–G (gewichtsgleich reproduziert v0.2/v0.3-Verdikte)
//   Teil 2 — gewichtete Valenz (Schicht B): Fälle H/I unter Gewichtsprofilen
//   Teil 3 — Invarianten: Regression w=1, Veto gewichtsfrei, Gewichts-Deckel
const Ajv = require("ajv");
const ethikeskin = require("./ethikeskin-keyword");
const { auswerten, loeseGewichte, valenzScore, DEFAULT_CFG, GEWICHT_DECKEL } = ethikeskin;

const ajv = ethikeskin(new Ajv({ allErrors: true, strict: false }));
const dim = (richtung, intensitaet, begruendung = "belegt") => ({ richtung, intensitaet, begruendung });

let pass = 0, fail = 0;
const ok = (n, c, i = "") => { (c ? pass++ : fail++); console.log(`${c ? "✅" : "❌"} ${n}${i ? "  — " + i : ""}`); };

// ============================================================================
// Teil 1 — Verdikt-Parität A–G über das kompilierte Ajv-Keyword
// ============================================================================
function schema(vulnerabel = false) {
  return {
    $id: `https://logik-institut.org/schemas/instanz/${vulnerabel ? "vuln" : "std"}`,
    type: "object",
    properties: { "x-psy-achse": { type: "object", "x-psy-achse": { vulnerabel } } },
  };
}
const validateStd = ajv.compile(schema(false));
const validateVuln = ajv.compile(schema(true));

function verdikt(achse, vulnerabel = false) {
  const fn = vulnerabel ? validateVuln : validateStd;
  fn({ "x-psy-achse": achse });
  return ajv.getKeyword("x-psy-achse").validate.verdikt;
}

const faelle = {
  A: [{ stresslast: dim("ERHOEHT", 6), komplexitaetslast: dim("ERHOEHT", 6), ueberwachungsdruck: dim("ERHOEHT", 6),
        erholungsfaehigkeit: dim("ERHOEHT", 7), selbstwirksamkeitsstuetzung: dim("ERHOEHT", 6), ausgleich_dokumentiert: true }, false, "FAIL"],
  B: [{ stresslast: dim("ERHOEHT", 6), komplexitaetslast: dim("REDUZIERT", 2), ueberwachungsdruck: dim("REDUZIERT", 2),
        erholungsfaehigkeit: dim("ERHOEHT", 7), selbstwirksamkeitsstuetzung: dim("ERHOEHT", 6), ausgleich_dokumentiert: true }, false, "PRUEFEN"],
  C: [{ stresslast: dim("REDUZIERT", 1), komplexitaetslast: dim("REDUZIERT", 2), ueberwachungsdruck: dim("REDUZIERT", 1),
        erholungsfaehigkeit: dim("ERHOEHT", 8), selbstwirksamkeitsstuetzung: dim("ERHOEHT", 8), ausgleich_dokumentiert: true }, false, "PASS"],
  D: [{ stresslast: dim("REDUZIERT", 2), komplexitaetslast: dim("REDUZIERT", 2), ueberwachungsdruck: dim("ERHOEHT", 7),
        erholungsfaehigkeit: dim("ERHOEHT", 8), selbstwirksamkeitsstuetzung: dim("ERHOEHT", 8), ausgleich_dokumentiert: true }, false, "FAIL"],
  E: [{ stresslast: dim("REDUZIERT", 2), komplexitaetslast: dim("REDUZIERT", 2), ueberwachungsdruck: dim("REDUZIERT", 2),
        erholungsfaehigkeit: dim("ERHOEHT", 7), selbstwirksamkeitsstuetzung: dim("REDUZIERT", 2), ausgleich_dokumentiert: true }, false, "FAIL"],
  F: [{ stresslast: dim("ERHOEHT", 6), komplexitaetslast: dim("REDUZIERT", 2), ueberwachungsdruck: dim("REDUZIERT", 2),
        erholungsfaehigkeit: dim("ERHOEHT", 7), selbstwirksamkeitsstuetzung: dim("ERHOEHT", 6), ausgleich_dokumentiert: true }, true, "FAIL"],
  G: [{ stresslast: { richtung: "REDUZIERT", intensitaet: 2, begruendung: "" },
        komplexitaetslast: dim("REDUZIERT", 2), ueberwachungsdruck: dim("REDUZIERT", 2),
        erholungsfaehigkeit: dim("ERHOEHT", 8), selbstwirksamkeitsstuetzung: dim("ERHOEHT", 8), ausgleich_dokumentiert: true }, false, "PRUEFEN"],
};

console.log("----- Teil 1: Verdikt-Parität A–G (gewichtsgleich ≙ v0.2/v0.3) -----");
for (const [id, [achse, vuln, erw]] of Object.entries(faelle)) {
  const v = verdikt(achse, vuln);
  ok(`Fall ${id}: ${v.marker} ${v.state} (erwartet ${erw})`, v.state === erw, v.state !== erw ? `ABWEICHUNG` : "");
}

// ============================================================================
// Teil 2 — gewichtete Valenz (Schicht B): Fälle H/I unter Profilen
// ============================================================================
console.log("\n----- Teil 2: gewichtete, normierte Valenz (Schicht B) -----");
const H = { stresslast: dim("REDUZIERT", 2), komplexitaetslast: dim("REDUZIERT", 2), ueberwachungsdruck: dim("ERHOEHT", 4),
            erholungsfaehigkeit: dim("ERHOEHT", 7), selbstwirksamkeitsstuetzung: dim("ERHOEHT", 7), ausgleich_dokumentiert: true };
const I = { stresslast: dim("REDUZIERT", 1), komplexitaetslast: dim("REDUZIERT", 1), ueberwachungsdruck: dim("ERHOEHT", 5),
            erholungsfaehigkeit: dim("ERHOEHT", 8), selbstwirksamkeitsstuetzung: dim("ERHOEHT", 8), ausgleich_dokumentiert: true };

// Fall H standard: ueber=4 trifft Soft-Band (G_soft=4) -> PRUEFEN; Valenz-Score 14 (ungewichtet ≙ w=1)
const rH_std = auswerten(H, DEFAULT_CFG, false, null);
ok("Fall H standard: PRUEFEN (Soft-Band ueber=4), Valenz 14", rH_std.state === "PRUEFEN" && rH_std.valenz && rH_std.valenz.score === 14, `state=${rH_std.state} v=${rH_std.valenz && rH_std.valenz.score}`);

const rH_vuln = auswerten(H, DEFAULT_CFG, true, null);
ok("Fall H vulnerabel: Valenz < standard (Lasten stärker gewichtet)", rH_vuln.valenz && rH_vuln.valenz.score < 14, `v=${rH_vuln.valenz && rH_vuln.valenz.score}`);

// Fall I im vulnerabel-Band: ueber=5 >= G_hard 5 -> K-UEBER-Veto (Schicht A vor B)
const rI_vuln = auswerten(I, DEFAULT_CFG, true, null);
ok("Fall I vulnerabel: FAIL per K-UEBER-Veto, keine Saldierung", rI_vuln.state === "FAIL" && rI_vuln.valenz === null, `state=${rI_vuln.state}`);

// ============================================================================
// Teil 3 — Invarianten
// ============================================================================
console.log("\n----- Teil 3: Invarianten -----");
// (I1) Regression: gewichtsgleich (w=1) == roher v0.3-Score
const gleich = { stresslast: 1, komplexitaetslast: 1, ueberwachungsdruck: 1, erholungsfaehigkeit: 1, selbstwirksamkeitsstuetzung: 1 };
const sc = valenzScore(H, gleich, "gewichtet_normiert");
ok("I1 Regression: w=1 ⇒ gewichtet == roh", sc.score === sc.roh, `score=${sc.score} roh=${sc.roh}`);

// (I2) Veto gewichtsfrei: Fall A bleibt FAIL auch unter Extremgewichten 3/3/3/3/3
const extremCfg = { ...DEFAULT_CFG, gewichte: { profile: { standard: { stresslast: 3, komplexitaetslast: 3, ueberwachungsdruck: 3, erholungsfaehigkeit: 3, selbstwirksamkeitsstuetzung: 3 } } } };
const rA = auswerten(faelle.A[0], extremCfg, false, null);
ok("I2 Veto gewichtsfrei: Fall A bleibt FAIL, Valenz null", rA.state === "FAIL" && rA.valenz === null, `state=${rA.state}`);

// (I3) Gewichts-Deckel: w > GEWICHT_DECKEL wirft
let warf = false;
try { loeseGewichte({ profile: { standard: { stresslast: GEWICHT_DECKEL + 0.1 } } }, ["standard"]); }
catch (e) { warf = true; }
ok(`I3 Deckel: Gewicht > ${GEWICHT_DECKEL} wird abgewiesen`, warf);

console.log(`\n================  ${pass} bestanden, ${fail} fehlgeschlagen  ================`);
process.exit(fail ? 1 : 0);
