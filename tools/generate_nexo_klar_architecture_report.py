#!/usr/bin/env python3
"""Professional technical report for the current and target Nexo Klar architecture."""
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Flowable, HRFlowable

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'Informe_Tecnico_Profesional_Arquitectura_Nexo_Klar_v7.pdf'

INK = colors.HexColor('#141A20'); MUTED = colors.HexColor('#5D6B7A'); PRIMARY = colors.HexColor('#2A2A8C')
DEEP = colors.HexColor('#1A1A5E'); TEAL = colors.HexColor('#00CFC1'); TEAL_D = colors.HexColor('#00706A')
LINE = colors.HexColor('#E3DED2'); ALT = colors.HexColor('#FBF9F5'); PALE = colors.HexColor('#F0F0FA')
GREEN = colors.HexColor('#1B7F4B'); AMBER = colors.HexColor('#C77700'); RED = colors.HexColor('#B3261E')
PW, PH = A4

styles = getSampleStyleSheet()
for n, f, fs, ld, col, sb, sa in [
 ('Kicker','Helvetica-Bold',9,12,TEAL_D,0,10), ('NKTitle','Helvetica-Bold',31,37,INK,0,12),
 ('Sub','Helvetica',13,19,MUTED,0,15), ('H1N','Helvetica-Bold',20,25,INK,0,9),
 ('H2N','Helvetica-Bold',12.5,16,DEEP,8,5), ('BodyN','Helvetica',9.1,13.5,INK,0,7),
 ('SmallN','Helvetica',7.45,10.2,MUTED,0,4), ('CardN','Helvetica-Bold',10.2,13,INK,0,3),
 ('CallN','Helvetica',8.8,12.5,INK,0,0)]:
    styles.add(ParagraphStyle(name=n, fontName=f, fontSize=fs, leading=ld, textColor=col, spaceBefore=sb, spaceAfter=sa))

def p(text, style='BodyN'): return Paragraph(text, styles[style])
def section(title, kicker):
    return [p(kicker.upper(), 'Kicker'), p(title, 'H1N'), HRFlowable(width='100%', thickness=1, color=LINE, spaceAfter=10)]
def callout(text, color=TEAL):
    t = Table([[p(text,'CallN')]], colWidths=[170*mm])
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),colors.HexColor('#EAFBF9')),('LINEBEFORE',(0,0),(0,0),4,color),('BOX',(0,0),(-1,-1),.35,colors.HexColor('#BDEDE8')),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
    return t
def card(title, text, color=PRIMARY):
    t = Table([[p(title,'CardN'), p(text,'SmallN')]], colWidths=[44*mm,126*mm])
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(0,0),PALE),('LINEBEFORE',(0,0),(0,0),3,color),('BOX',(0,0),(-1,-1),.45,LINE),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)]))
    return t
def grid(rows, widths):
    rows = [[x if hasattr(x,'wrap') else p(str(x),'SmallN') for x in row] for row in rows]
    t = Table(rows, colWidths=widths, repeatRows=1, hAlign='LEFT')
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),.35,LINE),('BACKGROUND',(0,0),(-1,0),DEEP),('TEXTCOLOR',(0,0),(-1,0),colors.white),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
    return t

