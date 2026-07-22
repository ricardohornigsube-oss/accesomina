# Arquitectura AWS productiva para Nexo Klar

Esta carpeta deja preparado el paquete base para cargar Nexo Klar en AWS con operación productiva.

## Componentes

- `ecs-task-definition.json`: referencia de tarea ECS Fargate.
- `production-env.template`: variables productivas esperadas.
- `.github/workflows/aws-ecs-deploy.yml`: pipeline para construir imagen, subirla a ECR, ejecutar migraciones y actualizar ECS.

## Servicios AWS requeridos

1. Route 53 o DNS externo apuntando a `nexo.domian.cl`.
2. AWS Certificate Manager con certificado HTTPS.
3. Application Load Balancer público con HTTPS.
4. ECS Fargate en subredes privadas.
5. ECR para la imagen Docker.
6. RDS PostgreSQL 15+ privado, cifrado y con backup automático.
7. S3 privado para documentos, con versionado, cifrado y bloqueo público.
8. Secrets Manager para `DATABASE_URL`, `TENANT_SECRET_KEY`, tokens y claves externas.
9. CloudWatch Logs y alarmas.
10. Proveedor HTTPS de antivirus de archivos.

## Flujo productivo recomendado

1. GitHub ejecuta pruebas.
2. GitHub construye y sube imagen a ECR.
3. GitHub registra una nueva task definition.
4. Se ejecuta una tarea puntual de migración.
5. ECS actualiza el servicio productivo.
6. El balanceador valida `/api/health` y `/api/ready`.

## Separación de datos

La aplicación usa `tenant_id` por empresa. El backend establece `app.current_tenant_id` en cada transacción y PostgreSQL aplica Row Level Security en tablas críticas.

## Importante

No se debe operar producción desde `AccesoMina_v6.html` abierto como archivo local. Producción debe usar:

```text
public/index.html
public/cloud-client.js
server/
database/postgres/
RDS PostgreSQL
S3 privado
```

## Antes de vender con datos reales

- Probar dos empresas completas y confirmar que sus datos no se cruzan.
- Probar restauración real de RDS.
- Probar descarga de archivos desde S3 con sesión autorizada.
- Probar antivirus obligatorio.
- Probar MFA.
- Probar correo, WhatsApp, firma y OCR con proveedores reales.
- Activar monitoreo externo y alertas.
