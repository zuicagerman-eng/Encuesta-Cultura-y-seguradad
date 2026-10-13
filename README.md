# Encuesta de Cultura de Salud, Seguridad y Ambiente 2026 — Holcim Colombia

## 👉 [Abrir la encuesta](https://zuicagerman-eng.github.io/Encuesta-Cultura-y-seguradad/)

`https://zuicagerman-eng.github.io/Encuesta-Cultura-y-seguradad/` — este es el enlace que se
comparte (el mismo del QR). La página del repositorio en github.com muestra el código, no la
encuesta.

Versión HTML, dinámica y anónima, de la encuesta que hoy está en Google Forms. Cada respuesta
cae como una fila nueva en la misma hoja del Form (`Respuestas de formulario 1`), con las mismas
46 columnas y el mismo orden, así que los informes y tablas dinámicas que ya leen esa hoja siguen
funcionando.

> **El QR es fijo y ya está publicado.** Lleva siempre a esa dirección. No se regenera, no se
> renombra el repositorio y no se cambia el origen de GitHub Pages (rama `claude/vigilant-rubin-gnovek`,
> carpeta raíz). Los cambios de la encuesta se publican en esa rama y el QR muestra la versión nueva
> sin cambiar. Detalle en `CLAUDE.md`.

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
  - **Sin ventanas emergentes**: al enviar, la pantalla final dice en grande "Su respuesta quedó
    guardada. Ya puede cerrar esta ventana". (`MOTIVACION`, en `CONFIGURACIÓN`, está vacío; ahí se
    podría volver a poner un mensaje.)
  - **Caritas**: en las instrucciones, tocar una carita muestra qué significa esa opción
    (`ayuda` de cada opción en `ESCALA`). En las preguntas, la carita elegida suelta un aviso
    corto ("¡Anotado!") que no interrumpe.
- `difusion/` — material para invitar a responder. Todos los QR llevan a
  `https://zuicagerman-eng.github.io/Encuesta-Cultura-y-seguradad/` y se probaron con un lector.
  - `qr-encuesta.png` y `qr-encuesta.svg` — el QR solo, con el logo (el SVG sirve para imprimir
    en cualquier tamaño).
  - `qr-celular.png` — vertical 1080×1920, para WhatsApp o para mostrarlo en la pantalla.
  - `afiche-encuesta.png` — afiche A4 para imprimir y pegar en planta.
  - `bienvenida-encuesta.gif`, `.mp4` y `.webm` — animación de 12 s que termina en el QR. Por
    WhatsApp el MP4 se ve más nítido. La encuesta la muestra al abrir, solo en computador.
- **Computador primero**: en pantallas grandes con mouse la bienvenida arranca sola y el QR se
  ve en la portada y al final, para que otros lo escaneen (con botones para copiar el enlace,
  copiar la imagen del QR y descargarla). En el celular no se muestra el QR (ya está en el celular) ni hay botones de
  compartir, y la bienvenida queda en el botón "Ver bienvenida" para no gastar datos.
- `plantilla/Encuesta_Cultura_HSE_2026_Respuestas.xlsx` — el libro de respuestas, listo para
  subir a Google Sheets. Hojas:
  - `Respuestas de formulario 1`: las 46 columnas del Form, en el mismo orden y con el mismo
    texto. Cada respuesta de la encuesta llega aquí como una fila nueva, igual que un Form.
  - `Reportes de problemas`: lo que llega del botón Ayuda, con columna `Estado`.
  - `Resumen`: total de respuestas, respuestas por planta, vinculación y cargo, y % favorable,
    neutral y desfavorable por dimensión. Son fórmulas: se actualiza solo.
  - `Diccionario`: cada columna, su sección y los valores que puede tener.
  - `Léame`: cómo conectarlo.
  Se regenera con `python plantilla/generar_plantilla.py plantilla/columnas_form.json salida.xlsx`.
- `apps-script/Codigo.gs` — recibe la respuesta y la escribe en la hoja. Ubica cada columna por
  el texto del encabezado, no por posición. Si una pregunta no coincide con ninguna columna,
  rechaza el envío con un mensaje claro en vez de perder la respuesta.
- `apps-script/appsscript.json` — la aplicación web corre como quien la publica y la puede abrir
  cualquiera, sin iniciar sesión (necesario para contratistas y para que sea anónima).

## Opciones de respuesta

