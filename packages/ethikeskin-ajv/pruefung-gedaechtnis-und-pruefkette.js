'use strict';

const pruefung = require('node:assert/strict');
const { erstelleBelastungsgedaechtnis } = require('./ethikeskin-belastungsgedaechtnis');
const { erstellePruefkette, URSPRUNG } = require('./ethikeskin-pruefkette');

const SUBJEKT = 'pseudo-001';
const T0 = '2026-08-16T10:00:00.000Z';

const leer = erstelleBelastungsgedaechtnis({ jetzt: () => new Date(T0) });
const leerzustand = leer.zustand(SUBJEKT);
pruefung.equal(leerzustand.restsaettigung, 0);
pruefung.equal(leerzustand.gesperrt, false);

const gedaechtnis = erstelleBelastungsgedaechtnis({ jetzt: () => new Date(T0) });
gedaechtnis.erfasse(SUBJEKT, { expositionsregime: 'immersion', dauer_min: 60, zeitpunkt: T0 });
const nachTauchgang = gedaechtnis.zustand(SUBJEKT, new Date(T0));
pruefung.equal(nachTauchgang.restsaettigung, 1);
pruefung.equal(nachTauchgang.gesperrt, true);
pruefung.equal(nachTauchgang.gesperrt_bis, '2026-08-16T13:00:00.000Z');

const nachSperre = gedaechtnis.zustand(SUBJEKT, new Date('2026-08-16T13:00:01.000Z'));
pruefung.equal(nachSperre.gesperrt, false);
pruefung.ok(nachSperre.restsaettigung < 1);

const nachHalbwertszeit = gedaechtnis.zustand(SUBJEKT, new Date('2026-08-16T16:00:00.000Z'));
pruefung.ok(Math.abs(nachHalbwertszeit.restsaettigung - 0.5) < 0.001);

const angewendet = gedaechtnis.wendeAufKapazitaetAn({
  schadensschwere: 'III',
  reversibilitaet: 'irreversibel',
  expositionsregime: 'immersion',
  containment: 'einlassend_temperierend',
  trageform: 'umgebungsgebunden',
  dauer: { zeitbudget_min: 50 },
  durchsatz: { limit_pro_stunde: 3, gemessen: 0, ausgetauscht: false }
}, SUBJEKT, new Date('2026-08-16T10:30:00.000Z'));
pruefung.equal(angewendet.kapazitaet.dauer.budget_erschoepft, true);
pruefung.equal(angewendet.kapazitaet.durchsatz.gemessen, 1);

gedaechtnis.vergiss(SUBJEKT);
pruefung.equal(gedaechtnis.zustand(SUBJEKT).ereignisse, 0);

const kette = erstellePruefkette({ jetzt: () => new Date(T0) });
pruefung.equal(kette.kopf(), URSPRUNG);
const erster = kette.haengeAn({ typ: 'freigabe_vor_vollzug', inhalt: { a: 1, b: 2 } });
const zweiter = kette.haengeAn({ typ: 'deny', inhalt: { b: 2, a: 1 } });
pruefung.equal(erster.angehaengt, true);
pruefung.equal(zweiter.eintrag.vorgaenger_hash, erster.eintrag.eintrag_hash);
pruefung.equal(erster.eintrag.inhalt_hash, zweiter.eintrag.inhalt_hash);
pruefung.equal(kette.pruefe().gueltig, true);

const begrenzt = erstellePruefkette({ jetzt: () => new Date(T0), max_nicht_deny_pro_sekunde: 1 });
begrenzt.haengeAn({ typ: 'vollzug_erfolgreich', zeitpunkt: T0 });
const verworfen = begrenzt.haengeAn({ typ: 'vollzug_erfolgreich', zeitpunkt: T0 });
const verweigerung = begrenzt.haengeAn({ typ: 'deny', zeitpunkt: T0 });
pruefung.equal(verworfen.angehaengt, false);
pruefung.equal(verweigerung.angehaengt, true);
pruefung.equal(begrenzt.statistik().verworfen, 1);

const manipuliert = erstellePruefkette({ jetzt: () => new Date(T0) });
manipuliert.haengeAn({ typ: 'deny', inhalt: { grund: 'original' } });
manipuliert.haengeAn({ typ: 'deny', inhalt: { grund: 'zweiter' } });
const veraenderbar = manipuliert.abzug().map((eintrag) => ({ ...eintrag }));
veraenderbar[0].inhalt_hash = '0'.repeat(64);
const nachgespielt = erstellePruefkette({ eintraege: veraenderbar, jetzt: () => new Date(T0) });
const befund = nachgespielt.pruefe();
pruefung.equal(befund.gueltig, false);
pruefung.equal(befund.bruch_bei, 0);
pruefung.equal(befund.grund, 'eintrag_veraendert');

const verankerung = kette.verankere();
pruefung.equal(verankerung.laenge, 2);
pruefung.equal(verankerung.kopf, kette.kopf());

console.log('EthikeSkin Gedaechtnis und Pruefkette: 9 Pruefungen bestanden');
