# Ethikeskin v0.1 — Spezifikationsmatrix der psy‑Achse

### Operationalisierung, Grenzwerte, gekoppelte Fail‑Bedingungen und Zustandslogik

*Logik‑Institut — @hikeskin / EthicalSchema · Ausbaustufe 1 (psy‑Achse)*
Autor: Heiler, Maximilian · ORCID 0009‑0003‑2785‑1710 · Lizenz CC BY 4.0 · Sprache Deutsch · Stand 2026‑07‑15

---

## 0. Regel‑Vorrang (zuerst lesen)

> **Diese Datei erweitert `Ethikeskin v0.1` / das Meta‑Schema `ethikeskin‑0.2` — sie ersetzt nichts.** Bei Konflikt gilt der `schutzkern` vor jeder Grenzwert‑Feinjustierung.

Die folgenden acht Konstanten des `schutzkern` bleiben **NICHT_VERHANDELBAR** und stehen über der gesamten Grenzwertlogik dieses Dokuments. Kein Grenzwert, kein Score und keine Kombination darf sie aushebeln:

| # | Konstante | Wirkung auf die psy‑Achse |
|---|-----------|----------------------------|
| 1 | `ENTLASTUNG_ZUERST` | Ein Score zählt nur, wenn eine reale Entlastung adressiert ist. |
| 2 | `GEGENLAST_OFFENLEGEN` | Jede psy‑Last muss in `begruendung` benannt sein. |
| 3 | `FAIL_BEI_VERDECKTER_LAST` | Nicht benannte psy‑Last ⇒ hartes FAIL (unabhängig vom Score). |
| 4 | `AUTONOMIE_WAHREN` | `selbstwirksamkeitsstuetzung` darf nie durch Effizienz erkauft werden. |
| 5 | `TRANSPARENZ_PFLICHT` | `richtung`/`risikostufe` müssen begründet sein, sonst UNBEKANNT ⇒ PRUEFEN. |
| 6 | `KOHAESION_SCHUETZEN` | psy‑Achse darf soziale Fragmentierung nicht kompensatorisch „wegrechnen". |
| 7 | `SCHUTZ_VOR_EFFIZIENZ` | Kein psy‑Grenzwert darf mit Leistungsgewinn verrechnet werden. |
| 8 | `VULNERABILITAET_ZUERST` | Für sensible Gruppen gelten die **verschärften** Grenzwerte (Spalte 🛡). |

**Farb-/Marker‑Konvention (visuelle Verankerung, konsistent mit @hikeskin):**
`🟩 GRÜN = PASS` · `🟨 GELB = PRUEFEN` · `🟥 ROT = FAIL` · `🛡 = verschärfter Grenzwert für vulnerable Gruppen` · MAJUSKEL = nicht verhandelbarer Marker · Präfix `x-` = Ethikeskin‑Core‑Keyword.

---

## 1. Die gemeinsame Messgröße: erweiterte `wirkdimension`

v0.2 beschreibt jede psy‑Dimension nur qualitativ (`richtung`, `risikostufe`, `begruendung`). Für eine **operationalisierbare** Matrix mit *konkreten Grenzwerten* wird `wirkdimension` um zwei quantitative Felder ergänzt, ohne die bestehenden zu brechen (additiv, abwärtskompatibel):

- `intensitaet` — **0–10** (Stärke der Wirkung, unabhängig von der Richtung).
- `valenz` — abgeleiteter **Netto‑Score −10 … +10** = `intensitaet` × Vorzeichen(`richtung`).
  Belastungsachsen (Stress, Komplexität, Überwachung): `ERHOEHT` = **negativ**, `REDUZIERT` = **positiv**.
  Ressourcenachsen (Erholung, Selbstwirksamkeit): `ERHOEHT`/gestützt = **positiv**, `REDUZIERT`/gestört = **negativ**.

