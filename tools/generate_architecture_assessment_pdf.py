#!/usr/bin/env python3
"""Generate the corrected Nexo Klar production architecture assessment."""
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, HRFlowable

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'Nexo_Klar_Assessment_Arquitectura_v5_Produccion.pdf'
INK=colors.HexColor('#141A20'); MUTED=colors.HexColor('#5D6B7A'); PRIMARY=colors.HexColor('#2A2A8C')
DEEP=colors.HexColor('#1A1A5E'); LINE=colors.HexColor('#E3DED2'); ALT=colors.HexColor('#FBF9F5')
ACCENT=colors.HexColor('#00CFC1'); WARN=colors.HexColor('#C77700'); DANGER=colors.HexColor('#B3261E')
PAGE_W, PAGE_H = A4
styles=getSampleStyleSheet()
for name, font, size, leading, color, before, after in [
 ('NKicker','Helvetica-Bold',9,12,colors.HexColor('#00706A'),0,10),
 ('NTitle','Helvetica-Bold',33,39,INK,0,12), ('NSub','Helvetica',14,20,MUTED,0,16),
 ('NH1','Helvetica-Bold',21,26,INK,0,9), ('NH2','Helvetica-Bold',13,17,DEEP,10,5),
 ('NBody','Helvetica',9.3,14,INK,0,7), ('NSmall','Helvetica',7.6,10.5,MUTED,0,4),
 ('NCardTitle','Helvetica-Bold',10.3,13,INK,0,4), ('NCardBody','Helvetica',8.2,11.5,MUTED,0,0),
 ('NCallout','Helvetica',9,13,INK,0,0)]:
    styles.add(ParagraphStyle(name=name,fontName=font,fontSize=size,leading=leading,textColor=color,spaceBefore=before,spaceAfter=after))

def p(text, style='NBody'): return Paragraph(text, styles[style])
def tbl(rows, widths, header=True):
    cells=[]
    for r in rows: cells.append([x if hasattr(x,'wrap') else p(str(x),'NSmall') for x in r])
    t=Table(cells,colWidths=widths,repeatRows=1 if header else 0,hAlign='LEFT')
    st=[('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),.35,LINE),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]
    if header: st += [('BACKGROUND',(0,0),(-1,0),DEEP),('TEXTCOLOR',(0,0),(-1,0),colors.white)]
    else: st += [('BACKGROUND',(0,0),(-1,-1),ALT)]
    t.setStyle(TableStyle(st)); return t
def card(title, body, color=PRIMARY):
    t=Table([[p(title,'NCardTitle'),p(body,'NCardBody')]],colWidths=[40*mm,130*mm])
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(0,0),colors.HexColor('#F0F0FA')),('LINEBEFORE',(0,0),(0,0),3,color),('BOX',(0,0),(-1,-1),.45,LINE),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)])); return t
def callout(text, color=ACCENT):
    t=Table([[p(text,'NCallout')]],colWidths=[170*mm])
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),colors.HexColor('#EAFBF9')),('LINEBEFORE',(0,0),(0,0),4,color),('BOX',(0,0),(-1,-1),.35,colors.HexColor('#BDEDE8')),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)])); return t
def heading(title,kicker): return [p(kicker.upper(),'NKicker'),p(title,'NH1'),HRFlowable(width='100%',thickness=1,color=LINE,spaceAfter=10)]
def footer(canvas, doc):
    canvas.saveState(); canvas.setStrokeColor(LINE); canvas.line(20*mm,14*mm,PAGE_W-20*mm,14*mm); canvas.setFont('Helvetica',7.2); canvas.setFillColor(MUTED); canvas.drawString(20*mm,9*mm,'NEXO KLAR SPA · Assessment de arquitectura productiva · Confidencial'); canvas.drawRightString(PAGE_W-20*mm,9*mm,f'Página {doc.page}'); canvas.restoreState()

