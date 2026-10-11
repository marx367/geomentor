// Diálogo "＋ Tema de hoy": formulario (fecha, título, apuntes, materia y eje) → la IA propone eje y subtema
// → el estudiante edita y confirma. Al confirmar, guarda los apuntes y el tema en Mi curso.
import { $ } from '../nucleo/dom.js';
import { escapeHTML, loadingHTML, spinnerHTML, limpiarTexto, esFechaValida, today } from '../nucleo/utilidades.js';
import { S } from '../estado/estado.js';
import { Store } from '../estado/almacen.js';
import { buscarMateria, buscarEje, crearMateria, crearEje, agregarSubtema, guardarCurso } from '../estado/curso.js';
import { aiError } from '../ia/errores-ia.js';
import { mentor } from '../ui/mentor.js';
import { go, setAccent } from '../ui/navegacion.js';
import { leerArchivoApunte } from './lector-archivos.js';
import { proponerUbicacion } from './ubicar-tema.js';

const MAX_MB = 20; // tamaño máximo por archivo de apuntes
const NUEVA = '__nueva', NUEVO = '__nuevo', IA_ELIGE = '__ia';
// Estado del diálogo. paso: 'form' → 'busy' → 'propuesta'.
const T = {};
function reiniciar(materiaId = '', ejeId = IA_ELIGE) {
  Object.assign(T, { paso: 'form', err: '', leyendo: '', fecha: today(), titulo: '', archivos: [], materiaSel: materiaId || (S.curso.materias[0]?.id ?? NUEVA), materiaNueva: '', ejeSel: ejeId, ejeNuevo: '', propuesta: null });
}

const opcion = (v, label, sel) => `<option value="${escapeHTML(v)}" ${v === sel ? 'selected' : ''}>${escapeHTML(label)}</option>`;
const materiaElegida = () => T.materiaSel === NUEVA ? null : buscarMateria(T.materiaSel);

function renderFormulario() {
  const m = materiaElegida();
  return `
    ${T.err ? `<p class="error-text" role="alert">${escapeHTML(T.err)}</p>` : ''}
    <label class="field">Fecha de la clase<input type="date" id="th-fecha" value="${escapeHTML(T.fecha)}" required></label>
    <label class="field">Título de la clase<input id="th-titulo" maxlength="120" value="${escapeHTML(T.titulo)}" placeholder="Ej.: Límites laterales y continuidad" autocomplete="off" required></label>
    <div class="field">Apuntes de la clase <span class="muted small">(.txt, .md o .pdf con texto; opcional)</span>
      <div class="btn-row"><label class="btn file-btn">📁 Agregar archivos<input type="file" id="th-archivos" accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf" multiple></label></div>
      ${T.leyendo ? `<p class="loading small">${spinnerHTML} Leyendo ${escapeHTML(T.leyendo)}…</p>` : ''}
      <div class="file-list">${T.archivos.map((a, i) => `<div class="file-item"><span>📄 ${escapeHTML(a.nombre)} <span class="muted">· ${Math.max(1, Math.round(a.texto.length / 1000))} mil caracteres</span></span><button type="button" class="btn ghost sm" data-tact="quitar-archivo" data-i="${i}" aria-label="Quitar ${escapeHTML(a.nombre)}">✕</button></div>`).join('')}</div>
    </div>
    <label class="field">Materia<select id="th-materia">${S.curso.materias.map(x => opcion(x.id, x.nombre, T.materiaSel)).join('')}${opcion(NUEVA, '＋ Nueva materia…', T.materiaSel)}</select></label>
    ${T.materiaSel === NUEVA ? `<label class="field">Nombre de la materia nueva<input id="th-materia-nueva" maxlength="80" value="${escapeHTML(T.materiaNueva)}" placeholder="Ej.: Análisis Matemático I" autocomplete="off"></label>` : ''}
    <label class="field">Eje<select id="th-eje">${opcion(IA_ELIGE, '✨ Que lo proponga la IA', T.ejeSel)}${(m?.ejes || []).map(e => opcion(e.id, e.nombre, T.ejeSel)).join('')}${opcion(NUEVO, '＋ Nuevo eje…', T.ejeSel)}</select></label>
    ${T.ejeSel === NUEVO ? `<label class="field">Nombre del eje nuevo<input id="th-eje-nuevo" maxlength="80" value="${escapeHTML(T.ejeNuevo)}" placeholder="Ej.: Límites y continuidad" autocomplete="off"></label>` : ''}
    <div class="btn-row"><button type="button" class="btn primary" data-tact="proponer" ${T.leyendo ? 'disabled' : ''}>Siguiente: proponer ubicación</button></div>`;
}

