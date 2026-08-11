#!/usr/bin/env python3
"""Nexo Klar technical architecture assessment with current and target diagrams."""
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Flowable, HRFlowable

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'Nexo_Klar_Arquitectura_Tecnica_y_Objetivo_Operativo_v6.pdf'
INK=colors.HexColor('#141A20'); MUTED=colors.HexColor('#5D6B7A'); PRIMARY=colors.HexColor('#2A2A8C'); DEEP=colors.HexColor('#1A1A5E')
ACCENT=colors.HexColor('#00CFC1'); ACCENT_D=colors.HexColor('#00706A'); LINE=colors.HexColor('#E3DED2'); ALT=colors.HexColor('#FBF9F5')
GREEN=colors.HexColor('#1B7F4B'); ORANGE=colors.HexColor('#C77700'); RED=colors.HexColor('#B3261E'); BLUEBG=colors.HexColor('#F0F0FA')
W,H=A4
styles=getSampleStyleSheet()
for n,f,fs,l,c,b,a in [('TK','Helvetica-Bold',9,12,ACCENT_D,0,10),('TT','Helvetica-Bold',32,38,INK,0,12),('TS','Helvetica',13,19,MUTED,0,14),('TH1','Helvetica-Bold',20,25,INK,0,9),('TH2','Helvetica-Bold',12.5,16,DEEP,8,5),('TB','Helvetica',9.2,13.6,INK,0,7),('Tsm','Helvetica',7.5,10.1,MUTED,0,4),('Tcard','Helvetica-Bold',10.2,13,INK,0,3),('Tcall','Helvetica',8.9,12.7,INK,0,0)]:
    styles.add(ParagraphStyle(name=n,fontName=f,fontSize=fs,leading=l,textColor=c,spaceBefore=b,spaceAfter=a))
def p(x,s='TB'): return Paragraph(x,styles[s])
def table(rows,widths):
    r=[[x if hasattr(x,'wrap') else p(x,'Tsm') for x in row] for row in rows]
    t=Table(r,colWidths=widths,repeatRows=1,hAlign='LEFT')
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),.35,LINE),('BACKGROUND',(0,0),(-1,0),DEEP),('TEXTCOLOR',(0,0),(-1,0),colors.white),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]));return t
def callout(text,color=ACCENT):
    t=Table([[p(text,'Tcall')]],colWidths=[170*mm])
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),colors.HexColor('#EAFBF9')),('LINEBEFORE',(0,0),(0,0),4,color),('BOX',(0,0),(-1,-1),.35,colors.HexColor('#BDEDE8')),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]));return t
def card(title,text,color=PRIMARY):
    t=Table([[p(title,'Tcard'),p(text,'Tsm')]],colWidths=[43*mm,127*mm])
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(0,0),BLUEBG),('LINEBEFORE',(0,0),(0,0),3,color),('BOX',(0,0),(-1,-1),.45,LINE),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)]));return t
def section(title,kicker): return [p(kicker.upper(),'TK'),p(title,'TH1'),HRFlowable(width='100%',thickness=1,color=LINE,spaceAfter=10)]