class Diagram(Flowable):
    def __init__(self, kind):
        super().__init__(); self.kind=kind; self.width=170*mm; self.height=118*mm
    def wrap(self, aw, ah): return self.width, self.height
    def node(self,c,x,y,w,h,title,details,fill=colors.white,stroke=PRIMARY):
        c.setFillColor(fill); c.setStrokeColor(stroke); c.setLineWidth(1); c.roundRect(x,y,w,h,5,fill=1,stroke=1)
        c.setFillColor(INK); c.setFont('Helvetica-Bold',7.7); c.drawCentredString(x+w/2,y+h-13,title)
        c.setFillColor(MUTED); c.setFont('Helvetica',6.1)
        for i,line in enumerate(details.split('|')): c.drawCentredString(x+w/2,y+h-24-i*7.5,line)
    def arrow(self,c,a,b,d,e,col=PRIMARY):
        import math
        c.setStrokeColor(col); c.setLineWidth(1.05); c.line(a,b,d,e); ang=math.atan2(e-b,d-a); z=5
        c.line(d,e,d-z*math.cos(ang-.45),e-z*math.sin(ang-.45)); c.line(d,e,d-z*math.cos(ang+.45),e-z*math.sin(ang+.45))
    def draw(self):
        c=self.canv; c.saveState(); c.setFillColor(colors.HexColor('#FCFBFE')); c.setStrokeColor(LINE); c.roundRect(0,0,self.width,self.height,7,fill=1,stroke=1)
        if self.kind == 'software':
            self.node(c,10,285,125,35,'Experiencia de usuario','Sitio público + espacio privado|HTML · CSS · JavaScript',colors.white)
            self.node(c,180,285,125,35,'Cliente cloud','cloud-client.js|sesión + API REST',PALE)
            self.node(c,350,285,120,35,'Navegación funcional','módulos y permisos|por empresa',colors.white)
            self.node(c,10,210,145,40,'Express 5 · Node 20+','servidor estático|API /api/*',PALE)
            self.node(c,180,210,125,40,'Middleware de seguridad','Helmet · CSRF · origen|MFA · roles',colors.HexColor('#F5F9F5'),GREEN)
            self.node(c,330,210,140,40,'Rutas de negocio','auth · state · files · usuarios|operación · auditoría · libro',PALE)
            self.node(c,10,116,145,50,'PostgreSQL 15+','21 migraciones|tenant_id · RLS · auditoría',colors.HexColor('#EEF6FF'))
            self.node(c,180,116,125,50,'Estado y entidades','módulos versionados|tablas normalizadas',colors.HexColor('#EEF6FF'))
            self.node(c,330,116,140,50,'Persistencia documental','file_objects · SHA-256|local dev / S3 prod',colors.HexColor('#EEF6FF'))
            self.node(c,10,35,220,42,'Procesos internos','notificaciones programadas|correo · WhatsApp · informes',colors.HexColor('#F5F9F5'),TEAL_D)
            self.node(c,260,35,210,42,'Integraciones preparadas','firma · OCR/IA · antivirus · ERP|webhooks y eventos auditados',colors.HexColor('#F5F9F5'),TEAL_D)
            for x in [(135,302,180,302),(305,302,350,302),(73,285,82,250),(242,285,242,250),(410,285,400,250),(82,210,82,166),(242,210,242,166),(400,210,400,166),(100,116,100,77),(400,116,400,77),(230,137,180,137),(305,137,330,137)]: self.arrow(c,*x)
        elif self.kind == 'functional':
            self.node(c,10,285,105,37,'1. Prospecto','oportunidad|contacto y seguimiento',colors.white)
            self.node(c,135,285,105,37,'2. Cliente','empresa, contactos|ubicaciones',colors.white)
            self.node(c,260,285,105,37,'3. Contrato','vigencia, alcance|firma y anexos',colors.white)
            self.node(c,385,285,85,37,'4. Orden','servicio|hitos y estado',colors.white)
            self.node(c,10,204,105,44,'Personas','fijas, proyecto|disponibles y restringidas',PALE)
            self.node(c,135,204,105,44,'Cumplimiento','documentos, cursos|exámenes, credenciales',PALE)
            self.node(c,260,204,105,44,'Recursos','EPP, activos, turnos|vehículos, alojamiento',PALE)
            self.node(c,385,204,85,44,'Terceros','subcontratos|habilitación',PALE)
            self.node(c,10,110,150,49,'Ejecución controlada','centro operativo|asistencia, inventario, costos',colors.HexColor('#EEF6FF'))
            self.node(c,180,110,135,49,'Evidencia y calidad','libro de obra, incidentes|CAPA, auditoría',colors.HexColor('#EEF6FF'))
            self.node(c,335,110,135,49,'Comunicación','convocatorias, alertas|firma y notificación',colors.HexColor('#EEF6FF'))
            self.node(c,10,32,460,42,'Decisión y gobierno','panel general · reportes y analítica · bitácora de cambios · privacidad · usuarios y permisos|datos trazables por cliente, contrato, orden, persona y recurso',colors.HexColor('#F5F9F5'),TEAL_D)
            for x in [(115,303,135,303),(240,303,260,303),(365,303,385,303),(427,285,427,248),(60,285,60,248),(185,285,185,248),(310,285,310,248),(60,204,85,159),(185,204,245,159),(310,204,245,159),(427,204,402,159),(85,110,85,74),(247,110,247,74),(402,110,402,74)]: self.arrow(c,*x)
        else:
            self.node(c,10,285,110,35,'Usuarios','HTTPS · MFA|dominio y WAF',colors.white)
            self.node(c,150,285,110,35,'CloudFront','público y assets|caché controlada',colors.white,TEAL_D)
            self.node(c,290,285,80,35,'CI/CD','tests|build y ECR',colors.white)
            self.node(c,390,285,80,35,'Monitoreo','alertas|respuesta',colors.white,TEAL_D)
            self.node(c,10,205,110,43,'ALB + ACM','TLS · rutas|healthcheck',PALE)
            self.node(c,150,205,110,43,'ECS Fargate','2+ tareas privadas|API + worker',PALE)
            self.node(c,290,205,80,43,'Secrets','claves y|tokens',PALE)
            self.node(c,390,205,80,43,'CloudWatch','logs|métricas',PALE)
            self.node(c,10,110,140,53,'RDS PostgreSQL','Multi-AZ · cifrado|backup y PITR · RLS',colors.HexColor('#EEF6FF'))
            self.node(c,180,110,140,53,'S3 privado','SSE · versionado|lifecycle · AV',colors.HexColor('#EEF6FF'))
            self.node(c,350,110,120,53,'Red segura','VPC · subredes|SG mínimo · NAT',colors.HexColor('#EEF6FF'))
            self.node(c,10,32,460,42,'Proveedores externos y continuidad','firma electrónica · OCR/IA · antivirus · SMTP · WhatsApp · ERP · acreditación|webhooks, colas/reintentos, runbook, restauración y simulacro',colors.HexColor('#F5F9F5'),TEAL_D)
            for x in [(120,302,150,302),(260,302,290,302),(370,302,390,302),(65,285,65,248),(205,285,205,248),(330,285,330,248),(430,285,430,248),(65,205,80,163),(205,205,250,163),(430,205,410,163),(80,110,80,74),(250,110,250,74),(410,110,410,74)]: self.arrow(c,*x)
        c.restoreState()

