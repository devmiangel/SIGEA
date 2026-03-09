from django.db import models
from Usuarios.models import Funcionarios, Administradores

#TABLAS DE VEHICCULOS

class TiposVehiculos(models.Model):
    TipoVehiculo = models.CharField(max_length=255)

    def __str__(self):
        return self.TipoVehiculo

class TiposCombustibles(models.Model):
    TipoCombustible = models.CharField(max_length=255)

    def __str__(self):
        return self.TipoCombustible

class MarcasVehiculos(models.Model):
    MarcaVehiculo = models.CharField(max_length=255)

    def __str__(self):
        return self.MarcaVehiculo

class LineasVehiculos(models.Model):
    LineaVehiculo = models.CharField(max_length=255)
    MarcaVehiculo = models.ForeignKey(MarcasVehiculos, on_delete=models.PROTECT)

    def __str__(self):
        return self.LineaVehiculo

class Vehiculos(models.Model):
    LineaVehiculo = models.ForeignKey(LineasVehiculos, on_delete=models.PROTECT)
    TipoCombustible = models.ForeignKey(TiposCombustibles, on_delete=models.PROTECT)
    TipoVehiculo = models.ForeignKey(TiposVehiculos, on_delete=models.PROTECT)

class DetalleVehiculos(models.Model):
    Vehiculo = models.ForeignKey(Vehiculos, on_delete=models.CASCADE)
    Placa = models.CharField(max_length=255)
    Modelo = models.CharField(max_length=255)
    FechaTecno = models.DateField()
    FechaSoat = models.DateField()

    def __str__(self):
        return self.Placa

class Conductores(models.Model):
    Funcionario = models.ForeignKey(Funcionarios, on_delete=models.CASCADE)
    Licencia = models.CharField(max_length=255)

    def __str__(self):
        return self.Licencia

class RegistroAsignacionVehiculos(models.Model):
    DetalleVehiculo = models.ForeignKey(DetalleVehiculos, on_delete=models.CASCADE)
    Conductor = models.ForeignKey(Conductores, on_delete=models.CASCADE)
    Administrador = models.ForeignKey(Administradores, on_delete=models.CASCADE)
    FechaAsignacion = models.DateField()
    FechaDevolucion = models.DateField(null=True, blank=True)
    Entregado = models.BooleanField(default=False)

#FIN TABLAS DE VEHIICULOS

#TABLAS DE HERRAAMIENTAS

class TiposHerramientas(models.Model):
    TipoHerramienta = models.CharField(max_length=255)

    def __str__(self):
        return self.TipoHerramienta

class Herramientas(models.Model):
    Herramienta = models.CharField(max_length=255)
    TipoHerramienta = models.ForeignKey(TiposHerramientas, on_delete=models.PROTECT)

    def __str__(self):
        return self.Herramienta

class AsignacionHerramientas(models.Model):
    Herramienta = models.ForeignKey(Herramientas, on_delete=models.CASCADE)
    Funcionario = models.ForeignKey(Funcionarios, on_delete=models.CASCADE)
    Administrador = models.ForeignKey(Administradores, on_delete=models.CASCADE)
    FechaAsignacion = models.DateField()
    FechaDevolucion = models.DateField(null=True, blank=True)
    Entregado = models.BooleanField(default=False)

    def __str__(self):
        return str(self.Herramienta)

#FIN TABLAS DE HERRAMOINTAS

#TABLAS DE INSUMOS

class UnidadesMedida(models.Model):
    UnidadMedida = models.CharField(max_length=100)

    def __str__(self):
        return self.UnidadMedida

class Insumos(models.Model):
    Nombre = models.CharField(max_length=255)
    Cantidad = models.IntegerField()
    UnidadMedida = models.ForeignKey(UnidadesMedida, on_delete=models.PROTECT)

    def __str__(self):
        return self.Nombre

class InventarioFuncionario(models.Model):
    Insumo = models.ForeignKey(Insumos, on_delete=models.CASCADE)
    Funcionario = models.ForeignKey(Funcionarios, on_delete=models.CASCADE)
    Cantidad = models.IntegerField()

    def __str__(self):
        return str(self.Funcionario)

class CardexInsumoFuncionario(models.Model):
    Funcionario = models.ForeignKey(Funcionarios, on_delete=models.CASCADE)
    Insumo = models.ForeignKey(Insumos, on_delete=models.CASCADE)
    Administrador = models.ForeignKey(Administradores, on_delete=models.CASCADE)
    Cantidad = models.IntegerField()
    FechaAsignacion = models.DateField()

    def __str__(self):
        return f"Funcionario: {self.Funcionario} | Insumo: {self.Insumo} | Cantidad: {self.Cantidad}"
#FIN TABLAS DE INSUMOS