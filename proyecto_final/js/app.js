// Conecta todo: navegación, formularios y pintado de pantallas. 
(function () {
  const $ = id => document.getElementById(id);
  const dinero = n => '$' + Number(n).toFixed(2);
  let inicioForm = null; // para cronometrar el registro

  function mostrarVista(nombre) {
    document.querySelectorAll('.vista').forEach(v => v.classList.toggle('activa', v.id === nombre));
    document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('activo', b.dataset.vista === nombre));
    if (nombre === 'agregar') $('monto').focus();
    pintarTodo();
  }

  function pintarLista(gastos) {
    const ul = $('lista');
    ul.innerHTML = '';
    if (!gastos.length) { ul.innerHTML = '<li><span class="nota">Todavía no hay gastos.</span></li>'; return; }
    gastos.slice().sort((a, b) => b.fecha - a.fecha).slice(0, 30).forEach(g => {
      const li = document.createElement('li');
      const info = document.createElement('div'); info.className = 'info';
      info.textContent = g.categoria;
      const small = document.createElement('small');
      small.textContent = new Date(g.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) +
                          (g.nota ? ' · ' + g.nota : '');
      info.appendChild(small);
      const monto = document.createElement('span'); monto.className = 'monto'; monto.textContent = dinero(g.monto);
      const x = document.createElement('button'); x.textContent = '×'; x.setAttribute('aria-label', 'Borrar gasto');
      x.onclick = () => { DB.borrar(g.id); pintarTodo(); };
      li.append(info, monto, x);
      ul.appendChild(li);
    });
  }

  function pintarTodo() {
    pintarLista(DB.gastos());
    const t = DB.tiempos();
    $('tiempoRegistro').textContent = t.length
      ? 'Tiempo promedio por registro: ' + (t.reduce((a, b) => a + b, 0) / t.length).toFixed(1) + ' s (' + t.length + ' registros)'
      : '';
  }

  function iniciar() {
    CATEGORIAS.forEach(c => { const o = document.createElement('option'); o.textContent = c; $('categoria').appendChild(o); });
    document.querySelectorAll('#nav button').forEach(b => b.onclick = () => mostrarVista(b.dataset.vista));

    // Cronómetro: arranca al primer toque dentro del formulario
    $('form').addEventListener('focusin', () => { if (!inicioForm) inicioForm = Date.now(); });

    $('form').onsubmit = e => {
      e.preventDefault();
      const monto = parseFloat($('monto').value);
      if (!(monto > 0)) { $('estadoCaptura').textContent = 'El monto debe ser mayor a 0.'; return; }
      DB.agregar({ monto, categoria: $('categoria').value, nota: $('nota').value.trim() });
      if (inicioForm) DB.guardarTiempo((Date.now() - inicioForm) / 1000);
      inicioForm = null;
      $('form').reset(); $('estadoCaptura').textContent = 'Gasto guardado.';
      pintarTodo();
    };

    $('formAjustes').onsubmit = e => {
      e.preventDefault();
      DB.guardarConfig({ ingreso: parseFloat($('ingreso').value) || 0, frecuencia: $('frecuencia').value, siguiente: $('siguiente').value });
      $('estadoAjustes').textContent = 'Ajustes guardados.';
    };
    const cfg = DB.config();
    $('ingreso').value = cfg.ingreso || ''; $('frecuencia').value = cfg.frecuencia; $('siguiente').value = cfg.siguiente;

    $('btnBorrarTodo').onclick = () => { if (confirm('¿Borrar todos los gastos?')) { DB.borrarTodo(); pintarTodo(); } };

    pintarTodo();
  }

  document.addEventListener('DOMContentLoaded', iniciar);
})();