def footer(c,doc):
    c.saveState(); c.setStrokeColor(LINE); c.line(20*mm,14*mm,PW-20*mm,14*mm); c.setFont('Helvetica',7.1); c.setFillColor(MUTED)
    c.drawString(20*mm,9*mm,'NEXO KLAR SPA · Informe técnico de arquitectura · Confidencial'); c.drawRightString(PW-20*mm,9*mm,f'Página {doc.page}'); c.restoreState()

s=[]
s += [Spacer(1,33*mm),p('NEXO KLAR SPA · INFORME TÉCNICO PROFESIONAL','Kicker'),p('Arquitectura de software, funcional y objetivo de producción','NKTitle'),p('Diseño consolidado de la plataforma Nexo Klar: componentes actuales, separación multiempresa, modelo operativo, seguridad, datos, integraciones y arquitectura productiva.', 'Sub'),Spacer(1,6*mm)]
s += [card('Propósito del informe','Servir como documento de referencia para directorio, equipo técnico, integrador cloud y potenciales clientes empresariales. Diferencia capacidades implementadas en el repositorio de servicios que necesitan contratación y configuración externa.'),Spacer(1,7*mm)]
s.append(grid([['Referencia','Estado'],['Producto','Nexo Klar Cloud v7.7.0'],['Validación técnica','123 pruebas automatizadas correctas'],['Código oficial','Repositorio GitHub y carpeta oficial de Escritorio'],['Fecha','12 de agosto de 2026'],['Clasificación','Confidencial · uso técnico, comercial y de implementación']],[49*mm,121*mm]))
s += [Spacer(1,13*mm),callout('<b>Dictamen resumido.</b> Nexo Klar tiene una base de software funcional, integrada y multiempresa. Para operar comercialmente como SaaS necesita completar la infraestructura externa, las evidencias de continuidad y los proveedores productivos de seguridad e integración.'),PageBreak()]

