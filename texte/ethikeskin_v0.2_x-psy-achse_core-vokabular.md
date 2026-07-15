# Ethikeskin v0.2 — `x-psy-achse` als Core-Keyword

### Vom Evaluator zur formalen Grammatik: das `ethikeskin-core`-Vokabular

*Logik-Institut — @hikeskin / EthicalSchema · Ausbaustufe 2 (Dialekt & Vokabular)*
Autor: Heiler, Maximilian · ORCID 0009-0003-2785-1710 · Lizenz CC BY 4.0 · Sprache Deutsch · Stand 2026-07-15

---

## 0. Was v0.2 gegenüber v0.1 ändert (zuerst lesen)

> **Der entscheidende Schritt:** In v0.1 war der dynamische Stress-Kipppunkt (Überwachung × Komplexität) nur im JavaScript-Evaluator berechenbar — JSON Schema selbst konnte ihn nicht ausdrücken. In **v0.2** wird diese Logik zu einem **eigenen JSON-Schema-Keyword** `x-psy-achse`, das in einem **eigenen Vokabular** `ethikeskin-core` definiert ist. Damit ist der Kipppunkt nicht mehr Stil oder Nachrichten-Konvention, sondern **formale Grammatik**: Ein Validator, der das Vokabular kennt, *muss* die psy-Achsen-Regeln anwenden; einer, der es nicht kennt und es als erforderlich markiert ist, *muss die Verarbeitung verweigern*.

| Ebene | v0.1 | v0.2 |
|---|---|---|
| psy-Achse | `properties` mit `$ref` auf `wirkdimension` | **Core-Keyword `x-psy-achse`** mit eigener Semantik |
| Kipppunkt Überwachung × Komplexität | nur im JS-Evaluator | **deklarativ im Keyword** (`stress_kopplung`) |
| Grenzwerte | im Fließtext / Evaluator | **im Keyword als Datenobjekt** (versionierbar, 🛡-Bänder) |
| Dialekt-Bindung | `dialekt_uri`, `vokabular_uri` als Konstanten | **echtes `$vocabulary`-Meta-Schema** + Vokabular-Spezifikation |
| Fremdmarker | `additionalProperties: false` | `$vocabulary … : true` (**required**) ⇒ Ablehnung bei Unkenntnis |

Alle acht `schutzkern`-Konstanten aus v0.1 bleiben **NICHT_VERHANDELBAR** und stehen über dem Keyword. `SCHUTZ_VOR_EFFIZIENZ` bleibt hart: FAIL-Kanten sind additiv gesperrt, nie saldierbar.

**Marker-Konvention (unverändert):** `🟩 PASS` · `🟨 PRUEFEN` · `🟥 FAIL` · `🛡 verschärfter Grenzwert (vulnerabel)` · MAJUSKEL = nicht verhandelbar · Präfix `x-` = Ethikeskin-Core-Keyword.

---

## 1. Vokabular-Spezifikation `ethikeskin-core`

**Vokabular-URI:** `https://logik-institut.org/vocab/ethikeskin-core`
**Dialekt-/Meta-Schema-URI:** `https://logik-institut.org/meta/ethikeskin-0.2`

Das Vokabular definiert drei Core-Keywords. Sie sind **Applikatoren mit Assertion-Charakter**: Sie erzeugen Unterbefunde und können die Validität der Gesamtinstanz auf `false` setzen (hartes FAIL).

| Keyword | Rolle | Assertion-Verhalten |
|---|---|---|
| `x-schutzkern` | Prüft, dass alle acht NICHT_VERHANDELBAR-Konstanten `true` sind. | Fehlt eine ⇒ Instanz **ungültig**. |
| `x-gegenlast` | Prüft Gegenlast-Offenlegung. | `verdeckt = true` ⇒ Instanz **ungültig** (`FAIL_BEI_VERDECKTER_LAST`). |
| `x-psy-achse` | Operationalisiert die fünf psy-Dimensionen inkl. dynamischem Kipppunkt und Fail-Kopplung. | Jede K-Regel (§3) ⇒ Instanz **ungültig**. |

**Vokabular-Kontrakt (semantisch, für jede Implementierung verbindlich):**

