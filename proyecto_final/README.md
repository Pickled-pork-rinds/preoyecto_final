# Gastos CUCEI (equipo Pickled Pork Rinds)

App web para controlar gastos de estudiantes. Sin build ni dependencias: HTML + CSS + JavaScript.
Los datos se guardan en el navegador de cada dispositivo (localStorage); no se piden datos bancarios.

## Subir a Vercel
1. Sube esta carpeta a un repositorio de GitHub (`git init`, `git add .`, `git commit`, `git push`).
2. En vercel.com: Add New > Project > importa el repositorio.
3. Framework Preset: **Other**. Build Command y Output Directory: vacíos. Deploy.

Alternativa: `npx vercel` dentro de esta carpeta y `npx vercel --prod`.

## Archivos
| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | Pantallas: Inicio (lista), Agregar y Ajustes |
| `css/styles.css` | Estilos |
| `js/db.js` | Guardado en localStorage: gastos, ajustes y tiempos de registro |
| `js/app.js` | Navegación, formularios y lista |
| `vercel.json`, `.gitignore` | Configuración de despliegue |

## Qué hace hoy
Registrar un gasto con monto, categoría y nota; verlo en la lista; borrarlo; guardar ingreso, frecuencia y
fecha del siguiente ingreso; y cronometrar cuánto tarda cada registro.
   
  