function renderPropuesta() {
  const p = T.propuesta, m = materiaElegida();
  const nombreMateria = m ? m.nombre : limpiarTexto(T.materiaNueva, 80);
  const ejeSel = p.ejeId || NUEVO;
  return `
    ${T.err ? `<p class="error-text" role="alert">${escapeHTML(T.err)}</p>` : ''}
    <p class="muted small">${p.sinIA ? 'No hay IA configurada: armé la propuesta con el título. ' : ''}Revisa y corrige lo que haga falta antes de confirmar.</p>
    <p><strong>Materia:</strong> ${escapeHTML(nombreMateria)}${m ? '' : ' <span class="pill accent">nueva</span>'} · <strong>Fecha:</strong> ${escapeHTML(T.fecha.split('-').reverse().join('/'))}</p>
    <div class="gen-eje">
      <label class="field">Eje<select id="tp-eje">${(m?.ejes || []).map(e => opcion(e.id, e.nombre, ejeSel)).join('')}${opcion(NUEVO, p.ejeNuevo ? `Nuevo: ${p.ejeNuevo.nombre}` : '＋ Nuevo eje…', ejeSel)}</select></label>
      ${ejeSel === NUEVO ? `
        <div class="gen-row">
          <input class="emoji" id="tp-eje-icono" maxlength="4" value="${escapeHTML(p.ejeNuevo?.icono || '📚')}" aria-label="Emoji del eje">
          <input id="tp-eje-nombre" maxlength="80" value="${escapeHTML(p.ejeNuevo?.nombre || '')}" aria-label="Nombre del eje nuevo">
        </div>
        <input id="tp-eje-desc" maxlength="300" value="${escapeHTML(p.ejeNuevo?.desc || '')}" aria-label="Descripción del eje nuevo" placeholder="Descripción del eje (opcional)">` : ''}
      <label class="field">Subtema<input id="tp-sub-nombre" maxlength="120" value="${escapeHTML(p.subtema.nombre)}"></label>
      <label class="field">Qué se estudia<input id="tp-sub-desc" maxlength="300" value="${escapeHTML(p.subtema.desc)}" placeholder="Una frase (opcional)"></label>
      <div class="gen-files">📄 ${T.archivos.length ? T.archivos.map(a => escapeHTML(a.nombre)).join(', ') : 'sin apuntes'}</div>
    </div>
    <div class="btn-row">
      <button type="button" class="btn primary" data-tact="confirmar">✔ Confirmar</button>
      <button type="button" class="btn" data-tact="volver">← Volver</button>
      <button type="button" class="btn ghost" data-tact="proponer">↻ Proponer de nuevo</button>
    </div>`;
}

function render() {
  const body = $('#tema-hoy-body');
  if (T.paso === 'busy') { body.innerHTML = loadingHTML('El mentor está ubicando el tema en tu curso…'); return; }
  body.innerHTML = T.paso === 'propuesta' ? renderPropuesta() : renderFormulario();
}

