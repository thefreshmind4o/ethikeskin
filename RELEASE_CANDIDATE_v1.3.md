# EthikeSkin Release Candidate v1.3

## Versionspolitik

- Framework- und Dokumentationsstand: **v1.3**
- npm-Paket: **0.5.0-rc.1**
- Dieser Commit veröffentlicht keinen Tag und kein Paket.

## Prüfschritte

1. `node packages/ethikeskin-ajv/test-ajv.js`
2. `node packages/ethikeskin-ajv/test-v13-query-event.js`
3. JSON-Schema gegen positive und negative Query-Event-Beispiele validieren.
4. README.md, CITATION.cff und package.json auf den bestätigten Releaseumfang synchronisieren.
5. Lizenztrennung prüfen: Code Apache-2.0; Texte CC BY 4.0.

## Freigabeschritte

1. Versionsnummer in package.json auf 0.5.0 setzen, sobald der RC akzeptiert ist.
2. CITATION.cff mit finaler Framework-/Paketversion und DOI nach Zenodo-Deposit aktualisieren.
3. Git-Tag und GitHub Release erstellen.
4. npm Trusted Publisher ausführen.
5. Zenodo-Release archivieren und Version-DOI in CITATION.cff ergänzen.
