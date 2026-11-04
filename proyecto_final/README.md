# Gastos CUCEI (equipo Pickled Pork Rinds)

App web para controlar gastos de estudiantes. Sin build ni dependencias: HTML + CSS + JavaScript.
Los datos se guardan en el navegador de cada dispositivo (localStorage); no se piden datos bancarios.

## Probar en local
Abre `index.html` en Chrome, o: `npx serve .`
Pruebas de las funciones: `node tests/algoritmos.test.js`

## Subir a Vercel
1. Sube esta carpeta a un repositorio de GitHub (`git init`, `git add .`, `git commit`, `git push`).
2. En vercel.com: Add New > Project > importa el repositorio.
3. Framework Preset: **Other**. Build Command y Output Directory: vacíos. Deploy.

Alternativa: `npx vercel` dentro de esta carpeta y `npx vercel --prod`.

La voz y la cámara necesitan HTTPS, que Vercel ya da. El dictado funciona en Chrome, Edge y Safari
(Firefox no lo soporta). El lector de tickets descarga Tesseract.js desde un CDN la primera vez que se usa.

## Archivos por sprint
| Sprint | Archivos | Qué entrega |
| --- | --- | --- |
| 1 (Semana 1) | `index.html`, `css/styles.css`, `js/db.js`, parte de `js/app.js` | Registrar, listar y borrar gastos; ajustes de ingreso y periodo; cronómetro de registro |
| 2 (Semana 2) | `js/resumen.js`, `js/avisos.js`, parte de `js/app.js` | Gastado/restante, por categoría, promedio semanal, recomendación en Personales, alerta al 80 % |
| 3 (Semana 3) | `js/voz.js`, `js/foto.js`, `js/analisis.js`, `tests/` | Dictado, escaneo de ticket, medición de tiempos y pruebas |

Los scripts de los sprints 2 y 3 ya vienen cargados en `index.html`; para entregar por semana se pueden
comentar sus etiquetas `<script>` y activarlas al llegar a cada sprint.

## Regla de recomendación
Se compara lo gastado en Personales esta semana contra el promedio de las semanas anteriores.
Si lo supera por más de 20 %, se avisa (el 1.2 está en `recomendar()` de `js/resumen.js`).
