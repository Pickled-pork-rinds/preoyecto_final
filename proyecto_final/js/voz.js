// SPRINT 3 - Dictado por voz. "Gasté 80 pesos en tacos" -> monto 80, categoría Comidas.
(function (root) {
  const quitarAcentos = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const CLAVES = {
    'Comidas': ['taco', 'comida', 'torta', 'cafe', 'desayuno', 'almuerzo', 'cena', 'refresco', 'pizza', 'hamburguesa', 'agua'],
    'Transporte': ['camion', 'uber', 'didi', 'pasaje', 'gasolina', 'taxi', 'tren', 'macro', 'transporte'],
    'Universidad': ['copias', 'libro', 'material', 'colegiatura', 'impresion', 'papeleria', 'cuaderno', 'escuela'],
    'Médicos': ['doctor', 'medicina', 'farmacia', 'consulta', 'medico', 'pastilla', 'dentista']
  };

  function parsear(texto) {
    const t = quitarAcentos(texto || '').replace(/(\d),(\d{3})/g, '$1$2');
    const m = t.match(/\d+(?:[.,]\d{1,2})?/);
    const monto = m ? parseFloat(m[0].replace(',', '.')) : null;
    let categoria = 'Personales';
    outer: for (const [cat, palabras] of Object.entries(CLAVES))
      for (const p of palabras) if (t.includes(p)) { categoria = cat; break outer; }
    return { monto, categoria, nota: (texto || '').trim() };
  }

  function iniciar(alTerminar, alEstado) {
    const SR = root.SpeechRecognition || root.webkitSpeechRecognition;
    if (!SR) { alEstado('Tu navegador no soporta dictado por voz. Usa Chrome, Edge o Safari.'); return; }
    const rec = new SR();
    rec.lang = 'es-MX';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onstart = () => alEstado('Escuchando… di, por ejemplo: "gasté 80 pesos en tacos"', true);
    rec.onerror = e => alEstado('No se pudo dictar (' + e.error + '). Captura el gasto a mano.', false);
    rec.onend = () => alEstado(null, false);
    rec.onresult = e => alTerminar(e.results[0][0].transcript);
    rec.start();
  }

  const API = { parsear, iniciar };
  root.Voz = API;
  if (typeof module !== 'undefined') module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
