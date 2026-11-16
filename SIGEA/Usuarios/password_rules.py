"""Reglas de construcción de contraseñas con mensajes claros para el usuario.

Se apoya en AUTH_PASSWORD_VALIDATORS de Django y traduce cada error (por su código)
a un mensaje que explique qué le falta a la contraseña. Además revisa que no contenga
información personal (nombres, apellidos, documento, correo), algo que el validador de
Django no puede hacer porque el modelo Usuario no tiene first_name/last_name.
"""
import re
import unicodedata

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

MENSAJE_PERSONAL = (
    "La contraseña no puede contener tu información personal "
    "(nombre, apellido, documento o correo)."
)

MENSAJES_POR_CODIGO = {
    'password_too_short': "La contraseña es muy corta: debe tener al menos {min_length} caracteres.",
    'password_entirely_numeric': "La contraseña no puede tener solo números: agrega letras.",
    'password_too_common': "La contraseña es muy común y fácil de adivinar: elige una menos predecible.",
    'password_too_similar': MENSAJE_PERSONAL,
}

LONGITUD_MINIMA_DATO = 3


def _normalizar(texto):
    texto = unicodedata.normalize('NFD', str(texto or '')).encode('ascii', 'ignore').decode('ascii')
    return texto.lower()


def _datos_personales(persona=None, email=None):
    """Fragmentos de información personal que no deben aparecer en la contraseña."""
    valores = []
    if persona is not None:
        valores += [
            getattr(persona, 'primer_nombre', None),
            getattr(persona, 'segundo_nombre', None),
            getattr(persona, 'primer_apellido', None),
            getattr(persona, 'segundo_apellido', None),
            getattr(persona, 'numero_documento', None),
        ]
    if email:
        valores.append(str(email).split('@')[0])

    fragmentos = set()
    for valor in valores:
        # Cada palabra por separado ("María José" -> "maria", "jose").
        for parte in re.split(r'[\s._\-+]+', _normalizar(valor)):
            if len(parte) >= LONGITUD_MINIMA_DATO:
                fragmentos.add(parte)
    return fragmentos


def contiene_datos_personales(password, persona=None, email=None):
    clave = _normalizar(password)
    return any(fragmento in clave for fragmento in _datos_personales(persona, email))


def errores_password(password, user=None, persona=None, email=None):
    """Lista de mensajes (sin duplicados, en orden) que explican qué le falta a la contraseña."""
    mensajes = []
    try:
        validate_password(password, user=user)
    except ValidationError as exc:
        for error in exc.error_list:
            plantilla = MENSAJES_POR_CODIGO.get(error.code)
            if plantilla is None:
                mensajes.extend(error.messages)
            else:
                mensajes.append(plantilla.format(**(error.params or {})))

    if contiene_datos_personales(password, persona=persona, email=email):
        mensajes.append(MENSAJE_PERSONAL)

    return list(dict.fromkeys(mensajes))
