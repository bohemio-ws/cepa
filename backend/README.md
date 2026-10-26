# CEPA Altomira · Backend documental

Este directorio versiona el contrato del backend de Google Apps Script usado por la PWA.

## Invariantes de producción

1. Todos los documentos comparten el mismo encabezado corporativo:
   - CEPA Altomira
   - Control operativo municipal · Ayuntamiento de Tarancón
   - Conserje Helena Buitrago Vara
   - título específico del documento
   - fecha
   - línea corporativa
2. El informe diario se construye exclusivamente con registros reales de `CEPA_Eventos` de la fecha solicitada. No se genera una lista fija de dependencias.
3. `sections.work` siempre es verdadero. Incidencias y pedidos se incluyen únicamente cuando la PWA los solicita expresamente. Stock nunca forma parte del informe diario.
4. Una incidencia abierta no se repite cada día. Se documentan sus eventos de alta y, cuando corresponda, resolución/reapertura.
5. Las evidencias fotográficas vinculadas se incorporan al documento cuando existen.
6. Las escrituras de eventos y evidencias son idempotentes por ID: un reintento con el mismo ID no crea una segunda fila.
7. Modificar o borrar desde la PWA modifica o borra el registro correspondiente en Google.
8. Pie corporativo: `Documento generado automáticamente por CEPA Altomira · Ayuntamiento de Tarancón`.

## Acciones que consume la PWA

`session`, `history`, `events`, `event`, `update_event`, `delete_event`, `evidence`, `evidence_list`, `delete_evidence`, `order`, `report_pdf`, `report_mail`, `incident_pdf`, `incident_mail`, `order_pdf`, `order_mail`, `contacts`, `contact`, `update_contact`, `delete_contact`.

El proyecto Apps Script desplegado debe conservar estas acciones para no romper la aplicación publicada.
