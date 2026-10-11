// Markdown simple → HTML, sin librerías. Primero aparta las fórmulas (para que el escape no las rompa),
// escapa el texto y después arma títulos, listas, párrafos, citas y bloques :::complemento.
import { escapeHTML } from '../nucleo/utilidades.js';
import { renderMath } from './matematica.js';

export function markdownToHTML(src) {
  const math = [];
  const stash = (tex, display) => { math.push(renderMath(tex.trim(), display)); return `\uE000${math.length - 1}\uE001`; };
  let text = String(src || '').replace(/\r\n?/g, '\n')
    .replace(/```[a-z]*\n?/gi, '')
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, m) => stash(m, true))
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, m) => stash(m, true))
    .replace(/\\\(([\s\S]+?)\\\)/g, (_, m) => stash(m, false))
    .replace(/\$([^$\n]+?)\$/g, (_, m) => stash(m, false));
  text = escapeHTML(text);

  const inline = s => s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\((seg[uú]n [^()]{1,80})\)/g, '<span class="cita">($1)</span>')
    .replace(/(^|[^*\w])\*(?!\s)([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');

  let html = '', listType = null, para = [], inComp = false;
  const flushPara = () => { if (para.length) { html += `<p>${para.map(inline).join('<br>')}</p>`; para = []; } };
  const closeList = () => { if (listType) { html += `</${listType}>`; listType = null; } };
  const HEAD = [3, 3, 4, 5, 6, 6];

  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    let m;
    if (/^\s*:::\s*complemento/i.test(line)) { flushPara(); closeList(); if (inComp) html += '</aside>'; html += '<aside class="complemento"><p class="comp-title">➕ Complemento del tutor</p>'; inComp = true; continue; }
    if (inComp && /^\s*:::\s*$/.test(line)) { flushPara(); closeList(); html += '</aside>'; inComp = false; continue; }
    if (!line.trim()) { flushPara(); closeList(); continue; }
    if ((m = line.match(/^\s*(#{1,6})\s+(.*)$/))) {
      flushPara(); closeList();
      const lvl = HEAD[m[1].length - 1];
      html += `<h${lvl}>${inline(m[2])}</h${lvl}>`; continue;
    }
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { flushPara(); closeList(); html += '<hr>'; continue; }
    if ((m = line.match(/^\s*[-*+•]\s+(.*)$/))) {
      flushPara();
      if (listType !== 'ul') { closeList(); html += '<ul>'; listType = 'ul'; }
      html += `<li>${inline(m[1])}</li>`; continue;
    }
    if ((m = line.match(/^\s*(\d+)[.)]\s+(.*)$/))) {
      flushPara();
      if (listType !== 'ol') { closeList(); html += `<ol start="${m[1]}">`; listType = 'ol'; }
      html += `<li>${inline(m[2])}</li>`; continue;
    }
    closeList();
    para.push(line);
  }
  flushPara(); closeList();
  if (inComp) html += '</aside>';
  return html.replace(/\uE000(\d+)\uE001/g, (_, i) => math[+i]);
}
export const mdInline = t => markdownToHTML(t).replace(/^<p>([\s\S]*)<\/p>$/, '$1');
