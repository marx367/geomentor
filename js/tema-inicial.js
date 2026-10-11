// Tema guardado (light, dim o dark). Script clásico (no módulo) cargado en <head> antes de los estilos:
// así el atributo data-theme ya está puesto cuando el navegador pinta y no hay parpadeo.
// Sin atributo = Auto (sigue al sistema operativo). El menú que lo cambia está en js/ui/tema.js.
(function () {
  try {
    const tema = localStorage.getItem('geomentor-tema');
    if (tema === 'light' || tema === 'dim' || tema === 'dark') document.documentElement.dataset.theme = tema;
  } catch (e) { /* localStorage bloqueado (modo privado estricto): queda Auto */ }
})();
