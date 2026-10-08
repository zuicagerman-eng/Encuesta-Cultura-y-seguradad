/**
 * Encuesta de Cultura de Salud, Seguridad y Ambiente 2026 — servidor.
 *
 * Escribe cada respuesta como una fila nueva en la hoja del Google Form
 * ("Respuestas de formulario 1"), con las mismas 46 columnas. No asume
 * posiciones: lee la fila 1 y ubica cada respuesta por el texto del encabezado,
 * así que las columnas pueden reordenarse sin romper nada.
 *
 * Dos formas de recibir respuestas:
 *   - La página la sirve este mismo script (doGet) y llama a registrarRespuesta.
 *   - La página está publicada afuera (GitHub Pages) y hace POST a doPost.
 */

var HOJA_RESPUESTAS = 'Respuestas de formulario 1';
var COL_FECHA = 'Marca temporal';

// Déjelo vacío si el script está creado desde el mismo Google Sheet
// (Extensiones → Apps Script). Si es un proyecto aparte, pegue el ID del libro.
var ID_LIBRO = '';

var MAX_TEXTO = 1000;

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Percepción de Cultura HSE 2026 · Holcim Colombia')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  var resultado;
  try {
    resultado = registrarRespuesta(JSON.parse(e.postData.contents));
  } catch (err) {
    resultado = { ok: false, error: String(err && err.message || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(resultado))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Recibe { respuestas: { "<encabezado>": valor, ... } } y agrega una fila. */
function registrarRespuesta(datos) {
  var resp = datos && datos.respuestas;
  if (!resp || typeof resp !== 'object') throw new Error('No llegaron respuestas.');

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var hoja = hoja_();
    var ncol = hoja.getLastColumn();
    var encabezados = hoja.getRange(1, 1, 1, ncol).getValues()[0];
    var mapa = {};
    encabezados.forEach(function (h, i) { mapa[clave_(h)] = i; });

    var iFecha = mapa[clave_(COL_FECHA)];
    if (iFecha === undefined) throw new Error('La hoja no tiene la columna "' + COL_FECHA + '".');

    var fila = [];
    for (var c = 0; c < ncol; c++) fila.push('');
    fila[iFecha] = new Date();

    var desconocidas = [], n = 0;
    Object.keys(resp).forEach(function (k) {
      var i = mapa[clave_(k)];
      if (i === undefined || i === iFecha) { desconocidas.push(k); return; }
      var v = limpiar_(resp[k]);
      fila[i] = v;
      if (v !== '') n++;
    });
    // Mejor fallar que perder respuestas en silencio: si alguien cambió un
    // encabezado de la hoja, el administrador se entera en el primer envío.
    if (desconocidas.length) {
      throw new Error('Estas preguntas no coinciden con ninguna columna de la hoja: ' + desconocidas.join(' | '));
    }
    if (!n) throw new Error('La respuesta llegó vacía.');

    hoja.appendRow(fila);
  } finally {
    lock.releaseLock();
  }
  return { ok: true };
}

/** Correr una vez desde el editor: confirma que el script encuentra la hoja. */
function verificarHoja() {
  var hoja = hoja_();
  var enc = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  Logger.log('Hoja "%s": %s columnas, %s respuestas.', hoja.getName(), enc.length, hoja.getLastRow() - 1);
  if (enc.length !== 46) Logger.log('OJO: se esperaban 46 columnas.');
}

function hoja_() {
  var libro = ID_LIBRO ? SpreadsheetApp.openById(ID_LIBRO) : SpreadsheetApp.getActiveSpreadsheet();
  var hoja = libro.getSheetByName(HOJA_RESPUESTAS);
  if (!hoja) throw new Error('No existe la hoja "' + HOJA_RESPUESTAS + '".');
  return hoja;
}

// Los encabezados del Form traen espacios sobrantes al final; se comparan sin ellos.
function clave_(texto) {
  return String(texto).replace(/\s+/g, ' ').trim().toLowerCase();
}

function limpiar_(v) {
  if (typeof v === 'number' && isFinite(v)) return v;
  var s = String(v == null ? '' : v).trim().slice(0, MAX_TEXTO);
  // Que un comentario que empiece con = + - @ no se vuelva fórmula.
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
