// Materia: ejes y subtemas. No cambiar los id existentes: se usan para guardar el progreso.
export const calculoDiferencial = {
  id: 'calculo', nombre: 'Cálculo Diferencial', icono: '📉', desc: 'Límites, continuidad, derivadas y sus aplicaciones.', acc: ['#047857', '#34d399'], ejes: [
    { id: 'limites', nombre: 'Límites y continuidad', icono: '🎯', desc: 'Cálculo de límites e indeterminaciones.', subtemas: [
      { id: 'limites', nombre: 'Cálculo de límites', desc: 'Límites laterales, al infinito y propiedades.' },
      { id: 'indeterminaciones', nombre: 'Indeterminaciones', desc: '0/0, ∞/∞ y técnicas para salvarlas.' },
      { id: 'continuidad', nombre: 'Continuidad y asíntotas', desc: 'Tipos de discontinuidad y asíntotas.' } ] },
    { id: 'derivada', nombre: 'La derivada', icono: '📉', desc: 'Definición, recta tangente y reglas.', subtemas: [
      { id: 'definicion', nombre: 'Definición y recta tangente', desc: 'Cociente incremental e interpretación geométrica.' },
      { id: 'reglas', nombre: 'Reglas de derivación', desc: 'Suma, producto, cociente y derivadas elementales.' },
      { id: 'cadena', nombre: 'Regla de la cadena', desc: 'Derivada de funciones compuestas.' } ] },
    { id: 'aplicaciones', nombre: 'Aplicaciones de la derivada', icono: '🏔️', desc: 'Extremos, concavidad y optimización.', subtemas: [
      { id: 'extremos', nombre: 'Crecimiento y extremos', desc: 'Puntos críticos, máximos y mínimos.' },
      { id: 'concavidad', nombre: 'Concavidad e inflexión', desc: 'Segunda derivada y puntos de inflexión.' },
      { id: 'optimizacion', nombre: 'Optimización', desc: 'Problemas de máximos y mínimos.' } ] }
  ]
};