Damit gilt für jede der fünf Achsen dieselbe Skala, aber die **Vorzeichenregel unterscheidet Last‑ von Ressourcenachsen**. Das ist der Kern, der die kombinatorische Fail‑Logik in §3 überhaupt rechenbar macht.

**Ableitung `risikostufe` aus `intensitaet` (Standard → 🛡 vulnerabel):**

| `intensitaet` | Belastungsachse (Standard) | Belastungsachse 🛡 | Ressourcenachse (Standard) | Marker |
|---|---|---|---|---|
| 0–2 | NIEDRIG | NIEDRIG | (hoch = gut) NIEDRIG‑Risiko | 🟩 |
| 3–5 | MITTEL | **HOCH** | MITTEL | 🟨 |
| 6–8 | HOCH | **KRITISCH** | HOCH (bei Defizit) | 🟨/🟥 |
| 9–10 | KRITISCH | KRITISCH | KRITISCH (bei Defizit) | 🟥 |

> 🛡 **Vulnerabilitäts‑Verschiebung:** Für als sensibel geprüfte Gruppen wird `risikostufe` um **eine Stufe** angehoben (Regel `VULNERABILITAET_ZUERST`). Ein Standard‑MITTEL wird für vulnerable Gruppen zu HOCH.

---

## 2. Spezifikationsmatrix der fünf psy‑Achsen (Grenzwerte je Dimension)

Skala für alle: `intensitaet` 0–10. **G_soft** = Schwelle für 🟨 PRUEFEN. **G_hard** = Schwelle für 🟥 FAIL (Einzelachse). Für Belastungsachsen ist der Grenzwert eine **Obergrenze** (darüber = schlechter); für Ressourcenachsen eine **Untergrenze** (darunter = schlechter).

| Feld (`psy_achse`) | Typ | Positive Richtung | Frageschlüssel | G_soft 🟨 (Standard / 🛡) | G_hard 🟥 (Standard / 🛡) | Notiz |
|---|---|---|---|---|---|---|
| `stresslast` | Last | REDUZIERT | Erzeugt/reduziert das System Druck, Verdichtung, Angst, Überforderung? | ≥ 4 / ≥ 3 | ≥ 8 / ≥ 6 | Kipppunkt der Kopplung (§3) |
| `komplexitaetslast` | Last | REDUZIERT | Macht es Prozesse verständlicher oder schwerer handhabbar? | ≥ 5 / ≥ 4 | ≥ 8 / ≥ 7 | Verstärker von Stress |
| `ueberwachungsdruck` | Last | REDUZIERT | Steigert es das Gefühl ständiger Beobachtung/Bewertung? | ≥ 4 / ≥ 3 | ≥ 7 / ≥ 5 | eigener harter Trigger |
| `erholungsfaehigkeit` | Ressource | ERHOEHT/geschützt | Schützt es Pausen, Grenzen, Regeneration oder stört es sie? | ≤ 5 / ≤ 6 | ≤ 2 / ≤ 3 | Untergrenze |
| `selbstwirksamkeitsstuetzung` | Ressource | ERHOEHT/gestützt | Stärkt es Handeln, Verstehen, Beeinflussen? | ≤ 5 / ≤ 6 | ≤ 2 / ≤ 3 | koppelt an `autonomiewache` |

**Lesebeispiel:** `ueberwachungsdruck.intensitaet = 7` ⇒ Standard: 🟥 FAIL (≥ 7). Für eine vulnerable Gruppe bereits ab `intensitaet = 5` ⇒ 🟥.

**Einzelachs‑Fail (harte Bedingungen, Ausbaustufe 1):**

- 🟥 `FAIL`, wenn `ueberwachungsdruck.risikostufe = "KRITISCH"` *(bereits in Turn 11 gesetzt — hier durch Grenzwert `intensitaet ≥ 7` / 🛡 ≥ 5 operationalisiert)*.
- 🟥 `FAIL`, wenn `stresslast.richtung = "ERHOEHT"` **und** kein dokumentierter Ausgleich (`ausgleich_dokumentiert = false`) *(Turn 11)*.
- 🟥 `FAIL`, wenn `erholungsfaehigkeit` **oder** `selbstwirksamkeitsstuetzung` unter G_hard fällt.

