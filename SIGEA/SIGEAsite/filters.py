from django.db.models import Q


def filtrar_texto(queryset, valor, campos):
    """Filtra por texto en varios campos.

    El texto se separa por espacios: cada palabra debe aparecer en alguno de
    los campos (OR entre campos, AND entre palabras). Así "Juan Perez" coincide
    con primer_nombre='Juan' y primer_apellido='Perez'.
    """
    texto = (valor or '').strip()
    if not texto:
        return queryset
    for palabra in texto.split():
        condicion = Q()
        for campo in campos:
            condicion |= Q(**{f'{campo}__icontains': palabra})
        queryset = queryset.filter(condicion)
    return queryset.distinct()
