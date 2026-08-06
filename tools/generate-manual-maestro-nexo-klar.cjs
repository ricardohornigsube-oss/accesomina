const fs = require('fs');
const path = require('path');
const {
  AlignmentType, BorderStyle, Document, Footer, HeadingLevel, LevelFormat,
  Packer, PageBreak, PageNumber, Paragraph, ShadingType, Table, TableCell,
  TableRow, TextRun, WidthType
} = require('docx');

const OUT = path.resolve(__dirname, '../outputs/Manual_Maestro_Nexo_Klar');
fs.mkdirSync(OUT, { recursive: true });

const C = {
  ink: '15172A', text: '4B556B', muted: '64748B', indigo: '332E9B',
  magenta: 'E6007E', orange: 'FF6B18', lilac: 'F4F1FF', pink: 'FFF0F7',
  line: 'DDE2EC', pale: 'F8FAFC', success: '15803D', white: 'FFFFFF'
};
const CONTENT = 9026;
const border = { style: BorderStyle.SINGLE, size: 1, color: C.line };
const borders = { top: border, bottom: border, left: border, right: border };

function run(text, opts = {}) {
  return new TextRun({ text, font: 'Arial', size: opts.size || 21, color: opts.color || C.text, bold: opts.bold || false, italics: opts.italics || false, break: opts.break });
}
function p(text = '', opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: { before: opts.before || 0, after: opts.after ?? 130, line: opts.line || 300 },
    children: Array.isArray(text) ? text : [run(text, opts)]
  });
}
function heading(text, level = 1) {
  return new Paragraph({
    heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
    spacing: { before: level === 1 ? 300 : 230, after: 130 },
    children: [run(text, { size: level === 1 ? 32 : 26, color: C.ink, bold: true })]
  });
}
function label(text) { return p(text.toUpperCase(), { size: 16, bold: true, color: C.magenta, after: 75, line: 220 }); }
function bullet(text) {
  return new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 70, line: 290 }, children: [run(text, { size: 20 })] });
}
function number(text) {
  return new Paragraph({ numbering: { reference: 'numbers', level: 0 }, spacing: { after: 75, line: 290 }, children: [run(text, { size: 20 })] });
}
function cell(content, width, opts = {}) {
  const children = Array.isArray(content) ? content : [p(content, { size: opts.size || 19, color: opts.color || C.text, bold: opts.bold || false, after: 0, line: 270 })];
  return new TableCell({ width: { size: width, type: WidthType.DXA }, borders, shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined, margins: { top: 120, bottom: 120, left: 150, right: 150 }, children });
}
function table(headers, rows, widths) {
  return new Table({
    width: { size: CONTENT, type: WidthType.DXA }, columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, widths[i], { fill: C.indigo, color: C.white, bold: true, size: 18 })) }),
      ...rows.map((row, r) => new TableRow({ children: row.map((item, i) => cell(item, widths[i], { fill: r % 2 ? C.white : C.pale })) }))
    ]
  });
}
function callout(title, body, color = C.lilac) {
  return new Table({ width: { size: CONTENT, type: WidthType.DXA }, columnWidths: [CONTENT], rows: [new TableRow({ children: [cell([
    p(title, { bold: true, color: C.indigo, size: 20, after: 45 }), p(body, { size: 19, after: 0 })
  ], CONTENT, { fill: color })] })] });
}
function phase(num, title, goal, modules, steps, controls) {
  return [
    heading(`${num}. ${title}`),
    p([run('Objetivo: ', { bold: true, color: C.ink }), run(goal)]),
    label('Módulos involucrados'), p(modules, { size: 19, color: C.muted, after: 110 }),
    label('Ruta de trabajo'), ...steps.map(number),
    label('Control que queda registrado'), ...controls.map(bullet),
  ];
}

const title = 'Manual Maestro de Procesos';
const subtitle = 'Nexo Klar | Ruta integral para gestionar clientes, personas, recursos, cumplimiento y operación';
const sections = [];