class ArchitectureDiagram(Flowable):
    def __init__(self, mode):
        super().__init__(); self.mode=mode; self.width=170*mm; self.height=117*mm
    def wrap(self,aw,ah): return self.width,self.height
    def box(self,c,x,y,w,h,title,sub,fill=colors.white,stroke=PRIMARY):
        c.setFillColor(fill); c.setStrokeColor(stroke); c.setLineWidth(1); c.roundRect(x,y,w,h,5,fill=1,stroke=1)
        c.setFillColor(INK); c.setFont('Helvetica-Bold',8); c.drawCentredString(x+w/2,y+h-14,title)
        c.setFillColor(MUTED); c.setFont('Helvetica',6.4)
        lines=sub.split('|')
        for i,line in enumerate(lines): c.drawCentredString(x+w/2,y+h-25-i*8,line)
    def arrow(self,c,x1,y1,x2,y2):
        c.setStrokeColor(PRIMARY);c.setLineWidth(1.1);c.line(x1,y1,x2,y2); import math; a=math.atan2(y2-y1,x2-x1);d=5
        c.line(x2,y2,x2-d*math.cos(a-.45),y2-d*math.sin(a-.45));c.line(x2,y2,x2-d*math.cos(a+.45),y2-d*math.sin(a+.45))
    def draw(self):
        c=self.canv; c.saveState(); c.setStrokeColor(LINE); c.setFillColor(colors.HexColor('#FCFBFE'));c.roundRect(0,0,self.width,self.height,7,fill=1,stroke=1)
        if self.mode=='current':
            self.box(c,11,285,130,33,'Usuarios y navegador','Sitio público + aplicación privada|HTTPS / cookies seguras',colors.white)
            self.box(c,196,285,130,33,'Express · Node 20+','Servidor estático + API /api|Helmet, origen, CSRF, MFA',BLUEBG)
            self.box(c,381,285,90,33,'Jobs internos','Notificaciones|cada 15–60 s',colors.white,ACCENT_D)
            self.box(c,11,205,132,40,'Autenticación y roles','Sesiones hash · scrypt · TOTP|roles y permisos por empresa',colors.white)
            self.box(c,196,205,132,40,'Rutas de dominio','estado · usuarios · archivos|operación · libro · privacidad',colors.white)
            self.box(c,381,205,90,40,'Conectores','SMTP · WhatsApp|firma · OCR · ERP',colors.white,ACCENT_D)
            self.box(c,11,111,145,49,'PostgreSQL 15+','21 migraciones · tenant_id|RLS + FORCE RLS|auditoría y versionado',colors.HexColor('#EEF6FF'))
            self.box(c,187,111,130,49,'Datos funcionales','tenant_module_state + tablas|normalizadas y catálogos',colors.HexColor('#EEF6FF'))
            self.box(c,348,111,123,49,'Archivos','local en desarrollo|S3 privado en producción',colors.HexColor('#EEF6FF'))
            self.box(c,11,33,220,36,'Controles de integridad','RUT único · referencias · fechas · sanitización|concurrencia optimista por módulo',colors.HexColor('#F5F9F5'),GREEN)
            self.box(c,260,33,211,36,'Observabilidad disponible','/health · /ready · /metrics · logs JSON|operational_events · audit_log',colors.HexColor('#F5F9F5'),GREEN)
            for a in [(141,301,196,301),(326,301,381,301),(76,285,76,245),(261,285,261,245),(426,285,426,245),(76,205,83,160),(261,205,252,160),(426,205,410,160),(156,135,187,135),(317,135,348,135),(121,111,121,69),(365,111,365,69)]: self.arrow(c,*a)
        else:
            self.box(c,10,285,130,34,'Usuarios / clientes','Dominio HTTPS · MFA|WAF y rate limiting',colors.white)
            self.box(c,190,285,130,34,'CloudFront / CDN','Sitio público y estáticos|caché e invalidación',colors.white,ACCENT_D)
            self.box(c,370,285,100,34,'GitHub Actions','tests · build · ECR|aprobación',colors.white)
            self.box(c,10,207,130,40,'ALB + ACM','TLS · healthcheck|subredes públicas',BLUEBG)
            self.box(c,190,207,130,40,'ECS Fargate x2+','Express · jobs desacoplados|subredes privadas / 2 AZ',BLUEBG)
            self.box(c,370,207,100,40,'Secrets Manager','DB · claves tenant|tokens externos',BLUEBG)
            self.box(c,10,114,130,51,'RDS PostgreSQL','Multi-AZ · backups|RLS y cifrado',colors.HexColor('#EEF6FF'))
            self.box(c,190,114,130,51,'S3 privado','SSE · versionado|lifecycle · AV',colors.HexColor('#EEF6FF'))
            self.box(c,370,114,100,51,'CloudWatch','logs · métricas|alarmas y tableros',colors.HexColor('#EEF6FF'))
            self.box(c,10,33,460,40,'Servicios externos gobernados','Firma electrónica · OCR/IA · antivirus · SMTP · WhatsApp · ERP · acreditación|Webhooks validados, eventos idempotentes, trazabilidad y revisión humana',colors.HexColor('#F5F9F5'),ACCENT_D)
            for a in [(140,302,190,302),(75,285,75,247),(255,285,255,247),(420,285,420,247),(140,227,190,227),(320,227,370,227),(75,207,75,165),(255,207,255,165),(420,207,420,165),(75,114,75,73),(255,114,255,73),(420,114,420,73)]: self.arrow(c,*a)
        c.restoreState()