1. Eine Implementierung, die `ethikeskin-core` im `$vocabulary` mit Wert `true` (= *required*) vorfindet und das Vokabular **nicht** kennt, **muss** die Validierung ablehnen (kein stilles Ignorieren).
2. `x-psy-achse` ist ein **Objekt-Keyword**: Sein Wert ist die Keyword-Konfiguration (Grenzwerte, Kopplungsparameter); der zu prüfende Dateninstanz-Zweig ist das gleichnamige Instanzfeld.
3. Alle numerischen Auswertungen (Kipppunkt, Valenz) sind **deterministisch** und **monoton verschärfend** (§4): Ein Zustand darf sich innerhalb einer Auswertung nur von PASS → PRUEFEN → FAIL bewegen, nie zurück.
4. `x-psy-achse` respektiert `VULNERABILITAET_ZUERST`: Bei `vulnerabel = true` (aus dem Auswertungskontext) gelten die 🛡-Grenzwertbänder.

---

## 2. Meta-Schema `ethikeskin-0.2` (mit `$vocabulary`)

```jsonc
{
  "$id": "https://logik-institut.org/meta/ethikeskin-0.2",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$vocabulary": {
    "https://json-schema.org/draft/2020-12/vocab/core": true,
    "https://json-schema.org/draft/2020-12/vocab/applicator": true,
    "https://json-schema.org/draft/2020-12/vocab/validation": true,
    "https://json-schema.org/draft/2020-12/vocab/meta-data": true,
    "https://logik-institut.org/vocab/ethikeskin-core": true
  },
  "$dynamicAnchor": "meta",
  "title": "Ethikeskin Meta-Schema v0.2",
  "description": "Dialekt fuer humane Technologiepruefung. Definiert die Core-Keywords x-schutzkern, x-gegenlast, x-psy-achse.",
  "allOf": [
    { "$ref": "https://json-schema.org/draft/2020-12/schema" }
  ],
  "properties": {
    "x-schutzkern": { "$dynamicRef": "#meta" },
    "x-gegenlast":  { "$dynamicRef": "#meta" },
    "x-psy-achse":  { "$dynamicRef": "#meta" }
  }
}
```

> Der `true`-Wert bei `…/vocab/ethikeskin-core` markiert das Vokabular als **erforderlich**. Damit greift Kontrakt-Regel 1: Wer `x-psy-achse` nicht versteht, darf @hikeskin-Instanzen nicht als gültig durchwinken.

---

## 3. Grammatik des Keywords `x-psy-achse`

### 3.1 Keyword-Konfiguration (was im Schema steht)

Der Wert von `x-psy-achse` im Schema ist ein Konfigurationsobjekt. Das ist die **deklarative Fassung** der gesamten v0.1-Grenzwertlogik — jetzt maschinenlesbar und versionierbar:

```jsonc
"x-psy-achse": {
  "version": "0.2",
  "skala": { "min": 0, "max": 10 },
  "grenzwerte": {
    "standard": {
      "stresslast":                  [4, 8],   // [G_soft, G_hard]  Obergrenze
      "komplexitaetslast":           [5, 8],
      "ueberwachungsdruck":          [4, 7],
      "erholungsfaehigkeit":         [5, 2],   // Untergrenze (Ressource)
      "selbstwirksamkeitsstuetzung": [5, 2]
    },
    "vulnerabel": {                             // 🛡  eine Stufe verschaerft
      "stresslast":                  [3, 6],
      "komplexitaetslast":           [4, 7],
      "ueberwachungsdruck":          [3, 5],
      "erholungsfaehigkeit":         [6, 3],
      "selbstwirksamkeitsstuetzung": [6, 3]
    }
  },
  "stress_kopplung": {
    "verstaerker": ["ueberwachungsdruck", "komplexitaetslast"],
    "teiler": 4,
    "untergrenze": 3
  },
  "pass_valenz_min": 5
}
```

### 3.2 Instanz-Zweig (was geprüft wird)

