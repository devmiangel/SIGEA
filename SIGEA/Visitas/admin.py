from django.contrib import admin
from .models import (
    MotivosSolicitudes, Estados, Solicitudes, TiposVisitas, 
    Visitas, InsumoVisita, Calificaciones, InfoVisita,
    Aperos, Pajillas,
)

class InsumoVisitaInline(admin.TabularInline):
    model = InsumoVisita
    extra = 1

@admin.register(Visitas)
class VisitasAdmin(admin.ModelAdmin):
    list_display = ('Solicitud', 'Funcionario', 'FechaYHoraVisita', 'TipoVisita')
    inlines = [InsumoVisitaInline]

admin.site.register([MotivosSolicitudes, Estados, Solicitudes, TiposVisitas, Calificaciones, InfoVisita])

@admin.register(Aperos)
class AperosAdmin(admin.ModelAdmin):
    list_display = ('id', 'Apero', 'ValorHora')
    list_editable = ('ValorHora',)
    search_fields = ('Apero',)

@admin.register(Pajillas)
class PajillasAdmin(admin.ModelAdmin):
    list_display = ('id', 'Pajilla', 'ValorPajilla')
    list_editable = ('ValorPajilla',)
    search_fields = ('Pajilla',)