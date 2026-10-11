// Pestaña 1 · pantalla: teoría, ideas clave, chequeo socrático (turnos, medidor, entendido/falta,
// pregunta actual) y tarjeta de resumen. Solo dibuja; las acciones están en pestana-teoria.js.
import { $ } from '../nucleo/dom.js';
import { escapeHTML, spinnerHTML, loadingHTML, errorBlock } from '../nucleo/utilidades.js';
import { S, key, sess } from '../estado/estado.js';
import { markdownToHTML, mdInline } from '../render/markdown.js';
import { fuentesHTML } from '../contexto/fuentes.js';

export function renderTeoria() {
  const el = $('#tab-teoria');
  const k = key(), s = sess(), c = S.cache[k];
  if (!k) return;
  if (s.busy.teoria) { el.innerHTML = loadingHTML('Preparando la teoría del subtema…'); return; }
  if (!c) { el.innerHTML = errorBlock(s.err.teoria || 'Todavía no se generó la teoría de este subtema.', 'regen-teoria', s.err.teoria ? 'Reintentar' : 'Generar teoría'); return; }
  if (!s.currentQ) s.currentQ = c.pregunta;

  const busy = s.busy.chequeo || s.busy.resumen;
  const turns = s.turns.map((t, i) => `
    <article class="turn">
      <p class="turn-q"><span class="turn-n">${i + 1}</span><span>${mdInline(t.q)}</span></p>
      <blockquote class="turn-a">${escapeHTML(t.a).replace(/\n/g, '<br>')}</blockquote>
      <div class="turn-f md">${markdownToHTML(t.feedback)}</div>${fuentesHTML(t.fuentes)}
    </article>`).join('');
  const chips = s.turns.length ? `
    <div class="chips-block">
      <div><h4>✔ Lo que ya entendiste</h4><div class="chips">${s.entendido.length ? s.entendido.map(x => `<span class="chip ok">${mdInline(x)}</span>`).join('') : '<span class="muted small">Aún nada firme.</span>'}</div></div>
      <div><h4>✖ Lo que te falta</h4><div class="chips">${s.falta.length ? s.falta.map(x => `<span class="chip bad">${mdInline(x)}</span>`).join('') : '<span class="muted small">Nada pendiente detectado.</span>'}</div></div>
    </div>` : '';

  el.innerHTML = `
  <div class="stack">
    <section class="panel-card">
      <div class="card-head"><h2>${escapeHTML(S.sub.nombre)}</h2><button class="btn ghost sm" data-action="regen-teoria">↻ Regenerar</button></div>
      <div class="md">${markdownToHTML(c.teoria)}</div>
      ${fuentesHTML(c.fuentes)}
    </section>
    ${c.ideas.length ? `<section class="panel-card"><h3 style="margin-bottom:.5rem">🔑 Ideas clave</h3><ul class="ideas">${c.ideas.map(i => `<li>${mdInline(i)}</li>`).join('')}</ul></section>` : ''}
    <section class="panel-card socratic">
      <div class="card-head" style="margin-bottom:.4rem"><h3>🤔 Chequeo socrático de comprensión</h3>${s.turns.length ? `<span class="pill accent">Comprensión ${s.comprension}%</span>` : ''}</div>
      ${s.turns.length ? `<div class="meter" aria-label="Comprensión estimada"><span style="width:${s.comprension}%"></span></div>` : '<p class="muted small" style="margin-bottom:.5rem">Responde con tus palabras. El mentor evalúa tu razonamiento, te dice qué entendiste y qué te falta, y te hace una nueva pregunta. Puedes iterar todas las veces que quieras.</p>'}
      ${turns}
      ${chips}
      <div class="current-q">
        <p class="q-label">${s.turns.length ? 'SIGUIENTE PREGUNTA' : 'PREGUNTA'}</p>
        <div class="q-text">${mdInline(s.currentQ)}</div>
        <textarea id="answer" rows="4" placeholder="Explica tu razonamiento paso a paso…" ${busy ? 'disabled' : ''}>${escapeHTML(s.draft)}</textarea>
        <div class="btn-row">
          <button class="btn primary" data-action="verificar" ${busy ? 'disabled' : ''}>${s.busy.chequeo ? spinnerHTML + ' Evaluando…' : 'Verificar razonamiento'}</button>
          <button class="btn" data-action="export-resumen" ${!s.turns.length || busy ? 'disabled' : ''} title="${s.turns.length ? 'Genera el resumen, guarda tus puntos débiles y descarga un .txt' : 'Responde al menos una pregunta primero'}">${s.busy.resumen ? spinnerHTML + ' Generando resumen…' : '📄 Resumen de la sesión (.txt)'}</button>
          <button class="btn ghost" data-action="nose" ${busy ? 'disabled' : ''}>No lo sé, explícame</button>
        </div>
        ${s.err.chequeo ? `<p class="error-text">${escapeHTML(s.err.chequeo)}</p>` : ''}
      </div>
    </section>
    ${summaryCard(s)}
  </div>`;
}

export function summaryCard(s) {
  const r = s.summary;
  if (!r) return '';
  const li = arr => arr.map(x => `<li>${escapeHTML(x)}</li>`).join('');
  return `
  <section class="panel-card summary-card">
    <h3>🧾 Resumen de la sesión</h3>
    <p>${escapeHTML(r.general)}</p>${fuentesHTML(r.fuentes)}
    ${r.fuertes.length ? `<h4>✔ Puntos fuertes</h4><ul>${li(r.fuertes)}</ul>` : ''}
    ${r.debiles.length ? `<h4>✖ Puntos débiles</h4><ul>${li(r.debiles)}</ul>` : ''}
    ${r.plan.length ? `<h4>🗺️ Plan de repaso</h4><ol>${li(r.plan)}</ol>` : ''}
    ${r.saved ? `<p class="saved-note">📌 Guardé ${r.debiles.length} puntos débiles. El mentor los reforzará la próxima vez que estudies este subtema.</p>` : ''}
    <div class="btn-row" style="margin-top:.75rem"><button class="btn sm" data-action="descargar-resumen">⬇️ Descargar .txt</button></div>
  </section>`;
}
