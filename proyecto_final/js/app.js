// Conecta todo: navegación, formularios y pintado de pantallas.
(function () {
  const $ = id => document.getElementById(id);
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
      const monto = document.createElement('span'); monto.className = 'monto'; monto.textContent = Resumen.dinero(g.monto);
      const x = document.createElement('button'); x.textContent = '×'; x.setAttribute('aria-label', 'Borrar gasto');
      x.onclick = () => { DB.borrar(g.id); pintarTodo(); };
      li.append(info, monto, x);
      ul.appendChild(li);
    });
  }

  function pintarResumen(gastos, cfg) {
    const r = Resumen.resumenPeriodo(gastos, cfg);
    const caja = $('resumenDatos');
    if (!r) { caja.innerHTML = '<p class="nota">Configura tu ingreso en Ajustes para ver cuánto te queda.</p>'; }
    else {
      const datos = [['Gastado', Resumen.dinero(r.gastado)], ['Te queda', Resumen.dinero(r.restante)],
                     ['Días al siguiente ingreso', String(r.dias)], ['Sugerido por día', Resumen.dinero(r.diarioSugerido)]];
      caja.innerHTML = '';
      datos.forEach(([et, val]) => {
        const d = document.createElement('div'); d.className = 'dato';
        const s = document.createElement('span'); s.textContent = et;
        const b = document.createElement('b'); b.textContent = val;
        d.append(s, b); caja.appendChild(d);
      });
    }
    const cat = Resumen.totalPorCategoria(gastos);
    const max = Math.max(1, ...Object.values(cat));
    const pc = $('porCategoria'); pc.innerHTML = '';
    CATEGORIAS.forEach(c => {
      const v = cat[c] || 0;
      const div = document.createElement('div'); div.className = 'barra';
      const fila = document.createElement('div'); fila.className = 'fila';
      const a = document.createElement('span'); a.textContent = c;
      const b = document.createElement('span'); b.textContent = Resumen.dinero(v);
      fila.append(a, b);
      const fondo = document.createElement('div'); fondo.className = 'fondo';
      const rel = document.createElement('div'); rel.className = 'relleno'; rel.style.width = (v / max * 100) + '%';
      fondo.appendChild(rel); div.append(fila, fondo); pc.appendChild(div);
    });
    Avisos.preventivo(r);
  }

  function pintarTodo() {
    const gastos = DB.gastos(), cfg = DB.config();
    pintarLista(gastos);
    Avisos.pintarSemanal(gastos);
    pintarResumen(gastos, cfg);
    const t = DB.tiempos();
    $('tiempoRegistro').textContent = t.length
      ? 'Tiempo promedio por registro: ' + (t.reduce((a, b) => a + b, 0) / t.length).toFixed(1) + ' s (' + t.length + ' registros)'
      : '';
  }

  function prellenar({ monto, categoria, nota }) {
    if (monto != null) $('monto').value = monto;
    if (categoria) $('categoria').value = categoria;
    if (nota) $('nota').value = nota;
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
      Avisos.pedirPermiso();
      pintarTodo();
    };

    $('formAjustes').onsubmit = e => {
      e.preventDefault();
      DB.guardarConfig({ ingreso: parseFloat($('ingreso').value) || 0, frecuencia: $('frecuencia').value, siguiente: $('siguiente').value });
      $('estadoAjustes').textContent = 'Ajustes guardados.';
      pintarTodo();
    };
    const cfg = DB.config();
    $('ingreso').value = cfg.ingreso || ''; $('frecuencia').value = cfg.frecuencia; $('siguiente').value = cfg.siguiente;

    $('btnBorrarTodo').onclick = () => { if (confirm('¿Borrar todos los gastos?')) { DB.borrarTodo(); pintarTodo(); } };

    // Voz
    $('btnVoz').onclick = () => Voz.iniciar(
      texto => { prellenar(Voz.parsear(texto)); $('estadoCaptura').textContent = 'Entendí: "' + texto + '". Revisa y guarda.'; },
      (msg, activo) => { if (msg) $('estadoCaptura').textContent = msg; $('btnVoz').classList.toggle('escuchando', !!activo); }
    );

    // Foto
    $('inputFoto').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      $('estadoCaptura').textContent = 'Leyendo ticket… puede tardar unos segundos.';
      try {
        const r = await Foto.leerTicket(f);
        if (r.monto == null) $('estadoCaptura').textContent = 'No pude leer el total. Captura el monto a mano.';
        else { prellenar({ monto: r.monto, categoria: 'Personales' }); $('estadoCaptura').textContent = 'Total detectado: ' + Resumen.dinero(r.monto) + '. Revisa y guarda.'; }
      } catch (err) { $('estadoCaptura').textContent = err.message; }
      e.target.value = '';
    };

    // Análisis
    $('btnBenchmark').onclick = () => {
      const cuerpo = document.querySelector('#tablaBench tbody'); cuerpo.innerHTML = '';
      $('btnBenchmark').disabled = true;
      setTimeout(() => {
        Analisis.ejecutar().forEach(r => {
          const tr = document.createElement('tr');
          [r.n.toLocaleString('es-MX'), r.categorias.toFixed(3), r.promedio.toFixed(3)].forEach(v => {
            const td = document.createElement('td'); td.textContent = v; tr.appendChild(td);
          });
          cuerpo.appendChild(tr);
        });
        $('tablaBench').hidden = false; $('btnBenchmark').disabled = false;
      }, 30);
    };

    pintarTodo();
  }

  document.addEventListener('DOMContentLoaded', iniciar);
})();
