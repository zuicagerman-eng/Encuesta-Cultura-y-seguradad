# Encuesta de Cultura de Salud, Seguridad y Ambiente 2026 — Holcim Colombia

Versión HTML, dinámica y anónima, de la encuesta que hoy está en Google Forms. Cada respuesta
cae como una fila nueva en la misma hoja del Form (`Respuestas de formulario 1`), con las mismas
46 columnas y el mismo orden, así que los informes y tablas dinámicas que ya leen esa hoja siguen
funcionando.

## Contenido

- `index.html` — la encuesta completa en un solo archivo (estilos, logo y JavaScript adentro).
  Bienvenida, 9 secciones (datos generales + 8 dimensiones), revisión y envío. Valida las
  preguntas obligatorias, guarda el avance en el dispositivo si se cierra la página y permite
  "Enviar otra respuesta" para equipos compartidos en planta.
- `apps-script/Codigo.gs` — recibe la respuesta y la escribe en la hoja. Ubica cada columna por
  el texto del encabezado, no por posición. Si una pregunta no coincide con ninguna columna,
  rechaza el envío con un mensaje claro en vez de perder la respuesta.
- `apps-script/appsscript.json` — la aplicación web corre como quien la publica y la puede abrir
  cualquiera, sin iniciar sesión (necesario para contratistas y para que sea anónima).

## Antes de publicar: revisar las opciones

El Excel exportado trae las preguntas pero no las opciones de respuesta. En `index.html`, bloque
`CONFIGURACIÓN`, ajuste para que queden **idénticas** a las del Form:

- `OPCIONES` — plantas, tipo de vinculación, cargo, rango de edad, antigüedad y la pregunta de
  desviaciones.
- `ESCALA` — ya tiene las 7 opciones del Form ("Totalmente de Acuerdo" … "Totalmente en
  Desacuerdo"), con el mismo texto que se guarda en la hoja.

## Puesta en marcha

1. Abra el Google Sheet de respuestas (o uno nuevo, en blanco) → **Extensiones → Apps Script**.
2. Pegue `apps-script/Codigo.gs` en `Código.gs`. En *Configuración del proyecto* active "Mostrar
   el archivo de manifiesto" y pegue `apps-script/appsscript.json`.
3. Elija `prepararHoja` y pulse **Ejecutar** (pide permisos la primera vez). Si el libro no
   tiene la hoja `Respuestas de formulario 1`, la crea con las 46 columnas; si la tiene, la revisa.
4. **Implementar → Nueva implementación → Aplicación web**. Ejecutar como: *Yo*. Acceso:
   *Cualquier persona*. Copie la URL que termina en `/exec`.
5. Elija dónde vive la página:
   - **GitHub Pages** (recomendado): en `index.html` pegue la URL en `URL_WEBAPP`, suba el cambio
     y active *Settings → Pages* sobre esta rama. El enlace a compartir es el de Pages.
   - **Dentro de Apps Script**: agregue un archivo HTML llamado `Index`, pegue `index.html` y vuelva
     a implementar. El enlace a compartir es la URL `/exec`. `URL_WEBAPP` puede quedar vacía.
6. En el Google Form, desactive "Aceptar respuestas" para que nadie responda por los dos lados.

Cada vez que cambie `Codigo.gs`: **Implementar → Administrar implementaciones → Editar → Nueva
versión**, así la URL `/exec` no cambia.

## Anonimato

La página no pide nombre, correo ni cédula, y la aplicación web corre con la cuenta de quien la
publica: la hoja no registra quién respondió. La única marca es la fecha y hora del envío.