s += section('1. Resumen ejecutivo','Visión de arquitectura')
s.append(p('Nexo Klar está diseñado como una plataforma SaaS de control operacional para empresas de servicios. Su arquitectura conecta la relación comercial, las personas, los recursos, la ejecución, el cumplimiento y el gobierno de datos en un espacio aislado por empresa.'))
s.append(grid([['Capa','Responsabilidad','Estado actual'],['Experiencia','Sitio público y aplicación privada, navegación por módulos, formularios, filtros, reportes y control visual.','Implementada'],['Aplicación','Servidor Express, API REST, validación, roles, CSRF, MFA, jobs y reglas de negocio.','Implementada'],['Datos','PostgreSQL, migraciones, RLS, integridad, auditoría, módulos versionados y entidades normalizadas.','Implementada / requiere instancia productiva'],['Documentos','Carga controlada, hash, deduplicación, descarga autorizada y conectores de antivirus/S3.','Preparada para producción'],['Integraciones','Correo, WhatsApp, firma, OCR/IA, ERP y acreditación mediante configuraciones por empresa.','Preparada / requiere proveedor'],['Operación cloud','Docker, Compose, plantilla ECS, health/readiness y variables de entorno productivas.','Preparada / requiere AWS']],[30*mm,89*mm,51*mm]))
s += [Spacer(1,7),callout('<b>Principio de diseño:</b> la información crítica permanece en la empresa, pero se conecta con el cliente, contrato, orden de servicio, persona, recurso y documento correspondiente. No debe depender de planillas aisladas ni de conocimiento personal.'),PageBreak()]

s += section('2. Diagrama de arquitectura de software actual','Cómo está construido hoy')
s.append(p('El navegador carga el sitio público o el espacio privado. La API centraliza autenticación, autorización, datos, archivos, eventos y reglas. La separación por empresa se aplica en la aplicación y en la base de datos.'))
s.append(Diagram('software'))
s += [Spacer(1,7),callout('<b>Implementación actual:</b> interfaz HTML/CSS/JavaScript modular, Express 5 sobre Node.js 20+, PostgreSQL 15+, rutas REST, jobs internos y almacenamiento documental. No es una aplicación React/Vite.',PRIMARY),PageBreak()]

s += section('3. Arquitectura funcional del producto','Cómo se conectan los módulos')
s.append(p('El valor de Nexo Klar está en mantener un flujo continuo. La relación comercial define el contexto; las personas y recursos se habilitan; la ejecución genera evidencia; los paneles consolidan decisiones y control.'))
s.append(Diagram('functional'))
s += [Spacer(1,7),callout('<b>Regla funcional:</b> una orden de servicio puede operar solo cuando sus personas, requisitos, recursos, alojamiento, vehículos, EPP y evidencias necesarias están asociadas y vigentes. Las brechas se reflejan como alertas, restricciones o pendientes operativos.',GREEN),PageBreak()]

s += section('4. Dominios funcionales y responsabilidades','Cobertura de la plataforma')
s.append(grid([['Dominio','Módulos principales','Interacción clave'],['Centro de control','Panel general, alertas, gestión de personal por proyecto, centro operativo.','Consolida disponibilidad, brechas, prioridades y estado de ejecución.'],['Relación comercial','Prospectos, clientes, contratos, firmas, órdenes de servicio.','Cliente → contrato → orden; contexto para personas, costos y documentos.'],['Capital humano','Personas, turnos y asistencia, EPP, formación, exámenes, salud y restringidos.','Habilita o restringe a cada persona según requisitos y asignación.'],['Gestión operacional','Comunicaciones, vehículos, alojamientos, credenciales, terceros, incidentes.','Asigna recursos a órdenes y registra ejecución, tiempo y evidencia.'],['Activos e inventario','Maquinaria, instrumentos, herramientas, EPP, materiales, bodegas, movimientos y mantenimiento.','Controla disponibilidad, costos, préstamos, vida útil y reposición.'],['Cumplimiento y calidad','Documentación corporativa, habilitación del cliente, auditoría, CAPA, libro de obra.','Registra requisitos, revisión, firma, hallazgos, compromisos y cierre.'],['Gobierno','Reportes, configuración, importación/exportación, usuarios, bitácora, privacidad, administración de clientes.','Controla permisos, parámetros, trazabilidad, respaldo y operación SaaS.']],[32*mm,72*mm,66*mm]))
s.append(PageBreak())

