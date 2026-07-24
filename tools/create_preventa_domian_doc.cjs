const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  LevelFormat,
  Footer,
  PageNumber,
} = require('docx');

const out = path.resolve(__dirname, '../outputs/Plan_Preventa_Mejoras_Domian_Nexo.docx');
const tableWidth = 9360;
const border = { style: BorderStyle.SINGLE, size: 1, color: 'D8DEE8' };
const borders = { top: border, bottom: border, left: border, right: border };

function paragraph(text, options = {}) {
  return new Paragraph({
    spacing: { before: options.before || 0, after: options.after ?? 130 },
    alignment: options.align,
    children: [
      new TextRun({
        text,
        bold: options.bold,
        italics: options.italics,
        color: options.color || '344054',
        size: options.size || 22,
      }),
    ],
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 160 },
    children: [new TextRun(text)],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 220, after: 120 },
    children: [new TextRun(text)],
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 22, color: '344054' })],
  });
}

function cell(text, width, fill = 'FFFFFF', bold = false) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [
      new Paragraph({
        children: [new TextRun({ text: String(text), bold, size: 19, color: bold ? '101828' : '344054' })],
      }),
    ],
  });
}

function table(headers, rows, widths) {
  return new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ children: headers.map((header, index) => cell(header, widths[index], 'EAF2F8', true)) }),
      ...rows.map((row) => new TableRow({ children: row.map((value, index) => cell(value, widths[index])) })),
    ],
  });
}

const criticalPoints = [
  [
    '1',
    'Plataforma controlada y robusta',
    'Alta',
    'Validar ambiente productivo, base de datos, respaldos, monitoreo, control de errores, seguridad de sesión y separación real de empresas.',
    'Ambiente productivo estable y checklist de operación aprobado.',
  ],
  [
    '2',
    'Escalabilidad y seguridad',
    'Alta',
    'Definir arquitectura cloud, permisos, MFA, roles, cifrado, respaldos, control de acceso, auditoría y continuidad operacional.',
    'Arquitectura documentada y lista para clientes reales.',
  ],
  [
    '3',
    'Parametrización por empresa',
    'Alta',
    'Asegurar que cada cliente pueda tener configuración, marca, usuarios, permisos, documentos y procesos propios sin afectar a otros.',
    'Modelo multiempresa validado con casos de prueba.',
  ],
  [
    '4',
    'Operación, administración y soporte cliente con IA',
    'Alta',
    'Definir cómo se administran clientes, altas, bajas, soporte, preguntas frecuentes, tickets, capacitación y asistencia apoyada por IA.',
    'Modelo de soporte, SLA y base de conocimiento inicial.',
  ],
  [
    '5',
    'Plan comercial',
    'Alta',
    'Ordenar planes SaaS, precios, contrato mínimo, propuesta de valor, demos, pilotos, metas y proceso de venta.',
    'Plan comercial con pricing, metas y embudo de venta.',
  ],
  [
    '6',
    'Plan de estrategia de marketing',
    'Media',
    'Definir mensajes, industrias, contenido, LinkedIn, sitio web, videos, casos de uso y material para captar reuniones.',
    'Calendario de marketing y kit comercial.',
  ],
  [
    '7',
    'Casos de éxito y pilotos controlados',
    'Alta',
    'Seleccionar uno o más clientes piloto, incluso gratis o a precio reducido, para obtener historial, comentarios y mejoras.',
    'Primer caso de éxito documentado con métricas antes/después.',
  ],
  [
    '8',
    'Masa crítica para expansión organizacional',
    'Media',
    'Definir desde qué nivel de clientes, ingresos o soporte se requiere sumar equipo comercial, soporte, implementación y tecnología.',
    'Umbrales de contratación y expansión definidos.',
  ],
  [
    '9',
    'Plan de crecimiento, expansión técnica y mantención',
    'Alta',
    'Definir roadmap técnico, mejoras futuras, mantención mensual, costos cloud, actualizaciones y crecimiento regional.',
    'Roadmap 12, 24 y 48 meses.',
  ],
];

const salesProjectionRows = [
  [
    '12 meses',
    '10 a 12 clientes',
    '$420.000 a $520.000',
    '$4.200.000 a $6.240.000',
    '$50.400.000 a $74.880.000',
    'Validar mercado, soporte y primeros casos de exito.',
  ],
  [
    '24 meses',
    '30 a 40 clientes',
    '$520.000 a $650.000',
    '$15.600.000 a $26.000.000',
    '$187.200.000 a $312.000.000',
    'Consolidar ventas recurrentes y estructura de operacion.',
  ],
  [
    '48 meses',
    '80 a 120 clientes',
    '$650.000 a $850.000',
    '$52.000.000 a $102.000.000',
    '$624.000.000 a $1.224.000.000',
    'Escalar equipo, soporte, alianzas y expansion fuera de Chile.',
  ],
];

