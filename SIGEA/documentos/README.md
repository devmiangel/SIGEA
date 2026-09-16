# documentos - Documentación

Aplicación encargada de la **generación de documentos** del sistema. Actualmente genera el **PDF de la visita técnica** (formato GDE-F011) a partir de los datos registrados en la app `Visitas`, usando [ReportLab](https://www.reportlab.com/).

La app `Visitas` no guarda la ruta del documento: el PDF se genera **al vuelo** por el endpoint de esta app y se devuelve como respuesta directamente.

Estructura interna de la app:

```
documentos/
├── services/
│   └── pdf_service.py      # Lógica de generación del PDF (reportlab)
├── logo/                   # Logotipo usado en el encabezado del documento
├── urls.py                 # Registro de rutas
├── views.py                # Vistas de la API
└── management/             # Comandos de administración
```

---

## Servicio de PDF (`services/pdf_service.py`)

| Función | Descripción |
|---|---|
| `generar_documento_visita_bytes(visita_id)` | Obtiene la `Visitas` por id, arma los datos (`_datos_desde_visita`) y devuelve el PDF como bytes. |
| `generar_visita_tecnica(salida, datos)` | Dibuja el documento de visita técnica (formato GDE-F011) con `reportlab`. Acepta un archivo/ruta o un `BytesIO`. |
| `_datos_desde_visita(visita)` | Extrae los datos del formulario desde la visita y sus relaciones: datos del productor, vereda/sector, teléfono, tipo de visita, fecha, funcionario, acciones, observaciones, calificación y firmas (`FirmaProductor` / `FirmaFuncionario`, como base64). |

Detalles del layout: usa tamaño `letter`, cabecera con logo (buscado en `logo/`), código del documento `GDE-F011`, versión `006` y fecha `AGOSTO 2025`.

---

## Views

| Vista | Tipo | Descripción |
|---|---|---|
| `generar_documento_visita` | `@api_view(['GET'])` | Busca la visita por id (`get_object_or_404`) y devuelve el PDF generado como `HttpResponse` (`Content-Type: application/pdf`) con `Content-Disposition: inline`, listo para visualizar o descargar. |

> La vista no exige autenticación (`@permission_classes([IsAuthenticated])` está comentado), por lo que el PDF puede abrirse directamente desde el navegador o el frontend sin token.

---

## Endpoints (URLs)

Rutas registradas en `urls.py`, bajo el prefijo `/api/documentos/` (definido en `SIGEAsite/urls.py`).

| Endpoint | Vista | Método |
|---|---|---|
| `/api/documentos/visita/<visita_id>/generar/` | `generar_documento_visita` | GET |

---

## Uso desde el frontend

Como no se persiste ninguna ruta, el frontend descarga el PDF generándolo al vuelo, por ejemplo:

```
GET /api/documentos/visita/{id}/generar/
```

El binario de la respuesta se convierte en un blob para descargar/abrir el archivo `visita_{id}.pdf`.