s += section('5. Arquitectura multiempresa y separación completa','Seguridad de clientes')
s.append(p('Nexo Klar sigue un modelo multi-tenant con una misma plataforma y datos aislados por empresa. El tenant no se decide en el navegador: surge desde la sesión autenticada y se aplica en cada transacción de base de datos.'))
s.append(grid([['Mecanismo','Diseño técnico','Resultado'],['Identidad de tenant','La sesión enlaza usuario, tenant, rol y estado de cuenta.','No se aceptan tenant_id arbitrarios desde la interfaz.'],['Autorización','Middleware authenticate, allowRoles, requireMfa, requireCsrf y requireOrigin.','Cada acción exige identidad, permiso, MFA y origen válido.'],['RLS','withTenant() fija app.current_tenant_id en la transacción; PostgreSQL aplica políticas RLS y FORCE RLS.','Defensa en profundidad incluso ante consultas incompletas.'],['Archivos','Cada objeto se registra con tenant_id y key tenants/{tenantId}/objects/{sha}.','Descargas y eliminaciones se autorizan por empresa.'],['Configuración','Catálogos, marca, módulos, alertas e integraciones quedan por tenant.','Empresa A parametriza sin modificar Empresa B.'],['Auditoría','Cambios, acciones, integraciones y fallas contienen contexto de tenant y usuario.','Soporte y trazabilidad por cliente.']],[33*mm,82*mm,55*mm]))
s += [Spacer(1,8),card('Validación de aislamiento','La aceptación productiva exige probar con al menos tres empresas: crear datos equivalentes, intentar consulta cruzada, descarga de archivos, cambios de configuración, importación/exportación y URLs manipuladas. El resultado esperado es cero acceso cruzado.',RED),PageBreak()]

s += section('6. Datos, persistencia e integridad','Base técnica de los módulos')
s.append(grid([['Elemento','Diseño actual','Reglas relevantes'],['PostgreSQL','21 migraciones versionadas; pool de conexiones con SSL estricto en producción.','Migración ordenada, readiness y transacciones por tenant.'],['Estado modular','tenant_module_state conserva colecciones funcionales y versión por módulo.','Evita que cambios en un módulo sobrescriban otro; conflicto 409 cuando existe desactualización.'],['Entidades normalizadas','Trabajadores, requisitos, catálogos, estado operativo, vínculos, historial, control de planes y soporte.','Permite integración, auditoría, reportes y evolución gradual.'],['Integridad','RUT, contratos, proyectos, asignaciones, habitaciones, entregas, vehículos y relaciones.','Unicidad por empresa, fechas coherentes y referencias existentes.'],['Auditoría','audit_log, entity_change_history, operational_events e integration_events.','Usuario, fecha, entidad, acción, resumen, evidencia y contexto.'],['Importación/exportación','JSON completo y CSV por entidad con validación.','Detecta duplicados, formato, fechas y referencias antes de confirmar.']],[34*mm,78*mm,58*mm]))
s += [Spacer(1,7),callout('<b>Reglas verificadas por pruebas:</b> se rechazan RUT duplicados incluso con distinto formato, asignaciones duplicadas, contratos/proyectos de otra empresa, alojamientos superpuestos, patentes/series duplicadas y entregas EPP inconsistentes.',GREEN),PageBreak()]

s += section('7. Seguridad de aplicación y protección de datos','Controles técnicos actuales')
s.append(grid([['Control','Implementación en código','Condición productiva'],['Contraseña','scrypt con salt único y política mínima de 12 caracteres.','Mantener política, recuperación controlada y revisión de cuentas comprometidas.'],['MFA','TOTP, códigos de recuperación y MFA_REQUIRED en producción.','Enrolamiento obligatorio, resguardo de recovery codes y soporte seguro.'],['Sesiones','Token aleatorio, hash SHA-256 en BD, cookie HttpOnly, Secure y SameSite Strict.','HTTPS real y revocación ante reinicio de contraseña o incidente.'],['HTTP/API','Helmet, CSP actual, no-store en API, CSRF, origen permitido, roles y límites.','WAF, revisión CSP, pentest y monitoreo de ataques.'],['Archivos','MIME permitido, máximo 25 MB, SHA-256, deduplicación, estado de malware.','Antivirus HTTPS obligatorio, cuarentena y alertas.'],['Secretos','AES-256-GCM para secretos de integración por tenant.','Secrets Manager, IAM mínimo, rotación y prohibición de secretos en Git.'],['Privacidad','Módulo de privacidad, actividad de tratamiento, consentimientos y solicitudes.','Gobierno real de Ley 21.719: responsables, retención, derechos y protocolo de brechas.']],[31*mm,75*mm,64*mm]))
s.append(PageBreak())

