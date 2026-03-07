from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import Group
from django.db import models

class TiposDocumentos(models.Model):
    TipoDocumento = models.CharField(max_length=100)

    def __str__(self):
        return self.TipoDocumento


class TiposContactos(models.Model):
    TipoContacto = models.CharField(max_length=255)

    def __str__(self):
        return self.TipoContacto


class TiposNivelesEducativos(models.Model):
    TipoNivelEducativo = models.CharField(max_length=255)

    def __str__(self):
        return self.TipoNivelEducativo


class Sisben(models.Model):
    NivelSisben = models.CharField(max_length=255)

    def __str__(self):
        return self.NivelSisben


class Empresas(models.Model):
    NombreEmpresa = models.CharField(max_length=255)

    def __str__(self):
        return self.NombreEmpresa


class Contactos(models.Model):
    contacto = models.CharField(max_length=255)
    TipoContacto = models.ForeignKey(TiposContactos, on_delete=models.PROTECT)

    def __str__(self):
        return self.contacto


class Personas(models.Model):
    primer_nombre = models.CharField(max_length=255)
    segundo_nombre = models.CharField(max_length=255, blank=True, null=True)
    primer_apellido = models.CharField(max_length=255)
    segundo_apellido = models.CharField(max_length=255, blank=True, null=True)
    numero_documento = models.CharField(max_length=255, unique=True)
    TipoDocumento = models.ForeignKey(TiposDocumentos, on_delete=models.PROTECT)
    fecha_nacimiento = models.DateField()

    contactos = models.ManyToManyField(Contactos, blank=True)
    TipoNivelEducativo = models.ManyToManyField(TiposNivelesEducativos, blank=True)
    NivelSisben = models.ManyToManyField(Sisben, blank=True)
    Empresa = models.ManyToManyField(Empresas, blank=True)

    def __str__(self):
        return f"{self.primer_nombre} {self.primer_apellido}"


class Usuario(AbstractUser):
    username = None
    first_name = None
    last_name = None
    email = models.EmailField(unique=True)
    persona = models.OneToOneField(Personas, on_delete=models.CASCADE)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

#FALTA CREAR LOS GRUPOSDE CADA ROL
class Funcionarios(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.usuario)

class Administradores(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.usuario)

class Productores(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.usuario)
