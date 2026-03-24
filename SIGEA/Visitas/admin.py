from django.contrib import admin
from .models import (
    MotivosSolicitudes, Estados, Solicitudes, TiposVisitas, 
    Visitas, InsumoVisita, Calificaciones, InfoVisita
)

class InsumoVisitaInline(admin.TabularInline):
    model = InsumoVisita
    extra = 1

@admin.register(Visitas)
class VisitasAdmin(admin.ModelAdmin):
    list_display = ('Solicitud', 'Funcionario', 'FechaVisita', 'TipoVisita')
    inlines = [InsumoVisitaInline]

admin.site.register([MotivosSolicitudes, Estados, Solicitudes, TiposVisitas, Calificaciones, InfoVisita])