def footer(c,doc):
    c.saveState();c.setStrokeColor(LINE);c.line(20*mm,14*mm,W-20*mm,14*mm);c.setFont('Helvetica',7.1);c.setFillColor(MUTED);c.drawString(20*mm,9*mm,'NEXO KLAR SPA · Arquitectura técnica y objetivo operativo · Confidencial');c.drawRightString(W-20*mm,9*mm,f'Página {doc.page}');c.restoreState()

s=[]
s += [Spacer(1,34*mm),p('NEXO KLAR SPA · ARQUITECTURA TÉCNICA','TK'),p('Arquitectura funcional actual y objetivo operativo','TT'),p('Documento técnico consolidado: repositorio, módulos, datos, separación multiempresa, controles, operación cloud y arquitectura objetivo.','TS'),Spacer(1,7*mm),card('Alcance','Describe lo que funciona hoy en el código de Nexo Klar y cómo debe quedar la plataforma cuando AWS, monitoreo, continuidad e integraciones estén operativos. No asume servicios externos no configurados.'),Spacer(1,7*mm)]
s.append(table([['Referencia','Valor'],['Versión funcional','Nexo Klar Cloud 7.7.0'],['Backend','Node.js 20+ · Express 5 · API REST'],['Persistencia','PostgreSQL 15+ · 21 migraciones · RLS'],['Archivos','S3 privado preparado para producción; disco local solo en desarrollo'],['Seguridad','scrypt, sesión hash, cookie segura, CSRF, MFA obligatorio en producción'],['Fecha','11 de agosto de 2026']],[47*mm,123*mm]))
s += [Spacer(1,13*mm),callout('<b>Lectura técnica.</b> El repositorio ya contiene una plataforma multiempresa operativa y validaciones automatizadas. “Objetivo operativo” significa que la infraestructura AWS, proveedores externos y controles de continuidad se han configurado y probado con cuentas reales.'),PageBreak()]

s += section('1. Arquitectura funcional que opera hoy','Componentes reales del repositorio')
s.append(p('La aplicación se ejecuta como un servicio Express que entrega la interfaz desde <b>public/</b> y expone una API bajo <b>/api</b>. La interfaz usa HTML, CSS y JavaScript modular; no corresponde a una aplicación React/Vite.'))
s.append(ArchitectureDiagram('current'))
s += [Spacer(1,7),callout('<b>Flujo de datos actual:</b> la sesión valida identidad y tenant; el middleware exige origen, CSRF y MFA; la ruta de negocio ejecuta una transacción con contexto de tenant; PostgreSQL aplica RLS; las operaciones relevantes generan auditoría y eventos de error.',PRIMARY),PageBreak()]

s += section('2. Servicios y rutas que funcionan hoy','Aplicación privada y administración')
s.append(table([['Área API','Uso funcional','Controles'],['/api/auth','inicio de sesión, MFA, recuperación, sesiones y registro controlado','contraseña scrypt, rate limit, TOTP, cookies HttpOnly'],['/api/state','estado modular por empresa y concurrencia optimista','versión por módulo, conflictos 409, RLS'],['/api/users y /api/tenants','usuarios, roles, clientes SaaS y gobierno Domian','roles, tenant, auditoría y suspensión lógica'],['/api/files','carga, descarga y baja lógica de evidencias','MIME permitido, 25 MB, SHA-256, deduplicación, AV requerido en producción'],['/api/operations','operación, recursos, costos, inventario, notificaciones y eventos','transacciones, tenant_id, auditoría'],['/api/work-books','libro de obra, anotaciones, firmantes y callbacks de firma','folio, estado, adjuntos, proveedor configurado'],['/api/privacy y /api/audit','gobierno de datos, evidencias y bitácora','roles, histórico append-only'],['/api/integrations y /api/settings','secretos por empresa, conectores y catálogos','AES-256-GCM para secretos de integraciones'],['/api/data-transfer','importación, exportación y plantillas','validaciones, duplicados, relaciones y registro de evento']],[33*mm,78*mm,59*mm]))
s += [Spacer(1,8),p('<b>Planificador interno:</b> procesa notificaciones configuradas por empresa, correos SMTP, WhatsApp, informes programados y errores de entrega. Usa locks de trabajos para evitar que una tarea se ejecute dos veces mientras está en curso.'),PageBreak()]