s=[]
s += [Spacer(1,36*mm),p('NEXO KLAR SPA · DOCUMENTO TÉCNICO INTERNO','NKicker'),p('Assessment de arquitectura productiva','NTitle'),p('Versión corregida y consolidada de la arquitectura, funcionalidad, aislamiento de clientes y ruta de implementación cloud.','NSub'),Spacer(1,8*mm)]
s += [card('Propósito','Entregar una referencia única y veraz para el equipo técnico, socios e integradores. Distingue capacidades ya implementadas en el repositorio de configuraciones que deben activarse en AWS antes de operar con clientes reales.'),Spacer(1,7*mm)]
s.append(tbl([['Elemento','Estado de referencia'],['Producto','Nexo Klar Cloud v7.7.0'],['Fecha','11 de agosto de 2026'],['Código oficial','Repositorio GitHub y carpeta oficial del proyecto'],['Cobertura','Frontend público y privado, API, datos, seguridad, AWS, clientes e integraciones'],['Clasificación','Uso interno · evaluación técnica y preparación productiva']],[45*mm,125*mm]))
s += [Spacer(1,16*mm),callout('<b>Conclusión ejecutiva.</b> La base de producto incorpora backend multiempresa, RLS, sesiones seguras, auditoría, control de versiones, almacenamiento S3 preparado y validaciones automatizadas. La salida a producción requiere completar y probar infraestructura AWS, integraciones reales, observabilidad y continuidad.'),PageBreak()]

s += heading('1. Resumen ejecutivo y correcciones','Estado real de la arquitectura')
s.append(p('El assessment v4 contiene supuestos que no representan el repositorio actual. Esta versión reemplaza esos supuestos por el estado verificable del código y una arquitectura objetivo razonable para AWS.'))
s.append(tbl([['Tema','Assessment anterior','Arquitectura real / corrección'],['Frontend','React 18, Vite y Tailwind','HTML, CSS y JavaScript modular; <b>public/index.html</b> y <b>public/cloud-client.js</b> son la aplicación servida.'],['Backend','Node.js 22','Node.js <b>20 o superior</b> con Express 5.'],['Contraseñas','bcrypt','<b>scrypt</b> con salt único, de acuerdo con la implementación actual.'],['Aislamiento','RLS no activo','RLS está habilitado y <b>FORCE ROW LEVEL SECURITY</b> protege las tablas críticas.'],['Persistencia','27 tablas / 19 migraciones','PostgreSQL con <b>21 migraciones versionadas</b>, entidades normalizadas y estado modular.'],['Base de datos','Aurora Serverless v2 como hecho','Soporta <b>PostgreSQL 15+</b>. RDS PostgreSQL es la base recomendada; Aurora es alternativa opcional.'],['Cifrado S3','Sin SSE configurado','S3 privado, versionado y cifrado son requisito de producción; dependen de la cuenta AWS.']],[28*mm,55*mm,87*mm]))
s += [Spacer(1,7),callout('<b>Regla de lectura:</b> “Implementado” significa que existe en código y pruebas. “Por configurar” implica una cuenta, credencial, servicio o política externa que debe contratarse, habilitarse y validarse antes de la operación productiva.',PRIMARY),PageBreak()]

s += heading('2. Alcance funcional y relación de datos','Qué soporta la plataforma')
s.append(p('Nexo Klar centraliza la operación comercial, laboral, documental y de terreno. Cada registro se relaciona con la empresa usuaria y puede vincularse a cliente, contrato, orden de servicio, persona, recurso y evidencia.'))
tree='Empresa (tenant)<br/>├── Prospectos y oportunidades<br/>├── Cliente<br/>│   ├── Contrato / firma / anexo<br/>│   │   └── Orden de servicio<br/>│   │       ├── Personas y asignaciones<br/>│   │       ├── Vehículos, activos, EPP, alojamiento y turnos<br/>│   │       ├── Documentos, cursos, exámenes, credenciales y habilitación<br/>│   │       └── Libro de obra, incidentes, CAPA, costos y reportes<br/>│   └── Terceros y subcontratos<br/>└── Gobierno: usuarios, permisos, auditoría, privacidad y configuración'
s.append(card('Flujo operativo',f"<font face='Courier'>{tree}</font>",colors.HexColor('#00706A')))
s += [Spacer(1,8)]
s.append(tbl([['Capa','Módulos y uso real'],['Relación comercial','Prospectos, clientes, contratos, firmas, órdenes de servicio y seguimiento de condiciones.'],['Capital humano','Personas fijas, por proyecto o disponibles; turnos, asistencia, EPP, formación, exámenes, salud y restricciones.'],['Operación','Convocatorias, alojamiento, vehículos, activos, inventario, terceros, ejecución y libro de obra.'],['Cumplimiento','Documentación corporativa, habilitación de cliente, auditoría, incidentes, no conformidades y acciones.'],['Gestión','Paneles, alertas, reportes, analítica, bitácora de cambios, privacidad, permisos y catálogos por empresa.']],[42*mm,128*mm]))
s.append(PageBreak())

