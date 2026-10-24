// Ejercicios propios (de los apuntes y libros, o del profesor): estado dentro de la sesión del subtema
// y el texto de las fuentes del tema. Módulo aparte para mudarlo entero al Paso 5 (Repaso 1) del plan.
import { S } from '../../estado/estado.js';
import { scopeState } from '../../contexto/busqueda-apuntes.js';
import { capitulosDelTema, etiquetaCapitulo } from '../../contexto/bibliografia-tema.js';

export const ORIGENES = {
  tutor: { icono: '🤖', nombre: 'Del tutor', titulo: 'Ejercicio guiado tipo examen' },
  apuntes: { icono: '📒', nombre: 'De mis apuntes y libros', titulo: 'Ejercicio de tus apuntes y libros' },
  profesor: { icono: '👨‍🏫', nombre: 'Del profesor', titulo: 'Ejercicio del profesor' }
};

// s.propio guarda lo que el estudiante está armando antes de tener el ejercicio listo.
export function propio(s) {
  return s.propio ||= { origen: 'tutor', encontrados: null, enunciado: '', imagen: null, solucion: '', leyendo: '' };
}

// Apuntes que corresponden al subtema (asignados o libres) y capítulos asociados: { nombre, texto }.
export function fuentesDelTema() {
  const apuntes = Object.entries(S.config.apuntes || {})
    .filter(([n]) => scopeState(n) !== 'otro')
    .map(([nombre, texto]) => ({ nombre, texto: String(texto) }));
  const libros = capitulosDelTema().map(c => ({ nombre: etiquetaCapitulo(c), texto: c.cap.texto }));
  return [...apuntes, ...libros];
}
export const hayMaterialDelTema = () => fuentesDelTema().length > 0;