s += section('8. Documentos e integraciones','Motor documental y conectores')
s.append(p('Los documentos están diseñados como evidencia controlada. La aplicación conserva archivos, estado y contexto; proveedores externos agregan capacidades de seguridad, firma y validación, sin reemplazar la decisión humana.'))
s.append(grid([['Servicio','Función integrada','Modelo de operación'],['S3 privado','Documentos, contratos, certificados, fotos y evidencias.','Carga vía API, metadatos, hash, tenant_id, cifrado, versionado y acceso autorizado.'],['Antivirus','Evalúa archivos antes de liberarlos.','Producción rechaza carga si el servicio AV no está configurado o disponible.'],['OCR / IA','Extrae fechas, emisor, RUT, QR, campos y señales de consistencia.','Resultado y score auditados; revisión humana final obligatoria.'],['Firma electrónica','Contratos, anexos, actas y libro de obra.','Solicitud por correo/celular, webhook firmado, estado y evidencia.'],['SMTP / WhatsApp','Alertas, convocatorias, vencimientos, firmas e informes.','Configuración por empresa, destinatarios, historial de envío y errores.'],['ERP / acreditación','Costos, órdenes, facturación y habilitación cuando exista API oficial.','Eventos idempotentes, reintentos, auditoría y aprobación técnica/legal.']],[32*mm,61*mm,77*mm]))
s += [Spacer(1,8),callout('<b>Restricción importante:</b> no se debe automatizar un portal de cliente o mandante sin API oficial, autorización contractual y validación de seguridad. Los conectores deben usar webhooks, claves segregadas y auditoría.',AMBER),PageBreak()]

s += section('9. Diagrama de arquitectura productiva objetivo','Cómo debe funcionar en producción')
s.append(p('Esta es la arquitectura recomendada cuando Nexo Klar opere con clientes. Mantiene el acceso público reducido al perímetro HTTPS y deja aplicación, datos y archivos en servicios privados.'))
s.append(Diagram('target'))
s += [Spacer(1,7),callout('<b>Regla de producción:</b> los contenedores no tienen volumen compartido ni secretos en imagen; PostgreSQL y S3 son las fuentes de persistencia; AWS administra red, cifrado, escalamiento, recuperación y monitoreo según configuración aprobada.',PRIMARY),PageBreak()]

s += section('10. Diseño de despliegue y operación AWS','Implementación recomendada')
s.append(grid([['Componente','Diseño objetivo','Prueba de aceptación'],['DNS, ACM y ALB','Dominio HTTPS, certificado administrado, listener 443 y redirección 80→443.','TLS válido, health check operativo y cabeceras seguras.'],['VPC y seguridad','ALB público; ECS y RDS privados; SG por mínimo privilegio; 2 AZ.','No hay RDS/ECS público; solo ALB llega a la API.'],['ECS Fargate','Mínimo dos tareas, health /api/health, readiness /api/ready, rolling deploy.','Escalamiento, rollback y reemplazo automático de tarea fallida.'],['RDS PostgreSQL','PostgreSQL 15+, Multi-AZ, cifrado, backups y point-in-time recovery.','Restauración en ambiente aislado medida y documentada.'],['S3','Block public access, SSE, versionado, lifecycle, IAM por Task Role.','Archivo solo descarga con autorización; se valida versionado y borrado lógico.'],['Secrets Manager','Database URL, clave tenant, métricas, AV, firma, OCR y mensajería.','No hay secreto en repositorio, imágenes, logs o navegador.'],['CloudWatch','Logs estructurados, métricas, dashboards y alarmas.','Alarma 5xx, jobs fallidos, latencia o readiness llega al responsable.'],['CI/CD','Tests, build, escaneo, ECR, migración única, staging y despliegue aprobado.','No se libera un cambio sin pruebas y smoke test.']],[30*mm,82*mm,58*mm]))
s.append(PageBreak())

