# ethikeskin-ajv — natives `x-psy-achse`-Keyword für Ajv

Registriert das Core-Keyword **`x-psy-achse`** des Vokabulars `ethikeskin-core`
(`https://logik-institut.org/vocab/ethikeskin-core`) in einer Ajv-Instanz. Damit
prüfen Standard-JSON-Schema-Validatoren den @hikeskin-Dialekt nativ — inklusive
des dynamischen Stress-Kipppunkts (Überwachung × Komplexität), der harten
Fail-Kopplungen und der 🛡-Grenzwertbänder für vulnerable Gruppen.

## Zwei-Schichten-Architektur (v0.4)

Die Auswertung läuft in zwei klar getrennten Schichten — **Veto vor Grad**:

1. **Schicht A — Veto (ungewichtet, absorbierend).** K-Regeln, Transparenz-Pflicht
   und die schutzkern-Konstanten. Feuert eine Regel, ist die Instanz 🟥 FAIL —
   **kein Gewicht kann das aufheben** (`valenz = null`).
2. **Schicht B — Grad (gewichtet, normiert).** Nur wenn kein Veto vorliegt, wird
   die Feinabstufung 🟩/🟨 aus einer gewichteten, normierten Valenz gebildet:
   \( V_{gew} = \frac{\sum_a w_a \cdot v_a}{\sum_a w_a} \cdot n \) (n = 5 Achsen).

Bei gleichen Gewichten (w = 1) ist \(V_{gew}\) skaleninvariant identisch zur rohen
v0.3-Summe — die A–G-Verdikte bleiben also **unverändert**. Gewichtsprofile
(`standard`, `vulnerabel`, `arbeit`) sind über `cfg.gewichte` konfigurierbar;
mehrere aktive Profile werden pro Achse **maximal** kombiniert und durch einen
**Deckel** \(0 < w \le 3\) begrenzt. Gewichte sind normativ/überschreibbar
(Kalibrierungsvorschläge, Evidenzniveau KONZEPTUELL).

## Installation

```bash
npm install @logikinstitut/ethikeskin-ajv ajv@^8
```

```js
const ethikeskin = require("@logikinstitut/ethikeskin-ajv");
```

(Alternativ die Datei `ethikeskin-keyword.js` direkt ins Projekt kopieren.)

## Nutzung

```js
const Ajv = require("ajv");
const ethikeskin = require("./ethikeskin-keyword");

const ajv = ethikeskin(new Ajv({ allErrors: true, strict: false }));

const schema = {
  type: "object",
  properties: {
    "x-psy-achse": {
      type: "object",
      "x-psy-achse": { vulnerabel: false }   // Keyword-Konfiguration (Defaults + Kontext)
    }
  }
};

const validate = ajv.compile(schema);

const instanz = {
  "x-psy-achse": {
    stresslast:                  { richtung: "ERHOEHT", intensitaet: 6, begruendung: "Echtzeit-Takt" },
    komplexitaetslast:           { richtung: "ERHOEHT", intensitaet: 6, begruendung: "verschachtelte Pfade" },
    ueberwachungsdruck:          { richtung: "ERHOEHT", intensitaet: 6, begruendung: "permanentes Log" },
    erholungsfaehigkeit:         { richtung: "ERHOEHT", intensitaet: 7, begruendung: "Pausenfenster" },
    selbstwirksamkeitsstuetzung: { richtung: "ERHOEHT", intensitaet: 6, begruendung: "Wirkanzeige" },
    ausgleich_dokumentiert: true
  }
};

const ok = validate(instanz);           // false  (FAIL durch Kopplung)
console.log(validate.errors);           // [{ message: "[K-STRESS] stresslast 6 >= dynamischer Grenzwert 5 ..." }]

// Verdikt + Logik-Log introspizieren:
const kw = ajv.getKeyword("x-psy-achse");
console.log(kw.validate.verdikt);       // { state:"FAIL", marker:"🟥", log:[ ... ] }
```

## Verdikt-Semantik

| Ajv-Ergebnis | Verdikt | Bedeutung |
|---|---|---|
| `valid = false` | 🟥 **FAIL** | Instanz ungültig; eine K-Regel ausgelöst. `NICHT_HUMAN_VERTRETBAR / freigabe=NEIN`. |
| `valid = true`, Verdikt `PRUEFEN` | 🟨 **PRUEFEN** | Schema-gültig, aber `BEDINGT_HUMAN / NUR_UNTER_AUFLAGEN`. |
| `valid = true`, Verdikt `PASS` | 🟩 **PASS** | `HUMAN_VERTRETBAR / freigabe=JA`. |

> Hinweis: 🟨 PRUEFEN ist **schema-gültig**, weil es eine Auflage, kein Regelbruch ist.
> Wer PRUEFEN wie FAIL behandeln will, wertet zusätzlich `kw.validate.verdikt.state` aus.

## Test

```bash
npm install ajv@^8 --no-save
node test-ajv.js
# ✅ 13 bestanden, 0 fehlgeschlagen
```

Die Suite deckt drei Teile ab:

- **Teil 1 — Verdikt-Parität A–G (7 Fälle):** dynamische Kopplung (A vs. B),
  sauberes PASS (C), harten Überwachungs-Fail (D), Ressourcen-Defizit (E),
  🛡-Verschärfung (F), Transparenz-Pflicht mit Monotonie-Garantie (G). Bei
  gleichen Gewichten identisch zum v0.2/v0.3-Referenz-Validator.
- **Teil 2 — gewichtete Valenz (Schicht B):** Fälle H/I unter Profilen, inkl.
  Nachweis, dass das K-UEBER-Veto der gewichteten Saldierung vorausgeht.
- **Teil 3 — Invarianten:** Regression (w = 1 ⇒ gewichtet == roh), Veto
  gewichtsfrei (Fall A bleibt FAIL unter Extremgewichten 3/3/3/3/3),
  Gewichts-Deckel (w > 3 wird abgewiesen).

---

*Logik-Institut — @hikeskin / EthicalSchema · Lizenz CC BY 4.0 · Autor Heiler, Maximilian (ORCID 0009-0003-2785-1710).*
