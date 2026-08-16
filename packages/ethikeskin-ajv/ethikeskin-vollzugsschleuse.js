'use strict';

const { hasheEreignis } = require('./ethikeskin-entscheidungsstrecke');

function verweigere(ursache, phase, zusatz = {}) {
  return Object.freeze({
    freigegeben: false,
    ausgefuehrt: false,
    wirksame_entscheidung: 'verweigert',
    phase,
    ursache,
    ...zusatz
  });
}

function erstelleVollzugsschleuse(optionen = {}) {
  const fuehreStreckeAus = optionen.fuehreStreckeAus;
  const protokolliere = optionen.protokolliere;
  const jetzt = typeof optionen.jetzt === 'function' ? optionen.jetzt : () => new Date();

  if (typeof fuehreStreckeAus !== 'function') {
    throw new TypeError('fuehreStreckeAus muss eine Funktion sein');
  }
  if (typeof protokolliere !== 'function') {
    throw new TypeError('protokolliere muss eine Funktion sein; ohne Protokoll kein Vollzug');
  }

  async function protokolliereSicher(eintrag) {
    try {
      await protokolliere(Object.freeze({ ...eintrag }));
      return true;
    } catch (_) {
      return false;
    }
  }

  return async function vollziehe(auftrag = {}) {
    const anfrageEreignis = auftrag.anfrageEreignis;
    const kontext = auftrag.kontext || {};
    const fuehreAus = auftrag.fuehreAus;

    if (!anfrageEreignis || typeof anfrageEreignis !== 'object' || Array.isArray(anfrageEreignis)) {
      const ergebnis = verweigere('anfrage_fehlt', 'eingang');
      await protokolliereSicher({ typ: 'deny', ursache: ergebnis.ursache, phase: ergebnis.phase });
      return ergebnis;
    }
    if (typeof fuehreAus !== 'function') {
      const ergebnis = verweigere('handlung_fehlt', 'eingang');
      await protokolliereSicher({ typ: 'deny', ursache: ergebnis.ursache, phase: ergebnis.phase });
      return ergebnis;
    }

    let streckenergebnis;
    try {
      streckenergebnis = await fuehreStreckeAus(anfrageEreignis, kontext);
    } catch (fehler) {
      const ergebnis = verweigere('strecke_ausnahme', 'strecke', { fehler: Object.freeze([fehler.message]) });
      await protokolliereSicher({ typ: 'deny', ursache: ergebnis.ursache, phase: ergebnis.phase });
      return ergebnis;
    }

    const freigegeben = streckenergebnis &&
      streckenergebnis.freigegeben === true &&
      streckenergebnis.wirksame_entscheidung === 'erlaubt' &&
      streckenergebnis.vollzug &&
      streckenergebnis.vollzug.wirksame_entscheidung === 'erlaubt';

    if (!freigegeben) {
      const ergebnis = verweigere(
        streckenergebnis && streckenergebnis.ursache ? streckenergebnis.ursache : 'strecke_nicht_freigegeben',
        'vollzug',
        { streckenergebnis: streckenergebnis || null }
      );
      await protokolliereSicher({ typ: 'deny', ursache: ergebnis.ursache, phase: ergebnis.phase });
      return ergebnis;
    }

    const entscheidung = streckenergebnis.entscheidung;
    if (!entscheidung || !entscheidung.anfrage_ref || !entscheidung.gueltigkeit) {
      const ergebnis = verweigere('nachweis_unvollstaendig', 'vorpruefung');
      await protokolliereSicher({ typ: 'deny', ursache: ergebnis.ursache, phase: ergebnis.phase });
      return ergebnis;
    }

    const aktuellerHash = hasheEreignis(anfrageEreignis);
    if (aktuellerHash !== entscheidung.anfrage_ref.eingangs_hash) {
      const ergebnis = verweigere('eingangs_hash_abweichend', 'vorpruefung');
      await protokolliereSicher({ typ: 'deny', ursache: ergebnis.ursache, phase: ergebnis.phase });
      return ergebnis;
    }

    const ablauf = Date.parse(entscheidung.gueltigkeit.gueltig_bis);
    const jetztWert = jetzt();
    const jetztMs = jetztWert instanceof Date ? jetztWert.getTime() : new Date(jetztWert).getTime();
    if (!Number.isFinite(ablauf) || !Number.isFinite(jetztMs) || jetztMs >= ablauf) {
      const ergebnis = verweigere('entscheidung_abgelaufen', 'vorpruefung');
      await protokolliereSicher({ typ: 'deny', ursache: ergebnis.ursache, phase: ergebnis.phase });
      return ergebnis;
    }

    const fehlend = streckenergebnis.vollzug.fehlende_auflagen || [];
    if (!Array.isArray(fehlend) || fehlend.length > 0) {
      const ergebnis = verweigere('auflage_nicht_erfuellt', 'vorpruefung', {
        fehlende_auflagen: Object.freeze(Array.isArray(fehlend) ? [...fehlend] : ['unbestimmt'])
      });
      await protokolliereSicher({ typ: 'deny', ursache: ergebnis.ursache, phase: ergebnis.phase });
      return ergebnis;
    }

    const protokollAngenommen = await protokolliereSicher({
      typ: 'freigabe_vor_vollzug',
      entscheidungs_id: entscheidung.entscheidungs_id,
      query_event_id: entscheidung.anfrage_ref.query_event_id,
      eingangs_hash: aktuellerHash,
      gueltig_bis: entscheidung.gueltigkeit.gueltig_bis
    });
    if (!protokollAngenommen) {
      return verweigere('protokoll_nicht_verfuegbar', 'vorpruefung');
    }

    try {
      const ergebniswert = await fuehreAus(Object.freeze({
        anfrageEreignis: Object.freeze({ ...anfrageEreignis }),
        kontext: Object.freeze({ ...kontext }),
        entscheidung
      }));
      await protokolliereSicher({
        typ: 'vollzug_erfolgreich',
        entscheidungs_id: entscheidung.entscheidungs_id,
        eingangs_hash: aktuellerHash
      });
      return Object.freeze({
        freigegeben: true,
        ausgefuehrt: true,
        wirksame_entscheidung: 'erlaubt',
        phase: 'vollzogen',
        ursache: 'keine',
        entscheidungs_id: entscheidung.entscheidungs_id,
        ergebnis: ergebniswert
      });
    } catch (fehler) {
      await protokolliereSicher({
        typ: 'vollzug_fehlgeschlagen',
        entscheidungs_id: entscheidung.entscheidungs_id,
        eingangs_hash: aktuellerHash,
        fehler: fehler.message
      });
      return Object.freeze({
        freigegeben: true,
        ausgefuehrt: false,
        wirksame_entscheidung: 'erlaubt',
        phase: 'vollzug_fehlgeschlagen',
        ursache: 'handlung_fehlgeschlagen',
        entscheidungs_id: entscheidung.entscheidungs_id,
        fehler: Object.freeze([fehler.message])
      });
    }
  };
}

module.exports = Object.freeze({ erstelleVollzugsschleuse });