s += heading('3. Arquitectura lógica de referencia','Flujo de acceso y servicios')
s.append(p('La plataforma debe operar con un único origen HTTPS. El navegador no determina el tenant: la API obtiene usuario, rol y empresa desde la sesión segura, y PostgreSQL aplica el aislamiento de datos.'))
s.append(card('Ruta de solicitud','Usuario autorizado → HTTPS / WAF opcional → ALB → ECS Fargate (Express) → transacción con contexto de tenant → PostgreSQL RDS con RLS. Los archivos viajan a S3 privado por la API y solo se entregan mediante autorización y URL firmada.'))
s += [Spacer(1,8)]
s.append(tbl([['Capa','Tecnología / responsabilidad','Estado'],['Interfaz','Sitio público y aplicación privada HTML/CSS/JS. Cliente cloud para consumir API.','Implementado'],['API','Express, validación, autorización por rol, CSRF, control de concurrencia y rutas por dominio.','Implementado'],['Datos','PostgreSQL 15+, migraciones, RLS, restricciones, módulos y entidades normalizadas.','Implementado / requiere instancia'],['Archivos','Metadatos, hash, tamaño máximo, antivirus previsto; S3 privado en producción.','Preparado / requiere S3 y proveedor AV'],['Integraciones','SMTP, WhatsApp Cloud API, firma, OCR/IA, ERP y acreditación mediante conectores y eventos.','Preparado / requiere proveedores']],[28*mm,100*mm,42*mm]))
s += [Spacer(1,7),callout('<b>No usar producción desde file://.</b> El HTML independiente sirve para demostración local. La operación productiva debe ser servida por la API, con PostgreSQL como fuente autoritativa y S3 como almacenamiento documental.',DANGER),PageBreak()]

s += heading('4. Separación completa por empresa','Modelo multiempresa')
s.append(p('Nexo Klar utiliza un modelo multi-tenant de base compartida y filas separadas por <b>tenant_id</b>. Empresa A, B y N no deben compartir vistas, archivos, catálogos, usuarios ni configuraciones, aun cuando utilicen la misma infraestructura.'))
s.append(tbl([['Control','Cómo se aplica','Resultado esperado'],['Sesión','La cookie HttpOnly identifica una sesión validada; el backend resuelve tenant, usuario y rol.','El navegador no puede elegir otra empresa.'],['Autorización','Cada endpoint verifica rol y pertenencia antes de leer o escribir.','Permisos acotados a función y tenant.'],['Base de datos','La transacción establece app.current_tenant_id; RLS y FORCE RLS filtran tablas críticas.','Defensa ante errores de filtro en aplicación.'],['Datos y archivos','IDs, RUT, vínculos y claves se validan por empresa. S3 usa prefijos por tenant y acceso autorizado.','No se mezclan documentos ni entidades.'],['Configuración','tenant_settings, catálogos e integraciones se mantienen por empresa; secretos se cifran.','Parametrización independiente.'],['Auditoría','Eventos con usuario, fecha, entidad, resumen y contexto de tenant.','Trazabilidad de cambios y soporte.']],[31*mm,90*mm,49*mm]))
s += [Spacer(1,7),callout('<b>Prueba obligatoria de aceptación:</b> crear tres empresas de prueba, cargar datos equivalentes y comprobar que una no puede buscar, descargar, exportar ni inferir información de las otras. Repetir en cada liberación mayor.'),PageBreak()]

