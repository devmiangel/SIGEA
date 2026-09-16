def _normalizar_vacios(value):
    """Convierte recursivamente las cadenas vacias en None.

    El formulario de caracterizacion envia '' para los campos numericos
    opcionales que el funcionario deja en blanco. DRF rechaza '' en campos
    IntegerField/DecimalField/CharField sin allow_blank, asi que se normaliza
    a None antes de la validacion.
    """
    if isinstance(value, dict):
        return {k: _normalizar_vacios(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_normalizar_vacios(v) for v in value]
    if isinstance(value, str) and value.strip() == '':
        return None
    return value


class PermitirVaciosMixin:
    def to_internal_value(self, data):
        return super().to_internal_value(_normalizar_vacios(data))


def get_o_crear(model, defaults=None, **kwargs):
    """Version tolerante de get_or_create.

    get_or_create lanza MultipleObjectsReturned si existen duplicados en el
    catalogo. Aqui se recupera el primero o se crea, evitando el 500.
    """
    obj = model.objects.filter(**kwargs).first()
    if obj is None:
        values = dict(kwargs)
        values.update(defaults or {})
        obj = model.objects.create(**values)
    return obj
