from django.contrib import admin
from .models import (
    TiposVehiculos, TiposCombustibles, MarcasVehiculos, LineasVehiculos, 
    Vehiculos, DetalleVehiculos, Conductores, RegistroAsignacionVehiculos,
    TiposHerramientas, Herramientas, AsignacionHerramientas,
    UnidadesMedida, Insumos, InventarioFuncionario, CardexInsumoFuncionario
)

class DetalleVehiculoInline(admin.TabularInline):
    model = DetalleVehiculos
    extra = 1

@admin.register(Vehiculos)
class VehiculosAdmin(admin.ModelAdmin):
    list_display = ('LineaVehiculo', 'TipoVehiculo', 'TipoCombustible')
    inlines = [DetalleVehiculoInline]

admin.site.register([TiposVehiculos, TiposCombustibles, MarcasVehiculos, LineasVehiculos, DetalleVehiculos])
admin.site.register([Conductores, RegistroAsignacionVehiculos, TiposHerramientas, Herramientas, AsignacionHerramientas])
admin.site.register([UnidadesMedida, Insumos, InventarioFuncionario, CardexInsumoFuncionario])