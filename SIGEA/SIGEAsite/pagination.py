from rest_framework.pagination import PageNumberPagination


class SigeaPagination(PageNumberPagination):
    """Paginación de todos los listados: ninguna respuesta trae más de ``max_page_size`` filas.

    - Con ``?page=`` o ``?page_size=``: páginas de ``page_size`` (50 por defecto, máx. 200).
    - Sin parámetros: igual se pagina, con páginas de ``max_page_size``. Así un listado
      grande nunca se lee y serializa completo en una sola petición. Los enlaces
      ``next``/``previous`` llevan ``page_size`` para que las páginas siguientes
      conserven el mismo tamaño.

    La respuesta siempre es ``{count, next, previous, results}``. El frontend
    (``services/api.js``) recorre ``next`` cuando una llamada no pidió página.
    """

    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200

    def get_page_size(self, request):
        params = request.query_params
        if 'page' not in params and 'page_size' not in params:
            return self.max_page_size
        return super().get_page_size(request)

    def paginate_queryset(self, queryset, request, view=None):
        # Sin orden explícito la paginación no es estable (y Django avisa).
        if not getattr(queryset, 'ordered', True):
            queryset = queryset.order_by('pk')
        return super().paginate_queryset(queryset, request, view)

    def get_next_link(self):
        return self._con_page_size(super().get_next_link())

    def get_previous_link(self):
        return self._con_page_size(super().get_previous_link())

    def _con_page_size(self, url):
        if url is None:
            return None
        from rest_framework.utils.urls import replace_query_param
        return replace_query_param(url, self.page_size_query_param, self.page.paginator.per_page)


def respuesta_paginada(request, queryset, serializer_class, **serializer_kwargs):
    """Pagina un listado en una vista de función (``@api_view``) igual que en los ViewSets."""
    paginador = SigeaPagination()
    pagina = paginador.paginate_queryset(queryset, request)
    datos = serializer_class(pagina, many=True, **serializer_kwargs).data
    return paginador.get_paginated_response(datos)
