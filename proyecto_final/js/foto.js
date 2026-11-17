// SPRINT 3 - Escaneo de ticket con OCR (Tesseract.js, se carga solo al usarlo).
(function (root) {
  const CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  const IMPORTES = /\d{1,6}[.,]\d{2}/g;
  const aNumero = s => parseFloat(s.replace(',', '.'));

  // Busca la línea "TOTAL" (no "SUBTOTAL"); si no hay, usa el importe más grande.
  function extraerTotal(texto) {
    const lineas = (texto || '').split('\n');
    let total = null;
    for (const l of lineas) {
      if (/(^|[^a-z])total/i.test(l) && !/sub\s*total/i.test(l)) {
        const m = l.match(IMPORTES);
        if (m) total = aNumero(m[m.length - 1]);
      }
    }
    if (total !== null) return total;
    const todos = (texto || '').match(IMPORTES);
    return todos ? Math.max(...todos.map(aNumero)) : null;
  }

  function cargarLibreria() {
    return new Promise((ok, mal) => {
      if (root.Tesseract) return ok();
      const s = document.createElement('script');
      s.src = CDN; s.onload = ok; s.onerror = () => mal(new Error('No se pudo cargar el lector de tickets.'));
      document.head.appendChild(s);
    });
  }

  async function leerTicket(archivo) {
    await cargarLibreria();
    const r = await root.Tesseract.recognize(archivo, 'spa');
    return { monto: extraerTotal(r.data.text), texto: r.data.text };
  }

  const API = { extraerTotal, leerTicket };
  root.Foto = API;
  if (typeof module !== 'undefined') module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
