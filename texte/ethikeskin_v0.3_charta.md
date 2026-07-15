# Die Ethikeskin-Charta

### Eine lesbare Fassung des @hikeskin-Dialekts für humane Technologieprüfung

*Logik-Institut · @hikeskin / EthicalSchema · Fassung 0.3*
Autor: Heiler, Maximilian · ORCID 0009-0003-2785-1710 · Lizenz CC BY 4.0 · Sprache Deutsch · Stand 2026-07-15

---

## Vorbemerkung: Warum eine Charta neben dem Code?

Ethikeskin ist zuerst ein **Maschinen-Dialekt** — ein JSON-Schema-Vokabular
(`ethikeskin-core`) mit dem Kern-Keyword `x-psy-achse`, das Software daraufhin
prüft, ob sie Menschen entlastet oder verdeckt belastet. Der Code ist präzise,
aber stumm: Er sagt 🟥, nicht *warum das zählt*.

Diese Charta ist die **zweite, sprechende Fassung derselben Logik**. Sie trägt
publizistisch, was der Dialekt maschinell trägt. Beide sind deckungsgleich: Jeder
Grundsatz hier hat sein Gegenstück im Code, jede Regel im Code hat hier ihren
Grund. Die Metapher bleibt die **funktionale Regenjacke** — Ethikeskin ist die
Schicht, die anliegt, atmet und vor dem schützt, was von außen auf den Menschen
einwirkt, ohne ihn einzuschnüren.

---

## Präambel

Technik verspricht Entlastung und liefert oft das Gegenteil: Sie nimmt einen
Handgriff ab und legt drei neue auf — als Wachsamkeit, als Erklärungsdruck, als
das Gefühl, ständig verfügbar und vermessen zu sein. Ethikeskin macht diese
verdeckte Gegenlast **sichtbar und prüfbar**. Es misst nicht, ob ein System
funktioniert, sondern **was es dem Menschen zumutet, damit es funktioniert**.

Die Charta erhebt keinen Anspruch auf letzte Wahrheit. Ihre Grenzwerte sind
**Kalibrierungsvorschläge** auf konzeptuellem Evidenzniveau — offen für Revision,
aber nie für stille Umgehung.

---

## Die acht nicht verhandelbaren Grundsätze (`schutzkern`)

Diese acht Sätze stehen über allem. Sie sind im Dialekt in Großbuchstaben
notiert, weil sie **nicht verhandelbar** sind — kein Effizienzgewinn hebt sie auf.

1. **ENTLASTUNG ZUERST.** Ein System muss zuerst danach beurteilt werden, ob es
   Last nimmt — nicht danach, ob es Leistung steigert.
2. **GEGENLAST OFFENLEGEN.** Jede neue Belastung, die ein System erzeugt, muss
   benannt werden. Was nicht offengelegt ist, gilt als verdeckt.
3. **FAIL BEI VERDECKTER LAST.** Verdeckte Belastung führt unmittelbar zum
   Durchfall — nicht zur Abwägung.
4. **AUTONOMIE WAHREN.** Der Mensch behält Wahlfreiheit und das Recht, den
   Einfluss des Systems erklärt zu bekommen.
5. **TRANSPARENZPFLICHT.** Jede Einstufung braucht eine Begründung. Fehlt sie,
   ist das Urteil bestenfalls „unter Auflagen“.
6. **KOHÄSION SCHÜTZEN.** Systeme dürfen soziale Bindung nicht zugunsten von
   Durchsatz zersetzen.
7. **SCHUTZ VOR EFFIZIENZ.** Schutz schlägt Effizienz. Ein Durchfall lässt sich
   nicht durch Vorteile an anderer Stelle aufwiegen.
8. **VULNERABILITÄT ZUERST.** Für schutzbedürftige Gruppen gelten strengere
   Grenzwerte — sichtbar am Schild 🛡.

---

## Die fünf psychischen Wirkachsen (`x-psy-achse`)

Ethikeskin prüft die Wirkung eines Systems auf den Menschen entlang von fünf
Achsen. Drei sind **Lasten** (je weniger, desto besser), zwei sind **Ressourcen**
(je mehr, desto besser).

| Achse | Art | Frage, die sie stellt |
|---|---|---|
| **Stresslast** | Last | Erhöht das System die innere Anspannung, den Takt, die Verdichtung? |
| **Komplexitätslast** | Last | Muss der Mensch mehr überblicken, verschalten, im Kopf behalten? |
| **Überwachungsdruck** | Last | Fühlt sich der Mensch beobachtet, protokolliert, vermessen? |
| **Erholungsfähigkeit** | Ressource | Bleibt Raum für echte Pausen und Regeneration? |
| **Selbstwirksamkeits­stützung** | Ressource | Erlebt der Mensch, dass sein Handeln wirkt und verständlich ist? |

