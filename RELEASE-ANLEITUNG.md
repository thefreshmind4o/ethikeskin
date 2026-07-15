# Einrichtung & Release — GitHub-Repo + npm (@logikinstitut/ethikeskin-ajv)

Diese Anleitung dokumentiert den Ist-Zustand und führt dich durch die noch
offenen, an dein npm-Login gebundenen Schritte.

- **GitHub-Konto:** `thefreshmind4o`
- **Repository:** [github.com/thefreshmind4o/ethikeskin](https://github.com/thefreshmind4o/ethikeskin) — **öffentlich, online**
- **npm-Organisation:** `logikinstitut` · **Paket:** `@logikinstitut/ethikeskin-ajv`

> Der GitHub-Handle (`thefreshmind4o`) und die npm-Org (`logikinstitut`) tragen
> unterschiedliche Namen. Für Trusted Publishing ist das unerheblich — es
> verknüpft Repository ↔ Paket direkt. Wichtig ist nur, beim npm-Setup exakt
> `thefreshmind4o/ethikeskin` als Quelle einzutragen (Teil 3).

---

## Teil 1 — Git-Repository ✅ ERLEDIGT

Das Repo ist initialisiert, die datierte Historie steht:

```bash
cd ethikeskin-repo
git log --oneline --decorate     # zeigt Commits + Tag v0.3.0
git show --stat v0.3.0           # datierter Nachweis (Autor, Zeitstempel)
```

- Commit `ae9d253` (Tag `v0.3.0`) — Autor: Maximilian Heiler <trueserenity@posteo.de>, 2026-07-15
- Folge-Commit `3e1336d` — GitHub-Username in den URLs eingesetzt

Der Commit-Zeitstempel + SHA-Hash sind dein **kryptografisch datierter Nachweis**
— neben der Zenodo-DOI ein zweiter, unabhängiger Prioritätsbeleg.

## Teil 2 — Auf GitHub veröffentlicht ✅ ERLEDIGT

Das öffentliche Repo ist angelegt und gepusht (main + Tag `v0.3.0`):

```bash
# So wurde es angelegt (bereits geschehen):
gh repo create ethikeskin --public --source=. --remote=origin --push
git push origin v0.3.0
```

- Sichtbarkeit: **PUBLIC**, Default-Branch: `main`
- Beide Workflows sind aktiv erkannt: **CI** und **Publish Package**
- Der Push von `main` hat den **CI-Workflow** ausgelöst. Kontrolle unter
  [Actions](https://github.com/thefreshmind4o/ethikeskin/actions) — der Lauf sollte grün sein.

## Teil 3 — npm Trusted Publisher einrichten ⏳ OFFEN (dein Login)

Weil dein npm-Account mit GitHub verknüpft ist, kannst du ohne gespeicherten
Token publizieren. Diese Schritte sind login-gebunden und daher von dir
auszuführen:

1. Sicherstellen, dass die **Organisation `logikinstitut`** auf npmjs.com existiert
   und dir gehört (Scope = `@logikinstitut`).
2. Da das Paket noch nicht existiert, den **allerersten Publish einmal manuell
   lokal** machen, damit das Paket angelegt ist; danach übernimmt Trusted
   Publishing alle weiteren Releases:
   ```bash
   cd packages/ethikeskin-ajv
   npm login                      # dein npm-Konto
   npm install ajv@^8 --no-save
   npm test
   npm publish --access public    # erstmalige Anlage von @logikinstitut/ethikeskin-ajv
   ```
3. **Trusted Publisher hinterlegen:** npmjs.com → Paket `@logikinstitut/ethikeskin-ajv`
   → **Settings → Trusted Publisher → GitHub Actions**. Eintragen:
   - **Organization or user:** `thefreshmind4o`
   - **Repository:** `ethikeskin`
   - **Workflow filename:** `publish.yml`   (nur der Dateiname)
   - **Environment name:** leer lassen
   - **Allowed actions:** `npm publish` anhaken
     *(seit Mai 2026 verpflichtend auszuwählen)*

## Teil 4 — Automatische Releases ab jetzt

Sobald Teil 3 steht, genügt für jede neue Version:

```bash
# 1) Version erhöhen (hält package.json + Tag synchron)
cd packages/ethikeskin-ajv
npm version patch      # oder minor / major  -> erzeugt Commit + Tag vX.Y.Z
# 2) Push samt Tag
git push && git push --tags
```

Der Tag `v*` löst `publish.yml` aus: GitHub Actions authentifiziert sich per
**OIDC** bei npm (kein Token im Repo), führt die Tests aus und veröffentlicht mit
**Provenance**. Auf der npm-Paketseite erscheint dann das grüne
„Provenance"-Abzeichen — ein zusätzlicher Herkunftsnachweis.

> Voraussetzung im Workflow ist bereits erfüllt: `permissions: id-token: write`,
> aktuelles npm, `publishConfig.provenance = true`.

## Versionslogik (semantisch, projektweit synchron)

| Änderung | Beispiel | Bump |
|---|---|---|
| Grenzwert-Kalibrierung | 0.3.0 → 0.3.1 | patch |
| neue Achse / neues Keyword | 0.3.1 → 0.4.0 | minor |
| Kopplungslogik brechend geändert | 0.4.0 → 1.0.0 | major |

Dieselbe Nummer in `package.json`, dem Git-Tag, `CITATION.cff` und der
Zenodo-`version` halten.

> **Hinweis zu v0.4:** Der aktuelle npm-/Repo-Stand ist v0.3.0. Das v0.4-Konzept
> (gewichtete Valenz + Fünf-Schichten-Integration) ist verifiziert, aber noch
> nicht als Release getaggt. Ein `npm version minor` → `v0.4.0` würde es
> veröffentlichen, sobald der Plugin-Code auf v0.4 in `packages/` übernommen ist.

---

*Dies ist keine Rechtsberatung. Grenzwerte und Gewichte sind
Kalibrierungsvorschläge (Evidenzniveau KONZEPTUELL).*
