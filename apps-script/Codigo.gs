/**
 * Encuesta de Cultura de Salud, Seguridad y Ambiente 2026 — servidor.
 *
 * Escribe cada respuesta como una fila nueva en la hoja del Google Form
 * ("Respuestas de formulario 1"), con las mismas 46 columnas. No asume
 * posiciones: lee la fila 1 y ubica cada respuesta por el texto del encabezado,
 * así que las columnas pueden reordenarse sin romper nada.
 *
 * También guarda los reportes de problemas que la gente envía desde el botón
 * de ayuda, en otra hoja ("Reportes de problemas"), sin tocar las respuestas.
 *
 * Dos formas de recibir respuestas:
 *   - La página la sirve este mismo script (doGet) y llama a registrarRespuesta.
 *   - La página está publicada afuera (GitHub Pages) y hace POST a doPost.
 */

var HOJA_RESPUESTAS = 'Respuestas de formulario 1';
var COL_FECHA = 'Marca temporal';
var HOJA_REPORTES = 'Reportes de problemas';
var ENC_REPORTES = ['Marca temporal', 'Tipo', 'Descripción', 'Pantalla', 'Contacto',
                    'Navegador', 'Tamaño de pantalla', 'Tema', 'Último error', 'Estado'];

// Déjelo vacío si el script está creado desde el mismo Google Sheet
// (Extensiones → Apps Script). Si es un proyecto aparte, pegue el ID del libro.
var ID_LIBRO = '';

var MAX_TEXTO = 1000;

// Las 46 columnas del Form, en su orden. Solo se usan para crear la hoja si el
// libro no la tiene; si ya existe, manda lo que diga su fila 1.
var ENCABEZADOS = [
  "Marca temporal",
  "¿En cuál planta o sede de trabajo está ubicado(a)?",
  "Usted es:",
  "Qué tipo de cargo desempeña en sus labores",
  "Cúal es su rango de Edad en años",
  "Número de años que lleva trabajando en Holcim Colombia",
  "Ha reportado alguna desviación en Salud, Seguridad o Ambiente sin que esta haya sido tenido en cuenta",
  "Mi supervisor/gerente apoya los más altos estándares posibles de salud, seguridad y ambiente (HSE).",
  "La salud, seguridad y ambiente (HSE) son una prioridad en mi trabajo.",
  "La gerencia se preocupa por la salud, seguridad y ambiente (HSE), incluso si no hay incidentes ni accidentes.",
  "La gerencia y los supervisores son modelos a seguir para los comportamientos esperados en materia de salud, seguridad y ambiente (HSE).",
  "Por favor comparta aquí sus comentarios sobre VALORES Y COMPROMISO HSE:",
  "Nuestra comunicación en temas de salud, seguridad y ambiente (HSE) es efectiva en todos los niveles de la empresa (De arriba hacia abajo, de abajo hacia arriba y de igual a igual).",
  "La alta gerencia es consciente de los problemas que enfrentan los trabajadores en el campo y actúa para resolverlos.",
  "Las tareas se evalúan periódicamente para identificar y gestionar los riesgos en mi lugar de trabajo.",
  "Se motiva e invita a los empleados a involucrarse en la mejora de los procesos de trabajo en función de los riesgos identificados.",
  "Por favor comparta aquí sus comentarios sobre PROCESOS OPERACIONALES:",
  "En Holcim Colombia se está invirtiendo activamente recursos para mejorar la salud, seguridad y ambiente.",
  "Holcim Colombia contrata trabajadores alineados con los valores de HSE y brinda oportunidades de capacitación y aprendizaje.",
  "Holcim Colombia asegura que las herramientas y los equipos sean eficientes, apropiados y seguros de usar.",
  "Holcim Colombia valora el tiempo invertido en mejorar la salud, la seguridad y el medio ambiente.",
  "Por favor comparta aquí sus comentarios sobre GESTIÓN DE RECURSOS:",
  "Los supervisores alientan a los trabajadores a reportar e informar cualquier problema o inquietud.",
  "Los supervisores alientan a los trabajadores a dedicar tiempo para la capacitación y el desarrollo personal.",
  "Los trabajadores reciben suficiente capacitación e instrucciones para realizar su trabajo de manera segura.",
  "Los supervisores están presentes en campo y brindan supervisión regular y comentarios constructivos.",
  "Por favor comparta aquí sus comentarios sobre SUPERVISIÓN:",
  "Se informa a los trabajadores sobre los peligros potenciales asociados con las actividades laborales.",
  "Los supervisores tratan de distribuir la carga de trabajo de manera uniforme entre los trabajadores.",
  "Los supervisores monitorean de cerca la competencia para garantizar que los trabajadores estén calificados para realizar las tareas asignadas.",
  "Me proporcionan la información, el equipo y el tiempo apropiado para realizar mi trabajo de manera segura.",
  "Por favor comparta aquí sus comentarios sobre PLANIFICACIÓN DEL TRABAJO:",
  "Los supervisores constantemente hacen responsables a los trabajadores que actúan de manera insegura, incluso si sus acciones ahorraron tiempo o dinero.",
  "Cuando los trabajadores reportan un problema de salud, seguridad y medio ambiente, los supervisores actúan rápidamente para corregir el problema.",
  "Los supervisores no son permisivos con los trabajadores que violan los procedimientos y reglas de salud, seguridad y medio ambiente.",
  "Cuando es necesario, las consecuencias disciplinarias se aplican a los empleados en cualquier nivel de la organización.",
  "Por favor comparta aquí sus comentarios sobre ABORDAJE DE PROBLEMAS Y PELIGROS:",
  "Los supervisores animan a los trabajadores a detener los trabajos que no sean seguros.",
  "Los supervisores dan ejemplo en el cumplimiento de Reglas y estándares de salud, seguridad y medio ambiente.",
  "Los supervisores nunca firman evaluaciones de Riesgos (Permisos de trabajo, ATS o ITS) que están incompletos o inexactos.",
  "Los supervisores siempre siguen las reglas de salud, seguridad y ambiente (HSE).",
  "Por favor comparta aquí sus comentarios sobre CUMPLIMIENTO DE REGLAS:",
  "Es poco probable que me lesione en el trabajo durante los próximos 12 meses.",
  "Es poco probable que uno de mis compañeros de trabajo o contratistas se lesionen en el trabajo en los próximos 12 meses.",
  "Es poco probable que ocurra un incidente o accidente en los próximos 12 meses.",
  "Por favor comparta aquí sus comentarios sobre EVALUACIÓN SUBJETIVA DE RIESGOS:"
];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Percepción de Cultura HSE 2026 · Holcim Colombia')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  var resultado;
  try {
    var datos = JSON.parse(e.postData.contents);
    resultado = datos && datos.tipo === 'reporte' ? registrarReporte(datos) : registrarRespuesta(datos);
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

/** Recibe { reporte: { tipo, descripcion, ... } } y lo agrega a la hoja de reportes. */
function registrarReporte(datos) {
  var r = datos && datos.reporte;
  if (!r || typeof r !== 'object') throw new Error('No llegó el reporte.');
  var desc = limpiar_(String(r.descripcion || '').slice(0, 500));
  if (!desc) throw new Error('El reporte llegó sin descripción.');
  var corto = function (v, n) { return limpiar_(String(v == null ? '' : v).slice(0, n)); };

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    hojaReportes_().appendRow([
      new Date(), corto(r.tipo, 60), desc, corto(r.pantalla, 120), corto(r.contacto, 120),
      corto(r.navegador, 300), corto(r.tamano, 30), corto(r.tema, 20), corto(r.error, 300), 'Nuevo'
    ]);
  } finally {
    lock.releaseLock();
  }
  return { ok: true };
}

