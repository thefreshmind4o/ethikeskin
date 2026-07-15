# Lizenzübersicht — @hikeskin / Ethikeskin

*Logik-Institut · Autor: Maximilian Heiler · ORCID 0009-0003-2785-1710 · Stand 2026-07-15*

Dieses Projekt trennt **Code** und **Inhalt** bewusst in zwei Lizenzen. Das ist
gängige und empfohlene Praxis: Creative-Commons-Lizenzen sind für Texte/Inhalte
gedacht und für Software ungeeignet (dazu rät Creative Commons selbst); Software
gehört unter eine Software-Lizenz mit ausdrücklicher Patent- und Haftungsklausel.

## Auf einen Blick

| Artefakt | Typ | Lizenz | Lizenzdatei |
|---|---|---|---|
| `ethikeskin-ajv/` — Ajv-Plugin (`ethikeskin-keyword.js`, Tests) | **Code** | **Apache License 2.0** | `ethikeskin-ajv/LICENSE` + `NOTICE` |
| „Die Ethikeskin-Charta" (`ethikeskin_v0.3_charta.md`) | **Inhalt** | **CC BY 4.0** | `LICENSE-CC-BY-4.0.txt` |
| „Ethikeskin v0.2 — x-psy-achse als Core-Keyword" (Spezifikation) | **Inhalt** | **CC BY 4.0** | `LICENSE-CC-BY-4.0.txt` |
| „Ethikeskin v0.1 — Spezifikationsmatrix der psy-Achse" | **Inhalt** | **CC BY 4.0** | `LICENSE-CC-BY-4.0.txt` |

> Grenzfall: In den Spezifikationsdokumenten eingebettete **Code-Fragmente**
> (Schema-Beispiele, Validator-Ausschnitte) sind als Software zu verstehen und
> stehen unter **Apache-2.0**, auch wenn das umgebende Dokument CC BY 4.0 ist.

## Warum diese Wahl

**Code → Apache License 2.0**
- Ausdrückliche **Urheberrechts- und Patentlizenz** (Abschnitt 2 und 3) — relevant, weil der Dialekt eine neuartige Methode (dynamischer Kipppunkt) formalisiert.
- **Namensnennungs- und Änderungspflicht** (Abschnitt 4b/4c): Wer das Plugin verändert, muss Änderungen kenntlich machen und deine Urhebervermerke erhalten. Das sichert deine Urheberschaft im Weiterverbreitungsfall.
- **NOTICE-Mechanismus**: Deine Zuordnung (Logik-Institut, ORCID) muss in Derivaten mitgeführt werden.
- Kompatibel mit npm-Veröffentlichung und mit dem `SPDX-License-Identifier`-Header in den Quelldateien.

**Inhalt → CC BY 4.0**
- Entspricht deiner bestehenden Zenodo-Praxis und ist der Standard für zitierbare wissenschaftliche Publikationen.
- Erlaubt weite Nachnutzung (auch kommerziell, auch Bearbeitung) **unter der einzigen Bedingung der Namensnennung** — passend zur wissenschaftlichen Verbreitung.

## Urheberschaft (Attribution)

Beide Lizenzen verlangen bei Nachnutzung deine Nennung:

```
Heiler, Maximilian (Logik-Institut) — ORCID 0009-0003-2785-1710, 2026.
Code: Apache-2.0 · Texte: CC BY 4.0
```

## Hinweise

- Die Lizenzen regeln die **Nutzungsrechte**, nicht die Beweisbarkeit der
  Erstautorschaft. Für einen datierten, unabhängigen **Prioritätsnachweis**
  dient der geplante Zenodo-Eintrag (DOI) sowie eine öffentliche Git-Historie.
- Dies ist keine Rechtsberatung. Für den Ernstfall empfiehlt sich eine
  anwaltliche Prüfung, insbesondere zur Lizenzwahl bei kommerzieller Verwertung.
