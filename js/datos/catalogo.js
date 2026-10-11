// Catálogo completo: junta las materias en el orden en que se muestran.
// Para sumar una materia, ver docs/agregar-materia.md.
import { geometriaAnalitica } from './materias/geometria-analitica.js';
import { funcionesPrecalculo } from './materias/funciones-precalculo.js';
import { trigonometria } from './materias/trigonometria.js';
import { calculoDiferencial } from './materias/calculo-diferencial.js';
import { algebraLineal } from './materias/algebra-lineal.js';

export const MATERIAS = [geometriaAnalitica, funcionesPrecalculo, trigonometria, calculoDiferencial, algebraLineal];