```jsonc
"x-psy-achse": {
  "stresslast":                  { "richtung": "ERHOEHT",  "intensitaet": 6, "begruendung": "Verdichtung durch Echtzeit-Takt" },
  "komplexitaetslast":           { "richtung": "ERHOEHT",  "intensitaet": 6, "begruendung": "verschachtelte Freigabepfade" },
  "ueberwachungsdruck":          { "richtung": "ERHOEHT",  "intensitaet": 6, "begruendung": "permanentes Aktivitaetslog" },
  "erholungsfaehigkeit":         { "richtung": "ERHOEHT",  "intensitaet": 7, "begruendung": "erzwungene Pausenfenster" },
  "selbstwirksamkeitsstuetzung": { "richtung": "ERHOEHT",  "intensitaet": 6, "begruendung": "transparente Wirkanzeige" },
  "ausgleich_dokumentiert": true
}
```

### 3.3 Auswertungsregeln (die formale Semantik des Keywords)

**Dynamischer Stress-Kipppunkt (die Kopplung):**

```
verstSumme    = Σ intensitaet[ stress_kopplung.verstaerker ]      // ueber + komplex
abzug         = ⌈ verstSumme / stress_kopplung.teiler ⌉
G_stress_eff  = max( stress_kopplung.untergrenze ,  G_stress_hard − abzug )
```

**Kopplungskatalog (jede Regel setzt die Instanz auf FAIL):**

| ID | Bedingung | 
|---|---|
| **K-STRESS** | `stresslast.intensitaet ≥ G_stress_eff` (dynamisch) |
| **K-UEBER** | `ueberwachungsdruck.intensitaet ≥ G_hard` (= KRITISCH) |
| **K-STRESS-RAW** | `stresslast.richtung = ERHOEHT` ∧ `ausgleich_dokumentiert = false` |
| **K-RESSOURCE** | `erholungsfaehigkeit ≤ G_hard` ∨ `selbstwirksamkeitsstuetzung ≤ G_hard` |
| **K-VERDECKT** | (via `x-gegenlast`) `verdeckt = true` |

**Aggregation (nur wenn kein FAIL):**

```
Valenz(Last)      = ±intensitaet   (REDUZIERT +, ERHOEHT −)
Valenz(Ressource) = ±intensitaet   (gestützt/ERHOEHT +, gestört/REDUZIERT −)

🟨 PRUEFEN  wenn ≥1 Lastachse ≥ G_soft  ODER  Σ Valenz < 0
🟨 PRUEFEN  wenn eine begruendung fehlt (TRANSPARENZ_PFLICHT)
🟩 PASS     nur wenn Zustand==PASS ∧ Σ Valenz ≥ pass_valenz_min
```

---

## 4. Zustandslogik & Logik-Log (monotone Verschärfung)

`x-psy-achse` ist eine **monotone Verschärfungs-State-Machine**. Ein einmal erreichtes 🟥 FAIL ist absorbierend; ein aus TRANSPARENZ_PFLICHT gesetztes 🟨 PRUEFEN kann **nicht** durch einen positiven Valenz-Score zurück auf 🟩 PASS gehoben werden (das war der in v0.1 gefundene und in v0.2 geschlossene Fehlerpfad).

```
  🟩 PASS ──► 🟨 PRUEFEN ──► 🟥 FAIL   (absorbierend)
     ▲            │
     └── nur via neue Instanz mit revision_id + Evidenz DOKUMENTIERT+
```

Jeder Übergang erzeugt einen append-only Log-Eintrag (tamber-evident, passt zur Accountability-Hood, Layer 5):

```jsonc
{ "t": 2, "regel": "K-STRESS", "von": "PASS", "nach": "FAIL",
  "grund": "stresslast 6 >= G_stress_eff 5",
  "snapshot": { "stresslast": 6, "ueberwachungsdruck": 6, "komplexitaetslast": 6 } }
```

---

## 5. Referenz-Validator (JavaScript, ausführbar)

Vollständige Datei: `ethikeskin_core_validator.js` (beigelegt). Kern:

