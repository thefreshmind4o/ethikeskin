# EthikeSkin Pruefstrecke

Stand: 16.08.2026

Die Pruefstrecke laeuft ueber den Workflow `.github/workflows/ethikeskin-pruefstrecke.yml`
und wird bei jeder Aenderung in `packages/ethikeskin-ajv/**` oder `schemas/**` ausgeloest.
Manuell startbar ueber `workflow_dispatch`.

## Module

| Modul | Aufgabe | Pruefdatei |
|---|---|---|
| ethikeskin-kapazitaetsregelwerk.js | Schutzwirkung und Auflagen aus Schadensschwere, Expositionsregime und Containment ableiten | pruefung-kapazitaetsregelwerk.js |
| ethikeskin-entscheidungsobjekt.js | PDP-Antwort bauen, Begruendungspflicht, Fail-closed-Kollaps | pruefung-entscheidungsobjekt.js |
| ethikeskin-entscheidungsstrecke.js | Anfrage pruefen, kanonisieren, hashen, Entscheidung gegen Schema validieren | pruefung-entscheidungsstrecke.js |
| ethikeskin-vollzugsschleuse.js | PEP: Vollzug nur bei Freigabe, gueltiger TTL, passendem Hash und erfuellten Auflagen | pruefung-vollzugsschleuse.js |
| ethikeskin-belastungsgedaechtnis.js | Restsaettigung, Abklingfunktion, Sperrfristen, Durchsatz | pruefung-gedaechtnis-und-pruefkette.js |
| ethikeskin-pruefkette.js | Manipulationsevidente Hash-Kette mit Deny-Prioritaet | pruefung-gedaechtnis-und-pruefkette.js |

## Schemata

- `schemas/ethikeskin-v1.3-query-event-contract.json` (Eingang)
- `schemas/ethikeskin-v1.4.1-kapazitaet.schema.json` (Kapazitaet, dreiachsig)
- `schemas/ethikeskin-v1.4-policy-decision.schema.json` (Entscheidung, fail-closed)
- `schemas/ethikeskin-clsdb-entscheidungs-event-v1.0.schema.json` (Vorgang)

## Auflagenkatalog

| Kennung | Auflage |
|---|---|
| AUF-101 | Zeitbudget festlegen und ueberwachen |
| AUF-102 | Gestuftes Ausstiegsprotokoll ausfuehren |
| AUF-103 | Partner- oder Vier-Augen-Prinzip |
| AUF-104 | Durchsatzlimit einhalten |
| AUF-105 | Jederzeitige Weglegbarkeit |
| AUF-106 | Versorgung oder Supervision |

## Umfang

40 Pruefungen in fuenf Dateien: 7 Kapazitaet, 8 Entscheidungsobjekt, 8 Entscheidungsstrecke,
8 Vollzugsschleuse, 9 Gedaechtnis und Pruefkette.

## Grundsatz

Jeder Fehlerpfad endet mit `wirksame_entscheidung: "verweigert"`.
Ablehnungen werden immer protokolliert und nie durch ein Ratenlimit verworfen.
