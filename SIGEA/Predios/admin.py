from django.contrib import admin
from .models import Sectores, Veredas, TiposTenencias, Seguros, TiposRegistrosICA, Predios

admin.site.register([Sectores, Veredas, TiposTenencias, Seguros, TiposRegistrosICA])

@admin.register(Predios)
class PrediosAdmin(admin.ModelAdmin):
    list_display = ('NombrePredio', 'Sector', 'AreaPredio', 'TipoTenencia')
    list_filter = ('Sector', 'TipoTenencia', 'AccesoCredito')
    search_fields = ('NombrePredio',)