---

## 3. Gekoppelte Fail‑Bedingungen (der eigentliche Kern der Aufgabe)

Die zentrale Forderung: **Wann führt die *Kombination* aus Überwachung und Komplexität dazu, dass der Stress‑Grenzwert zum Fail kippt?** Die Logik: Überwachungsdruck und Komplexitätslast sind **Stress‑Verstärker**. Sie senken die tolerierbare Stress‑Obergrenze. Der Stress‑Grenzwert ist also nicht fix, sondern **kontextabhängig** — er wird durch die beiden anderen Lastachsen dynamisch heruntergezogen.

### 3.1 Der dynamische Stress‑Kipppunkt

**Effektiver Stress‑Grenzwert** (Obergrenze, ab der FAIL):

```
G_stress_eff = G_stress_hard − ⌈(ueberwachungsdruck.intensitaet + komplexitaetslast.intensitaet) / 4⌉
```

mit Untergrenze `G_stress_eff ≥ 3` (der Stress‑Grenzwert darf nie unter 3 kippen — sonst würde schon Grundrauschen failen; Breathability‑Prinzip).

**Kombinationstafel (Standard‑Grenzwerte; Basis G_stress_hard = 8):**

| `ueberwachungsdruck` | `komplexitaetslast` | Abzug ⌈(Σ)/4⌉ | **G_stress_eff** | `stresslast` = 5 | `stresslast` = 6 | `stresslast` = 7 |
|---|---|---|---|---|---|---|
| 2 | 2 | 1 | 7 | 🟩 PASS | 🟨 PRUEFEN | 🟨 PRUEFEN |
| 4 | 4 | 2 | 6 | 🟨 PRUEFEN | 🟥 **FAIL** | 🟥 **FAIL** |
| 6 | 4 | 3 | 5 | 🟥 **FAIL** | 🟥 **FAIL** | 🟥 **FAIL** |
| 6 | 6 | 3 | 5 | 🟥 **FAIL** | 🟥 **FAIL** | 🟥 **FAIL** |
| 8 | 6 | 4 | 4 | 🟥 **FAIL** | 🟥 **FAIL** | 🟥 **FAIL** |

> **Kern‑Aussage:** Ein *mittlerer* Stresswert (z. B. 5–6), der isoliert nur 🟨 PRUEFEN wäre, kippt zu 🟥 **FAIL**, sobald Überwachung und Komplexität gemeinsam hoch sind. Genau das ist die geforderte Kopplung: *Überwachung × Komplexität senkt die tolerierbare Stress‑Grenze.* Für vulnerable Gruppen (🛡) startet die Rechnung mit `G_stress_hard = 6`, sodass der Kipppunkt entsprechend früher liegt.

### 3.2 Vollständiger Kopplungskatalog (Ausbaustufe 1)

| ID | Bedingung (Kombination) | Ergebnis | Herkunft |
|---|---|---|---|
| **K‑STRESS** | `stresslast ≥ G_stress_eff` (dynamisch, §3.1) | 🟥 FAIL | neu (Kernkopplung) |
| **K‑UEBER** | `ueberwachungsdruck.risikostufe = KRITISCH` | 🟥 FAIL | Turn 11 |
| **K‑STRESS‑RAW** | `stresslast.richtung = ERHOEHT` ∧ `ausgleich_dokumentiert = false` | 🟥 FAIL | Turn 11 |
| **K‑AUTO** | `wahlfreiheit = false` ∧ `einfluss_erklaert = false` | 🟥 FAIL | Turn 11 |
| **K‑VULN** | `sensible_gruppen_geprueft = false` | 🟥 FAIL | Turn 11 |
| **K‑KOHAES** | `fragmentierung_vermieden = false` ∧ `inklusion_gefoerdert = false` | 🟥 FAIL | Turn 11 |
| **K‑RESSOURCE** | (`erholungsfaehigkeit < G_hard`) ∨ (`selbstwirksamkeitsstuetzung < G_hard`) | 🟥 FAIL | neu |
| **K‑DOPPELLAST** | *zwei oder mehr* Belastungsachsen ≥ ihr jeweiliges G_soft | 🟨 → eskaliert zu 🟥, wenn eine Ressourcenachse < G_soft | neu |
| **K‑VERDECKT** | `gegenlastpruefung.verdeckt = true` | 🟥 FAIL | v0.1 Schutzkern (`FAIL_BEI_VERDECKTER_LAST`) |