s += heading('5. Datos, integridad y trazabilidad','Modelo que soporta la operación')
s.append(p('El sistema combina colecciones funcionales versionadas para compatibilidad con tablas normalizadas para procesos críticos, integraciones, reportes y evolución. La dirección correcta es aumentar las rutas que usan entidades normalizadas sin romper la experiencia vigente.'))
s.append(tbl([['Dominio','Entidades principales','Control relevante'],['Identidad','tenants, app_users, user_sessions','Roles, MFA, sesiones revocables, bloqueo y aprobación de cuentas.'],['Comercial','clientes/mines, commercial_contracts, projects, asignaciones','Vínculos por tenant y fechas coherentes.'],['Personas','workers, documentos, cursos, exámenes, estado operativo','RUT único por empresa, estado habilitado/restringido, matriz de requisitos.'],['Recursos','vehículos, hoteles, EPP, inventario, movimientos y mantenimiento','Asignación, disponibilidad, costo y vida útil.'],['Cumplimiento','requisitos, revisiones, file_objects, habilitación, auditoría','Vigencias, evidencias, responsables y bloqueo automático.'],['Gobierno','audit_log, historial, privacidad, consentimientos y eventos','Historial append-only y trazabilidad por entidad.']],[32*mm,75*mm,63*mm]))
s += [Spacer(1,6),p('<b>Integridad ya considerada:</b> RUT único por trabajador en la empresa, identificadores únicos, referencias entre entidades, coherencia de fechas, sanitización de HTML ejecutable, bloqueo de Base64 y control optimista de versión por módulo.'),PageBreak()]

s += heading('6. Seguridad, identidad y datos personales','Controles de aplicación')
s.append(tbl([['Área','Control actual en repositorio','Cierre productivo requerido'],['Contraseñas','scrypt con salt único.','Política de longitud, control de credenciales filtradas y entrenamiento de soporte.'],['Sesiones','Token con hash, cookie HttpOnly/Secure/SameSite=Strict y revocación.','HTTPS real, expiración revisada y cierre global ante incidente.'],['MFA','Validación de entorno exige MFA_REQUIRED=true en producción.','TOTP, enrolamiento, recuperación segura y prueba de pérdida de dispositivo.'],['CSRF / origen','Protecciones de origen y CSRF a nivel de API.','CSP estricta sin unsafe-inline donde sea viable y pruebas OWASP.'],['Archivos','Hash, límite de 25 MB, estado antivirus y metadatos.','Servicio AV real, cuarentena, reescaneo y política de descarga.'],['Datos sensibles','RLS y secretos de integración cifrados AES-256-GCM.','Clasificación, retención, derechos de titulares y cifrado adicional donde corresponda.']],[28*mm,72*mm,70*mm]))
s += [Spacer(1,8),callout('La Ley 21.719 exige gobierno real, no solo una pantalla de privacidad. Antes del lanzamiento se deben aprobar: inventario de tratamientos, base jurídica, periodos de conservación, respuesta a derechos de titulares, protocolo de incidentes y responsables internos.',WARN),PageBreak()]

s += heading('7. Documentos, archivos e integraciones','Servicios externos controlados')
s.append(p('El motor documental está diseñado para mantener revisión humana final. Las integraciones agregan evidencia y puntaje, pero no deben habilitar por sí solas a una persona, vehículo o empresa sin la validación responsable.'))
s.append(tbl([['Componente','Función','Patrón de integración'],['S3 privado','Contratos, certificados, fotografías, evidencias y documentos de cumplimiento.','Carga vía API, metadatos/file_objects, prefijo de tenant, URL firmada, versionado y lifecycle.'],['Antivirus','Evita adjuntos maliciosos.','Archivo en cuarentena; se publica tras respuesta limpia del proveedor.'],['OCR / IA documental','Extrae fechas, emisor, nombre, RUT, QR y señales de consistencia.','Webhook/REST asíncrono, resultado guardado, score explicable y revisión humana.'],['Firma electrónica','Contrato, anexo, libro de obra y actas.','Crear sobre, enviar por canal autorizado, recibir webhook firmado y mantener versión/evidencia.'],['Correo / WhatsApp','Convocatorias, vencimientos y solicitudes de firma.','Plantillas, consentimiento, historial de entrega, error y respuesta.'],['ERP / acreditación','Órdenes, costos, facturación y habilitación cuando exista API oficial.','Eventos idempotentes, trazables, con reintentos y sin automatizar portales sin autorización.']],[33*mm,59*mm,78*mm]))
s.append(PageBreak())

