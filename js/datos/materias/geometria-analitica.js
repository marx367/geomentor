// Materia: ejes y subtemas. No cambiar los id existentes: se usan para guardar el progreso.
export const geometriaAnalitica = {
  id: 'geometria', nombre: 'Geometría Analítica', icono: '📐', desc: 'Vectores, rectas, planos y cónicas.', acc: ['#0e7490', '#22d3ee'], ejes: [
    { id: 'vectores', nombre: 'Vectores en R² y R³', icono: '↗️', desc: 'Operaciones, producto escalar y vectorial, módulo y ángulos.', subtemas: [
      { id: 'operaciones', nombre: 'Operaciones y producto escalar', desc: 'Suma, resta, combinación lineal y producto punto.' },
      { id: 'modulo', nombre: 'Módulo, versor y ángulo', desc: 'Norma, vector unitario y ángulo entre vectores.' },
      { id: 'proyeccion', nombre: 'Proyección ortogonal', desc: 'Proyección de un vector sobre otro y componente ortogonal.' },
      { id: 'vectorial', nombre: 'Producto vectorial y mixto', desc: 'Producto cruz en R³, áreas y volúmenes.' } ] },
    { id: 'recta', nombre: 'La recta en el plano', icono: '📏', desc: 'Ecuaciones, posiciones relativas y distancias.', subtemas: [
      { id: 'ecuaciones', nombre: 'Ecuaciones de la recta', desc: 'Explícita, general, segmentaria, vectorial y paramétrica.' },
      { id: 'posiciones', nombre: 'Paralelismo y perpendicularidad', desc: 'Condiciones con pendientes y vectores directores.' },
      { id: 'distancia', nombre: 'Distancia punto-recta', desc: 'Fórmula de distancia y distancia entre paralelas.' },
      { id: 'interseccion', nombre: 'Intersección y ángulo entre rectas', desc: 'Sistemas de ecuaciones y ángulo entre direcciones.' } ] },
    { id: 'conicas', nombre: 'Las cónicas', icono: '⭕', desc: 'Circunferencia, parábola, elipse e hipérbola.', subtemas: [
      { id: 'circunferencia', nombre: 'Circunferencia', desc: 'Centro, radio, ecuación canónica y general.' },
      { id: 'parabola', nombre: 'Parábola', desc: 'Foco, directriz, vértice y eje.' },
      { id: 'elipse', nombre: 'Elipse', desc: 'Semiejes, focos y excentricidad.' },
      { id: 'hiperbola', nombre: 'Hipérbola', desc: 'Asíntotas, focos y excentricidad.' },
      { id: 'general', nombre: 'Ecuación general de segundo grado', desc: 'Completar cuadrados e identificar la cónica.' } ] },
    { id: 'espacio', nombre: 'Recta y plano en R³', icono: '🧊', desc: 'Ecuaciones y posiciones relativas en el espacio.', subtemas: [
      { id: 'plano', nombre: 'Ecuaciones del plano', desc: 'Vector normal, ecuación general y paramétrica.' },
      { id: 'recta3', nombre: 'La recta en el espacio', desc: 'Ecuaciones vectorial, paramétrica y simétrica.' },
      { id: 'relativas', nombre: 'Posiciones relativas y distancias', desc: 'Recta-plano, plano-plano y distancia punto-plano.' } ] }
  ]
};
