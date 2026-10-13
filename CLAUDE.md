# Encuesta de Cultura HSE 2026 — Holcim Colombia

Encuesta HTML (GitHub Pages) que guarda en Google Sheets por Apps Script. Ver `README.md`.

## El QR es fijo: NO cambiarlo nunca

El QR ya está publicado e impreso. Codifica esta dirección y nada más:

    https://zuicagerman-eng.github.io/Encuesta-Cultura-y-seguradad/

Para que siga funcionando:

- **No** regenerar ni reemplazar `difusion/qr-encuesta.png`, `difusion/qr-encuesta.svg`,
  `difusion/qr-celular.png`, `difusion/afiche-encuesta.png` ni el QR embebido en `index.html`
  (`<template id="qrPlantilla">`), ni los cuadros del GIF y el MP4 de bienvenida.
- **No** cambiar `URL_PUBLICA` en `index.html`.
- **No** renombrar el repositorio, ni mover `index.html` de la raíz.
- **No** cambiar el origen de GitHub Pages (rama `claude/vigilant-rubin-gnovek`, carpeta `/ (root)`)
  ni borrar esa rama.
- Cualquier cambio de la encuesta se hace sobre `index.html` en esa misma rama: el enlace del QR
  sigue igual y muestra la versión nueva.

Si algo obligara a cambiar la dirección, no se hace sin preguntarle primero al dueño de la encuesta.

## Otras reglas

- Español, de usted, sin jerga.
- Las opciones de respuesta (`OPCIONES`, `ESCALA`) tienen el texto exacto del Google Form: no se
  cambian letra por letra sin que el Form cambie.
- Los títulos de la hoja de respuestas (`ENCABEZADOS` en `apps-script/Codigo.gs`) son los del Form.
- Ningún dato de personas ni respuestas entra al repositorio.
