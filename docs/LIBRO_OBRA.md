# Libro de Obra Nexo Klar

## Objetivo

El Libro de Obra es el registro formal y correlativo de instrucciones, consultas,
respuestas, acuerdos, avances, observaciones, recepciones e incidentes de un
servicio. Es independiente del Libro Diario Operacional, que conserva el detalle
de horas hombre, dotación, equipos, clima y avance diario.

## Flujo funcional

1. Seleccionar cliente, contrato opcional y proyecto, servicio o mantención.
2. Seleccionar el tipo de libro y el tipo de anotación.
3. Registrar fecha, asunto, detalle, responsable y fecha de compromiso.
4. Adjuntar evidencias desde el almacenamiento privado.
5. Guardar como borrador o enviar a firma.
6. Gestionar observaciones y firma.
7. Cerrar la anotación cuando el compromiso se encuentre resuelto.

Estados permitidos:

- `borrador`
- `pendiente_firma`
- `observado`
- `firmado`
- `cerrado`

Las anotaciones firmadas o cerradas no permiten modificar su contenido. Una
rectificación debe registrarse como una nueva anotación, preservando la evidencia
y el contexto anterior.

## Arquitectura

- `work_books`: cabecera, folio, alcance y estado general del libro.
- `work_book_entries`: anotaciones correlativas, compromisos, firma y evidencias.
- `work_book_entry_history`: historial append-only de cambios y responsables.
- `audit_log`: auditoría transversal de creación y actualización.
- Row Level Security y `FORCE ROW LEVEL SECURITY` aíslan cada empresa.
- Los folios se generan bajo bloqueo transaccional para evitar colisiones.
- Las referencias se validan contra cliente, contrato y proyecto de la empresa.

API:

- `GET /api/work-books/entries`
- `GET /api/work-books/entries/:id`
- `POST /api/work-books/entries`
- `PATCH /api/work-books/entries/:id`
- `POST /api/work-books/entries/:id/signature-requests`

## Solicitud de firma electrónica

Cada anotación abierta permite solicitar firma indicando:

- Nombre del firmante.
- Correo electrónico.
- Teléfono celular.
- Canal: correo, WhatsApp o ambos.
- Mensaje personalizado.

El endpoint de solicitud:

1. Valida el firmante y los datos exigidos por el canal.
2. Comprueba que la anotación pertenezca a la empresa autenticada.
3. Rechaza anotaciones ya firmadas o cerradas.
4. Envía el sobre al proveedor configurado en `signature`.
5. Registra el identificador del sobre y el enlace seguro devuelto.
6. Notifica por SMTP y/o WhatsApp Cloud API.
7. Actualiza la anotación a `pendiente_firma`.
8. Conserva el evento en historial y auditoría.

Contrato esperado del proveedor de firma:

```json
{
  "envelopeId": "referencia-del-proveedor",
  "signingUrl": "https://proveedor.example/firmar/...",
  "provider": "nombre-proveedor"
}
```

Si el proveedor no está configurado, la solicitud queda en estado
`pendiente_configuracion`. Nexo Klar no informa un envío ni una firma que no
hayan ocurrido realmente.

Las solicitudes se almacenan en `work_book_signature_requests`, aisladas por
empresa mediante Row Level Security. Solo puede existir una solicitud activa por
anotación para evitar envíos duplicados.

## Permisos

Pueden crear y actualizar anotaciones:

- Administrador Nexo Klar.
- Administrador de la empresa.
- RR.HH.
- Prevención.
- Acreditación.

La lectura requiere sesión válida, MFA cuando esté exigido, aislamiento por
empresa y token CSRF para operaciones de escritura.

## Producción

Antes del despliegue debe aplicarse la migración
`database/postgres/017_work_book.sql`. Los archivos adjuntos utilizan el flujo
privado existente, con revisión antivirus y almacenamiento S3 compatible en
producción.

La integración utiliza el conector de firma definido por empresa y puede
combinarse con SMTP y Meta WhatsApp Cloud API. Antes de operar debe realizarse
una prueba de extremo a extremo con el proveedor contratado, incluyendo firma,
rechazo, expiración, evidencia y conciliación del identificador del sobre.