// Lee los campos a T antes de redibujar, para no perder lo escrito.
function leerFormulario() {
  const v = id => $('#' + id)?.value;
  if (T.paso === 'form') {
    T.fecha = v('th-fecha') ?? T.fecha; T.titulo = v('th-titulo') ?? T.titulo;
    T.materiaSel = v('th-materia') ?? T.materiaSel; T.materiaNueva = v('th-materia-nueva') ?? T.materiaNueva;
    T.ejeSel = v('th-eje') ?? T.ejeSel; T.ejeNuevo = v('th-eje-nuevo') ?? T.ejeNuevo;
  }
  if (T.paso === 'propuesta') {
    const p = T.propuesta, sel = v('tp-eje');
    if (sel !== undefined) p.ejeId = sel === NUEVO ? '' : sel;
    if ($('#tp-eje-nombre')) p.ejeNuevo = { icono: v('tp-eje-icono'), nombre: v('tp-eje-nombre'), desc: v('tp-eje-desc') };
    else if (!p.ejeId) p.ejeNuevo ||= { icono: '📚', nombre: '', desc: '' };
    p.subtema = { nombre: v('tp-sub-nombre') ?? p.subtema.nombre, desc: v('tp-sub-desc') ?? p.subtema.desc };
  }
}

// Validación del formulario: devuelve el mensaje de error o '' si está todo bien.
function validarFormulario() {
  if (!esFechaValida(T.fecha)) return 'Elige una fecha válida.';
  if (limpiarTexto(T.titulo).length < 3) return 'Escribe el título de la clase (al menos 3 letras).';
  if (T.materiaSel === NUEVA && limpiarTexto(T.materiaNueva, 80).length < 2) return 'Escribe el nombre de la materia nueva.';
  if (T.ejeSel === NUEVO && limpiarTexto(T.ejeNuevo, 80).length < 2) return 'Escribe el nombre del eje nuevo.';
  return '';
}

async function proponer() {
  T.err = validarFormulario();
  if (T.err) { render(); return; }
  // Si escribió una materia nueva que ya existe con ese nombre, se usa la existente.
  if (T.materiaSel === NUEVA) {
    const igual = S.curso.materias.find(x => x.nombre.toLowerCase() === limpiarTexto(T.materiaNueva, 80).toLowerCase());
    if (igual) T.materiaSel = igual.id;
  }
  const m = materiaElegida();
  T.paso = 'busy'; render();
  try {
    T.propuesta = await proponerUbicacion({
      materia: m, nombreMateria: m ? m.nombre : limpiarTexto(T.materiaNueva, 80),
      eje: buscarEje(m, T.ejeSel), ejeNuevoNombre: T.ejeSel === NUEVO ? limpiarTexto(T.ejeNuevo, 80) : '',
      titulo: limpiarTexto(T.titulo), texto: T.archivos.map(a => `=== ${a.nombre} ===\n${a.texto}`).join('\n\n')
    });
    T.paso = 'propuesta'; T.err = '';
  } catch (e) {
    T.paso = 'form'; T.err = 'No se pudo pedir la propuesta: ' + aiError(e);
  }
  render();
}

// Si ya hay un apunte con ese nombre y otro contenido, se le agrega la fecha para no pisarlo.
function nombreLibre(nombre, texto) {
  const ap = S.config.apuntes;
  if (!(nombre in ap) || ap[nombre] === texto) return nombre;
  const [, base, ext = ''] = nombre.match(/^(.*?)(\.[^.]*)?$/);
  let n = `${base} (${T.fecha})${ext}`, k = 2;
  while (n in ap && ap[n] !== texto) n = `${base} (${T.fecha}-${k++})${ext}`;
  return n;
}