s += heading('8. Diseño AWS recomendado','Producción segura y escalable')
s.append(p('La infraestructura debe desplegarse en una cuenta AWS de producción separada de desarrollo y prueba. RDS PostgreSQL es la alternativa base; Aurora PostgreSQL es una decisión opcional de capacidad y costo, no un requisito técnico.'))
aws='Usuarios<br/>  └─ DNS + ACM + HTTPS<br/>      └─ Application Load Balancer (subredes públicas)<br/>          └─ ECS Fargate / Express (subredes privadas, 2 AZ)<br/>              ├─ RDS PostgreSQL 15+ privado (Multi-AZ)<br/>              ├─ S3 privado (documentos, versionado, SSE)<br/>              ├─ Secrets Manager<br/>              ├─ CloudWatch Logs / métricas / alarmas<br/>              └─ NAT o endpoints privados para integraciones y AWS<br/>GitHub Actions → ECR → tarea de migración controlada → ECS'
s.append(card('Arquitectura objetivo',f"<font face='Courier'>{aws}</font>"))
s += [Spacer(1,8)]
s.append(tbl([['Servicio','Configuración mínima de producción'],['Red','VPC, subredes públicas para ALB y privadas para ECS/RDS; SG de mínimo privilegio; dos zonas de disponibilidad.'],['ECS','Dos tareas iniciales, healthcheck /api/health, readiness /api/ready, escalamiento por CPU/memoria y despliegue progresivo.'],['RDS','PostgreSQL 15+, sin acceso público, cifrado, backups automáticos, restauración probada y conexión solo desde ECS.'],['S3','Bloqueo público, SSE-KMS o SSE-S3, versionado, lifecycle, task role y monitoreo de acceso.'],['Secretos','Secrets Manager para DATABASE_URL, TENANT_SECRET_KEY, tokens y claves; rotación y acceso IAM por rol.'],['Perímetro','ACM, HTTPS, WAF recomendado, rate limiting, registros de ALB y cabeceras seguras.']],[34*mm,136*mm]))
s.append(PageBreak())

s += heading('9. Despliegue, calidad y continuidad','Operación técnica')
s.append(tbl([['Etapa','Secuencia recomendada','Evidencia de salida'],['1. Desarrollo','Cambios en rama, revisión y pruebas automatizadas.','Tests OK, sintaxis y revisión funcional.'],['2. Preproducción','Misma arquitectura con datos sintéticos; migraciones y smoke tests.','Aprobación funcional y prueba de aislamiento A/B/C.'],['3. Imagen','Build Docker, escaneo de dependencias/imagen, publicación en ECR por commit.','Tag inmutable y reporte de build.'],['4. Migración','Tarea puntual antes del despliegue; nunca desde todas las réplicas.','schema_migrations actualizado y respaldo previo.'],['5. Producción','Rolling o blue/green según madurez; health/readiness y rollback definido.','Versión desplegada, métricas normales y smoke test.'],['6. Continuidad','Backups, restauración trimestral, runbook, RPO/RTO y simulacro.','Acta de restauración y acciones de mejora.']],[28*mm,95*mm,47*mm]))
s += [Spacer(1,8),callout('<b>La arquitectura queda lista para automatizarse, no desplegada por sí sola.</b> El repositorio prepara Docker, ECS, variables, migraciones y pipeline base. Se deben crear cuenta, IAM, DNS, certificados, servicios, secretos, alarmas y pruebas de recuperación con credenciales reales.'),PageBreak()]

s += heading('10. Observabilidad, soporte y gobierno','Operación diaria')
s.append(tbl([['Dominio','Implementar y operar'],['Disponibilidad','Alarmas por 5xx, healthcheck fallido, tareas ECS bajo mínimo, latencia ALB y errores de autenticación.'],['Base de datos','Métricas de conexiones, CPU, almacenamiento, slow queries, backup exitoso y replicación/Multi-AZ.'],['Archivos','Alertas por antivirus fallido, archivos en cuarentena, errores de S3 y URLs firmadas denegadas.'],['Aplicación','Logs estructurados con request_id, tenant_id pseudonimizado, endpoint, tiempo, código y error; sin secretos ni documentos.'],['Auditoría','Revisión periódica de cambios sensibles, permisos, exportaciones, restauraciones y restablecimientos.'],['Soporte','Tickets por tenant, prioridad, dueño, SLA, bitácora y comunicación con cliente.']],[37*mm,133*mm]))
s += [Spacer(1,8),callout('Definir responsables: dueño de plataforma, responsable de seguridad, responsable de datos personales, soporte de primer nivel y contacto de incidente. La herramienta registra información; la operación requiere personas y un procedimiento activo.',PRIMARY),PageBreak()]

