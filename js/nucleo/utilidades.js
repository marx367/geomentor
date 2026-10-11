// Utilidades generales de texto, fechas e identificadores. Sin dependencias.
export const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
export const clip = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n) + '…' : s; };
export const byteLen = s => new TextEncoder().encode(s).length;
export const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const slug = s => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'tema';
export const today = () => new Date().toISOString().slice(0, 10);
export const stamp = (d = new Date()) => d.toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' });
export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const spinnerHTML = '<span class="spinner" aria-hidden="true"></span>';
export const loadingHTML = msg => `<div class="loading">${spinnerHTML}<span>${escapeHTML(msg)}</span></div>`;
export const errorBlock = (msg, action, label = 'Reintentar') => `<div class="empty"><p class="error-text">${escapeHTML(msg)}</p><button class="btn" data-action="${action}">${label}</button></div>`;