**Aggregations‑Regel (psy‑Achsen‑Verdikt):**

```
FAIL     wenn irgendeine K‑Regel FAIL auslöst           (harte Kante, nicht verrechenbar)
PRUEFEN  wenn kein FAIL, aber ≥1 Achse im 🟨-Band        oder Summe(valenz) < 0
PASS     wenn kein FAIL, keine Achse 🟨, Summe(valenz) ≥ +5
```

> **SCHUTZ_VOR_EFFIZIENZ:** Ein hoher positiver `selbstwirksamkeitsstuetzung`‑Score darf einen FAIL auf `ueberwachungsdruck` **nicht** kompensieren. FAIL‑Kanten sind additiv gesperrt, nicht saldierbar.

---

## 4. Code‑Fragmente zur Integration in die EthicalSchema‑Architektur

Drei anschlussfähige Ebenen, konsistent mit dem bestehenden Meta‑Schema `ethikeskin‑0.2`.

### 4.1 Erweitertes `$defs/wirkdimension` (additiv, JSON Schema 2020‑12)

```jsonc
{
  "$defs": {
    "wirkdimension": {
      "type": "object",
      "required": ["richtung", "intensitaet", "risikostufe", "begruendung"],
      "properties": {
        "richtung":    { "type": "string", "enum": ["REDUZIERT", "ERHOEHT", "UNEINDEUTIG", "UNBEKANNT"] },
        "intensitaet": { "type": "integer", "minimum": 0, "maximum": 10 },
        "valenz":      { "type": "integer", "minimum": -10, "maximum": 10,
                         "description": "abgeleitet: intensitaet x Vorzeichen(richtung, achsen_typ)" },
        "risikostufe": { "type": "string", "enum": ["NIEDRIG", "MITTEL", "HOCH", "KRITISCH"] },
        "achsen_typ":  { "type": "string", "enum": ["LAST", "RESSOURCE"] },
        "begruendung": { "type": "string", "minLength": 1 }
      },
      "additionalProperties": false
    }
  }
}
```

### 4.2 Harte Einzelachs‑Fail‑Kante im Schema (Beispiel `ueberwachungsdruck`)

```jsonc
"psy_achse": {
  "type": "object",
  "required": ["stresslast","komplexitaetslast","ueberwachungsdruck",
               "erholungsfaehigkeit","selbstwirksamkeitsstuetzung"],
  "properties": {
    "stresslast":                  { "$ref": "#/$defs/wirkdimension" },
    "komplexitaetslast":           { "$ref": "#/$defs/wirkdimension" },
    "ueberwachungsdruck":          { "$ref": "#/$defs/wirkdimension" },
    "erholungsfaehigkeit":         { "$ref": "#/$defs/wirkdimension" },
    "selbstwirksamkeitsstuetzung": { "$ref": "#/$defs/wirkdimension" },
    "ausgleich_dokumentiert":      { "type": "boolean" }
  },
  "allOf": [
    {
      "$comment": "K-UEBER: ueberwachungsdruck KRITISCH -> Schema ungueltig",
      "if":   { "properties": { "ueberwachungsdruck": {
                  "properties": { "risikostufe": { "const": "KRITISCH" } },
                  "required": ["risikostufe"] } },
                "required": ["ueberwachungsdruck"] },
      "then": false
    },
    {
      "$comment": "K-STRESS-RAW: Stress ERHOEHT ohne dokumentierten Ausgleich -> FAIL",
      "if":   { "properties": {
                  "stresslast": { "properties": { "richtung": { "const": "ERHOEHT" } },
                                  "required": ["richtung"] },
                  "ausgleich_dokumentiert": { "const": false } },
                "required": ["stresslast", "ausgleich_dokumentiert"] },
      "then": false
    }
  ],
  "additionalProperties": false
}
```