sections.push(
  p('NEXO KLAR', { size: 22, bold: true, color: C.magenta, before: 1300, after: 110, align: AlignmentType.CENTER }),
  p(title, { size: 48, bold: true, color: C.ink, align: AlignmentType.CENTER, after: 140, line: 520 }),
  p(subtitle, { size: 23, color: C.text, align: AlignmentType.CENTER, after: 430, line: 350 }),
  callout('Propósito del documento', 'Explicar, de forma cronológica y práctica, cómo una empresa utiliza Nexo Klar desde la configuración inicial y una oportunidad comercial hasta la ejecución, control, trazabilidad y análisis de su operación.', C.pink),
  p('', { after: 260 }),
  p('Datos claros. Operación conectada.', { size: 22, bold: true, color: C.indigo, align: AlignmentType.CENTER, after: 120 }),
  p('Versión de referencia: agosto de 2026', { size: 17, color: C.muted, align: AlignmentType.CENTER, after: 0 }),
  new Paragraph({ children: [new PageBreak()] }),
  heading('Cómo leer este manual'),
  p('Nexo Klar opera como una cadena de información: cada dato se crea en un contexto y se relaciona con el siguiente. El objetivo es evitar registros aislados, planillas dispersas y decisiones sin respaldo.'),
  table(['Nivel', 'Pregunta que responde', 'Resultado'], [
    ['Relación comercial', '¿Para quién trabajamos y bajo qué condiciones?', 'Cliente, contrato y orden de servicio definidos.'],
    ['Personas y recursos', '¿Quién ejecutará el trabajo y con qué recursos?', 'Personas habilitadas, EPP, turnos, vehículos y estadías asignados.'],
    ['Cumplimiento', '¿Está todo vigente y aprobado?', 'Documentos, exámenes, credenciales y requisitos controlados.'],
    ['Ejecución', '¿Qué está ocurriendo y qué debe resolverse?', 'Avances, incidentes, acuerdos y evidencias trazables.'],
    ['Decisión', '¿Qué debemos priorizar o mejorar?', 'Paneles, alertas, reportes y bitácora de cambios.']
  ], [1700, 3300, 4026]),
  heading('Mapa maestro de la operación'),
  p('La secuencia recomendada es la siguiente. Algunos módulos funcionan en paralelo, pero todos conservan referencia al cliente, contrato y orden de servicio que corresponda.', { after: 150 }),
  table(['Etapa', 'Flujo principal', 'Resultado esperado'], [
    ['1', 'Configuración de empresa y gobierno', 'Espacio de trabajo listo y usuarios autorizados.'],
    ['2', 'Prospecto -> Cliente -> Contrato -> Orden de servicio', 'Relación comercial estructurada.'],
    ['3', 'Personas -> requisitos -> habilitación', 'Dotación apta y disponible.'],
    ['4', 'EPP, turnos, vehículo, estadía y comunicaciones', 'Recursos listos para ejecutar.'],
    ['5', 'Centro Operativo -> Libro de Obra -> incidentes', 'Ejecución documentada y controlada.'],
    ['6', 'Alertas -> auditoría -> reportes y analítica', 'Decisiones basadas en información vigente.']
  ], [900, 4550, 3576]),
  callout('Regla de oro', 'Antes de asignar una persona o recurso a una orden, verifique que el cliente, contrato y orden de servicio estén creados. Esta relación es la base del historial, las alertas y los reportes.'),
  new Paragraph({ children: [new PageBreak()] })
);

sections.push(...phase('1', 'Configuración de la empresa y gobierno',
  'Preparar el espacio privado de la empresa, sus usuarios, permisos, catálogos y reglas de trabajo antes de cargar información operativa.',
  'Configuración Empresa, Usuarios y Permisos, Privacidad y Datos, Importar / Exportar, Documentación de la Empresa, Bitácora de Cambios.',
  [
    'Complete la identidad de la empresa: razón social, RUT, contactos, ubicación y datos operativos.',
    'Cree usuarios individuales y asigne permisos de administración, edición o consulta.',
    'Parametrice cargos, especialidades, tipos de documentos, turnos, EPP, centros de costo y requisitos habituales.',
    'Defina la documentación de la empresa que se solicitará en habilitaciones o procesos de clientes.',
    'Use importación masiva cuando exista información histórica que deba incorporarse de forma controlada.'
  ], [
    'Empresa y configuración separadas de las demás organizaciones.',
    'Usuario, fecha y acción registrados en la Bitácora de Cambios.',
    'Catálogos reutilizables en formularios, filtros, asignaciones y reportes.'
]));

