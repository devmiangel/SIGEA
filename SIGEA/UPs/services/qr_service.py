import qrcode
import os
import logging
from io import BytesIO
from django.conf import settings
from django.core.files.base import ContentFile
from ..models import UP

logger = logging.getLogger(__name__)


def generar_qr_up(up_id):
    """
    Genera un código QR con los datos de la UP:
    - RUEA
    - Nombre del productor
    - Nombre del predio
    """
    try:
        up = UP.objects.select_related(
            'Productor__usuario__persona',
            'Predio'
        ).get(id=up_id)
    except UP.DoesNotExist:
        raise ValueError(f"No se encontró la UP con id={up_id}")
    except Exception as e:
        raise ValueError(f"Error al consultar la UP: {str(e)}")

    try:
        persona = getattr(up.Productor.usuario, 'persona', None)
    except Exception:
        persona = None

    if persona:
        nombre_productor = ' '.join(filter(None, [
            persona.primer_nombre,
            persona.segundo_nombre,
            persona.primer_apellido,
            persona.segundo_apellido,
        ])) or 'Sin asignar'
    else:
        nombre_productor = 'Sin asignar'

    try:
        nombre_predio = up.Predio.NombrePredio if up.Predio else 'Sin asignar'
    except Exception:
        nombre_predio = 'Sin asignar'

    contenido = (
        f"RUEA: {up.RUEA}\n"
        f"Productor: {nombre_productor}\n"
        f"Predio: {nombre_predio}"
    )

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(contenido)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)

    qr_dir = os.path.join(settings.MEDIA_ROOT, 'qr_up')
    os.makedirs(qr_dir, exist_ok=True)

    nombre_archivo = f"qr_{up.RUEA}.png"

    if up.CodigoQR:
        try:
            up.CodigoQR.delete(save=False)
        except Exception:
            pass

    up.CodigoQR.save(nombre_archivo, ContentFile(buffer.read()), save=False)
    up.save(update_fields=['CodigoQR'])

    logger.info(f"QR generado exitosamente para UP {up.id} ({up.RUEA})")
    return up.CodigoQR.url
