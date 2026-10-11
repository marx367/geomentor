// Materia: ejes y subtemas. No cambiar los id existentes: se usan para guardar el progreso.
export const algebraLineal = {
  id: 'algebra', nombre: 'Álgebra Lineal', icono: '🔢', desc: 'Matrices, sistemas y transformaciones lineales.', acc: ['#be123c', '#fb7185'], ejes: [
    { id: 'matrices', nombre: 'Matrices y determinantes', icono: '🔢', desc: 'Operaciones, determinantes e inversa.', subtemas: [
      { id: 'operaciones', nombre: 'Operaciones con matrices', desc: 'Suma, producto y transpuesta.' },
      { id: 'determinantes', nombre: 'Determinantes', desc: 'Cálculo y propiedades.' },
      { id: 'inversa', nombre: 'Matriz inversa', desc: 'Existencia y cálculo de la inversa.' } ] },
    { id: 'sistemas', nombre: 'Sistemas de ecuaciones', icono: '⚖️', desc: 'Gauss y clasificación de sistemas.', subtemas: [
      { id: 'gauss', nombre: 'Método de Gauss', desc: 'Escalonamiento y resolución.' },
      { id: 'clasificacion', nombre: 'Clasificación de sistemas', desc: 'Compatible determinado, indeterminado e incompatible.' } ] },
    { id: 'transformaciones', nombre: 'Transformaciones lineales en el plano', icono: '🔄', desc: 'Matriz asociada y transformaciones geométricas.', subtemas: [
      { id: 'matriz', nombre: 'Matriz asociada', desc: 'Imagen de la base canónica.' },
      { id: 'geometricas', nombre: 'Rotaciones, simetrías y homotecias', desc: 'Efecto geométrico de una matriz 2×2.' } ] }
  ]
};
