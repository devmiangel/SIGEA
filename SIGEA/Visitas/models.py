from django.db import models
from Usuarios.models import Funcionarios
from UPs.models import UP
from Inventario.models import Insumos, InventarioFuncionario


class MotivosSolicitudes(models.Model):
    MotivoSolicitud = models.CharField(max_length=255)

    def __str__(self):
        return self.MotivoSolicitud

class Estados(models.Model):
    Estado = models.CharField(max_length=255)

    def __str__(self):
        return self.Estado

class Solicitudes(models.Model):
    UP = models.ForeignKey(UP, on_delete=models.PROTECT)
    FechaSolicitud = models.DateField(auto_now_add=True)
    MotivoSolicitud = models.ForeignKey(MotivosSolicitudes, on_delete=models.PROTECT)
    Observacion = models.CharField(max_length=255)
    Estado = models.ForeignKey(Estados, on_delete=models.PROTECT)

    def __str__(self):
        return self.MotivoSolicitud

class TiposVisitas(models.Model):
    TipoVisita = models.CharField(max_length=255)

    def __str__(self):
        return self.TipoVisita

class Visitas(models.Model):
    Solicitud = models.ForeignKey(Solicitudes, on_delete=models.CASCADE)
    Funcionario = models.ForeignKey(Funcionarios, on_delete=models.CASCADE, related_name="visitas_funcionario")
    Administrador = models.ForeignKey(Funcionarios, on_delete=models.CASCADE, related_name="visitas_administrador")
    TipoVisita = models.ForeignKey(TiposVisitas, on_delete=models.PROTECT)
    FechaVisita = models.DateField()
    RutaDocumento = models.CharField(max_length=255)

    def __str__(self):
        return self.TipoVisita

class InsumoVisita(models.Model):
    Visita = models.ForeignKey(Visitas, on_delete=models.CASCADE)
    InventarioFuncionario = models.ForeignKey(InventarioFuncionario, on_delete=models.PROTECT)
    Cantidad = models.IntegerField()

    def __str__(self):
        return f"{self.InventarioFuncionario} - {self.Cantidad}"

class Calificaciones(models.Model):
    Calificacion = models.CharField(max_length=255)

    def __str__(self):
        return self.Calificacion

class InfoVisita(models.Model):
    Visita = models.ForeignKey(Visitas, on_delete=models.CASCADE)
    Calificacion = models.ForeignKey(Calificaciones, on_delete=models.PROTECT)
    ObservacionVisita = models.TextField()
    AccionSeguimiento = models.CharField(max_length=255)
    Firmado = models.BooleanField(default=False)

