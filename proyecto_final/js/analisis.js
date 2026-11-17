const Analisis = {
  generar(n) {
    const ahora = Date.now(), r = [];
    for (let i = 0; i < n; i++)
      r.push({ monto: Math.random() * 300 + 5, categoria: CATEGORIAS[i % CATEGORIAS.length],
               fecha: ahora - Math.floor(Math.random() * 84 * 86400000) });
    return r;
  },
  medir(fn, datos, repeticiones) {
    fn(datos); // calentamiento
    const t0 = performance.now();
    for (let i = 0; i < repeticiones; i++) fn(datos);
    return (performance.now() - t0) / repeticiones;
  },
  ejecutar(tamanos) {
    return (tamanos || [100, 1000, 10000, 100000]).map(n => {
      const d = this.generar(n);
      return { n, categorias: this.medir(Resumen.totalPorCategoria, d, 20),
                  promedio: this.medir(Resumen.promedioSemanal, d, 20) };
    });
  }
};