const joseValueRows = [
  [
    'Participacion en una empresa ya desarrollada',
    'Domian Nexo ya cuenta con una base funcional, marca, material comercial, roadmap, documentos, presentaciones y estructura inicial.',
  ],
  [
    'Acceso a una oportunidad SaaS recurrente',
    'El negocio no depende de una venta unica; la proyeccion esta basada en ingresos mensuales recurrentes por cliente.',
  ],
  [
    'Entrada en etapa temprana',
    'El monto se justifica porque Jose Antonio entraria antes de una venta masiva, cuando aun puede aportar a la estrategia y capturar crecimiento futuro.',
  ],
  [
    'Apoyo esperado en crecimiento',
    'Su participacion no seria pasiva; debe aportar tiempo, contactos, estructura comercial, vision de expansion y orden de negocio.',
  ],
  [
    'Riesgo compartido',
    'El cobro debe quedar asociado a condiciones, hitos y permanencia, para que el ingreso sea justo para ambas partes.',
  ],
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 32, bold: true, font: 'Arial', color: '101828' },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 27, bold: true, font: 'Arial', color: '1D2939' },
        paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 1 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 520, hanging: 260 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1150, right: 1440, bottom: 1150, left: 1440 },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'Domian Nexo - Plan previo a venta | Página ', size: 18, color: '667085' }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '667085' }),
              ],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({ text: 'Domian Nexo', bold: true, size: 42, color: 'F47B32' })],
        }),
        new Paragraph({
          spacing: { after: 280 },
          children: [
            new TextRun({
              text: 'Documento ordenado de mejoras, preparación comercial y participación estratégica',
              bold: true,
              size: 30,
              color: '101828',
            }),
          ],
        }),
        paragraph('Objetivo', { bold: true, size: 24, color: '101828' }),
        paragraph(
          'Ordeno en este documento los puntos que tenemos que trabajar antes de comenzar una venta formal y masiva de Domian Nexo, manteniendo una visión clara de plataforma robusta, operación, marketing, plan comercial, soporte, escalabilidad y crecimiento.'
        ),
        paragraph(
          'También dejo escrito por qué la participación de un tercero, en este caso José Antonio Dinamarca, puede ser valiosa para nosotros por el apoyo y tiempo que dedicará a la estructura, plan comercial y plan de expansión de Domian Nexo.',
          { bold: true, color: '8A3B12' }
        ),

        h1('1. Resumen ejecutivo'),
        paragraph(
          'Domian Nexo cuenta con una base funcional orientada a empresas que necesitan controlar personal, documentos, contratos, proyectos, EPP, vehículos, hotelería, turnos, credenciales, alertas, reportes y trazabilidad. Antes de vender de forma amplia, considero necesario consolidar la plataforma como un servicio SaaS estable, seguro, administrable y escalable.'
        ),
        paragraph(
          'El foco previo a la venta debe ser convertir la solución en una operación comercial repetible: mismo proceso de implementación, mismos planes, soporte claro, pilotos medibles, métricas de uso y una promesa comercial fácil de explicar.'
        ),

        h1('2. Puntos obligatorios antes de vender'),
        table(
          ['N°', 'Punto a trabajar', 'Prioridad', 'Qué significa', 'Resultado esperado'],
          criticalPoints,
          [600, 2100, 900, 3260, 2500]
        ),

        h1('3. Orden recomendado de ejecución'),
        h2('Fase 1: Base productiva y controlada'),
        bullet('Cerrar ambiente productivo en cloud con base de datos, archivos, respaldos, monitoreo, seguridad, roles y acceso por empresa.'),
        bullet('Validar que los datos de una empresa no se mezclen con otra y que cada cliente tenga marca, usuarios y permisos propios.'),
        bullet('Documentar el proceso de alta, baja, recuperación de acceso, soporte y administración interna.'),

        h2('Fase 2: Producto vendible y parametrizado'),
        bullet('Definir qué incluye cada plan SaaS: Básico, Pro y Full.'),
        bullet('Asegurar que los módulos principales tengan flujos simples, datos relacionados y reportes claros.'),
        bullet('Crear una demo limpia con datos ficticios realistas para mostrar a clientes.'),
        bullet('Dejar parametrizaciones por empresa sin afectar a las demás cuentas.'),

        h2('Fase 3: Comercial, marketing y casos piloto'),
        bullet('Preparar discurso de venta, presentación, sitio web, video, post de LinkedIn, casos de uso y propuesta económica.'),
        bullet('Seleccionar un cliente piloto, incluso gratis o a precio reducido, para obtener comentarios, mejoras y caso de éxito.'),
        bullet('Medir resultados del piloto: ahorro de tiempo, documentos ordenados, vencimientos evitados, personas habilitadas y trazabilidad.'),

        h2('Fase 4: Expansión y organización'),
        bullet('Definir la masa crítica para sumar soporte, implementación, ventas y desarrollo técnico.'),
        bullet('Crear roadmap de crecimiento técnico y comercial a 12, 24 y 48 meses.'),
        bullet('Evaluar expansión fuera de Chile solo después de casos de éxito, clientes activos y operación estable.'),

        h1('4. Rol de José Antonio Dinamarca'),
        paragraph(
          'Veo la participación de José Antonio Dinamarca como valiosa si su aporte se concentra en estructura, estrategia comercial, expansión y estabilidad del negocio. Su incorporación debe quedar asociada a responsabilidades claras y medibles.'
        ),
        table(
          ['Área de apoyo', 'Responsabilidad esperada', 'Indicador sugerido'],
          [
            ['Estructura de negocio', 'Apoyar definición de planes, precios, propuesta de valor y modelo de cobro.', 'Planes SaaS aprobados y oferta comercial lista.'],
            ['Plan comercial', 'Participar en prospección, reuniones, pilotos y cierre de clientes.', 'Demos, pilotos y clientes cerrados.'],
            ['Marketing y marca', 'Apoyar mensajes, materiales, presentación, LinkedIn, sitio y propuesta comercial.', 'Kit comercial completo y calendario de marketing.'],
            ['Expansión', 'Ayudar a definir mercados, alianzas, masa crítica y crecimiento organizacional.', 'Roadmap de expansión y criterios de contratación.'],
            ['Estabilidad del negocio', 'Apoyar seguimiento financiero, operación, soporte y priorización de mejoras.', 'Tablero mensual de métricas y decisiones.'],
          ],
          [2200, 4300, 2860]
        ),
        paragraph(
          'Mi recomendación es que su participación quede amarrada a hitos, tiempo de dedicación, responsabilidades y resultados, evitando entregar participación completa sin validar aporte real durante el periodo inicial.'
        ),

        h1('5. Proyección de venta y base para valorizar la participación'),
        paragraph(
          'Para conversar el monto que le cobraremos a José Antonio por participar en la empresa, es importante dejar una proyección simple. La lógica es que Domian Nexo no se valoriza solo por lo que existe hoy, sino por el potencial de ingresos recurrentes si logramos ordenar la plataforma, vender planes SaaS y mantener clientes activos.'
        ),
        paragraph(
          'Estoy considerando una entrada o cobro inicial referencial de $20.000.000 por participación, siempre sujeto a acuerdo formal, responsabilidades, hitos y permanencia. Este monto se entiende como una entrada temprana a una empresa con producto en desarrollo avanzado y posibilidad de crecimiento comercial. Este monto también puede ser pagado de forma mensual durante un periodo de 8 meses, equivalente a cuotas referenciales de $2.500.000 mensuales, siempre que quede pactado por escrito.'
        ),
        table(
          ['Plazo', 'Clientes proyectados', 'Ticket mensual promedio', 'Ingreso mensual estimado', 'Ingreso anual recurrente', 'Objetivo del periodo'],
          salesProjectionRows,
          [1100, 1350, 1650, 1650, 1650, 1960]
        ),
        paragraph(
          'Esta proyección es conservadora y debe validarse con pilotos reales. Aun así, muestra que si logramos estabilidad técnica, casos de éxito y ventas recurrentes, el negocio puede generar ingresos mensuales relevantes y justificar una valorización inicial para quien quiera participar desde esta etapa.'
        ),

        h1('6. Justificación del cobro a José Antonio'),
        paragraph(
          'El monto de $20.000.000 no lo estoy mirando solo como un pago por entrar, sino como una forma de valorar el trabajo ya realizado, la oportunidad creada y el potencial de crecimiento. También debe servir para financiar parte del crecimiento, mejorar la operación, preparar la venta y ordenar la estructura del negocio.'
        ),
        table(
          ['Base de la valorización', 'Comentario'],
          joseValueRows,
          [3000, 6360]
        ),
        paragraph(
          'Para que sea justo, este cobro debe quedar por escrito con condiciones claras: qué porcentaje o derecho recibe, qué actividades debe realizar, qué hitos debe cumplir, qué pasa si no participa activamente y cómo se protege la propiedad intelectual de Domian Nexo.'
        ),

        h1('7. Forma sugerida de estructurar la participación'),
        table(
          ['Concepto', 'Propuesta sugerida'],
          [
            ['Monto de entrada', '$20.000.000 como aporte o cobro inicial por participación, sujeto a contrato. Puede pagarse al contado o en 8 cuotas mensuales referenciales de $2.500.000.'],
            ['Participación', 'Definir porcentaje final solo con acuerdo formal. Se recomienda liberarlo por hitos y permanencia.'],
            ['Periodo de evaluación', '12 meses iniciales, con revisión cada 3 o 6 meses.'],
            ['Responsabilidades', 'Apoyo en plan comercial, marketing, expansión, contactos, estructura y crecimiento.'],
            ['Protección del proyecto', 'La propiedad intelectual, software, marca y datos deben quedar protegidos para Domian.'],
            ['Salida anticipada', 'Definir qué ocurre si no cumple dedicación, hitos o deja de participar.'],
          ],
          [3000, 6360]
        ),
        paragraph(
          'Mi recomendación es no entregar una participación completa desde el primer día. Lo más sano es pactar una participación progresiva, donde José Antonio pueda ir ganando derechos según su aporte real al crecimiento.'
        ),

        h1('8. Métricas para decidir cuándo comenzar a vender'),
        table(
          ['Métrica', 'Meta mínima antes de venta formal'],
          [
            ['Ambiente productivo', 'Operativo con respaldo, monitoreo, seguridad y dominio final.'],
            ['Demo comercial', 'Empresa ficticia cargada con flujo completo: cliente, contrato, proyecto, trabajadores, EPP, vehículos, hotelería y reportes.'],
            ['Piloto', 'Al menos 1 cliente piloto usando la plataforma con comentarios documentados.'],
            ['Soporte', 'Proceso de soporte definido: canal, responsable, tiempos y base de ayuda.'],
            ['Plan comercial', 'Precios, contrato mínimo, onboarding, descuentos y propuesta económica definidos.'],
            ['Marketing', 'Presentación, video, sitio, post comercial y material de venta listos.'],
            ['Seguridad', 'Roles, MFA, separación por empresa, auditoría y recuperación de acceso definidos.'],
          ],
          [3400, 5960]
        ),

        h1('9. Riesgos si se vende antes de ordenar estos puntos'),
        bullet('Prometer más de lo que la operación puede soportar.'),
        bullet('Perder confianza por problemas de acceso, datos o soporte.'),
        bullet('No poder responder rápido a clientes que pidan cambios, carga de información o capacitación.'),
        bullet('No tener claridad de precios, alcance ni contrato mínimo.'),
        bullet('No poder demostrar valor con casos reales o métricas de ahorro.'),
        bullet('Dificultar la entrada de nuevos socios o integrantes por falta de estructura.'),

        h1('10. Decisión recomendada'),
        paragraph(
          'Mi recomendación es avanzar con una etapa previa a venta de 60 a 90 días. Durante este periodo tenemos que cerrar la plataforma productiva, ordenar el plan comercial, preparar marketing, crear una demo realista, definir soporte y ejecutar un piloto controlado.'
        ),
        paragraph(
          'En paralelo, podemos formalizar la participación de José Antonio Dinamarca como apoyo estratégico, pero asociada a hitos de trabajo, crecimiento y resultados. Esto nos permite aprovechar su experiencia sin comprometer el proyecto antes de validar su aporte.'
        ),

        h1('11. Checklist final previo a venta'),
        bullet('Plataforma productiva robusta y segura.'),
        bullet('Modelo multiempresa validado.'),
        bullet('Planes SaaS Básico, Pro y Full listos.'),
        bullet('Demo comercial con datos completos.'),
        bullet('Contrato, propuesta y política de privacidad preparados.'),
        bullet('Soporte cliente definido, idealmente con base de conocimiento e IA de apoyo.'),
        bullet('Plan de marketing y calendario de difusión.'),
        bullet('Cliente piloto o caso de éxito inicial.'),
        bullet('Roadmap técnico y comercial de 12, 24 y 48 meses.'),
        bullet('Acuerdo formal de participación de José Antonio si se incorpora al crecimiento.'),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, buffer);
  console.log(out);
});
