const Avisos = {
  pintarSemanal(gastos) {
    const a = Resumen.avisoSemanal(gastos);
    const caja = document.getElementById('aviso');
    if (!gastos.length) { caja.textContent = 'Registra tus primeros gastos para ver tu promedio semanal.'; return; }
    caja.innerHTML = '<b>Promedio semanal: ' + Resumen.dinero(a.promedioGeneral) + '</b><br>' +
                     '<span class="nota">Personales esta semana: ' + Resumen.dinero(a.personalesSemana) + '</span>' +
                     '<p style="margin:8px 0 0"></p>';
    caja.lastChild.textContent = a.mensaje;
  },

  pedirPermiso() {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  },

  preventivo(resumen) {
    const caja = document.getElementById('alerta80');
    if (!resumen || resumen.pct < 0.8) { caja.hidden = true; return; }
    const texto = resumen.pct >= 1
      ? 'Ya gastaste todo tu ingreso del periodo.'
      : 'Ya gastaste el ' + Math.round(resumen.pct * 100) + ' % de tu ingreso del periodo. Te quedan ' +
        Resumen.dinero(resumen.restante) + ' para ' + resumen.dias + ' día(s).';
    caja.textContent = texto;
    caja.hidden = false;

    // Notificación del sistema, una sola vez por periodo
    const marca = 'aviso80-' + resumen.fin;
    try {
      if ('Notification' in window && Notification.permission === 'granted' && !localStorage.getItem(marca)) {
        new Notification('Gastos CUCEI', { body: texto });
        localStorage.setItem(marca, '1');
      }
    } catch (e) { /* sin notificaciones */ }
  }
};