Jede Achse wird auf einer Skala von 0 bis 10 eingeschätzt, mit **Richtung**
(reduziert / erhöht / uneindeutig / unbekannt) und einer **Begründung**.

---

## Der bewegliche Kipppunkt — das Herzstück

Der wichtigste Gedanke von Ethikeskin: **Stress wird nicht isoliert beurteilt.**

Dieselbe Stressbelastung ist harmlos oder untragbar — je nachdem, wie viel
Überwachung und Komplexität gleichzeitig auf den Menschen einwirken. Wer unter
ständiger Beobachtung *und* hoher Verschachtelung steht, verträgt weniger
zusätzlichen Stress als jemand in einer ruhigen, überschaubaren Lage.

Ethikeskin bildet das ab, indem der **Stress-Grenzwert absinkt**, je höher
Überwachung und Komplexität zusammen ausfallen. Der Grenzwert ist also keine
feste Zahl, sondern eine **abhängige Größe**:

> Je mehr Überwachung und Komplexität, desto früher fällt schon mäßiger Stress
> durch. Der Kipppunkt kommt dem Menschen entgegen — nach unten.

**Ein Beispiel aus der Prüfung (identischer Stresswert, verschiedene Urteile):**

- **Fall A** — hohe Überwachung *und* hohe Komplexität: Bei Stress 6 fällt das
  System durch (🟥). Der bewegliche Grenzwert ist auf 5 gesunken.
- **Fall B** — dieselbe Stressstufe 6, aber ruhige Umgebung: nur „unter Auflagen“
  (🟨). Der Grenzwert bleibt bei 7.
- **Fall F** — wie B, aber für eine **vulnerable Gruppe** 🛡: fällt durch (🟥),
  weil für Schutzbedürftige die Latte von vornherein tiefer liegt.

Das ist der Kern: **Kontext und Schutzbedürftigkeit verschieben die Grenze**, nicht
der Stress allein.

---

## Die drei Urteile

Ethikeskin kennt genau drei Ausgänge, farblich verankert:

- 🟩 **GRÜN — human vertretbar.** Freigabe: ja. Die Ressourcen überwiegen, keine
  Last überschreitet ihre Schwelle.
- 🟨 **GELB — bedingt human.** Freigabe: nur unter Auflagen. Etwas steht im
  kritischen Band oder eine Begründung fehlt. Nachbessern, dann erneut prüfen.
- 🟥 **ROT — nicht human vertretbar.** Freigabe: nein. Eine harte Regel wurde
  verletzt. Dieses Urteil ist **absorbierend** — es lässt sich nicht wegrechnen.

---

## Warum ein Urteil sich nur verschärfen darf

Ethikeskin kennt eine strenge Richtungsregel: Ein Prüflauf darf sich nur
**verschärfen**, nie entspannen. Wer einmal bei 🟨 steht — etwa weil eine
Begründung fehlt —, kommt nicht durch einen guten Gesamtschnitt zurück auf 🟩.
Und 🟥 ist endgültig.

Das ist kein technisches Detail, sondern Ausdruck von **SCHUTZ VOR EFFIZIENZ**:
Ein Mangel wird nicht durch Stärken an anderer Stelle aufgewogen. Eine
Rückstufung ist nur über eine **neue, dokumentierte Fassung mit Nachweis**
möglich — nachvollziehbar, nicht heimlich.

---

## Verhältnis zum Maschinen-Dialekt

| Charta (diese Fassung) | Maschinen-Dialekt (`ethikeskin-core`) |
|---|---|
| Acht Grundsätze | `x-schutzkern` — acht NICHT_VERHANDELBAR-Konstanten |
| Fünf Wirkachsen | Felder der `x-psy-achse` |
| Beweglicher Kipppunkt | `stress_kopplung` im Keyword `x-psy-achse` |
| Strengere Latte 🛡 | Grenzwertband `vulnerabel` |
| Nur-Verschärfung | monotone Zustandsmaschine (PASS→PRUEFEN→FAIL) |
| Offengelegte Gegenlast | `x-gegenlast` (`verdeckt=false` erzwungen) |

Der Dialekt ist prüfbar (ausführbares Ajv-Plugin, sieben verifizierte
Testfälle). Die Charta ist lesbar. Sie sagen **dasselbe**.

---

## Schlusssatz

Ethikeskin will nicht Technik verhindern, sondern sie **anziehbar** machen — wie
eine gute Regenjacke: schützend, atmend, dem Körper folgend, nie einschnürend.
Die Prüfung fragt am Ende nur eines: *Trägt der Mensch dieses System — oder trägt
das System den Menschen ab?*

---

*Logik-Institut — @hikeskin / EthicalSchema. Diese Charta ist die publizistische
Fassung des Vokabulars `ethikeskin-core` (Meta-Schema `ethikeskin-0.2`,
Ajv-Plugin v0.3). Grenzwerte sind Kalibrierungsvorschläge (Evidenzniveau
KONZEPTUELL). Lizenz CC BY 4.0.*
