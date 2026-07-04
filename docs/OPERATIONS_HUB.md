# Centro Operativo v7.6

## Funciones incorporadas

- Registro centralizado de errores productivos por empresa.
- Cola documental con flujo cargado, enviado, revision, observado, corregido, aprobado o rechazado.
- Puntaje preliminar para OCR, firma, QR, fotografia, integridad y emisor.
- Programacion de correo, WhatsApp y reportes.
- Registro de acceso restringido de revisores del mandante por minera y alcance.
- Formularios configurables y aislados por empresa.
- Politicas de conservacion con bloqueo legal y evaluacion previa sin eliminacion.
- Importacion y exportacion CSV de 11 modulos operativos, ademas del respaldo completo.

## Limites

El puntaje documental refleja los controles registrados y no certifica por si solo la autenticidad. Para automatizar cada control se debe configurar un proveedor de OCR, firma electronica, consulta QR al emisor, comparacion fotografica y analisis forense. Los resultados deben conservar proveedor, fecha, version, confianza y evidencia. Un revisor autorizado mantiene la decision final.

Las programaciones se almacenan y auditan. Su envio efectivo requiere SMTP, WhatsApp Cloud API o proveedor de reportes configurado y un ejecutor programado en la infraestructura productiva.

## Produccion

Configurar un monitor externo para consultar `/api/health` y `/api/ready`. El registro interno de errores complementa ese monitor, pero no puede detectar una caida total por si mismo.

Antes de eliminar o anonimizar, ejecutar la evaluacion en seco, revisar bloqueos legales y contar con un respaldo restaurable.