s += section('3. Arquitectura de datos y separación de clientes','Aislamiento real por tenant')
s.append(table([['Capa de aislamiento','Mecanismo implementado','Efecto'],['Identidad','RUT de empresa + usuario + sesión revocable','la API deriva empresa y rol desde la sesión, no desde el navegador'],['Aplicación','authenticate, requireMfa, requireCsrf, requireOrigin, allowRoles','ninguna ruta privada opera sin sesión y control correspondiente'],['Transacción','withTenant() abre BEGIN y establece app.current_tenant_id','toda consulta tenant-aware corre dentro de contexto explícito'],['PostgreSQL','tenant_id, políticas RLS y FORCE ROW LEVEL SECURITY','la BD filtra incluso si una consulta olvida una condición de empresa'],['Archivos','clave tenants/{tenantId}/objects/{sha} y metadatos tenant_id','una empresa no debe descargar el archivo de otra'],['Configuración','tenant_settings, catálogos, integraciones y perfil comercial por tenant','cada empresa parametriza sin cambiar vistas, listas o secretos de otras'],['Auditoría','audit_log, entity_change_history, integration_events y operational_events','cada cambio queda asociado a empresa, usuario y entidad']],[36*mm,78*mm,56*mm]))
s += [Spacer(1,8),card('Prueba E2E imprescindible','Empresa A, B y C deben cargar clientes, personas, archivos, inventario y exportaciones. Desde cada cuenta se valida ausencia total de datos ajenos, incluso con ID manipulado, URL de archivo o solicitud de exportación.',RED),PageBreak()]

s += section('4. Datos, dominios y reglas de integridad','Fundación funcional')
s.append(table([['Dominio','Datos principales','Reglas y relación'],['Comercial','prospectos, clientes, contratos, firmas, órdenes de servicio','cliente → contrato → orden; vigencia, responsable, presupuesto y documentos'],['Personas','trabajadores fijos, por proyecto, disponibles, subcontratos','RUT único por empresa, estado operativo, asignación, restricciones y trayectoria'],['Cumplimiento','documentos, cursos, exámenes, salud, credenciales, habilitación','matriz de requisitos por cliente/contrato/orden/cargo; vencimientos y bloqueo'],['Recursos','EPP, vehículos, maquinaria, equipos, bodega, alojamiento, turnos','asignaciones, stock, movimientos, vida útil, disponibilidad y costos'],['Operación','libro de obra, incidentes, CAPA, comunicaciones, horas y evidencias','folio, responsable, compromiso, firma, observaciones, historial y cierre'],['Gobierno','usuarios, permisos, catálogos, privacidad, auditoría, tickets','parámetros, conservación, cambios, soporte y administración global']],[31*mm,71*mm,68*mm]))
s += [Spacer(1,6),callout('<b>Reglas implementadas:</b> RUT único por empresa, referencias válidas entre entidades, fechas coherentes, bloqueo de contenido HTML ejecutable, archivos Base64 no persistidos, hashes de archivos y control de versión optimista por módulo.',GREEN),PageBreak()]