s += section('11. Diseño operativo de extremo a extremo','Cómo debe funcionar el servicio SaaS')
s.append(grid([['Etapa','Flujo técnico-funcional','Control'],['Ingreso','Usuario de una empresa inicia sesión con MFA y recibe sesión segura.','tenant, rol, permiso, MFA, CSRF y origen.'],['Configuración','Administrador define catálogos, responsables, requisitos y módulos de su empresa.','Configuración aislada y auditada por tenant.'],['Gestión comercial','Se crea prospecto, cliente, contrato y orden de servicio.','Vigencias, responsables, documentos y estado comercial.'],['Habilitación','Se vinculan personas, formación, salud, EPP, recursos y documentos.','Matriz de requisitos, alertas y restricción automática.'],['Ejecución','Centro operativo coordina trabajo; se registran movimientos, asistencia, libro, incidentes y CAPA.','Historial, evidencia, fechas, responsables y firma cuando aplique.'],['Comunicación','Sistema programa correo, WhatsApp, firma, avisos y reportes.','Consentimiento, proveedor, lock, reintento y resultado.'],['Control','Paneles, alertas y reportes consumen datos por empresa, cliente, contrato y orden.','Permisos, filtros, bitácora y exportación validada.'],['Continuidad','Plataforma monitorea salud, errores, backups e integraciones.','Alarmas, runbook, restauración y post-incidente.']],[25*mm,91*mm,54*mm]))
s += [Spacer(1,7),callout('<b>Escalabilidad:</b> una empresa puede tener configuraciones y módulos distintos sin afectar otras. Para solicitudes de personalización comercial, la recomendación es usar catálogos, reglas, campos configurables y feature flags por tenant; no forks de código por cliente.',TEAL_D),PageBreak()]

s += section('12. Pruebas, calidad y trazabilidad','Evidencia actual')
s.append(grid([['Cobertura verificada','Resultado'],['Pruebas automatizadas','123 correctas: seguridad, migraciones, autorización, datos, módulos, QA de menú, flujo operativo, libro de obra, archivos, inventario, EPP, terceros, importación y arquitectura.'],['Multiempresa','Pruebas separan usuarios, datos operacionales, marcas, integraciones, catálogos y módulos por empresa.'],['Integridad','Pruebas rechazan duplicados críticos, relaciones cruzadas y registros huérfanos.'],['Producción','Validación de variables exige HTTPS, secretos fuertes, MFA, S3, token de métricas y antivirus HTTPS.'],['Calidad visual y vocabulario','Pruebas de paridad entre versión local y productiva, navegación agrupada, filtros de personas, sistema visual y terminología unificada.'],['Pendiente externo','Pruebas reales en AWS, proveedor AV, firma, OCR, WhatsApp, SMTP, monitoreo, restauración y pentest.']],[52*mm,118*mm]))
s += [Spacer(1,8),callout('<b>Importante:</b> las pruebas de código validan comportamiento interno. Las pruebas de infraestructura y proveedores deben ejecutarse con recursos reales antes de vender la operación como completamente productiva.',AMBER),PageBreak()]

s += section('13. Matriz de preparación productiva','Decisión y backlog')
s.append(grid([['Prioridad','Acción','Resultado esperado'],['P0','Crear dev, staging y producción independientes; configurar AWS, DNS, TLS, IAM, RDS, S3 y Secrets Manager.','Entorno productivo aislado y reproducible.'],['P0','Habilitar MFA, antivirus, backups, restauración, CloudWatch, alertas y runbook.','Servicio seguro, recuperable y monitoreado.'],['P0','Ejecutar prueba de aislamiento con tres empresas, prueba de recuperación y pentest externo.','Evidencia de seguridad y continuidad antes de datos reales.'],['P1','Conectar firma, OCR, QR, emisor, foto e integraciones con proveedores contratados.','Flujo documental inteligente con revisión humana y trazabilidad.'],['P1','Desacoplar worker de jobs y usar EventBridge/SQS cuando aumente volumen.','Notificaciones y tareas escalables, con reintentos robustos.'],['P1','Extender entidades normalizadas y APIs por dominio para BI e integraciones de alto volumen.','Reportes y conectores más eficientes y mantenibles.'],['P2','Agregar SSO corporativo, WAF avanzado, rotación automática de secretos y evaluación Aurora.','Madurez enterprise según demanda y SLA.']],[22*mm,88*mm,60*mm]))
s += [Spacer(1,9),card('Conclusión final','<b>Nexo Klar está diseñado como una plataforma SaaS multiempresa con una base funcional sólida.</b> La arquitectura de software, datos, seguridad y módulos ya soporta la operación integrada. La siguiente fase debe concentrarse en ejecutar la arquitectura cloud objetivo, validar proveedores reales y reunir evidencia de continuidad para ofrecer el servicio en producción con confianza.',AMBER)]

doc=SimpleDocTemplate(str(OUT),pagesize=A4,leftMargin=20*mm,rightMargin=20*mm,topMargin=18*mm,bottomMargin=20*mm,title='Nexo Klar - Informe técnico profesional de arquitectura v7',author='Nexo Klar SPA')
doc.build(s,onFirstPage=footer,onLaterPages=footer)
print(OUT)
