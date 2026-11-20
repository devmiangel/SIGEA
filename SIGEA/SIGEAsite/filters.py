from django.db.models import Q


def filtrar_texto(queryset, valor, campos):
    texto = (valor or '').strip()
    if not texto:
        return queryset
    condicion = Q()
    for campo in campos:
        condicion |= Q(**{f'{campo}__icontains': texto})
    return queryset.filter(condicion).distinct()
