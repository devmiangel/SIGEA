from django.contrib import admin
from .models import (
    TipoUP, ActividadUP, Unidades, UP, ArchivosUP, DetalleUP, ProductosUPs, 
    ProduccionUPAgricola, ProduccionUPAgroindustrial, GrupoAnimal, TiposAves, 
    Propositos, Animales, Razas, ProductosApicolas, DetalleBovinos, DetalleAves
)

class DetalleUPInline(admin.StackedInline):
    model = DetalleUP
    extra = 1

@admin.register(UP)
class UPAdmin(admin.ModelAdmin):
    list_display = ('id', 'Productor', 'Predio', 'TipoUP', 'FechaCaracterizacion')
    list_filter = ('TipoUP', 'FechaCaracterizacion')
    inlines = [DetalleUPInline]

admin.site.register([TipoUP, ActividadUP, Unidades, ArchivosUP, ProductosUPs])
admin.site.register([ProduccionUPAgricola, ProduccionUPAgroindustrial, GrupoAnimal, TiposAves, Propositos, Animales, Razas])
admin.site.register([ProductosApicolas, DetalleBovinos, DetalleAves])