s += heading('11. Estado de preparación productiva','Decisión informada')
s.append(tbl([['Área','Estado del repositorio','Condición para declarar producción'],['Aplicación y módulos','Base funcional amplia: comercial, personas, operación, cumplimiento, activos, libro de obra y reportes.','QA de flujos críticos por plan y autorización de negocio.'],['Multiempresa','tenant_id, RLS, roles, configuración por tenant y pruebas automatizadas.','Prueba E2E con tres clientes y datos reales controlados.'],['Seguridad','Sesiones seguras, MFA exigible, CSRF, validaciones, auditoría y secretos cifrables.','MFA, pentest, CSP revisada, WAF y procedimiento de incidente.'],['Datos / archivos','Migraciones, reglas de integridad y conectores S3/antivirus preparados.','RDS y S3 reales, cifrado, AV, backups/restauración y lifecycle.'],['Integraciones','Rutas y eventos para SMTP, WhatsApp, firma, OCR, ERP y acreditación.','Contratos, credenciales, sandbox, webhooks y monitoreo validados.'],['Infraestructura','Docker, Compose, plantilla ECS, variables y pipeline base disponibles.','AWS con IAM, red, dominio, alarmas, staging y runbook probado.']],[33*mm,67*mm,70*mm]))
s += [Spacer(1,9),card('Dictamen','<b>Preparada para implementación productiva controlada.</b> La plataforma no debe declararse operativa para clientes reales hasta completar las configuraciones externas y las pruebas de seguridad, recuperación, integraciones y aislamiento descritas en este documento.',WARN),PageBreak()]

s += heading('12. Backlog priorizado para la salida','Cierre de brechas')
s.append(tbl([['Prioridad','Iniciativa','Resultado verificable'],['P0','Crear ambientes dev, staging y producción separados; CI obligatorio antes del despliegue.','No hay cambios directos a producción sin pruebas y aprobación.'],['P0','Desplegar RDS privado, S3 cifrado/versionado, Secrets Manager, ECS Multi-AZ, HTTPS y MFA.','Arquitectura base operando con acceso mínimo y datos separados.'],['P0','Configurar antivirus, backups, restauración de ensayo, CloudWatch y alertas de caída.','Evidencia de restauración y notificación de incidente.'],['P0','Pentest externo, revisión IAM, prueba de aislamiento y validación Ley 21.719.','Informe de seguridad y plan de remediación aceptado.'],['P1','Conectar firma, OCR, QR, emisor y score documental; mantener revisión humana final.','Flujo documental con proveedor real y trazabilidad de decisión.'],['P1','Normalizar progresivamente entidades críticas, reporting y API pública por dominio.','Consultas, BI e integraciones confiables y escalables.'],['P1','Definir RPO/RTO, DRP, ownership de alertas y mesa de soporte.','Runbook, simulacro y responsables activos.'],['P2','Autoescalado fino, WAF, rotación de secretos y evaluación de Aurora si la carga lo exige.','Optimización por métrica, costo y nivel de servicio.']],[21*mm,92*mm,57*mm]))
s += [Spacer(1,9),callout('<b>Siguiente hito sugerido:</b> sesión de arquitectura con AWS e integrador para completar checklist de preproducción, asignar responsables, levantar la cuenta cloud y ejecutar el primer despliegue en staging antes de habilitar clientes comerciales.',colors.HexColor('#00706A'))]

doc=SimpleDocTemplate(str(OUT),pagesize=A4,rightMargin=20*mm,leftMargin=20*mm,topMargin=18*mm,bottomMargin=20*mm,title='Nexo Klar - Assessment de arquitectura productiva v5',author='Nexo Klar SPA')
doc.build(s,onFirstPage=footer,onLaterPages=footer)
print(OUT)
