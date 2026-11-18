from django.urls import path

from .views import generar_caracterizacion_up, generar_documento_visita

urlpatterns = [
    path('visita/<int:visita_id>/generar/', generar_documento_visita, name='generar_documento_visita'),
    path('up/<int:up_id>/caracterizacion/', generar_caracterizacion_up, name='generar_caracterizacion_up'),
]