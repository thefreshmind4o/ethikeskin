'use strict';

const STANDARDPROFIL = Object.freeze({
  tropfen: Object.freeze({ halbwertszeit_min: 30, referenz_min: 240, sperre_min: 0 }),
  spritzer: Object.freeze({ halbwertszeit_min: 120, referenz_min: 120, sperre_min: 60 }),
  immersion: Object.freeze({ halbwertszeit_min: 360, referenz_min: 60, sperre_min: 180 })
});

const REGIME = Object.freeze(Object.keys(STANDARDPROFIL));

function inMillisekunden(wert) {
  const ms = wert instanceof Date ? wert.getTime() : Date.parse(wert);
  if (!Number.isFinite(ms)) throw new TypeError('Ungueltiger Zeitpunkt');
  return ms;
}

function klingeAb(wert, verstricheneMinuten, halbwertszeitMin) {
  if (halbwertszeitMin <= 0) return 0;
  return wert * Math.pow(0.5, verstricheneMinuten / halbwertszeitMin);
}

function erstelleBelastungsgedaechtnis(optionen = {}) {
  const profil = Object.freeze({ ...STANDARDPROFIL, ...(optionen.profil || {}) });
  const jetzt = typeof optionen.jetzt === 'function' ? optionen.jetzt : () => new Date();
  const speicher = optionen.speicher instanceof Map ? optionen.speicher : new Map();
  const maxEreignisse = Number.isInteger(optionen.max_ereignisse) ? optionen.max_ereignisse : 500;

  function subjektSchluessel(subjektRef) {
    if (typeof subjektRef !== 'string' || subjektRef.length === 0) {
      throw new TypeError('subjektRef muss eine pseudonyme, nichtleere Zeichenkette sein');
    }
    return subjektRef;
  }

  function erfasse(subjektRef, ereignis = {}) {
    const schluessel = subjektSchluessel(subjektRef);
    const regime = ereignis.expositionsregime;
    if (!REGIME.includes(regime)) {
      throw new TypeError('expositionsregime muss tropfen, spritzer oder immersion sein');
    }
    const dauerMin = Number.isFinite(ereignis.dauer_min) && ereignis.dauer_min >= 0 ? ereignis.dauer_min : 0;
    const menge = Number.isFinite(ereignis.menge) && ereignis.menge >= 0 ? ereignis.menge : 1;
    const zeitpunkt = inMillisekunden(ereignis.zeitpunkt || jetzt());

    const bisher = speicher.get(schluessel) || [];
    const neu = bisher.concat([Object.freeze({ regime, dauer_min: dauerMin, menge, zeitpunkt })]);
    speicher.set(schluessel, neu.slice(-maxEreignisse));
    return zustand(schluessel, new Date(zeitpunkt));
  }

  function zustand(subjektRef, stand) {
    const schluessel = subjektSchluessel(subjektRef);
    const jetztMs = inMillisekunden(stand || jetzt());
    const eintraege = speicher.get(schluessel) || [];

    let saettigung = 0;
    let verbrauchtMin = 0;
    let durchsatzLetzteStunde = 0;
    let gesperrtBis = 0;

    eintraege.forEach((eintrag) => {
      const verstrichenMin = (jetztMs - eintrag.zeitpunkt) / 60000;
      if (verstrichenMin < 0) return;
      const werte = profil[eintrag.regime];
      const beitrag = werte.referenz_min > 0 ? eintrag.dauer_min / werte.referenz_min : 0;
      saettigung += klingeAb(beitrag, verstrichenMin, werte.halbwertszeit_min);
      verbrauchtMin += klingeAb(eintrag.dauer_min, verstrichenMin, werte.halbwertszeit_min);
      if (verstrichenMin <= 60) durchsatzLetzteStunde += eintrag.menge;
      if (werte.sperre_min > 0) {
        gesperrtBis = Math.max(gesperrtBis, eintrag.zeitpunkt + werte.sperre_min * 60000);
      }
    });

    const gesperrt = gesperrtBis > jetztMs;
    return Object.freeze({
      subjekt: schluessel,
      stand: new Date(jetztMs).toISOString(),
      restsaettigung: Math.min(1, Number(saettigung.toFixed(6))),
      verbrauchte_zeit_min: Math.round(verbrauchtMin),
      durchsatz_letzte_stunde: Number(durchsatzLetzteStunde.toFixed(6)),
      gesperrt,
      gesperrt_bis: gesperrt ? new Date(gesperrtBis).toISOString() : null,
      ereignisse: eintraege.length
    });
  }

  function wendeAufKapazitaetAn(kapazitaet, subjektRef, stand) {
    if (!kapazitaet || typeof kapazitaet !== 'object' || Array.isArray(kapazitaet)) {
      throw new TypeError('kapazitaet muss ein Objekt sein');
    }
    const gedaechtnis = zustand(subjektRef, stand);
    const ergebnis = { ...kapazitaet };

    if (ergebnis.dauer && typeof ergebnis.dauer === 'object') {
      const budget = ergebnis.dauer.zeitbudget_min;
      const restanteil = 1 - gedaechtnis.restsaettigung;
      const wirksamesBudget = Number.isInteger(budget)
        ? Math.max(0, Math.floor(budget * restanteil))
        : budget;
      ergebnis.dauer = {
        ...ergebnis.dauer,
        zeitbudget_min: Number.isInteger(wirksamesBudget) && wirksamesBudget > 0 ? wirksamesBudget : budget,
        verbrauchte_zeit_min: gedaechtnis.verbrauchte_zeit_min,
        budget_erschoepft: gedaechtnis.gesperrt ||
          gedaechtnis.restsaettigung >= 1 ||
          (Number.isInteger(budget) && gedaechtnis.verbrauchte_zeit_min >= budget)
      };
    }

    if (ergebnis.durchsatz && typeof ergebnis.durchsatz === 'object') {
      ergebnis.durchsatz = {
        ...ergebnis.durchsatz,
        gemessen: gedaechtnis.durchsatz_letzte_stunde
      };
    }

    return Object.freeze({ kapazitaet: Object.freeze(ergebnis), gedaechtnis });
  }

  function vergiss(subjektRef) {
    return speicher.delete(subjektSchluessel(subjektRef));
  }

  return Object.freeze({ erfasse, zustand, wendeAufKapazitaetAn, vergiss, profil });
}

module.exports = Object.freeze({ STANDARDPROFIL, erstelleBelastungsgedaechtnis });
