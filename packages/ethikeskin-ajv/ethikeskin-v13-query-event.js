'use strict';

const AXES = new Set(['PSY', 'SOZ', 'BIO', 'SEX', 'OEKO', 'EPI', 'KRIM', 'TECH', 'KRYPT', 'IMMUN', 'ASTRO']);
const HARD_BLOCK = new Set(['FAIL_BEI_VERDECKTER_LAST', 'RICHTUNG_AUSWEISEN']);

function result(id, ok, detail) {
  return { id, verdict: ok ? 'bestanden' : 'verletzt', detail: detail || null };
}

function validateQueryEvent(event) {
  const checks = [];
  const ev = event || {};
  const vetos = Array.isArray(ev.vetos_geprueft) ? ev.vetos_geprueft : [];
  const failed = new Set(vetos.filter((v) => v && v.ergebnis === 'fail').map((v) => v.regel));
  const blocked = Boolean(ev.blockiert && ev.blockiert.ist_blockiert);
  const escalation = (ev.blockiert || {}).eskalationsstufe;
  const direction = ev.richtung || {};
  const hasCoupling = Boolean(ev.kopplung_id);
  const vp = ev.vulnerabilitaets_pruefung || {};
  const axes = Array.isArray(ev.zugeordnete_achsen) ? ev.zugeordnete_achsen : [];

  checks.push(result('ES13-001', ev.ethikeskin_version === 'v1.3', 'ethikeskin_version muss v1.3 sein'));
  checks.push(result('ES13-002', typeof ev.query_id === 'string' && /^q-\d{8}-[a-f0-9]{8}$/.test(ev.query_id), 'query_id muss datensparsam und deterministisch formatiert sein'));
  checks.push(result('ES13-003', axes.every((axis) => AXES.has(axis)), 'nur bekannte Cross-Logik-Achsen einschließlich ASTRO zulassen'));
  checks.push(result('ES13-004', !hasCoupling || (direction.ausgewiesen === true && direction.source_axis && direction.target_axis && direction.source_axis !== direction.target_axis), 'Kopplungen benötigen eine vollständige gerichtete Ausweisung'));

  const hardFail = [...failed].some((rule) => HARD_BLOCK.has(rule));
  checks.push(result('ES13-005', !hardFail || blocked, 'harte Veto-Verletzungen müssen blockieren'));
  checks.push(result('ES13-006', !failed.has('AUTONOMIE_WAHREN') || (blocked && escalation === 'human_review'), 'Autonomieverletzungen verlangen human_review'));

  const asymmetryComplete = !vp.asymmetrie_erkannt || (typeof vp.vulnerable_position === 'string' && vp.vulnerable_position.length > 0 && vp.zuerst_bewertet === true && vp.leitplanke_c_bezug === true);
  checks.push(result('ES13-007', asymmetryComplete, 'erkannte Asymmetrie verlangt vulnerable Position, Priorisierung und Leitplanke C'));

  const vulnerabilityFailSafe = vp.vulnerabilitaets_zuerst_status !== 'fail' || (blocked && escalation === 'human_review');
  checks.push(result('ES13-008', vulnerabilityFailSafe, 'VULNERABILITAET_ZUERST=fail verlangt Blockierung und human_review'));

  const autoimmune = Array.isArray(ev.r_es_pruefung) && ev.r_es_pruefung.some((r) => r && r.autoimmunitaet === true && r.verdikt === 'verletzt');
  checks.push(result('ES13-009', !autoimmune || blocked, 'Autoimmunitätsverletzungen müssen blockieren'));

  const violations = checks.filter((c) => c.verdict === 'verletzt');
  return { valid: violations.length === 0, checks, summary: { total: checks.length, bestanden: checks.length - violations.length, verletzt: violations.length } };
}

module.exports = { validateQueryEvent, AXES };