/**
 * Correr una vez desde el editor (botón Ejecutar). Si el libro no tiene la hoja
 * de respuestas, la crea con las 46 columnas; si ya la tiene, la revisa.
 */
function prepararHoja() {
  var libro = libro_();
  var hoja = libro.getSheetByName(HOJA_RESPUESTAS);
  if (!hoja) {
    hoja = libro.insertSheet(HOJA_RESPUESTAS);
    hoja.getRange(1, 1, 1, ENCABEZADOS.length).setValues([ENCABEZADOS])
      .setFontWeight('bold').setWrap(true).setVerticalAlignment('top');
    hoja.setFrozenRows(1);
    hoja.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm:ss');
    Logger.log('Hoja "%s" creada con %s columnas.', HOJA_RESPUESTAS, ENCABEZADOS.length);
  } else {
    revisarHoja_(hoja);
  }
  hojaReportes_();
  Logger.log('Hoja "%s" lista para recibir reportes de problemas.', HOJA_REPORTES);
}

function revisarHoja_(hoja) {
  var enc = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(clave_);
  var faltan = ENCABEZADOS.filter(function (h) { return enc.indexOf(clave_(h)) < 0; });
  Logger.log('Hoja "%s": %s columnas, %s respuestas.', HOJA_RESPUESTAS, enc.length, hoja.getLastRow() - 1);
  Logger.log(faltan.length ? 'OJO, faltan estas columnas: ' + faltan.join(' | ') : 'Todas las columnas están. Lista para recibir respuestas.');
}

// La hoja de reportes se crea sola la primera vez que se necesita.
function hojaReportes_() {
  var libro = libro_();
  var hoja = libro.getSheetByName(HOJA_REPORTES);
  if (!hoja) {
    hoja = libro.insertSheet(HOJA_REPORTES);
    hoja.getRange(1, 1, 1, ENC_REPORTES.length).setValues([ENC_REPORTES]).setFontWeight('bold');
    hoja.setFrozenRows(1);
    hoja.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  }
  return hoja;
}

function libro_() {
  return ID_LIBRO ? SpreadsheetApp.openById(ID_LIBRO) : SpreadsheetApp.getActiveSpreadsheet();
}

function hoja_() {
  var hoja = libro_().getSheetByName(HOJA_RESPUESTAS);
  if (!hoja) throw new Error('No existe la hoja "' + HOJA_RESPUESTAS + '". Corra prepararHoja desde el editor.');
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
