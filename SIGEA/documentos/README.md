# documentos - Documentación

Aplicación encargada de la **generación de documentos** del sistema. Genera **al vuelo** (en memoria, sin persistir rutas) tres documentos PDF con [ReportLab](https://www.reportlab.com/), a partir de los datos registrados en la app `Visitas`:

- **Visita técnica** (formato GDE-F011).
- **Caracterización / actualización y seguimiento** (formato GDE-F-035).
- **Recibo de pago de servicios agropecuarios** (formato GDE-F005).

La app `Visitas` no guarda la ruta del documento: el PDF se genera por el endpoint de esta app y se devuelve como respuesta directamente.

Estructura interna de la app:

```
documentos/
├── services/
│   ├── pdf_service_visita.py            # PDF de visita técnica (GDE-F011)
│   ├── pdf_service_caracterizacion.py   # PDF de caracterización (GDE-F-035)
│   └── pdf_service_recibo.py            # PDF de recibo de pago (GDE-F005)
├── logo/                                # Logotipo usado en el encabezado (escudo.png)
├── urls.py                              # Registro de rutas
├── views.py                             # Vistas de la API
└── management/                          # Comandos de administración
```

---

## Selección del documento

`views.py` determina qué PDF generar según el **tipo de visita** (`Visitas.TipoVisita.TipoVisita`, comparado sin acentos y en minúsculas):

| Tipo de visita | Servicio | Archivo generado |
|---|---|---|
| `Servicios Pagos` | `generar_documento_recibo_bytes` | `recibo_<id>.pdf` |
| `Caracterización` | `generar_documento_caracterizacion_bytes` | `caracterizacion_<id>.pdf` |
| Cualquier otro | `generar_documento_visita_bytes` | `visita_<id>.pdf` |

---

## Servicios de PDF

### Visita técnica (`services/pdf_service_visita.py`)

| Función | Descripción |
|---|---|
| `generar_documento_visita_bytes(visita_id)` | Obtiene la `Visitas` por id, arma los datos (`_datos_desde_visita`) y devuelve el PDF como bytes. |
| `generar_visita_tecnica(salida, datos)` | Dibuja el documento de visita técnica (formato GDE-F011) con `reportlab`. Acepta un archivo/ruta o un `BytesIO`. |
| `_datos_desde_visita(visita)` | Extrae los datos del formulario desde la visita y sus relaciones: productor, vereda/sector, teléfono, tipo de visita, fecha, funcionario, acciones, diagnóstico presuntivo, horas de inicio/salida, observaciones, calificación y firmas (`FirmaProductor` / `FirmaFuncionario`, base64). |

Cabecera con código `GDE-F011`, versión `006` y fecha `AGOSTO 2025`.

### Caracterización (`services/pdf_service_caracterizacion.py`)

| Función | Descripción |
|---|---|
| `generar_documento_caracterizacion_bytes(visita_id)` | Genera el PDF de caracterización a partir de la UP vinculada a la solicitud de la visita. |
| `generar_caracterizacion(salida, datos)` | Dibuja el documento en 2 páginas (información personal, predio, UP/empresa, sistema agrícola, pecuario, agroindustrial, observaciones, autorización de tratamiento de datos y firmas). |
| `_datos_desde_caracterizacion(visita)` | Reutiliza los serializers de caracterización de `UPs` (`InfoPersonal`, `InfoPredio`, `InfoUP`, producción agrícola/animal/agroindustrial y adicional) para volcar la información de la UP. |

Cabecera con código `GDE-F-035`, versión `001` y fecha `FEBRERO 2025`. Incluye la casilla de autorización de tratamiento de datos (`Visitas.Autorizacion`).

### Recibo de pago (`services/pdf_service_recibo.py`)

| Función | Descripción |
|---|---|
| `generar_documento_recibo_bytes(visita_id)` | Genera el recibo de pago a partir de los `VisitasServiciosPagos` registrados en la visita. |
| `generar_recibo(salida, datos)` | Dibuja el recibo (formato GDE-F005) con las tablas de **Maquinaria Agrícola** (Nº horas, valor unitario, valor total, apero) e **Inseminación Artificial** (Nº pajillas, toro, valor unitario, valor total), observaciones y firmas. |
| `_datos_desde_visita(visita)` | Extrae usuario, cédula, vereda, sector, teléfono, RUEA, funcionario, firmas y la lista de servicios de pago (`VisitasServiciosPagos`) con sus valores. |

Cabecera con código `GDE-F005`, versión `006` y fecha `AGOSTO 2025`.

---

## Views

| Vista | Tipo | Descripción |
|---|---|---|
| `generar_documento_visita` | `@api_view(['GET'])` | Requiere autenticación (`IsAuthenticated`) y el permiso `Visitas.view_visitas`; si falta, responde `403`. Busca la visita por id (`get_object_or_404`), elige el servicio según el tipo de visita y devuelve el PDF como `HttpResponse` (`Content-Type: application/pdf`) con `Content-Disposition: inline`. Si la generación falla, responde `500` con el error. |

---

## Endpoints (URLs)

Rutas registradas en `urls.py`, bajo el prefijo `/api/documentos/` (definido en `SIGEAsite/urls.py`).

| Endpoint | Vista | Método |
|---|---|---|
| `/api/documentos/visita/<visita_id>/generar/` | `generar_documento_visita` | GET |

---

## Uso desde el frontend

Como no se persiste ninguna ruta, el frontend descarga el PDF generándolo al vuelo:

```
GET /api/documentos/visita/{id}/generar/   (con token de Knox)
```

El binario de la respuesta se convierte en un blob para descargar/abrir el archivo correspondiente (`visita_{id}.pdf`, `caracterizacion_{id}.pdf` o `recibo_{id}.pdf`).