> Der **dynamische** Kipppunkt aus §3.1 (arithmetische Kopplung Überwachung + Komplexität) lässt sich in reinem JSON Schema nicht rechnen — JSON Schema ist deklarativ, nicht arithmetisch. Dafür dient der Evaluator in §4.3. Das Schema erzwingt die *statischen* Kanten; der Evaluator erzwingt die *gekoppelten*.

### 4.3 Evaluator (JavaScript) — dynamische Kopplung + psy‑Verdikt

```js
// @hikeskin — Ethikeskin psy-Achse Evaluator v0.1
// NICHT_VERHANDELBAR: FAIL-Kanten sind gesperrt, nicht saldierbar (SCHUTZ_VOR_EFFIZIENZ).

const LAST_ACHSEN      = ["stresslast", "komplexitaetslast", "ueberwachungsdruck"];
const RESSOURCE_ACHSEN = ["erholungsfaehigkeit", "selbstwirksamkeitsstuetzung"];

const G = {                        // [G_soft, G_hard] Standard | 🛡 vulnerabel
  stresslast:                  { std: [4, 8], vuln: [3, 6] },
  komplexitaetslast:           { std: [5, 8], vuln: [4, 7] },
  ueberwachungsdruck:          { std: [4, 7], vuln: [3, 5] },
  erholungsfaehigkeit:         { std: [5, 2], vuln: [6, 3] },   // Untergrenzen
  selbstwirksamkeitsstuetzung: { std: [5, 2], vuln: [6, 3] },
};

function valenz(dim, typ) {
  const s = (dim.richtung === "REDUZIERT") ? +1
          : (dim.richtung === "ERHOEHT")   ? -1 : 0;
  // Ressourcenachse: gestuetzt (ERHOEHT) ist positiv -> Vorzeichen drehen
  return (typ === "RESSOURCE" ? -s : s) * dim.intensitaet;
}

function evaluatePsyAchse(inst, { vulnerabel = false } = {}) {
  const log = [];                       // -> Logik-Log (§5)
  const push = (regel, von, nach, grund) =>
    log.push({ t: log.length, regel, von, nach, grund });

  const p = inst.psy_achse;
  const band = vulnerabel ? "vuln" : "std";
  let state = "PASS";
  push("INIT", null, "PASS", "Start: keine Verletzung angenommen");

  // --- K-STRESS: dynamischer Kipppunkt (Ueberwachung x Komplexitaet) ---
  const G_stress_hard = G.stresslast[band][1];
  const abzug   = Math.ceil((p.ueberwachungsdruck.intensitaet
                           + p.komplexitaetslast.intensitaet) / 4);
  const G_stress_eff = Math.max(3, G_stress_hard - abzug);
  push("K-STRESS/CALC", null, null,
       `G_stress_eff = ${G_stress_hard} - ${abzug} = ${G_stress_eff} `
     + `(ueber=${p.ueberwachungsdruck.intensitaet}, komplex=${p.komplexitaetslast.intensitaet})`);

  if (p.stresslast.intensitaet >= G_stress_eff) {
    push("K-STRESS", state, "FAIL",
         `stresslast ${p.stresslast.intensitaet} >= G_stress_eff ${G_stress_eff}`);
    state = "FAIL";
  }

  // --- K-UEBER ---
  if (p.ueberwachungsdruck.risikostufe === "KRITISCH") {
    push("K-UEBER", state, "FAIL", "ueberwachungsdruck = KRITISCH"); state = "FAIL";
  }
  // --- K-STRESS-RAW ---
  if (p.stresslast.richtung === "ERHOEHT" && inst.psy_achse.ausgleich_dokumentiert === false) {
    push("K-STRESS-RAW", state, "FAIL", "Stress ERHOEHT ohne Ausgleich"); state = "FAIL";
  }
  // --- K-RESSOURCE (Untergrenzen) ---
  for (const a of RESSOURCE_ACHSEN) {
    const gHard = G[a][band][1];
    if (p[a].intensitaet <= gHard) {
      push("K-RESSOURCE", state, "FAIL", `${a} ${p[a].intensitaet} <= G_hard ${gHard}`);
      state = "FAIL";
    }
  }

  // --- 🟨 PRUEFEN-Band, nur wenn (noch) kein FAIL ---
  if (state !== "FAIL") {
    let lastImSoft = 0;
    for (const a of LAST_ACHSEN)
      if (p[a].intensitaet >= G[a][band][0]) lastImSoft++;
    const summeValenz =
      LAST_ACHSEN.reduce((s,a)=>s+valenz(p[a],"LAST"),0) +
      RESSOURCE_ACHSEN.reduce((s,a)=>s+valenz(p[a],"RESSOURCE"),0);

    if (lastImSoft >= 1 || summeValenz < 0) {
      push("AGG/PRUEFEN", state, "PRUEFEN",
           `${lastImSoft} Lastachse(n) im Soft-Band, Summe(valenz)=${summeValenz}`);
      state = "PRUEFEN";
    } else if (summeValenz >= 5) {
      push("AGG/PASS", state, "PASS", `Summe(valenz)=${summeValenz} >= 5`);
    }
  }

  return { state, log,
           marker: { PASS:"🟩", PRUEFEN:"🟨", FAIL:"🟥" }[state] };
}
```