sections.push(...phase('2', 'Gestión comercial: de prospecto a cliente',
  'Registrar oportunidades y convertirlas en relaciones comerciales sin perder antecedentes, conversaciones ni documentos.',
  'Prospectos y Oportunidades, Clientes, Comunicaciones y convocatorias, Bitácora de Cambios.',
  [
    'Cree el prospecto con empresa, contacto, cargo, teléfono, correo, región, comuna, necesidad, monto estimado y etapa comercial.',
    'Registre reuniones, llamadas, correos, acuerdos, adjuntos, próxima acción y responsable en la bitácora de la oportunidad.',
    'Actualice la etapa: nuevo, calificado, propuesta, negociación, ganado, perdido o postergado.',
    'Cuando se concrete el negocio, convierta la oportunidad en Cliente y conserve la trazabilidad comercial.',
    'En la ficha del Cliente, agregue uno o más contactos con cargo, teléfono y correo; mantenga datos actualizados.'
  ], [
    'Historial comercial por oportunidad y por cliente.',
    'Datos de contacto validados y relacionados con la empresa correspondiente.',
    'Registro de conversión de prospecto a cliente.'
]));

sections.push(...phase('3', 'Contrato y orden de servicio',
  'Formalizar alcance, vigencia, responsables, compromisos y trabajos que se ejecutarán para un cliente.',
  'Clientes, Contratos y Firmas, Órdenes de Servicio, Documentación, Libro de Obra, Alertas.',
  [
    'Desde el Cliente cree el Contrato: número, tipo, alcance, fechas de vigencia, monto, responsable, documentos y estado.',
    'Cargue la versión contractual, anexos, órdenes de compra y antecedentes asociados; mantenga historial de renovaciones.',
    'Cree una Orden de Servicio por proyecto, intervención, mantenimiento, operación o trabajo temporal.',
    'Defina inicio, término, ubicación, responsables, requerimientos de dotación, especialidades y recursos esperados.',
    'Use la ficha y bitácora de cada contrato u orden para registrar cambios, ampliaciones, acuerdos, documentos y comentarios.'
  ], [
    'Cliente -> Contrato -> Orden de Servicio como relación principal.',
    'Vigencias, responsables, documentos y versiones del contrato.',
    'Estado operativo de la orden: lista, con brechas, en ejecución, observada, cerrada o cancelada.'
]));

sections.push(...phase('4', 'Gestión de personas',
  'Crear una base confiable de personal permanente y temporal, evitando duplicados y permitiendo asignaciones con historial.',
  'Personas, Personal permanente, Gestión de personal temporal, Restringidos, Formación y certificaciones, Exámenes y aptitudes, Salud Ocupacional.',
  [
    'Registre cada persona usando RUT como identificador único, junto con datos de contacto, cargo, especialidad, tipo de personal y domicilio.',
    'Clasifique como personal permanente o temporal según su relación con la empresa y las órdenes de servicio.',
    'Para personal temporal, gestione disponibilidad, convocatoria, confirmación, validación, contrato enviado, contrato firmado y habilitación.',
    'Cargue documentos, cursos, certificaciones, exámenes, aptitudes y protocolos de salud aplicables.',
    'Asigne la persona a una orden de servicio, contrato o cliente según corresponda; registre fechas y conserve el historial de movimientos.',
    'Califique o restrinja solo cuando exista un motivo documentado; el estado debe ser visible antes de asignar a una orden.'
  ], [
    'Control de duplicados por RUT dentro de la empresa.',
    'Historial de asignaciones, cambios de estado y documentos.',
    'Estado operativo unificado: disponible, convocado, en validación, contratado, habilitado, en ejecución, finalizado o restringido.'
]));

