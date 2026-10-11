// Materia: ejes y subtemas. No cambiar los id existentes: se usan para guardar el progreso.
export const trigonometria = {
  id: 'trigonometria', nombre: 'Trigonometría', icono: '🔺', desc: 'Razones, funciones trigonométricas e identidades.', acc: ['#b45309', '#fbbf24'], ejes: [
    { id: 'razones', nombre: 'Razones y círculo trigonométrico', icono: '🔺', desc: 'Triángulos, radianes y círculo unitario.', subtemas: [
      { id: 'triangulo', nombre: 'Razones en el triángulo rectángulo', desc: 'Seno, coseno y tangente de ángulos agudos.' },
      { id: 'circulo', nombre: 'Círculo trigonométrico y radianes', desc: 'Ángulos orientados, reducción al primer cuadrante.' },
      { id: 'teoremas', nombre: 'Teoremas del seno y del coseno', desc: 'Resolución de triángulos oblicuángulos.' } ] },
    { id: 'graficas', nombre: 'Funciones trigonométricas', icono: '〰️', desc: 'Gráficas, amplitud, período y fase.', subtemas: [
      { id: 'graficas', nombre: 'Gráficas de seno, coseno y tangente', desc: 'Dominio, imagen, ceros y asíntotas.' },
      { id: 'parametros', nombre: 'Amplitud, período y fase', desc: 'Función y = A sen(Bx + C) + D.' } ] },
    { id: 'identidades', nombre: 'Identidades y ecuaciones', icono: '🧩', desc: 'Demostraciones y resolución de ecuaciones.', subtemas: [
      { id: 'identidades', nombre: 'Identidades fundamentales', desc: 'Pitagórica, suma de ángulos y ángulo doble.' },
      { id: 'ecuaciones', nombre: 'Ecuaciones trigonométricas', desc: 'Soluciones generales y en un intervalo.' } ] }
  ]
};