```js
// @hikeskin — ethikeskin-core · x-psy-achse Referenz-Validator v0.2
const LAST_ACHSEN      = ["stresslast","komplexitaetslast","ueberwachungsdruck"];
const RESSOURCE_ACHSEN = ["erholungsfaehigkeit","selbstwirksamkeitsstuetzung"];
const ALLE_ACHSEN      = [...LAST_ACHSEN, ...RESSOURCE_ACHSEN];

function valenz(dim, typ) {
  const s = dim.richtung==="REDUZIERT"? +1 : dim.richtung==="ERHOEHT"? -1 : 0;
  return (typ==="RESSOURCE" ? -s : s) * dim.intensitaet;   // Ressource: gestützt = positiv
}

function validateXPsyAchse(instanz, cfg, { vulnerabel=false } = {}) {
  const band = vulnerabel ? "vulnerabel" : "standard";
  const G = cfg.grenzwerte[band];
  const p = instanz["x-psy-achse"];
  const log = []; const push=(regel,von,nach,grund)=>log.push({t:log.length,regel,von,nach,grund});
  let state="PASS"; push("INIT",null,"PASS",`Start (band=${band})`);

  // TRANSPARENZ_PFLICHT
  for (const a of ALLE_ACHSEN)
    if (!p[a]?.begruendung?.length) { push("TRANSPARENZ_PFLICHT",state,"PRUEFEN",`${a}.begruendung fehlt`); if(state!=="FAIL") state="PRUEFEN"; }

  // K-STRESS: dynamischer Kipppunkt (Überwachung × Komplexität)
  const gHard = G.stresslast[1];
  const verst = cfg.stress_kopplung.verstaerker.reduce((s,a)=>s+p[a].intensitaet,0);
  const abzug = Math.ceil(verst / cfg.stress_kopplung.teiler);
  const gEff  = Math.max(cfg.stress_kopplung.untergrenze, gHard - abzug);
  push("K-STRESS/CALC",null,null,`G_stress_eff = ${gHard} - ${abzug} => ${gEff}`);
  if (p.stresslast.intensitaet >= gEff) { push("K-STRESS",state,"FAIL",`stresslast ${p.stresslast.intensitaet} >= ${gEff}`); state="FAIL"; }

  // K-UEBER / K-STRESS-RAW / K-RESSOURCE
  if (p.ueberwachungsdruck.intensitaet >= G.ueberwachungsdruck[1]) { push("K-UEBER",state,"FAIL","ueberwachung KRITISCH"); state="FAIL"; }
  if (p.stresslast.richtung==="ERHOEHT" && p.ausgleich_dokumentiert===false) { push("K-STRESS-RAW",state,"FAIL","Stress ERHOEHT ohne Ausgleich"); state="FAIL"; }
  for (const a of RESSOURCE_ACHSEN)
    if (p[a].intensitaet <= G[a][1]) { push("K-RESSOURCE",state,"FAIL",`${a} <= G_hard`); state="FAIL"; }

  // Aggregation — monoton: PASS nie ueber ein bestehendes PRUEFEN heben
  if (state !== "FAIL") {
    let soft=0; for (const a of LAST_ACHSEN) if (p[a].intensitaet>=G[a][0]) soft++;
    const sum = ALLE_ACHSEN.reduce((s,a)=>s+valenz(p[a], LAST_ACHSEN.includes(a)?"LAST":"RESSOURCE"),0);
    if (soft>=1 || sum<0) { if(state!=="PRUEFEN") push("AGG/PRUEFEN",state,"PRUEFEN",`${soft} soft, Σvalenz=${sum}`); state="PRUEFEN"; }
    else if (state==="PASS" && sum>=cfg.pass_valenz_min) push("AGG/PASS",state,"PASS",`Σvalenz=${sum}`);
  }
  const marker={PASS:"🟩",PRUEFEN:"🟨",FAIL:"🟥"}[state];
  return { valid: state!=="FAIL", state, marker, log };
}
```

---

## 6. Verifizierte Testläufe

Sieben Instanzen gegen `ethikeskin_core_validator.js` (Ausgabe reproduzierbar via `node test_v0.2.js`):

| Fall | Instanz (Kurz) | `G_stress_eff` | Verdikt | Auslösende Regel |
|---|---|---|---|---|
| **A** | stress=6, ueber=6, komplex=6 | 8−3 = **5** | 🟥 FAIL | K-STRESS (6 ≥ 5) |
| **B** | stress=6, ueber=2, komplex=2 | 8−1 = **7** | 🟨 PRUEFEN | Soft-Band (stress ≥ 4) |
| **C** | alle Lasten niedrig, Ressourcen hoch | 7 | 🟩 PASS | Σvalenz = 20 ≥ 5 |
| **D** | ueber=7 | — | 🟥 FAIL | K-UEBER (KRITISCH) |
| **E** | selbstwirksamkeit=2 | — | 🟥 FAIL | K-RESSOURCE |
| **F** 🛡 | wie B, aber vulnerabel | 6−1 = **5** | 🟥 FAIL | K-STRESS (früher!) |
| **G** | fehlende `begruendung` | 7 | 🟨 PRUEFEN | TRANSPARENZ_PFLICHT (bleibt 🟨) |

