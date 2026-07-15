# ethikeskin-ajv — natives `x-psy-achse`-Keyword für Ajv

Registriert das Core-Keyword **`x-psy-achse`** des Vokabulars `ethikeskin-core`
(`https://logik-institut.org/vocab/ethikeskin-core`) in einer Ajv-Instanz. Damit
prüfen Standard-JSON-Schema-Validatoren den @hikeskin-Dialekt nativ — inklusive
des dynamischen Stress-Kipppunkts (Überwachung × Komplexität), der harten
Fail-Kopplungen und der 🛡-Grenzwertbänder für vulnerable Gruppen.

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
node test-ajv.js
# ✅ Alle 7 Fälle: Ajv-Plugin identisch zum Referenz-Validator.
```

Die sieben Fälle (A–G) decken: dynamische Kopplung (A vs. B), sauberes PASS (C),
harten Überwachungs-Fail (D), Ressourcen-Defizit (E), 🛡-Verschärfung (F) und
Transparenz-Pflicht mit Monotonie-Garantie (G).

---

*Logik-Institut — @hikeskin / EthicalSchema · Lizenz CC BY 4.0 · Autor Heiler, Maximilian (ORCID 0009-0003-2785-1710).*
