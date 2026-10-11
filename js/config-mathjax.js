// Configuración de MathJax. Script clásico (no módulo): tiene que existir antes de que cargue MathJax.
// Al terminar de cargar avisa con el evento 'math-ready' para volver a dibujar las fórmulas.
window.MathJax = {
  tex: { inlineMath: [], displayMath: [] },
  svg: { fontCache: 'none' },
  options: { enableMenu: false },
  startup: {
    typeset: false,
    ready: () => {
      MathJax.startup.defaultReady();
      MathJax.startup.promise.then(() => {
        try { document.head.appendChild(MathJax.svgStylesheet()); } catch (e) { /* sin hoja extra */ }
        window.__mjReady = true;
        window.dispatchEvent(new Event('math-ready'));
      });
    }
  }
};