sections.push(...phase('5', 'Cumplimiento, habilitación y acreditación',
  'Verificar que personas, empresa, terceros, vehículos y recursos cumplan los requisitos aplicables antes de iniciar el trabajo.',
  'Documentación de la Empresa, Habilitación del Cliente, Auditoría, Alertas, Credenciales, Terceros y subcontratos.',
  [
    'Configure los requisitos exigidos por cliente, contrato, orden, cargo o tipo de recurso.',
    'Cargue documentos con fecha de emisión, vencimiento, estado y evidencia; conserve versiones al renovar.',
    'Revise cada documento mediante auditoría: cargado, en revisión, observado, corregido, aprobado, rechazado, vencido o renovado.',
    'Gestione la habilitación ante el cliente y mantenga el resultado por entidad: empresa, persona, vehículo, tercero u orden.',
    'Emita o actualice credenciales de acceso con vigencia, zona autorizada y número o código de control.',
    'Cuando falte un requisito crítico, marque la persona o recurso como no habilitado y evite su uso operativo.'
  ], [
    'Historial documental y evidencia de cada revisión.',
    'Alertas previas a vencimientos, observaciones, rechazos y faltantes.',
    'Trazabilidad de aprobación por cliente, contrato y orden de servicio.'
]));

sections.push(...phase('6', 'Recursos para la operación',
  'Preparar los recursos físicos y logísticos necesarios para que las personas ejecuten una orden de servicio con seguridad y continuidad.',
  'Protección personal / EPP, Turnos y asistencia, Vehículos, activos y equipos, Alojamientos y Estadías, Comunicaciones y convocatorias.',
  [
    'Registre medidas de EPP de cada persona y entregue elementos con tipo, talla, fecha, estado, costo, vida útil y respaldo.',
    'Asigne turnos, fechas de ingreso y salida, horas trabajadas y asistencia a la persona y orden correspondiente.',
    'Registre vehículos, equipos y activos: identificación, propiedad o arriendo, operador, documentos, vencimientos, costos y alertas.',
    'Cree hoteles o alojamientos con contacto, habitaciones, camas, capacidad, precio y condiciones; asigne estadías por persona, cama y período.',
    'Use comunicaciones y convocatorias para contacto individual o grupal, dejando constancia del envío y del grupo objetivo.'
  ], [
    'Entrega, devolución, pérdida o desgaste de EPP con respaldo.',
    'Disponibilidad de cama, vehículo y persona por período.',
    'Costos y recursos asociados al contexto de la orden de servicio.'
]));

sections.push(...phase('7', 'Ejecución, libro de obra e incidencias',
  'Coordinar el trabajo diario, documentar avances y resolver desviaciones sin perder evidencia.',
  'Centro Operativo, Libro de Obra, Incidentes y no conformidades, Comunicaciones y convocatorias, Alertas, Bitácora de Cambios.',
  [
    'Revise el Centro Operativo para identificar órdenes listas, brechas de personal, documentos, EPP, alojamiento, vehículo o firma.',
    'Registre en Libro de Obra los avances diarios, acuerdos, hitos, riesgos, evidencias, responsables y solicitudes de firma.',
    'Cuando exista un incidente o no conformidad, registre fecha, contexto, severidad, evidencia, responsable, acción y fecha de cierre.',
    'Use alertas para priorizar vencimientos, documentos observados y tareas que impiden ejecutar la orden.',
    'Cierre el servicio con evidencia, resultado, pendientes y registro final en la bitácora.'
  ], [
    'Folio y trazabilidad del Libro de Obra por cliente, contrato y orden.',
    'Registro de incidencia, responsables, acciones y cierre.',
    'Historial de cambios y comunicaciones relevantes.'
]));

