// SPRINT 2 - Algoritmos del resumen. Funciones puras (se pueden probar con Node).
(function (root) {
  const DIA = 86400000;
  const DURACION = { semanal: 7, quincenal: 15, mensual: 30 };

  const dinero = n => '$' + Number(n).toFixed(2);

  function medianoche(ms) { const d = new Date(ms); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

  // Lunes (00:00 local) de la semana que contiene a `ms`. Se usa como llave de la semana.
  function inicioSemana(ms) {
    const d = medianoche(ms);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d.getTime();
  }

  // Periodo actual entre dos ingresos, a partir de la fecha del siguiente ingreso.
  function periodo(cfg, hoy) {
    hoy = hoy || new Date();
    if (!cfg || !cfg.siguiente) return null;
    const dur = DURACION[cfg.frecuencia] || 30;
    const [y, m, d] = cfg.siguiente.split('-').map(Number);
    const h = medianoche(hoy.getTime());
    let fin = new Date(y, m - 1, d);
    while (fin < h) fin = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate() + dur);
    const ini = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate() - dur);
    return { ini: ini.getTime(), fin: fin.getTime(), dias: Math.max(1, Math.round((fin - h) / DIA)) };
  }

  function totalGastado(gastos, ini, fin) {
    let t = 0;
    for (const g of gastos) if (g.fecha >= ini && g.fecha < fin) t += g.monto;
    return t;
  }

  function totalPorCategoria(gastos) {
    const r = {};
    for (const g of gastos) r[g.categoria] = (r[g.categoria] || 0) + g.monto;
    return r;
  }

  // Total / número de semanas distintas con gastos. O(n)
  function promedioSemanal(gastos) {
    if (!gastos.length) return 0;
    const semanas = new Set();
    let total = 0;
    for (const g of gastos) { semanas.add(inicioSemana(g.fecha)); total += g.monto; }
    return total / semanas.size;
  }

  function resumenPeriodo(gastos, cfg, hoy) {
    const p = periodo(cfg, hoy);
    if (!p) return null;
    const gastado = totalGastado(gastos, p.ini, p.fin);
    const restante = (cfg.ingreso || 0) - gastado;
    return {
      gastado, restante, dias: p.dias, fin: p.fin,
      diarioSugerido: restante > 0 ? restante / p.dias : 0,
      pct: cfg.ingreso > 0 ? gastado / cfg.ingreso : 0
    };
  }

  // Recomendación sobre gastos Personales: semana actual vs. promedio de semanas anteriores.
  function recomendar(actual, promedio) {
    if (promedio <= 0) return 'Aún no hay semanas anteriores en Personales para comparar. Sigue registrando.';
    if (actual > promedio * 1.2)
      return 'Esta semana llevas ' + dinero(actual - promedio) + ' más que tu promedio en Personales (' +
             dinero(promedio) + '). Intenta recortar un poco.';
    return 'Vas dentro de tu promedio en Personales (' + dinero(promedio) + '). Sigue así.';
  }

  function avisoSemanal(gastos, hoy) {
    hoy = hoy || new Date();
    const sem = inicioSemana(hoy.getTime());
    const pers = gastos.filter(g => g.categoria === 'Personales');
    const actual = pers.filter(g => inicioSemana(g.fecha) === sem).reduce((a, g) => a + g.monto, 0);
    const previos = pers.filter(g => inicioSemana(g.fecha) < sem);
    return {
      promedioGeneral: promedioSemanal(gastos),
      personalesSemana: actual,
      mensaje: recomendar(actual, promedioSemanal(previos))
    };
  }

  const API = { dinero, inicioSemana, periodo, totalGastado, totalPorCategoria, promedioSemanal,
                resumenPeriodo, recomendar, avisoSemanal };
  root.Resumen = API;
  if (typeof module !== 'undefined') module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