En `index.html`, bloque `CONFIGURACIÓN`: `OPCIONES` (planta, vinculación, cargo, edad, antigüedad
y desviaciones) y `ESCALA` (las 7 opciones de acuerdo) tienen el texto exacto del Google Form, que
es lo que se guarda en la hoja. Si el Form cambia, cámbielas aquí letra por letra.

## Conexión actual

Conectada al Sheet de respuestas: `URL_WEBAPP` en `index.html` apunta a su aplicación web, publicada
con acceso "Cualquier persona" (sin iniciar sesión). Si se vuelve a publicar el script, use **Implementar → Administrar implementaciones →
Editar → Nueva versión** para que la URL no cambie.

## Guardar directo en el Sheet de Holcim (como la reinducción)

El Apps Script que recibe puede estar en una cuenta personal (publicado con acceso «Cualquier
persona») y escribir directo en un Sheet de Holcim, igual que `ID_HOJA` en la reinducción:

1. En el Sheet de Holcim: **Compartir** → la cuenta personal que publica el script, como **Editor**.
2. En `Codigo.gs`, pegar la dirección (o el ID) de ese Sheet en `ID_LIBRO`.
   Pegar también `appsscript.json` (Configuración del proyecto → «Mostrar el archivo de manifiesto»):
   declara el permiso completo de Hojas de cálculo, sin el cual Google solo deja abrir la hoja propia
   («You do not have permission to call SpreadsheetApp.openById»).
3. Ejecutar `prepararHoja`: si el Sheet ya tiene una pestaña con las 46 columnas del Form (por ejemplo
   `Form_Responses`), escribe ahí; si no, crea lo que falte —`Respuestas de formulario 1` con las 46
   columnas, `Reportes de problemas` y `Resumen` con sus fórmulas— y no toca las demás pestañas.
   Si ya tenía un «Resumen» propio, el de la encuesta queda como «Resumen encuesta». El registro dice
   en qué Sheet se guarda.
4. **Implementar → Administrar implementaciones → ✏️ → Nueva versión.** La URL no cambia.

## Si Holcim no deja que el script externo abra su Sheet: copia desde Holcim

Holcim puede impedir que un script de una cuenta externa abra sus archivos (el editor no pide
permiso y `openById` falla). Entonces se hace al revés: la encuesta sigue guardando en el Sheet de la
cuenta personal, y **el Sheet de Holcim trae las respuestas** con `apps-script/Sincronizar_Holcim.gs`:

1. En el Sheet personal: **Compartir** → el correo de Holcim, como **Lector**.
2. En el Sheet de Holcim: **Extensiones → Apps Script** (con la cuenta de Holcim) → pegar
   `Sincronizar_Holcim.gs` y, en `ORIGEN`, la dirección del Sheet personal.
3. Ejecutar `sincronizar` (pide permisos) y luego `instalarSincronizacion`: corre solo cada 10 minutos.

Agrega al final de la hoja que tenga las columnas del Form (por ejemplo `Form_Responses`) las respuestas
que todavía no estén, y lo mismo con los reportes. No borra ni cambia nada, no repite filas y no se
publica. `diagnosticarPermisos` (en `Codigo.gs`) dice cuál de los dos casos es.

## Reporte de participación (pestaña «Reporte», con usuario)

Botón **Reporte** en la cabecera, o la dirección terminada en `#reporte`. Pide usuario y contraseña y
muestra el cumplimiento: empleados Holcim que respondieron frente a la población del maestro de
personal, en total y por planta, con lo que falta y las respuestas de contratistas. No toca la encuesta.

- **Usuario y contraseña**: no van en el código (el repositorio es público). En el Apps Script:
  ⚙️ Configuración del proyecto → **Propiedades de la secuencia de comandos** → `REPORTE_USUARIO` y
  `REPORTE_CLAVE`. La sesión dura 6 horas desde el último uso.
- **Población**: la hoja «Población» del Sheet de respuestas se crea sola la primera vez, con los
  conteos del maestro de personal (columna X, por cédula, con externos y aprendices; Transcem y
  HC-MEDELLIN no aplican; AF-TELEPORT va con CORPORATIVO Teleport). Se edita ahí. La columna de
  contratistas es opcional.
- El servidor nunca envía filas de respuestas, solo totales.

## Puesta en marcha

1. Suba `plantilla/Encuesta_Cultura_HSE_2026_Respuestas.xlsx` a Drive y ábralo con Google Sheets
   (**Archivo → Guardar como Hojas de cálculo de Google**). También sirve el Sheet del Form o uno en
   blanco. Después: **Extensiones → Apps Script**.
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
