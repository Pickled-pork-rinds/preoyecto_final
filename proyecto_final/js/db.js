// SPRINT 1 - Datos. Todo se guarda en localStorage del navegador (por dispositivo).
const CATEGORIAS = ['Personales', 'Universidad', 'Transporte', 'Comidas', 'Médicos'];

const DB = {
  _leer(clave, defecto) {
    try { const v = JSON.parse(localStorage.getItem(clave)); return v == null ? defecto : v; }
    catch (e) { return defecto; }
  },
  _escribir(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* sin almacenamiento */ }
  },

  gastos() { return this._leer('gastos', []); },
  agregar({ monto, categoria, nota }) {
    const lista = this.gastos();
    const gasto = { id: Date.now() + Math.random(), monto: Number(monto), categoria, nota: nota || '', fecha: Date.now() };
    lista.push(gasto);
    this._escribir('gastos', lista);
    return gasto;
  },
  borrar(id) { this._escribir('gastos', this.gastos().filter(g => g.id !== id)); },
  borrarTodo() { this._escribir('gastos', []); },

  config() { return this._leer('config', { ingreso: 0, frecuencia: 'semanal', siguiente: '' }); },
  guardarConfig(c) { this._escribir('config', c); },

  // Evidencia del avance (3.2): cuánto tarda registrar un gasto
  tiempos() { return this._leer('tiempos', []); },
  guardarTiempo(seg) { this._escribir('tiempos', this.tiempos().concat(seg).slice(-50)); }
};
