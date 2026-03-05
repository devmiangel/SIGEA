from django.contrib.auth.models import AbstractUser
from django.db import models

class TipoDocumento(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

class TipoContacto(models.Model):
    nombre = models.CharField(max_length=255)

    def __str__(self):
        return self.nombre

class TipoNivelEducativo(models.Model):
    nombre = models.CharField(max_length=255)

    def __str__(self):
        return self.nombre

class Sisben(models.Model):
    nivel = models.CharField(max_length=255)

    def __str__(self):
        return self.nivel

class Empresa(models.Model):
    nombre = models.CharField(max_length=255)

    def __str__(self):
        return self.nombre

class Contacto(models.Model):
    contacto = models.CharField(max_length=255)
    tipo_contacto = models.ForeignKey(TipoContacto, on_delete=models.PROTECT)

    def __str__(self):
        return self.contacto

class Persona(models.Model):
    primer_nombre = models.CharField(max_length=255)
    segundo_nombre = models.CharField(max_length=255, blank=True, null=True)
    primer_apellido = models.CharField(max_length=255)
    segundo_apellido = models.CharField(max_length=255, blank=True, null=True)
    numero_documento = models.CharField(max_length=255, unique=True)
    tipo_documento = models.ForeignKey(TipoDocumento, on_delete=models.PROTECT)
    fecha_nacimiento = models.DateField()

    contactos = models.ManyToManyField('Contacto', blank=True)
    niveles_educativos = models.ManyToManyField(TipoNivelEducativo, blank=True)
    sisben = models.ManyToManyField(Sisben, blank=True)
    empresas = models.ManyToManyField(Empresa, blank=True)

    def __str__(self):
        return f"{self.primer_nombre} {self.primer_apellido}"

class Usuario(AbstractUser): #no tiene todos los campos del diagrama por que al heredar abstractuser se crean todos los otros
    username = None
    email = models.EmailField(unique=True)
    persona = models.OneToOneField(Persona, on_delete=models.CASCADE)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email
