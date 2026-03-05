from django.contrib.auth.models import AbstractUser
from django.db import models

class TipoDocumento(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

class Persona(models.Model):
    primer_nombre = models.CharField(max_length=100)
    segundo_nombre = models.CharField(max_length=100, blank=True, null=True)
    primer_apellido = models.CharField(max_length=100)
    segundo_apellido = models.CharField(max_length=100, blank=True, null=True)
    numero_documento = models.CharField(max_length=50, unique=True)
    tipo_documento = models.ForeignKey(TipoDocumento, on_delete=models.PROTECT)
    fecha_nacimiento = models.DateField()

##class Usuario(AbstractUser): terminar y mirar bien
    