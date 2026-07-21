# Plan de excelencia Nexo Klar

Este documento ordena las mejoras necesarias para que Nexo Klar pase de una plataforma demostrable a una solución robusta para piloto, venta y operación productiva.

## 1. Producto y datos

- Mantener entidades críticas separadas y auditables: clientes, contratos, proyectos/servicios, trabajadores, asignaciones, documentos, EPP, hotelería, vehículos, turnos, credenciales, incidentes, actividades y usuarios.
- Usar catálogos configurables por empresa: cargos, especialidades, EPP, cursos, exámenes, documentos, turnos, tipos de contrato y centros de costo.
- Mantener matriz de requisitos por cliente, contrato, proyecto, cargo y tipo de trabajador.
- Registrar historial por entidad: qué cambió, quién lo hizo, cuándo, motivo y evidencia.

## 2. Interconexión operativa

- Desde cliente: ver contratos, proyectos, personas, recursos, documentos, alertas, actividades y compromisos.
- Desde contrato/proyecto: agregar o quitar trabajadores, vehículos, hotelería, permisos, subcontratos, incidentes y documentos.
- Desde trabajador: ver asignación activa, documentos, cursos, exámenes, EPP, hotel, turno, credencial, estado operativo y bloqueos.
- Bloquear automáticamente cuando falte un documento crítico, exista vencimiento, credencial vencida, examen vencido o contrato no firmado.

## 3. Documentación inteligente

- Mantener flujo formal: requerido, cargado, enviado, en revisión, observado, corregido, aprobado, rechazado y vencido.
- Conectar proveedor externo para OCR, firma electrónica, QR, comparación fotográfica, validación de emisor e integridad del archivo.
- Guardar score de confianza, evidencia del proveedor y revisión humana final.

## 4. Acceso, seguridad y Ley 21.719

- Operar productivamente con PostgreSQL, RLS por empresa, MFA, HTTPS, sesiones seguras y archivos privados por tenant.
- Definir responsable de privacidad, dueño del dato, política de conservación, bloqueo legal y registro de derechos de titulares.
- Mantener auditoría inmutable para cambios, accesos, documentos, usuarios, integraciones y acciones críticas.

## 5. Paneles y usabilidad

- Dashboard ejecutivo con cumplimiento, riesgo, dotación, vencimientos, costos, hotelería, vehículos, EPP, subcontratos y compromisos.
- Centro operativo diario para ingresos, salidas, disponibilidad, bloqueos, alertas, eventos de terreno y reportes.
- Vista móvil/terreno para cargar evidencia, check-in/out, incidentes, EPP y observaciones rápidas.
- Portal mandante para revisión, observación, aprobación y reportes restringidos.

## 6. Infraestructura requerida antes de vender a clientes grandes

- AWS o nube equivalente con base de datos administrada, almacenamiento privado, respaldos, monitoreo, logs centralizados y alertas.
- SMTP/correo real, WhatsApp Business API, firma electrónica, OCR/document AI, antivirus de archivos y prueba de penetración.
- Runbook de operación: respaldo, recuperación, soporte cliente, cambios, incidentes, privacidad y continuidad.

## 7. Enfoque comercial recomendado

- Vender como plataforma multisectorial de control operacional, cumplimiento documental y trazabilidad para empresas con personal interno y externo.
- Preparar demos por industria: minería, energía, construcción, industrial, facilities, logística, mantenimiento, seguridad privada y agroindustria.
- Ofrecer piloto controlado con un cliente real para generar caso de éxito, métricas de reducción de planillas, vencimientos detectados y tiempos de acreditación.