s += section('5. Seguridad actual y cierre necesario','Protección por capas')
s.append(table([['Control','Funcionando hoy','Para operar producción'],['Credenciales','scrypt N=16384, r=8, p=1; mínimo 12 caracteres con mayúscula, minúscula y número.','política de credenciales comprometidas, procedimiento de soporte y revisión de tasas'],['MFA','TOTP de 6 dígitos, códigos de recuperación, MFA_REQUIRED exigido en validación productiva.','enrolamiento guiado, resguardo de recuperación y simulacro de pérdida'],['Sesiones','token aleatorio hash SHA-256, expiración, revocación, cookie HttpOnly/Secure/SameSite Strict.','HTTPS real, monitoreo de sesiones anómalas y cierre por incidente'],['API','Helmet, CSP actual, límite JSON 8 MB, CSRF, validación de origen y roles.','CSP sin unsafe-inline donde sea viable, WAF, pentest y revisión OWASP'],['Archivos','lista de MIME, máximo 25 MB, SHA-256, almacenamiento seguro y estado malware.','proveedor AV operativo, cuarentena, reescaneo, alertas y lifecycle'],['Secretos','AES-256-GCM para secretos por tenant; entorno valida TENANT_SECRET_KEY.','AWS Secrets Manager, rotación, IAM mínimo y no registrar secretos en logs']],[31*mm,72*mm,67*mm]))
s += [Spacer(1,8),callout('<b>Protección de datos.</b> La plataforma tiene controles técnicos, pero la operación debe implementar inventario de tratamientos, base jurídica, periodos de retención, derechos de titulares, respuesta a brechas y responsables conforme a Ley 21.719.',ORANGE),PageBreak()]

s += section('6. Diagrama: arquitectura objetivo totalmente operativa','AWS, continuidad e integraciones')
s.append(p('El siguiente diagrama representa la configuración objetivo. No debe afirmarse como desplegada hasta contar con una cuenta AWS, recursos, certificados, secretos, proveedores externos y evidencias de pruebas de recuperación.'))
s.append(ArchitectureDiagram('target'))
s += [Spacer(1,7),callout('<b>Principio de operación:</b> un solo punto público HTTPS; servicios y datos en subredes privadas; acceso IAM mínimo; dos zonas de disponibilidad; secretos centralizados; documentos cifrados; observabilidad y alertas proactivas.',PRIMARY),PageBreak()]

s += section('7. Diseño funcional completo cuando esté operativo','Cómo fluye la arquitectura')
s.append(table([['Paso','Flujo funcional','Resultado'],['1. Acceso','Usuario inicia sesión con RUT de empresa, correo, contraseña y MFA.','Sesión segura con tenant, rol, permisos y CSRF.'],['2. Gestión','Cliente → contrato → orden de servicio; se asignan personas, recursos y requisitos.','Operación con contexto comercial y operativo único.'],['3. Cumplimiento','Documentos, cursos, exámenes, credenciales y archivos pasan por estados y validación.','Estado habilitado/restringido y alertas por brecha.'],['4. Ejecución','Libro de obra, inventario, hotelería, vehículos, incidentes, CAPA y comunicaciones.','Evidencia, costos, avances, responsabilidades y tiempos.'],['5. Integración','Eventos llaman firma, OCR, AV, correo, WhatsApp, ERP o acreditación oficial.','Resultado idempotente, auditado y con revisión humana.'],['6. Decisión','Panel, alertas, reportes y analítica leen entidades normalizadas y estado operativo.','Decisiones con datos por empresa, cliente, contrato u orden.'],['7. Continuidad','Backups, monitoreo, alarmas, runbook, restauración y control de releases.','Servicio recuperable, medible y operable en el tiempo.']],[23*mm,92*mm,54*mm]))
s.append(PageBreak())

s += section('8. AWS y despliegue: configuración técnica','Checklist de infraestructura')
s.append(table([['Componente','Configuración objetivo','Criterio de aceptación'],['VPC / red','ALB en subredes públicas; ECS y RDS en privadas; 2 AZ; NAT o endpoints VPC.','RDS no público; ECS no accesible desde internet; SG mínimo.'],['ECS Fargate','mínimo 2 tareas, 1 vCPU/2GB inicial, health /api/health y readiness /api/ready.','rolling o blue/green, rollback y escalamiento por CPU/memoria.'],['RDS PostgreSQL','PostgreSQL 15+, Multi-AZ, cifrado, backups y parámetros de conexión.','restauración aislada probada; RPO/RTO definidos.'],['S3 documentos','block public access, SSE, versionado, lifecycle, task role.','archivo privado solo accesible con autorización; AV limpio.'],['ECR / CI','imagen por commit, escaneo, build reproducible y migración controlada.','tests pasan antes de desplegar; no migraciones concurrentes.'],['ACM / DNS / WAF','dominio, HTTPS, redirección 80→443, reglas de protección.','TLS vigente, cabeceras, rate limit y logs.'],['CloudWatch','logs, dashboards y alarmas 5xx, latencia, CPU, errores, jobs fallidos.','notificación llega a responsables y se registra resolución.'],['Secrets Manager','DATABASE_URL, TENANT_SECRET_KEY, métricas y tokens de proveedores.','sin secretos en Git; roles IAM limitados y rotación definida.']],[31*mm,79*mm,59*mm]))
s += [Spacer(1,8),p('<b>Pipeline recomendado:</b> Pull request → tests → build Docker → escaneo → ECR → migración puntual en staging → smoke tests → aprobación → despliegue ECS → readiness → monitoreo → rollback si falla. El repositorio trae los artefactos base; se debe habilitar el pipeline CI/CD en la organización de GitHub y AWS.'),PageBreak()]

