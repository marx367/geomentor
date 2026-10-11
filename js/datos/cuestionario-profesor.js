// Cuestionario de opción múltiple sobre el profesor. Las respuestas se guardan por id (índice de la opción)
// y la IA las analiza junto con el estilo escrito (ver profesor/analisis-estilo.js).
// No cambiar los id: se usan para guardar las respuestas.
export const CUESTIONARIO = [
  { id: 'correccion', pregunta: '¿Cómo corrige los ejercicios?', opciones: ['Mira solo el resultado final', 'Mira todo el procedimiento', 'Da puntaje parcial por el procedimiento aunque el resultado esté mal', 'No lo sé todavía'] },
  { id: 'justificacion', pregunta: '¿Cuánto exige justificar?', opciones: ['Cada paso, nombrando la propiedad o el teorema', 'Solo los pasos clave', 'Poco: le importa que el cálculo esté bien', 'No lo sé todavía'] },
  { id: 'notacion', pregunta: '¿Qué tan estricto es con la notación?', opciones: ['Muy estricto: descuenta por notación incorrecta', 'Pide la notación que usa en clase', 'Acepta cualquier notación correcta', 'No lo sé todavía'] },
  { id: 'graficos', pregunta: '¿Pide gráficos?', opciones: ['En casi todos los ejercicios', 'Solo cuando el enunciado lo pide', 'Casi nunca', 'No lo sé todavía'] },
  { id: 'verificacion', pregunta: '¿Exige verificar resultados y condiciones (dominio, existencia, casos)?', opciones: ['Siempre, y descuenta si falta', 'A veces', 'No', 'No lo sé todavía'] },
  { id: 'formato', pregunta: '¿Cómo es el examen?', opciones: ['Solo ejercicios prácticos', 'Ejercicios y preguntas de teoría', 'Teoría con demostraciones', 'Opción múltiple'] },
  { id: 'teoria', pregunta: '¿Qué peso tiene la teoría?', opciones: ['Mucho: pide definiciones y teoremas exactos', 'Algo: las definiciones clave', 'Poco: casi todo es práctica', 'No lo sé todavía'] },
  { id: 'errores', pregunta: '¿Qué error penaliza más?', opciones: ['Errores de cálculo', 'Errores de concepto', 'Falta de justificación', 'Desorden o falta de claridad'] }
];
