# Ethikeskin (@hikeskin)

**Ein JSON-Schema-Dialekt für humane Technologieprüfung — Charta, Spezifikation und ausführbare Referenz-Implementierung.**

Autor: **Maximilian Heiler** · ORCID [0009-0003-2785-1710](https://orcid.org/0009-0003-2785-1710) · Logik-Institut

[![CI](https://github.com/thefreshmind4o/ethikeskin/actions/workflows/ci.yml/badge.svg)](https://github.com/thefreshmind4o/ethikeskin/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@logikinstitut/ethikeskin-ajv.svg)](https://www.npmjs.com/package/@logikinstitut/ethikeskin-ajv)

![Illustration der Schutzschichten von Ethikeskin: konzentrische Schichten (Relief, Counterbalance, Autonomy, Transparency, Cohesion, Vulnerability) um einen technischen Kern. Links abgewehrte Risiken (Ueberwachung, Ueberlastung, Manipulation, Ausgrenzung, Abhaengigkeit, Intransparenz), rechts was durchgelassen wird (Wohlbefinden, Balance, Selbstwirksamkeit, Vertrauen, Gemeinschaft, Sicherheit).](./assets/ethikeskin-schutzschichten.jpeg)

> Die Schutzschichten von Ethikeskin: Links werden Belastungen abgewehrt (u. a.
> Ueberwachungsdruck), rechts passieren nur menschendienliche Wirkungen. Die
> Schichtnamen entsprechen den `x-schutzkern`-Konstanten (Relief →
> ENTLASTUNG_ZUERST, Autonomy → AUTONOMIE_WAHREN, Transparency →
> TRANSPARENZ_PFLICHT, Cohesion → KOHAESION_SCHUETZEN, Vulnerability →
> VULNERABILITAET_ZUERST, Counterbalance → x-gegenlast). Abbildung: Logik-Institut,
> CC BY 4.0.

---

## Idee

Ethikeskin prüft Software daraufhin, ob sie Menschen **entlastet** oder verdeckt
**belastet** — wie eine funktionale Regenjacke: schützend, atmend, nie
einschnürend. Das Vokabular `ethikeskin-core` mit dem Core-Keyword `x-psy-achse`
operationalisiert fünf psychische Wirkachsen und einen **dynamischen
Stress-Kipppunkt**: Der Stress-Grenzwert sinkt, je höher Überwachung und
Komplexität gemeinsam ausfallen; für vulnerable Gruppen (🛡) gelten verschärfte
Bänder. Das Urteil ist dreiwertig (🟩 PASS / 🟨 PRUEFEN / 🟥 FAIL) und **monoton
verschärfend**.

## Repository-Struktur

```
.
├─ texte/                     ── Inhalt · Lizenz CC BY 4.0 ──
│   ├─ ethikeskin_v0.1_psy-achse_spezifikationsmatrix.md
│   ├─ ethikeskin_v0.2_x-psy-achse_core-vokabular.md    (Vokabular + Meta-Schema)
│   └─ ethikeskin_v0.3_charta.md                        (lesbare Charta)
├─ packages/ethikeskin-ajv/   ── Code · Lizenz Apache-2.0 ──
│   ├─ ethikeskin-keyword.js    natives Ajv-Plugin (Core-Keyword x-psy-achse)
│   ├─ test-ajv.js              v0.4-Suite: Parität A–G + gewichtete Valenz + Invarianten
│   └─ LICENSE · NOTICE · package.json · README.md
├─ assets/                     ── Abbildungen · CC BY 4.0 ──
│   └─ ethikeskin-schutzschichten.jpeg
├─ .github/workflows/
│   ├─ ci.yml                   Tests bei jedem Push/PR (Node 18/20/22)
│   └─ publish.yml              npm-Release via Trusted Publishing (OIDC)
├─ CITATION.cff · LIZENZ.md · LICENSE-CC-BY-4.0.txt
```

## Schnellstart

```bash
cd packages/ethikeskin-ajv
npm install ajv@^8 --no-save
npm test
# ✅ 13 bestanden, 0 fehlgeschlagen (Parität A–G · gewichtete Valenz · Invarianten)
```

Als npm-Paket:

```bash
npm install @logikinstitut/ethikeskin-ajv ajv@^8
```

## Lizenzen

| Teil | Lizenz |
|---|---|
| **Texte** (Charta, Spezifikationen) | **CC BY 4.0** |
| **Code** (`packages/ethikeskin-ajv`) | **Apache License 2.0** |

Siehe [`LIZENZ.md`](./LIZENZ.md) für Begründung und Grenzfälle.

## Veröffentlichung

- **CI** läuft bei jedem Push/PR und muss grün sein.
- **Release:** einen Tag `vX.Y.Z` pushen → der Publish-Workflow veröffentlicht das
  npm-Paket automatisch per **Trusted Publishing (OIDC, ohne Token)** samt
  Provenance-Attestierung. Einrichtung: siehe `RELEASE-ANLEITUNG.md`.

## Zitation

> Heiler, M. (2026). *Ethikeskin (@hikeskin)* (Version 0.4.0). Logik-Institut.
> Zenodo. https://doi.org/<DOI-nach-Upload>

Strukturierte Zitationsdaten in [`CITATION.cff`](./CITATION.cff) (GitHub zeigt
daraus automatisch „Cite this repository"). Siehe auch das Zenodo-Deposit-Bündel
für die DOI-Vergabe.

---

*Grenzwerte sind Kalibrierungsvorschläge (Evidenzniveau KONZEPTUELL). Dies ist keine Rechtsberatung.*
