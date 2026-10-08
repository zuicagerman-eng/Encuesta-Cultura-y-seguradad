# Encuesta de Cultura de Salud, Seguridad y Ambiente 2026 — Holcim Colombia

Versión HTML, dinámica y anónima, de la encuesta que hoy está en Google Forms. Cada respuesta
cae como una fila nueva en la misma hoja del Form (`Respuestas de formulario 1`), con las mismas
46 columnas y el mismo orden, así que los informes y tablas dinámicas que ya leen esa hoja siguen
funcionando.

## Contenido

- `index.html` — la encuesta completa en un solo archivo (estilos, logo y JavaScript adentro).
  Bienvenida, 9 secciones (datos generales + 8 dimensiones), revisión y envío. Valida las
  preguntas obligatorias y permite "Enviar otra respuesta" para equipos compartidos en planta.
  No guarda nada en el navegador: al abrir o recargar siempre empieza en blanco.
  - **Tema claro y oscuro**: el botón del sol o la luna. La primera vez sigue el tema del
    celular o computador; después recuerda lo que la persona eligió.
  - **Ayuda**: el botón `? Ayuda` muestra la ayuda de la pantalla que se está viendo.
  - **Reportar un problema**: desde el mismo panel. El reporte llega a la hoja
    `Reportes de problemas` (tipo, descripción, pantalla, contacto opcional, navegador, tamaño de
    pantalla, tema y último error), con la columna `Estado` en "Nuevo" para hacerle seguimiento.
    No incluye las respuestas de la encuesta.
  - **Motivación**: al terminar las secciones 3 y 6 sale un mensaje ("Su opinión es importante
    para nosotros", "Buscamos mejorar nuestra cultura") con el avance. Los textos están en
    `MOTIVACION`, dentro del bloque `CONFIGURACIÓN`.
  - **Caritas**: en las instrucciones, tocar una carita muestra qué significa esa opción
    (`ayuda` de cada opción en `ESCALA`). En las preguntas, la carita elegida suelta un aviso
    corto ("¡Anotado!") que no interrumpe.
- `difusion/` — material para invitar a responder. Todos los QR llevan a
  `https://zuicagerman-eng.github.io/Encuesta-Cultura-y-seguradad/` y se probaron con un lector.
  - `qr-encuesta.png` y `qr-encuesta.svg` — el QR solo, con el logo (el SVG sirve para imprimir
    en cualquier tamaño).
  - `qr-celular.png` — vertical 1080×1920, para WhatsApp o para mostrarlo en la pantalla.
  - `afiche-encuesta.png` — afiche A4 para imprimir y pegar en planta.
  - `bienvenida-encuesta.gif` y `bienvenida-encuesta.mp4` — animación de 12 s que termina en el
    QR. Por WhatsApp el MP4 se ve más nítido.
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
   También crea la hoja `Reportes de problemas`.
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
