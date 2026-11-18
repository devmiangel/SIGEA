from rest_framework import serializers

MAX_DESCRIPCION = 2000


def normalizar_texto(valor):
    return (valor or '').strip()


def normalizar_placa(valor):
    return normalizar_texto(valor).upper()


def validar_placa(valor):
    valor = normalizar_placa(valor)
    if not valor:
        raise serializers.ValidationError('La placa es obligatoria.')
    if len(valor) > 20:
        raise serializers.ValidationError('La placa no puede superar 20 caracteres.')
    return valor


def validar_modelo(valor):
    valor = normalizar_texto(valor)
    if not valor:
        raise serializers.ValidationError('El modelo es obligatorio.')
    if len(valor) > 255:
        raise serializers.ValidationError('El modelo no puede superar 255 caracteres.')
    return valor


def validar_descripcion(valor):
    valor = normalizar_texto(valor)
    if len(valor) > MAX_DESCRIPCION:
        raise serializers.ValidationError(
            f'La descripción no puede superar {MAX_DESCRIPCION} caracteres.'
        )
    return valor
