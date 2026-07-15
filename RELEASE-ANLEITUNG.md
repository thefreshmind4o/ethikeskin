# Einrichtung & Release — Git-Repo + npm (@logikinstitut/ethikeskin-ajv)

Diese Anleitung führt dich von „lokaler Ordner" zu „öffentliches GitHub-Repo mit
automatischer npm-Veröffentlichung ohne Token". Du hast deinen npm-Account bereits
mit GitHub verknüpft und die npm-Organisation **`logikinstitut`** angelegt — genau
darauf ist alles abgestimmt.

> **Ein Platzhalter zu ersetzen:** Überall steht `thefreshmind4o`. Ersetze ihn
> durch deinen **exakten GitHub-Benutzernamen** (Groß-/Kleinschreibung egal, aber
> genau der Kontoname). Suchen & Ersetzen in: `README.md`, `packages/ethikeskin-ajv/package.json`.

---

## Teil 1 — Git-Repository lokal (bereits vorbereitet)

Das entpackte Bündel ist bereits ein initialisiertes Git-Repo mit einem ersten,
datierten Commit und dem Tag `v0.3.0`. Prüfen:

```bash
cd ethikeskin-repo
git log --oneline --decorate     # zeigt den Commit + Tag v0.3.0
git show --stat v0.3.0           # datierter Nachweis (Autor, Zeitstempel)
```

Der Commit-Zeitstempel + der SHA-Hash sind dein **kryptografisch datierter
Nachweis** — neben der Zenodo-DOI ein zweiter, unabhängiger Prioritätsbeleg.

> Falls du Git-Autor/E-Mail korrigieren willst (der Commit wurde neutral gesetzt):
> ```bash
> git config user.name  "Maximilian Heiler"
> git config user.email "DEINE@mail"
> git commit --amend --reset-author --no-edit
> git tag -f v0.3.0
> ```

## Teil 2 — Auf GitHub veröffentlichen

1. Auf GitHub ein **neues, leeres** Repository anlegen: Name **`ethikeskin`**
   (Owner = dein Konto). Kein README/License/gitignore anhaken (ist schon da).
2. Lokales Repo verbinden und pushen:
   ```bash
   git remote add origin https://github.com/thefreshmind4o/ethikeskin.git
   git branch -M main
   git push -u origin main
   git push origin v0.3.0        # Tag NOCH NICHT pushen, wenn npm-Publisher
                                 # noch nicht eingerichtet ist (siehe Teil 3)!
   ```
   Der Push von `main` startet sofort den **CI-Workflow** (Tests). Sieh unter
   „Actions" nach, dass er grün ist.

## Teil 3 — npm Trusted Publisher einrichten (einmalig, kein Token nötig)

Weil dein npm-Account mit GitHub verknüpft ist, kannst du ganz ohne gespeicherten
Token publizieren. So autorisierst du genau diesen Workflow:

1. Sicherstellen, dass die **Organisation `logikinstitut`** auf npmjs.com existiert
   und dir gehört (Paketname-Scope = `@logikinstitut`).
2. Da das Paket noch nicht existiert, den ersten Publish so vorbereiten:
   Rufe **npmjs.com → dein Profil → „Add package" bzw. die Trusted-Publisher-
   Einstellung** auf. Alternativ (robuster Weg): den allerersten Publish **einmal
   manuell lokal** machen, damit das Paket existiert, danach Trusted Publishing für
   alle weiteren Releases:
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

Ab jetzt genügt für jede neue Version:

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

---

*Dies ist keine Rechtsberatung. Grenzwerte sind Kalibrierungsvorschläge
(Evidenzniveau KONZEPTUELL).*
