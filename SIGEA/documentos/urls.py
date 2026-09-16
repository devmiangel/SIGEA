from django.urls import path

from .views import generar_documento_visita

urlpatterns = [
    path('visita/<int:visita_id>/generar/', generar_documento_visita, name='generar_documento_visita'),
]