async function confirmar() {
  leerFormulario();
  const p = T.propuesta;
  const nombreSub = limpiarTexto(p.subtema.nombre);
  const nombreEje = limpiarTexto(p.ejeNuevo?.nombre, 80);
  if (nombreSub.length < 2) { T.err = 'Escribe el nombre del subtema.'; render(); return; }
  if (!p.ejeId && nombreEje.length < 2) { T.err = 'Escribe el nombre del eje nuevo.'; render(); return; }
  const m = materiaElegida() || crearMateria(limpiarTexto(T.materiaNueva, 80));
  const e = buscarEje(m, p.ejeId) || crearEje(m, { nombre: nombreEje, icono: limpiarTexto(p.ejeNuevo.icono, 4) || '📚', desc: p.ejeNuevo.desc });
  const nombres = T.archivos.map(a => {
    const n = nombreLibre(a.nombre, a.texto);
    S.config.apuntes[n] = a.texto;
    return n;
  });
  const sb = agregarSubtema(e, { nombre: nombreSub, desc: p.subtema.desc, fecha: T.fecha, archivos: nombres });
  // Cada apunte queda asignado a este subtema: así no se mezcla con los temas de otras clases.
  for (const n of nombres) (S.config.asignacion ||= {})[n] = `${m.id}/${e.id}/${sb.id}`;
  const okConfig = JSON.stringify(S.config).length < 240000 ? await Store.setDoc('config', S.config) : false;
  const okCurso = await guardarCurso();
  $('#dlg-tema-hoy').close();
  reiniciar();
  S.materia = m; S.eje = e; S.sub = null; setAccent(m);
  go('subtemas');
  mentor(`Listo: «${sb.nombre}» quedó en ${e.nombre}.${okConfig && okCurso ? '' : ' Ojo: no se pudo guardar todo de forma permanente (los apuntes son muy grandes); se usarán en esta sesión.'}`);
}

async function agregarArchivos(input) {
  leerFormulario();
  const files = [...(input.files || [])];
  input.value = '';
  T.err = '';
  for (const f of files) {
    if (!/\.(txt|md|pdf)$/i.test(f.name)) { T.err = `«${f.name}» no es .txt, .md ni .pdf.`; continue; }
    if (f.size > MAX_MB * 1024 * 1024) { T.err = `«${f.name}» pesa más de ${MAX_MB} MB.`; continue; }
    T.leyendo = f.name; render();
    try {
      const texto = await leerArchivoApunte(f);
      T.archivos = T.archivos.filter(a => a.nombre !== f.name).concat({ nombre: f.name, texto });
    } catch (e) {
      T.err = e.code === 'escaneado' ? `«${f.name}» parece escaneado: sus páginas son imágenes sin texto. Pásalo por un OCR o súbelo como .txt.` : `No pude leer «${f.name}»${e?.message ? ': ' + e.message : ''}.`;
    }
  }
  T.leyendo = ''; render();
}

// Abre el diálogo. Si se abre desde una materia o un eje, quedan preelegidos.
export function abrirTemaHoy() {
  if (T.paso !== 'busy') reiniciar(S.materia?.id, S.eje?.id || IA_ELIGE);
  render();
  $('#dlg-tema-hoy').showModal();
}

export function iniciarDialogoTemaHoy() {
  reiniciar();
  const body = $('#tema-hoy-body');
  body.addEventListener('click', ev => {
    const b = ev.target.closest('[data-tact]');
    if (!b) return;
    leerFormulario();
    const act = b.dataset.tact;
    if (act === 'proponer') proponer();
    if (act === 'confirmar') confirmar();
    if (act === 'volver') { T.paso = 'form'; T.err = ''; render(); }
    if (act === 'quitar-archivo') { T.archivos.splice(+b.dataset.i, 1); render(); }
  });
  body.addEventListener('change', ev => {
    if (ev.target.id === 'th-archivos') { agregarArchivos(ev.target); return; }
    // Al cambiar materia o eje se redibuja para mostrar (u ocultar) el campo de "nuevo".
    if (['th-materia', 'th-eje', 'tp-eje'].includes(ev.target.id)) {
      leerFormulario();
      if (ev.target.id === 'th-materia') T.ejeSel = IA_ELIGE;
      render();
    }
  });
}
