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

La integración de firma electrónica puede utilizar el conector de firma ya
definido por empresa. Hasta configurar un proveedor productivo, el estado
`pendiente_firma` mantiene el proceso controlado sin simular una firma válida.
