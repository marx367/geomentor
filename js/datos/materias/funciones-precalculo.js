// Materia: ejes y subtemas. No cambiar los id existentes: se usan para guardar el progreso.
export const funcionesPrecalculo = {
  id: 'funciones', nombre: 'Funciones y Precálculo', icono: '📈', desc: 'Funciones elementales, sus gráficas y transformaciones.', acc: ['#6d28d9', '#a78bfa'], ejes: [
    { id: 'elementales', nombre: 'Funciones elementales', icono: '📈', desc: 'Lineal, cuadrática, polinómica y racional.', subtemas: [
      { id: 'cuadratica', nombre: 'Función lineal y cuadrática', desc: 'Pendiente, vértice, raíces y forma canónica.' },
      { id: 'polinomica', nombre: 'Funciones polinómicas', desc: 'Raíces, multiplicidad y comportamiento en los extremos.' },
      { id: 'racional', nombre: 'Funciones racionales', desc: 'Dominio, asíntotas verticales y horizontales.' } ] },
    { id: 'explog', nombre: 'Exponencial y logarítmica', icono: '🧮', desc: 'Crecimiento, logaritmos y ecuaciones.', subtemas: [
      { id: 'exponencial', nombre: 'Función exponencial', desc: 'Base, crecimiento, decrecimiento y asíntota.' },
      { id: 'logaritmo', nombre: 'Logaritmo y propiedades', desc: 'Definición, propiedades y cambio de base.' },
      { id: 'ecuaciones', nombre: 'Ecuaciones exponenciales y logarítmicas', desc: 'Resolución y verificación de soluciones.' } ] },
    { id: 'transformaciones', nombre: 'Transformaciones y composición', icono: '🔁', desc: 'Traslaciones, dilataciones, inversa y composición.', subtemas: [
      { id: 'traslaciones', nombre: 'Traslaciones, dilataciones y reflexiones', desc: 'Efecto de los parámetros sobre la gráfica.' },
      { id: 'composicion', nombre: 'Composición e inversa', desc: 'Composición, inyectividad y función inversa.' },
      { id: 'dominio', nombre: 'Dominio, imagen y signo', desc: 'Análisis completo de una función.' } ] }
  ]
};
