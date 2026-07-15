# Ethikeskin (@hikeskin)

**Ein JSON-Schema-Dialekt für humane Technologieprüfung — Charta, Spezifikation und ausführbare Referenz-Implementierung.**

Autor: **Maximilian Heiler** · ORCID [0009-0003-2785-1710](https://orcid.org/0009-0003-2785-1710) · Logik-Institut

[![CI](https://github.com/DEIN-GITHUB-USER/ethikeskin/actions/workflows/ci.yml/badge.svg)](https://github.com/DEIN-GITHUB-USER/ethikeskin/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@logikinstitut/ethikeskin-ajv.svg)](https://www.npmjs.com/package/@logikinstitut/ethikeskin-ajv)

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
│   ├─ test-ajv.js              7 Referenzfälle (A–G)
│   └─ LICENSE · NOTICE · package.json · README.md
├─ .github/workflows/
│   ├─ ci.yml                   Tests bei jedem Push/PR (Node 18/20/22)
│   └─ publish.yml              npm-Release via Trusted Publishing (OIDC)
├─ LIZENZ.md · LICENSE-CC-BY-4.0.txt
```

## Schnellstart

```bash
cd packages/ethikeskin-ajv
npm install ajv@^8 --no-save
npm test
# ✅ Alle 7 Fälle: Ajv-Plugin identisch zum Referenz-Validator.
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

> Heiler, M. (2026). *Ethikeskin (@hikeskin)* (Version 0.3.0). Logik-Institut.
> Zenodo. https://doi.org/<DOI-nach-Upload>

Siehe auch das Zenodo-Deposit-Bündel für die DOI-Vergabe.

---

*Grenzwerte sind Kalibrierungsvorschläge (Evidenzniveau KONZEPTUELL). Dies ist keine Rechtsberatung.*
