from rest_framework.pagination import PageNumberPagination


class SigeaPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200

    def paginate_queryset(self, queryset, request, view=None):
        params = request.query_params
        if 'page' not in params and 'page_size' not in params:
            return None
        if not queryset.ordered:
            queryset = queryset.order_by('pk')
        return super().paginate_queryset(queryset, request, view)