sections.push(...phase('8', 'Panel, reportes y mejora continua',
  'Transformar la información registrada en control diario, decisiones de gestión y evidencia para clientes o auditorías.',
  'Panel General, Alertas, Centro Operativo, Reportes y analítica, Auditoría, Bitácora de Cambios, Importar / Exportar.',
  [
    'Abra el Panel General para revisar indicadores, pendientes, documentos por renovar, personal restringido y órdenes con brechas.',
    'Use filtros por cliente, contrato, orden de servicio, período, responsable, estado y persona para analizar una operación específica.',
    'Genere reportes de dotación, cumplimiento documental, costos, EPP, vehículos, estadías, terceros, incidentes y trazabilidad.',
    'Exporte información para análisis, respaldo o integración; valide el resultado antes de compartirlo.',
    'Revise periódicamente la Bitácora de Cambios y la Auditoría para asegurar control, continuidad y calidad de los datos.'
  ], [
    'Indicadores consolidados y alertas accionables.',
    'Reportes filtrables por contexto operativo.',
    'Evidencia histórica para gestión, cliente, auditoría y continuidad operacional.'
]));

sections.push(
  new Paragraph({ children: [new PageBreak()] }),
  heading('Matriz de módulos y uso real'),
  p('Esta matriz resume el rol de cada módulo dentro de la cadena operacional. Todos deben utilizarse con contexto: cliente, contrato, orden de servicio, persona o recurso, según aplique.'),
  table(['Grupo', 'Módulo', 'Uso principal', 'Conexiones'], [
    ['Inicio', 'Panel General', 'Priorizar operación, cumplimiento y riesgos.', 'Alertas, órdenes, personas, reportes.'],
    ['Inicio', 'Alertas', 'Gestionar vencimientos, faltantes y observaciones.', 'Documentos, EPP, vehículos, credenciales, contratos.'],
    ['Inicio', 'Centro Operativo', 'Preparar y controlar órdenes de servicio.', 'Personas, recursos, brechas, libro de obra.'],
    ['Inicio', 'Libro de Obra', 'Registrar hechos, acuerdos y evidencias diarias.', 'Cliente, contrato, orden, firma, incidentes.'],
    ['Relación comercial', 'Prospectos y Oportunidades', 'Gestionar nuevos negocios y seguimiento.', 'Cliente, contactos, bitácora, documentos.'],
    ['Relación comercial', 'Clientes', 'Administrar relación, contactos y contexto.', 'Contratos, órdenes, personas, documentos.'],
    ['Relación comercial', 'Contratos y Firmas', 'Formalizar vigencia, alcance y anexos.', 'Cliente, órdenes, documentos, firmas.'],
    ['Relación comercial', 'Órdenes de Servicio', 'Organizar ejecución y requerimientos.', 'Contrato, personas, recursos, costos.'],
    ['Relación comercial', 'Terceros y subcontratos', 'Controlar empresas externas y sus requisitos.', 'Contratos, personal, F30, documentos, alertas.'],
    ['Personas', 'Gestión de personal temporal', 'Convocar y habilitar dotación temporal.', 'Órdenes, requisitos, comunicaciones.'],
    ['Personas', 'Personas / Personal permanente', 'Mantener ficha y asignaciones.', 'Documentos, turnos, EPP, recursos.'],
    ['Personas', 'Turnos y asistencia', 'Controlar jornadas, entradas, salidas y HH.', 'Persona, orden, reportes, costos.'],
    ['Personas', 'Protección personal / EPP', 'Entregar EPP y controlar vida útil.', 'Persona, inventario, orden, costo.'],
    ['Personas', 'Formación / Exámenes / Salud', 'Verificar competencias y aptitud.', 'Persona, requisito, habilitación, alertas.'],
    ['Personas', 'Restringidos', 'Evitar asignaciones no autorizadas.', 'Persona, requisitos, órdenes, alertas.'],
    ['Operación', 'Comunicaciones y convocatorias', 'Contactar y coordinar equipos.', 'Personas, órdenes, historial.'],
    ['Operación', 'Vehículos, activos y equipos', 'Controlar disponibilidad, documentos y costos.', 'Cliente, orden, operador, alertas.'],
    ['Operación', 'Alojamientos y Estadías', 'Gestionar habitaciones, camas y períodos.', 'Persona, orden, hotel, costo.'],
    ['Operación', 'Credenciales', 'Controlar acceso y vigencia.', 'Persona, cliente, orden, habilitación.'],
    ['Cumplimiento', 'Documentación de la Empresa', 'Mantener respaldo corporativo vigente.', 'Cliente, habilitación, alertas.'],
    ['Cumplimiento', 'Habilitación del Cliente', 'Registrar aprobación u observación externa.', 'Empresa, persona, vehículo, orden.'],
    ['Cumplimiento', 'Incidentes y no conformidades', 'Gestionar desviaciones y acciones.', 'Orden, persona, evidencia, bitácora.'],
    ['Cumplimiento', 'Auditoría', 'Revisar documentos y evidencias.', 'Todas las entidades documentales.'],
    ['Gestión', 'Reportes y analítica', 'Medir operación, cumplimiento y costos.', 'Todos los módulos.'],
    ['Gestión', 'Configuración / permisos / datos', 'Gobernar la plataforma y sus usuarios.', 'Toda la empresa, seguridad y trazabilidad.']
  ], [1320, 2140, 3000, 2566]),
  new Paragraph({ children: [new PageBreak()] }),
  heading('Controles transversales'),
  p('Estos principios aplican en cada módulo y permiten que Nexo Klar mantenga información útil, segura y continua.'),
  table(['Control', 'Aplicación práctica'], [
    ['Datos separados por empresa', 'Cada organización opera con usuarios, configuraciones y registros independientes.'],
    ['No duplicidad', 'RUT para personas, folios y datos críticos deben validarse antes de guardar.'],
    ['Historial', 'Cambios, renovaciones, asignaciones y revisiones deben conservar fecha, usuario y evidencia.'],
    ['Documentos versionados', 'Al renovar, se agrega una versión y no se elimina el antecedente anterior.'],
    ['Alertas accionables', 'Cada alerta debe indicar responsable, plazo, entidad relacionada y acción posible.'],
    ['Contexto operativo', 'Personas, recursos y documentos deben vincularse al cliente, contrato u orden que corresponda.'],
    ['Acceso según rol', 'Cada usuario ve y modifica solo la información necesaria para su responsabilidad.']
  ], [2600, 6426]),
  heading('Ruta recomendada para una demostración comercial'),
  p('Para explicar el valor de Nexo Klar a un cliente, utilice un caso único y avance de manera visible por la cadena de información:'),
  ...[
    'Crear una oportunidad y registrar el contacto comercial.',
    'Convertirla en cliente, crear un contrato y una orden de servicio.',
    'Incorporar una persona y mostrar sus documentos, formación, exámenes y estado operativo.',
    'Asignar la persona a la orden junto con EPP, turno, alojamiento y vehículo.',
    'Mostrar la habilitación, las alertas y las brechas antes de iniciar.',
    'Registrar un avance en Libro de Obra y, si aplica, un incidente o acción correctiva.',
    'Cerrar con Panel General y un reporte filtrado por cliente, contrato u orden.'
  ].map(number),
  callout('Resultado que debe percibir el cliente', 'Nexo Klar convierte una operación dispersa en una vista única y trazable: permite saber qué se contrató, quién puede ejecutar, qué recursos están disponibles, qué falta para iniciar y qué evidencia respalda cada decisión.', C.pink)
);

const doc = new Document({
  creator: 'Nexo Klar', title, description: 'Manual maestro de procesos y flujo operativo de Nexo Klar',
  numbering: { config: [
    { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 430, hanging: 220 } } } }] },
    { reference: 'numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 470, hanging: 240 } } } }] }
  ] },
  styles: {
    default: { document: { run: { font: 'Arial', size: 21, color: C.text } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Arial', size: 32, bold: true, color: C.ink }, paragraph: { spacing: { before: 300, after: 130 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Arial', size: 26, bold: true, color: C.ink }, paragraph: { spacing: { before: 230, after: 100 }, outlineLevel: 1 } }
    ]
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 850, right: 1440, bottom: 850, left: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [run('Nexo Klar | Manual Maestro de Procesos | ', { size: 15, color: C.muted }), new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 15, color: C.muted })] })] }) },
    children: sections
  }]
});

Packer.toBuffer(doc).then(buffer => {
  const file = path.join(OUT, 'Manual_Maestro_Procesos_Nexo_Klar.docx');
  fs.writeFileSync(file, buffer);
  console.log(file);
});