> **Kernbeweis (A vs. B):** Identischer Stresswert 6 ergibt 🟥 FAIL bzw. 🟨 PRUEFEN — allein wegen der Kopplung Überwachung × Komplexität. **B vs. F:** Dieselbe Instanz kippt für vulnerable Gruppen (🛡) zu 🟥, weil `G_stress_hard` von 8 auf 6 sinkt. **G** belegt die Monotonie: TRANSPARENZ_PFLICHT-🟨 wird trotz Σvalenz = 22 nicht mehr zu 🟩 zurückgestuft.

---

## 7. Vollständiges @hikeskin-Instanz-Beispiel (v0.2)

```jsonc
{
  "$schema": "https://logik-institut.org/meta/ethikeskin-0.2",
  "@hikeskin": {
    "name": "Ethikeskin", "handle": "@hikeskin", "version": "0.2",
    "dialekt_uri": "https://logik-institut.org/dialect/ethikeskin-0.2",
    "vokabular_uri": "https://logik-institut.org/vocab/ethikeskin-core"
  },
  "x-schutzkern": {
    "ENTLASTUNG_ZUERST": true, "GEGENLAST_OFFENLEGEN": true,
    "FAIL_BEI_VERDECKTER_LAST": true, "AUTONOMIE_WAHREN": true,
    "TRANSPARENZ_PFLICHT": true, "KOHAESION_SCHUETZEN": true,
    "SCHUTZ_VOR_EFFIZIENZ": true, "VULNERABILITAET_ZUERST": true
  },
  "x-gegenlast": { "gegenlasten": ["Aktivitaetslog"], "verdeckt": false, "fail_status": "PRUEFEN" },
  "x-psy-achse": {
    "stresslast":                  { "richtung": "ERHOEHT",  "intensitaet": 6, "begruendung": "Echtzeit-Takt" },
    "komplexitaetslast":           { "richtung": "ERHOEHT",  "intensitaet": 6, "begruendung": "verschachtelte Pfade" },
    "ueberwachungsdruck":          { "richtung": "ERHOEHT",  "intensitaet": 6, "begruendung": "permanentes Log" },
    "erholungsfaehigkeit":         { "richtung": "ERHOEHT",  "intensitaet": 7, "begruendung": "Pausenfenster" },
    "selbstwirksamkeitsstuetzung": { "richtung": "ERHOEHT",  "intensitaet": 6, "begruendung": "Wirkanzeige" },
    "ausgleich_dokumentiert": true
  },
  "klassifikation": { "human_status": "NICHT_HUMAN_VERTRETBAR", "freigabe": "NEIN" }
}
```

Dieses Beispiel entspricht Fall A ⇒ 🟥 FAIL ⇒ Kaskade setzt `klassifikation` wie gezeigt.

---

## 8. Nächste Ausbaustufe (v0.3-Kandidaten)

- **Formales Vokabular-Meta-Schema für die Keyword-*Konfiguration*** selbst (Schema, das prüft, dass `x-psy-achse`-Grenzwerte wohlgeformt sind).
- **`x-psy-achse` als publizierbares npm/Ajv-Plugin** (`addKeyword`), damit Standard-Validatoren den Dialekt nativ laden.
- **Gewichtete Valenz** mit gruppenspezifischen Gewichten (🛡 gewichtet Überwachung höher).
- **Lesbare Charta-Fassung** neben dem Maschinen-Dialekt, damit dieselbe Logik publizistisch (Zenodo) und maschinell trägt.

---

*Logik-Institut — @hikeskin / EthicalSchema. v0.2 hebt die psy-Achse von einer Evaluator-Berechnung auf ein formales Core-Keyword `x-psy-achse` im Vokabular `ethikeskin-core`. Grenzwerte sind Kalibrierungsvorschläge (Evidenzniveau KONZEPTUELL) und über die Keyword-Konfiguration versionierbar. Alle Testläufe sind mit dem beigelegten Referenz-Validator reproduzierbar.*
