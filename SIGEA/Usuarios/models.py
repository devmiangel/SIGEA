from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import Group
from django.contrib.auth.base_user import BaseUserManager
from django.db import models

# para no usar username en los usuarios### mirar mas adelante esto 

class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superusuario debe tener is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

##########################

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
    persona = models.OneToOneField(Personas, on_delete=models.PROTECT, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UsuarioManager()

    def __str__(self):
        return self.email

#FALTA CREAR LOS GRUPOSDE CADA ROL
class Funcionarios(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.PROTECT)

    def __str__(self):
        return str(self.usuario)

class Administradores(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.PROTECT)

    def __str__(self):
        return str(self.usuario)

class Productores(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.PROTECT)

    def __str__(self):
        return str(self.usuario)
