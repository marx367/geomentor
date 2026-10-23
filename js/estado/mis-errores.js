// "Mis errores" de la hoja de un subtema: los puntos débiles de ese subtema, listos para mostrar.
// Función pura, sin IA ni almacén ni imports (igual que errores-frecuentes.js), para poder probarla con node.
// Los descartados no aparecen nunca: se lee el campo directo, igual que puntosVigentes().

// Devuelve [{ texto, tipo, superado }]: primero los pendientes (en el orden de la lista, que ya viene
// del más nuevo al más viejo) y después los superados, del superado más recientemente al más viejo.
export function misErrores(debiles, key) {
  const delTema = (Array.isArray(debiles) ? debiles : []).filter(d => d?.key === key);
  const puntos = d => (Array.isArray(d.puntos) ? d.puntos : [])
    .filter(p => p?.texto && !p.descartado)
    .map(p => ({ texto: p.texto, tipo: p.tipo, superado: Boolean(d.superado) }));
  const ms = d => new Date(d.superado).getTime() || 0;
  const pendientes = delTema.filter(d => !d.superado);
  const superados = delTema.filter(d => d.superado).sort((a, b) => ms(b) - ms(a));
  return [...pendientes, ...superados].flatMap(puntos);
}