s += section('9. Observabilidad y continuidad operativa','La arquitectura necesita operación')
s.append(table([['Señal','Fuente','Alarma / respuesta'],['Aplicación','logs JSON con requestId, tenantId, status y duración','errores 5xx, latencia, picos por endpoint; ticket y revisión'],['Salud','/api/health, /api/ready, ECS healthcheck','tarea no saludable, readiness fallida, servicio bajo mínimo'],['Base de datos','RDS/CloudWatch y métricas de pool','conexiones, CPU, almacenamiento, slow query, backup fallido'],['Procesos','notification_jobs y operational_events','trabajo fallido, trabajo bloqueado, proveedor no disponible'],['Archivos','S3, antivirus y file_objects','AV no disponible, archivo bloqueado, error de lectura/escritura'],['Seguridad','audit_log, auth y WAF','intentos de acceso, cambios de permisos, exportaciones anómalas'],['Continuidad','backups, restauración y runbook','simulacro trimestral, RPO/RTO, acciones correctivas']],[31*mm,61*mm,77*mm]))
s += [Spacer(1,8),callout('<b>Recomendación:</b> desacoplar el planificador de notificaciones del proceso web cuando la carga crezca. En la primera etapa puede operar en ECS; a escala, ejecutar un worker dedicado y usar EventBridge/SQS para mayor aislamiento y reintentos.',ACCENT_D),PageBreak()]

s += section('10. Estado real y plan de madurez','Qué falta para declarar producción')
s.append(table([['Nivel','Estado actual','Siguiente condición'],['Código y funcionalidad','Implementado: módulos, API, datos, RLS, roles, sesiones, auditoría, archivos, jobs y tests.','Mantener QA completo por release y crecimiento progresivo de entidades normalizadas.'],['Preproducción','Preparado: Docker, Compose, migraciones, validaciones de entorno y plantilla ECS.','Levantar staging con AWS, datos sintéticos y pruebas E2E de 3 tenants.'],['Producción','No puede declararse final solo con el código.','Configurar AWS, DNS/TLS, MFA, S3, RDS, AV, secretos, monitoreo y backups.'],['Integraciones','Conectores y eventos preparados.','Contratar/configurar proveedor y validar sandbox, webhook, errores y trazabilidad.'],['Continuidad y seguridad','Controles de aplicación presentes.','Pentest, DRP, restauración, WAF, alarmas y gobierno Ley 21.719.']],[31*mm,72*mm,67*mm]))
s += [Spacer(1,9),card('Dictamen técnico','<b>Nexo Klar está arquitectónicamente preparado para una implementación productiva controlada.</b> El siguiente paso no es otro cambio de interfaz: es configurar y probar el entorno cloud con los controles de operación, seguridad y continuidad que convierten el producto en un servicio SaaS real.',ORANGE)]

doc=SimpleDocTemplate(str(OUT),pagesize=A4,leftMargin=20*mm,rightMargin=20*mm,topMargin=18*mm,bottomMargin=20*mm,title='Nexo Klar - Arquitectura técnica y objetivo operativo v6',author='Nexo Klar SPA')
doc.build(s,onFirstPage=footer,onLaterPages=footer)
print(OUT)
