// Colores de acento e íconos para las materias que crea el estudiante.
// Cada materia nueva toma el siguiente par de la lista (y vuelve a empezar cuando se terminan).
// acc = [color para tema claro, color para temas oscuros].
export const COLORES_MATERIAS = [
  { acc: ['#1f6b57', '#6fd3b4'], icono: '📐' }, // verde pizarra (el color de marca)
  { acc: ['#8a3b6e', '#e39bc8'], icono: '📈' }, // ciruela
  { acc: ['#7f5300', '#e9c46a'], icono: '🔺' }, // ocre, tiza amarilla
  { acc: ['#a3361f', '#f49a84'], icono: '📉' }, // ladrillo
  { acc: ['#4d5a1e', '#b9cc6b'], icono: '🔢' }  // oliva
];
// Paleta anterior al rediseño (solo el color claro). Las materias guardadas con uno de estos colores
// pasan al color nuevo de la misma posición al cargar (ver normalizarMateria en estado/curso.js).
export const COLORES_ANTERIORES = ['#0e7490', '#6d28d9', '#b45309', '#047857', '#be123c'];