---

## 5. Logik‑Log für die Zustandsübergänge

Die psy‑Achse wird als **monotone Verschärfungs‑State‑Machine** modelliert: Zustände können nur *verschärfen* (PASS → PRUEFEN → FAIL), niemals von selbst zurück auf einen milderen Zustand. Ein einmal ausgelöstes 🟥 FAIL ist absorbierend (konsistent mit `SCHUTZ_VOR_EFFIZIENZ`: kein positiver Score „rettet" ein FAIL).

### 5.1 Zustandsdiagramm

```
        (Verschärfung ->)                      (absorbierend)
  🟩 PASS ───► 🟨 PRUEFEN ───► 🟥 FAIL ─┐
     ▲             │                     │
     └─────────────┘                     └── (kein Rueckweg ohne
   Rueckstufung NUR durch neue,              neue, geprüfte Instanz)
   dokumentierte Nachbesserung
   (revision_id + Evidenz)
```

**Übergangsregeln:**

| Von | Nach | Auslöser | Bedingung für Rückstufung |
|---|---|---|---|
| PASS | PRUEFEN | ≥1 Lastachse ≥ G_soft ∨ Summe(valenz)<0 | — |
| PASS/PRUEFEN | FAIL | eine K‑Regel (§3.2) | — |
| PRUEFEN | PASS | — | nur via **neue Instanz** mit `revision_id` + Evidenz `DOKUMENTIERT`+ |
| FAIL | PRUEFEN/PASS | — | nur via **neue Instanz**; alter Log bleibt als Audit‑Spur (Accountability‑Hood) |

### 5.2 Log‑Format (append‑only, tamper‑evident — passt zur Accountability‑Hood, Layer 5)

Jeder Übergang erzeugt einen unveränderlichen Eintrag:

```jsonc
{
  "t": 3,                          // monoton steigender Schritt-Index
  "regel": "K-STRESS",             // ausloesende Kopplung
  "von": "PRUEFEN",
  "nach": "FAIL",
  "grund": "stresslast 6 >= G_stress_eff 5",
  "achsen_snapshot": {             // Minimal-Trace, keine Rohdaten der Person (Layer 4)
    "stresslast": 6, "ueberwachungsdruck": 6, "komplexitaetslast": 6
  },
  "schutzkern_ref": "SCHUTZ_VOR_EFFIZIENZ"
}
```

### 5.3 Beispiel‑Lauf (Standardgruppe)

Instanz: `stresslast=6`, `komplexitaetslast=6`, `ueberwachungsdruck=6`, `erholungsfaehigkeit=7`, `selbstwirksamkeitsstuetzung=6`, `ausgleich_dokumentiert=true`.

```
t=0  INIT           null    -> PASS     Start: keine Verletzung angenommen
t=1  K-STRESS/CALC  --                  G_stress_eff = 8 - ⌈(6+6)/4⌉ = 8 - 3 = 5
t=2  K-STRESS       PASS    -> FAIL     stresslast 6 >= G_stress_eff 5   🟥
--- absorbierend: nachfolgende Regeln koennen FAIL nicht mildern ---
Verdikt: 🟥 FAIL   (psy_achse)
Kaskade -> klassifikation.human_status = "NICHT_HUMAN_VERTRETBAR", freigabe = "NEIN"
```

Gegenprobe ohne Kopplung — dieselbe `stresslast=6`, aber `ueberwachung=2`, `komplexitaet=2`:

```
t=0  INIT           null    -> PASS
t=1  K-STRESS/CALC  --                  G_stress_eff = 8 - ⌈(2+2)/4⌉ = 8 - 1 = 7
t=2  (kein K-STRESS: 6 < 7)
t=3  AGG/PRUEFEN    PASS    -> PRUEFEN  1 Lastachse im Soft-Band (stresslast≥4)   🟨
Verdikt: 🟨 PRUEFEN
```

> **Das ist der Beweis der geforderten Kopplung:** Identischer Stresswert (6) → einmal 🟨 PRUEFEN (niedrige Begleitlast), einmal 🟥 FAIL (hohe Überwachung + Komplexität). Der Stress‑Grenzwert *ist* die abhängige Variable von Überwachung und Komplexität.

---

## 6. Kaskade in `klassifikation` (Anbindung an bestehende Enums)

Das psy‑Achsen‑Verdikt propagiert deterministisch in die bestehenden `klassifikation`‑Enums von v0.1:

| psy‑Verdikt | `human_status` | `freigabe` |
|---|---|---|
| 🟩 PASS | `HUMAN_VERTRETBAR` | `JA` |
| 🟨 PRUEFEN | `BEDINGT_HUMAN` | `NUR_UNTER_AUFLAGEN` |
| 🟥 FAIL | `NICHT_HUMAN_VERTRETBAR` | `NEIN` |
| (Richtung/Risiko `UNBEKANNT`, `TRANSPARENZ_PFLICHT` verletzt) | `UNEINDEUTIG` | `NUR_UNTER_AUFLAGEN` |

---

## 7. Nächste Ausbaustufe (v0.2‑Kandidaten)

- **`x-psy-achse` als echtes Core‑Keyword** im Vokabular `ethikeskin-core`, damit der dynamische Kipppunkt Teil der formalen Grammatik wird (statt nur Evaluator‑Logik).
- **Gewichtete Valenz‑Summe** mit gruppenspezifischen Gewichten (🛡 gewichtet Überwachung höher).
- **Zeitreihe:** `wirkdimension` um `messzeitpunkt` erweitern, um Drift der psy‑Last (Layer 2 „drift monitoring") zu prüfen.

---

*Logik‑Institut — @hikeskin / EthicalSchema. Diese Matrix operationalisiert Ausbaustufe 1 der psy‑Achse und ist additiv anschlussfähig an das Meta‑Schema `ethikeskin‑0.2` (`https://logik-institut.org/meta/ethikeskin-0.2`). Grenzwerte sind Kalibrierungsvorschläge (Evidenzniveau KONZEPTUELL) und über den `$defs/wirkdimension`‑Mechanismus versionierbar.*
