/**
 * Encuesta de Cultura HSE 2026 — copia al Sheet de Holcim.
 *
 * Va DENTRO del Sheet de Holcim (Extensiones → Apps Script), con la cuenta de
 * Holcim. No se publica: cada 10 minutos trae del Sheet que recibe la encuesta
 * (el de la cuenta personal) las respuestas y los reportes que todavía no estén
 * aquí, y los agrega al final. Nunca borra ni cambia lo que ya hay.
 *
 * Por qué así: Holcim no deja que un script de una cuenta externa abra sus
 * archivos, pero un script de Holcim sí puede leer un Sheet que le compartan.
 *
 * Una vez:
 *   1. En el Sheet personal: Compartir → el correo de Holcim, como Lector.
 *   2. Pegue abajo, en ORIGEN, la dirección de ese Sheet personal.
 *   3. Ejecute sincronizar (pide permisos la primera vez) y revise el registro.
 *   4. Ejecute instalarSincronizacion: desde ahí corre solo cada 10 minutos.
 */

// Dirección (o ID) del Sheet que recibe la encuesta, el de la cuenta personal.
var ORIGEN = '';

var HOJA_ORIGEN = 'Respuestas de formulario 1';
var REPORTES = 'Reportes de problemas';
var MINUTOS = 10;

function sincronizar() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return;   // ya hay una copia en curso
  try {
    var origen = abrirOrigen_();
    var aqui = SpreadsheetApp.getActiveSpreadsheet();

    // Respuestas: a la hoja de aquí que tenga las columnas del Form (p. ej. Form_Responses)
    var hOrigen = origen.getSheetByName(HOJA_ORIGEN);
    if (!hOrigen) throw new Error('El Sheet de ORIGEN no tiene la hoja "' + HOJA_ORIGEN + '".');
    var titulos = hOrigen.getRange(1, 1, 1, hOrigen.getLastColumn()).getValues()[0];
    var destino = buscarDestino_(aqui, titulos);
    if (!destino) {
      destino = aqui.insertSheet(HOJA_ORIGEN);
      destino.getRange(1, 1, 1, titulos.length).setValues([titulos]).setFontWeight('bold');
      destino.setFrozenRows(1);
      Logger.log('No había hoja con las columnas del Form: se creó "%s".', HOJA_ORIGEN);
    }
    var n = copiarNuevas_(hOrigen, destino);
    Logger.log('Respuestas: %s nuevas copiadas a "%s".', n, destino.getName());

    // Reportes de problemas (si existen en el origen)
    var rOrigen = origen.getSheetByName(REPORTES);
    if (rOrigen && rOrigen.getLastRow() > 1) {
      var rDestino = aqui.getSheetByName(REPORTES);
      if (!rDestino) {
        rDestino = aqui.insertSheet(REPORTES);
        var tr = rOrigen.getRange(1, 1, 1, rOrigen.getLastColumn()).getValues()[0];
        rDestino.getRange(1, 1, 1, tr.length).setValues([tr]).setFontWeight('bold');
        rDestino.setFrozenRows(1);
      }
      Logger.log('Reportes: %s nuevos copiados.', copiarNuevas_(rOrigen, rDestino));
    }
  } finally {
    lock.releaseLock();
  }
}

/** Deja sincronizar corriendo solo cada MINUTOS minutos. Correr una vez. */
function instalarSincronizacion() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sincronizar') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sincronizar').timeBased().everyMinutes(MINUTOS).create();
  Logger.log('Listo: sincronizar corre solo cada %s minutos.', MINUTOS);
}

/** Por si se quiere detener la copia automática. */
function detenerSincronizacion() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sincronizar') ScriptApp.deleteTrigger(t);
  });
  Logger.log('La copia automática quedó detenida.');
}

// ---------------------------------------------------------------------------

function abrirOrigen_() {
  var id = soloId_(ORIGEN);
  if (!id) throw new Error('Falta pegar en ORIGEN la dirección del Sheet que recibe la encuesta.');
  try {
    return SpreadsheetApp.openById(id);
  } catch (e) {
    throw new Error('No se pudo abrir el Sheet de ORIGEN. Compártalo con ' +
      Session.getEffectiveUser().getEmail() + ' como Lector. Detalle: ' + e.message);
  }
}

// La hoja de aquí cuya fila 1 tiene todos los títulos del origen.
function buscarDestino_(libro, titulos) {
  var buscados = titulos.map(clave_).filter(String);
  var hojas = libro.getSheets();
  for (var i = 0; i < hojas.length; i++) {
    var n = hojas[i].getLastColumn();
    if (n < buscados.length) continue;
    var enc = hojas[i].getRange(1, 1, 1, n).getValues()[0].map(clave_);
    if (buscados.every(function (t) { return enc.indexOf(t) >= 0; })) return hojas[i];
  }
  return null;
}

/**
 * Agrega al destino las filas del origen que no estén. Cada fila se reconoce por
 * su marca temporal y su segunda columna; así no se repite aunque corra dos veces
 * ni aunque alguien borre filas viejas del origen. Las columnas se ubican por el
 * título, así que el destino puede tener otro orden o columnas de más.
 */
function copiarNuevas_(hOrigen, hDestino) {
  var datos = hOrigen.getDataRange().getValues();
  if (datos.length < 2) return 0;
  var tOrigen = datos[0].map(clave_);
  var nDest = hDestino.getLastColumn();
  var tDestino = hDestino.getRange(1, 1, 1, nDest).getValues()[0].map(clave_);
  var mapa = tOrigen.map(function (t) { return tDestino.indexOf(t); });   // columna de origen → de destino

  var cA = tDestino.indexOf(tOrigen[0]), cB = tDestino.indexOf(tOrigen[1]);
  var ya = {};
  if (hDestino.getLastRow() > 1 && cA >= 0) {
    var ancho = Math.max(cA, cB) + 1;
    hDestino.getRange(2, 1, hDestino.getLastRow() - 1, ancho).getValues().forEach(function (f) {
      ya[llave_(f[cA], cB >= 0 ? f[cB] : '')] = true;
    });
  }

  var nuevas = [];
  for (var r = 1; r < datos.length; r++) {
    var f = datos[r];
    if (f.every(function (v) { return v === '' || v === null; })) continue;
    var k = llave_(f[0], f[1]);
    if (ya[k]) continue;
    ya[k] = true;
    var fila = new Array(nDest).fill('');
    mapa.forEach(function (c, i) { if (c >= 0) fila[c] = f[i]; });
    nuevas.push(fila);
  }
  if (nuevas.length) {
    hDestino.getRange(hDestino.getLastRow() + 1, 1, nuevas.length, nDest).setValues(nuevas);
  }
  return nuevas.length;
}

function llave_(marca, otra) {
  var m = marca instanceof Date ? marca.getTime() : String(marca);
  return m + '|' + String(otra);
}

function clave_(texto) {
  return String(texto).replace(/\s+/g, ' ').trim().toLowerCase();
}

function soloId_(texto) {
  var t = String(texto || '').trim();
  var m = t.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  return m ? m[1] : t;
}
