from django.contrib import admin
from .models import (
    TiposDocumentos, TiposContactos, TiposNivelesEducativos, Sisben,
    Empresas, Contactos, Personas, Usuario, Funcionarios, Administradores, Productores
)

admin.site.register([TiposDocumentos, TiposContactos, TiposNivelesEducativos, Sisben, Empresas, Contactos])

@admin.register(Personas)
class PersonasAdmin(admin.ModelAdmin):
    list_display = ('primer_nombre', 'primer_apellido', 'numero_documento', 'TipoDocumento')
    search_fields = ('numero_documento', 'primer_nombre', 'primer_apellido')
    filter_horizontal = ('contactos', 'TipoNivelEducativo', 'NivelSisben', 'Empresa')

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('email', 'persona', 'is_staff', 'is_active', 'is_superuser')
    search_fields = ('email', 'persona__primer_nombre', 'persona__primer_apellido')
    list_filter = ('is_staff', 'is_superuser', 'is_active')

admin.site.register([Funcionarios, Administradores, Productores])