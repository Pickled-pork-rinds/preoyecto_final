// Ejecutar: node tests/algoritmos.test.js
const assert = require('assert');
const R = require('../js/resumen.js');
const V = require('../js/voz.js');
const F = require('../js/foto.js');

const dia = (y, m, d, h = 12) => new Date(y, m - 1, d, h).getTime();

// Semanas: lunes 2026-10-26 y lunes 2026-11-02
const g = [
  { monto: 100, categoria: 'Comidas', fecha: dia(2026, 10, 27) },
  { monto: 50, categoria: 'Personales', fecha: dia(2026, 10, 29) },
  { monto: 150, categoria: 'Personales', fecha: dia(2026, 11, 3) },
];
assert.deepStrictEqual(R.totalPorCategoria(g), { Comidas: 100, Personales: 200 });
assert.strictEqual(R.promedioSemanal(g), 150);                 // 300 / 2 semanas
assert.strictEqual(R.promedioSemanal([]), 0);
assert.strictEqual(R.inicioSemana(dia(2026, 11, 1)), R.inicioSemana(dia(2026, 10, 26))); // domingo cae en la semana del lunes 26

const hoy = new Date(2026, 10, 3, 12);
const cfg = { ingreso: 1000, frecuencia: 'semanal', siguiente: '2026-11-06' };
const r = R.resumenPeriodo(g, cfg, hoy);
assert.strictEqual(r.dias, 3);
assert.strictEqual(r.gastado, 150);                            // periodo 30-oct a 6-nov
assert.strictEqual(r.restante, 850);

const a = R.avisoSemanal(g, hoy);
assert.strictEqual(a.personalesSemana, 150);
assert.ok(a.mensaje.includes('más que tu promedio'));          // 150 > 50 * 1.2
assert.ok(R.recomendar(40, 50).includes('dentro de tu promedio'));
assert.ok(R.recomendar(10, 0).includes('Aún no'));

// Voz
assert.deepStrictEqual(V.parsear('gasté 80 pesos en tacos'), { monto: 80, categoria: 'Comidas', nota: 'gasté 80 pesos en tacos' });
assert.strictEqual(V.parsear('pagué 12.50 de camión').monto, 12.5);
assert.strictEqual(V.parsear('pagué 12.50 de camión').categoria, 'Transporte');
assert.strictEqual(V.parsear('compré medicina por 1,200').monto, 1200);
assert.strictEqual(V.parsear('algo raro').monto, null);
assert.strictEqual(V.parsear('algo raro').categoria, 'Personales');

// Foto
assert.strictEqual(F.extraerTotal('Tacos 45.00\nSUBTOTAL 90.00\nTOTAL $ 104.40'), 104.4);
assert.strictEqual(F.extraerTotal('Café 30,00\nPan 12,50'), 30);
assert.strictEqual(F.extraerTotal('nada'), null);

console.log('Todas las pruebas pasaron');
