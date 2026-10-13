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

// Dónde se guardan las respuestas (como ID_HOJA en la reinducción):
//   - Vacío: en el mismo Google Sheet donde está este script.
//   - Con la dirección (o solo el ID) de otro Sheet: escribe directo allá, por
//     ejemplo en el Sheet de Holcim. La cuenta que publica este script tiene que
//     ser EDITORA de ese Sheet.
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
    resultado = datos && datos.tipo === 'consulta' ? consultarReporte(datos)
      : datos && datos.tipo === 'reporte' ? registrarReporte(datos)
      : registrarRespuesta(datos);
  } catch (err) {
    resultado = { ok: false, error: String(err && err.message || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(resultado))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------------
// Reporte de participación (pestaña «Reporte» de la página, con usuario y clave)
// ---------------------------------------------------------------------------
//
// El usuario y la clave NO van en el código (el repositorio es público): van en
// Configuración del proyecto → Propiedades de la secuencia de comandos:
//   REPORTE_USUARIO   y   REPORTE_CLAVE
// Al entrar, el servidor da una llave de sesión que dura 6 horas desde el último uso.
// Nunca se envían filas de respuestas: solo totales por planta.

var HOJA_POBLACION = 'Población';
// Personas activas del maestro de personal (columna X «División de personal»),
// contadas por cédula y con externos y aprendices. No aplican: Transcem (TR-) ni
// HC-MEDELLIN. Es solo el punto de partida: se edita en la hoja «Población».
var POBLACION_INICIAL = [
  ['AGG Planta Mondoñedo', 30, 'HC-MONDOÑEDO'],
  ['CEM Planta Nobsa', 265, 'HC-NOBSA CEMENTO'],
  ['CORPORATIVO Fundación Holcim', 14, 'CJ-NOBSA + CJ-TELEPORT'],
  ['CORPORATIVO Teleport', 113, 'HC-TELEPORT + AF-TELEPORT'],
  ['GEOCYCLE Barrancabermeja', 11, 'HC-BARRANCABERMEJA'],
  ['GEOCYCLE Nobsa', 17, 'AF-NOBSA'],
  ['RMX Planta Bello', 32, 'HC-BELLO'],
  ['RMX Plantas Valle', 45, 'HC-PALMIRA + HC-CALI'],
  ['RMX Planta Chía', 44, 'HC-CHIA'],
  ['RMX Plantas Boyaca', 27, 'HC-NOBSA CONCRETO + HC-TUNJA'],
  ['RMX Planta Puente Aranda', 203, 'HC-PUENTE ARANDA'],
  ['RMX Planta Sibaté', 12, 'HC-SIBATE'],
  ['TQC Tocancipá', 52, 'HC-TQC']
];
var ENC_POBLACION = ['Planta', 'Empleados Holcim (maestro)', 'Contratistas (opcional)', 'Divisiones del maestro (columna X)'];
var EMPLEADO = 'Empleado(a) Holcim', CONTRATISTA = 'Contratista Holcim';

/** La página pide el reporte: { usuario, clave } la primera vez, después { token }. */
function consultarReporte(datos) {
  var d = datos || {};
  var cache = CacheService.getScriptCache();
  var token = String(d.token || '');
  if (!token || !cache.get('REP|' + token)) {
    if (d.token && !d.usuario) throw new Error('La sesión venció. Vuelva a entrar.');
    var props = PropertiesService.getScriptProperties();
    var usuario = props.getProperty('REPORTE_USUARIO'), clave = props.getProperty('REPORTE_CLAVE');
    if (!usuario || !clave) {
      throw new Error('El reporte no está configurado: faltan REPORTE_USUARIO y REPORTE_CLAVE en las propiedades del script.');
    }
    if (String(d.usuario || '').trim().toLowerCase() !== usuario.trim().toLowerCase() || String(d.clave || '') !== clave) {
      Utilities.sleep(1200);   // frena a quien pruebe claves al azar
      throw new Error('Usuario o contraseña incorrectos.');
    }
    token = Utilities.getUuid();
  }
  cache.put('REP|' + token, '1', 21600);
  return { ok: true, token: token, reporte: armarReporte_() };
}

function armarReporte_() {
  var libro = libro_();
  var hoja = hoja_();
  var datos = hoja.getDataRange().getValues();
  var enc = (datos[0] || []).map(clave_);
  var col = function (i) { return enc.indexOf(clave_(ENCABEZADOS[i])); };
  var cF = col(0), cP = col(1), cT = col(2);

  var pob = poblacion_(libro);
  var porPlanta = {};
  pob.forEach(function (p) { porPlanta[clave_(p.planta)] = { planta: p.planta, poblacion: p.empleados, poblacionContratistas: p.contratistas, empleados: 0, contratistas: 0 }; });
  var otras = {}, ultima = null, total = 0;

  for (var r = 1; r < datos.length; r++) {
    var f = datos[r];
    var planta = String(f[cP] || '').trim(), tipo = String(f[cT] || '').trim();
    if (!planta && !tipo) continue;
    total++;
    var fecha = f[cF];
    if (fecha instanceof Date && (!ultima || fecha > ultima)) ultima = fecha;
    var fila = porPlanta[clave_(planta)];
    if (!fila) fila = otras[planta] = otras[planta] || { planta: planta || '(sin planta)', empleados: 0, contratistas: 0 };
    if (tipo === EMPLEADO) fila.empleados++; else if (tipo === CONTRATISTA) fila.contratistas++;
  }

  var plantas = Object.keys(porPlanta).map(function (k) { return porPlanta[k]; });
  var sum = function (lista, campo) { return lista.reduce(function (a, x) { return a + (Number(x[campo]) || 0); }, 0); };
  return {
    generado: new Date().toISOString(),
    ultima: ultima ? ultima.toISOString() : '',
    total: total,
    empleados: sum(plantas, 'empleados'),
    contratistas: sum(plantas, 'contratistas') + sum(Object.keys(otras).map(function (k) { return otras[k]; }), 'contratistas'),
    poblacion: sum(plantas, 'poblacion'),
    plantas: plantas,
    otras: Object.keys(otras).map(function (k) { return otras[k]; }),
    notaPoblacion: 'Población: personas activas del maestro de personal (columna X), por cédula, con externos y aprendices. No aplican Transcem ni HC-MEDELLIN.'
  };
}

// La hoja «Población»: si no existe, se crea con los conteos iniciales.
function poblacion_(libro) {
  var h = libro.getSheetByName(HOJA_POBLACION);
  if (!h) {
    h = libro.insertSheet(HOJA_POBLACION);
    h.getRange(1, 1, 1, ENC_POBLACION.length).setValues([ENC_POBLACION]).setFontWeight('bold');
    h.getRange(2, 1, POBLACION_INICIAL.length, 4).setValues(POBLACION_INICIAL.map(function (p) { return [p[0], p[1], '', p[2]]; }));
    h.setFrozenRows(1);
  }
  var n = h.getLastRow();
  if (n < 2) return [];
  return h.getRange(2, 1, n - 1, 3).getValues()
    .filter(function (f) { return String(f[0]).trim(); })
    .map(function (f) {
      return { planta: String(f[0]).trim(), empleados: Number(f[1]) || 0, contratistas: f[2] === '' ? null : Number(f[2]) || 0 };
    });
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
  var hoja = buscarHojaRespuestas_(libro);
  if (hoja && hoja.getName() !== HOJA_RESPUESTAS) {
    Logger.log('Las respuestas van a la hoja "%s": ya tiene las columnas del Form.', hoja.getName());
  }
  if (!hoja) {
    hoja = libro.insertSheet(HOJA_RESPUESTAS);
    ponerTitulos_(hoja);
    Logger.log('Hoja "%s" creada con %s columnas.', HOJA_RESPUESTAS, ENCABEZADOS.length);
  } else if (hoja.getLastColumn() === 0) {
    ponerTitulos_(hoja);
    Logger.log('La hoja "%s" estaba vacía: se le pusieron las %s columnas.', HOJA_RESPUESTAS, ENCABEZADOS.length);
  } else {
    revisarHoja_(hoja);
  }
  PropertiesService.getScriptProperties().setProperty('HOJA_RESPUESTAS', hoja.getName());
  hojaReportes_();
  Logger.log('Hoja "%s" lista para recibir reportes de problemas.', HOJA_REPORTES);
  // Si el Sheet ya tiene un «Resumen» que no es el de la encuesta, el nuestro va aparte.
  var existente = libro.getSheetByName(HOJA_RESUMEN);
  var esNuestro = existente && /^Encuesta de Cultura/.test(String(existente.getRange(1, 1).getValues()[0][0]));
  var nombre = !existente || esNuestro ? HOJA_RESUMEN : HOJA_RESUMEN + ' encuesta';
  if (libro.getSheetByName(nombre)) {
    Logger.log('Ya hay una hoja "%s" con el resumen: no se toca.', nombre);
  } else {
    crearResumen_(libro, hoja, nombre);
  }
  Logger.log('Las respuestas se guardan en: "%s" — %s', libro.getName(), libro.getUrl());
}

/**
 * Correr desde el editor si prepararHoja dice que falta permiso. No cambia nada:
 *   1) ¿El script tiene el permiso completo de Hojas? (abre su propia hoja por ID)
 *   2) ¿Puede abrir el Sheet de ID_LIBRO?
 * Si 1 es SÍ y 2 es NO, quien lo impide es el dueño de ese Sheet (su organización),
 * no el script: use apps-script/Sincronizar_Holcim.gs desde la cuenta de Holcim.
 */
function diagnosticarPermisos() {
  Logger.log('Cuenta del script: %s', Session.getEffectiveUser().getEmail());
  var propio = SpreadsheetApp.getActiveSpreadsheet();
  try {
    SpreadsheetApp.openById(propio.getId());
    Logger.log('1) Permiso completo de Hojas de cálculo: SÍ');
  } catch (e) {
    Logger.log('1) Permiso completo de Hojas de cálculo: NO. Falta autorizar el script. Detalle: %s', e.message);
    return;
  }
  var id = soloId_(ID_LIBRO);
  if (!id) { Logger.log('2) ID_LIBRO está vacío: las respuestas van a esta misma hoja.'); return; }
  try {
    Logger.log('2) Abre el Sheet de ID_LIBRO: SÍ — "%s"', SpreadsheetApp.openById(id).getName());
  } catch (e) {
    Logger.log('2) Abre el Sheet de ID_LIBRO: NO. Lo bloquea el dueño de ese Sheet (su organización), ' +
      'no el script. Use Sincronizar_Holcim.gs desde la cuenta de Holcim. Detalle: %s', e.message);
  }
}

// ---------------------------------------------------------------------------
// Resumen: las mismas fórmulas del libro de la plantilla, para un Sheet que no
// salió de ella. Se crea una sola vez; si ya existe, no se toca.
// ---------------------------------------------------------------------------

var HOJA_RESUMEN = 'Resumen';
var FILAS_RESUMEN = 5000;
var OPCIONES_RESUMEN = [
  ['Planta o sede', 1, ['AGG Planta Mondoñedo', 'CEM Planta Nobsa', 'CORPORATIVO Teleport', 'CORPORATIVO Fundación Holcim',
    'GEOCYCLE Barrancabermeja', 'GEOCYCLE Nobsa', 'RMX Planta Bello', 'RMX Plantas Valle', 'RMX Planta Chía',
    'RMX Plantas Boyaca', 'RMX Planta Puente Aranda', 'RMX Planta Sibaté', 'TQC Tocancipá']],
  ['Vinculación', 2, ['Empleado(a) Holcim', 'Contratista Holcim']],
  ['Tipo de cargo', 3, ['Director(a)', 'Gerente - Head', 'Jefe - Coordinador(a)', 'Supervisor(a) - Analista', 'Operativo(a)']],
  ['¿Ha reportado desviaciones sin que se tengan en cuenta?', 6, ['Si', 'No']]
];
// [nombre, primera y última afirmación] como posición en ENCABEZADOS (0 = Marca temporal)
var DIMENSIONES = [
  ['Valores y compromiso HSE', 7, 10], ['Procesos operacionales', 12, 15], ['Gestión de recursos', 17, 20],
  ['Supervisión', 22, 25], ['Planificación del trabajo', 27, 30], ['Abordaje de problemas y peligros', 32, 35],
  ['Cumplimiento de reglas', 37, 40], ['Evaluación subjetiva de riesgos', 42, 44]
];
var FAVORABLE = ['Totalmente de Acuerdo', 'De acuerdo', 'Un poco de Acuerdo'];
var NEUTRAL = ['Ni de acuerdo ni en desacuerdo'];
var DESFAVORABLE = ['Un poco en Desacuerdo', 'En Desacuerdo', 'Totalmente en Desacuerdo'];

function letra_(n) {
  var s = '';
  while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

function crearResumen_(libro, hojaResp, nombre) {
  // Columna real de cada título (la hoja de respuestas puede tener otro orden)
  var enc = hojaResp.getRange(1, 1, 1, hojaResp.getLastColumn()).getValues()[0].map(clave_);
  var col = function (i) { var k = enc.indexOf(clave_(ENCABEZADOS[i])); return k < 0 ? 0 : k + 1; };
  var ref = "'" + hojaResp.getName() + "'!";
  var rango = function (c1, c2) { return ref + '$' + letra_(c1) + '$2:$' + letra_(c2) + '$' + FILAS_RESUMEN; };
  var r = libro.insertSheet(nombre, 0);
  var celdas = [];   // [fila, columna, valor o fórmula]
  var poner = function (f, c, v) { celdas.push([f, c, v]); };

  poner(1, 1, 'Encuesta de Cultura de Salud, Seguridad y Ambiente 2026 — Resumen');
  poner(2, 1, "Se calcula solo con lo que llega a la hoja '" + hojaResp.getName() + "'. No escriba en esta hoja.");
  poner(4, 1, 'Respuestas recibidas'); poner(4, 2, '=COUNTA(' + rango(col(0), col(0)) + ')');
  poner(5, 1, 'Primera respuesta');    poner(5, 2, '=IF(B4=0,"",MIN(' + rango(col(0), col(0)) + '))');
  poner(6, 1, 'Última respuesta');     poner(6, 2, '=IF(B4=0,"",MAX(' + rango(col(0), col(0)) + '))');

  var fila = 8, titulos = [];
  OPCIONES_RESUMEN.forEach(function (t) {
    var c = col(t[1]);
    titulos.push(fila);
    poner(fila, 1, t[0]); poner(fila, 2, 'Respuestas'); poner(fila, 3, '% del total');
    fila++;
    t[2].forEach(function (o) {
      poner(fila, 1, o);
      poner(fila, 2, c ? '=COUNTIF(' + rango(c, c) + ',A' + fila + ')' : 'Falta la columna');
      poner(fila, 3, '=IF($B$4=0,"",IFERROR(B' + fila + '/$B$4,""))');
      fila++;
    });
    fila++;
  });

  titulos.push(fila);
  poner(fila, 1, 'Percepción por dimensión'); poner(fila, 2, 'Calificaciones');
  poner(fila, 3, '% Favorable'); poner(fila, 4, '% Neutral'); poner(fila, 5, '% Desfavorable');
  var primeraDim = ++fila;
  DIMENSIONES.forEach(function (d) {
    var c1 = col(d[1]), c2 = col(d[2]);
    poner(fila, 1, d[0]);
    if (!c1 || !c2 || c2 - c1 !== d[2] - d[1]) {
      poner(fila, 2, 'Columnas no encontradas');
    } else {
      var rg = rango(c1, c2);
      var suma = function (ops) { return ops.map(function (o) { return 'COUNTIF(' + rg + ',"' + o + '")'; }).join('+'); };
      poner(fila, 2, '=COUNTA(' + rg + ')');
      poner(fila, 3, '=IF($B' + fila + '=0,"",(' + suma(FAVORABLE) + ')/$B' + fila + ')');
      poner(fila, 4, '=IF($B' + fila + '=0,"",(' + suma(NEUTRAL) + ')/$B' + fila + ')');
      poner(fila, 5, '=IF($B' + fila + '=0,"",(' + suma(DESFAVORABLE) + ')/$B' + fila + ')');
    }
    fila++;
  });
  poner(fila + 1, 1, 'Favorable = las tres opciones de acuerdo · Neutral = Ni de acuerdo ni en desacuerdo · ' +
    'Desfavorable = las tres opciones de desacuerdo.');

  celdas.forEach(function (x) {
    var celda = r.getRange(x[0], x[1]);
    if (String(x[2]).charAt(0) === '=') celda.setFormula(x[2]); else celda.setValue(x[2]);
  });

  // Formato
  r.setColumnWidth(1, 330);
  for (var k = 2; k <= 5; k++) r.setColumnWidth(k, 120);
  r.getRange('A1').setFontSize(15).setFontWeight('bold').setFontColor('#071a38');
  r.getRange('A2').setFontStyle('italic').setFontColor('#5b6b82');
  r.getRange('A4:A6').setFontWeight('bold');
  r.getRange('B4:B6').setFontWeight('bold').setHorizontalAlignment('left');
  r.getRange('B5:B6').setNumberFormat('dd/MM/yyyy HH:mm');
  titulos.forEach(function (f) {
    r.getRange(f, 1, 1, f === titulos[titulos.length - 1] ? 5 : 3)
      .setBackground('#071a38').setFontColor('#ffffff').setFontWeight('bold');
  });
  r.getRange(9, 3, fila - 9, 3).setNumberFormat('0.0%');
  r.getRange(primeraDim, 2, DIMENSIONES.length, 1).setNumberFormat('0');
  r.setFrozenRows(3);
  Logger.log('Hoja "%s" creada con las fórmulas del resumen.', nombre);
}

function ponerTitulos_(hoja) {
  hoja.getRange(1, 1, 1, ENCABEZADOS.length).setValues([ENCABEZADOS])
    .setFontWeight('bold').setWrap(true).setVerticalAlignment('top');
  hoja.setFrozenRows(1);
  hoja.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm:ss');
}

function revisarHoja_(hoja) {
  var enc = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(clave_);
  var faltan = ENCABEZADOS.filter(function (h) { return enc.indexOf(clave_(h)) < 0; });
  Logger.log('Hoja "%s": %s columnas, %s respuestas.', hoja.getName(), enc.length, hoja.getLastRow() - 1);
  Logger.log(faltan.length ? 'OJO, faltan estas columnas: ' + faltan.join(' | ') : 'Todas las columnas están. Lista para recibir respuestas.');
}

// La hoja de reportes se crea sola la primera vez que se necesita.
function hojaReportes_() {
  var libro = libro_();
  var hoja = libro.getSheetByName(HOJA_REPORTES);
  if (!hoja) hoja = libro.insertSheet(HOJA_REPORTES);
  if (hoja.getLastColumn() === 0) {
    hoja.getRange(1, 1, 1, ENC_REPORTES.length).setValues([ENC_REPORTES]).setFontWeight('bold');
    hoja.setFrozenRows(1);
    hoja.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  }
  return hoja;
}

function libro_() {
  var id = soloId_(ID_LIBRO);
  if (!id) return SpreadsheetApp.getActiveSpreadsheet();
  try {
    return SpreadsheetApp.openById(id);
  } catch (e) {
    if (/auth\/spreadsheets|permission to call|permiso para llamar/i.test(e.message)) {
      throw new Error('Al script le falta el permiso completo de Hojas de cálculo para abrir otro Sheet. ' +
        'En Configuración del proyecto active «Mostrar el archivo de manifiesto appsscript.json», pegue el ' +
        'appsscript.json del repositorio, guarde y vuelva a ejecutar prepararHoja para autorizar. Detalle: ' + e.message);
    }
    throw new Error('No se pudo abrir el Sheet de ID_LIBRO. La cuenta ' + Session.getEffectiveUser().getEmail() +
      ' tiene que ser EDITORA de ese Sheet (Compartir → Editor). Detalle: ' + e.message);
  }
}

// Acepta la dirección completa del Sheet o solo su ID.
function soloId_(texto) {
  var t = String(texto || '').trim();
  var m = t.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  return m ? m[1] : t;
}

function hoja_() {
  var libro = libro_();
  var guardada = PropertiesService.getScriptProperties().getProperty('HOJA_RESPUESTAS');
  var hoja = (guardada && libro.getSheetByName(guardada)) || buscarHojaRespuestas_(libro);
  if (!hoja) throw new Error('No existe la hoja "' + HOJA_RESPUESTAS + '". Corra prepararHoja desde el editor.');
  return hoja;
}

// La hoja de respuestas: la que se llama «Respuestas de formulario 1» o, si no
// hay, la que ya tenga en la fila 1 todas las columnas del Form (como
// «Form_Responses» en un Sheet que viene de una exportación del Form).
function buscarHojaRespuestas_(libro) {
  var porNombre = libro.getSheetByName(HOJA_RESPUESTAS);
  if (porNombre) return porNombre;
  var hojas = libro.getSheets();
  for (var i = 0; i < hojas.length; i++) {
    var n = hojas[i].getLastColumn();
    if (n < ENCABEZADOS.length) continue;
    var enc = hojas[i].getRange(1, 1, 1, n).getValues()[0].map(clave_);
    if (ENCABEZADOS.every(function (h) { return enc.indexOf(clave_(h)) >= 0; })) return hojas[i];
  }
  return null;
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
