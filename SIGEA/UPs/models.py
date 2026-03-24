from django.db import models
from Predios.models import Predios
from Usuarios.models import Productores, Funcionarios

class TipoUP(models.Model):
    TipoUP = models.CharField(max_length=255)

    def __str__(self):
        return self.TipoUP

class ActividadUP(models.Model):
    Actividad = models.CharField(max_length=255)

    def __str__(self):
        return self.Actividad

class Unidades(models.Model):
    Unidad = models.CharField(max_length=255)

    def __str__(self):
        return self.Unidad

class UP(models.Model):
    Productor = models.ForeignKey(Productores, on_delete=models.CASCADE)
    Predio = models.ForeignKey(Predios, on_delete=models.CASCADE)
    TipoUP = models.ForeignKey(TipoUP, on_delete=models.PROTECT)
    RUEA = models.CharField(max_length=255)
    FechaCaracterizacion = models.DateField()
    FechaActualizacion = models.DateField()
    Funcionario = models.ForeignKey(Funcionarios, on_delete=models.PROTECT)

    def __str__(self):
        return f"UP {self.id}"

class ArchivosUP(models.Model):
    UP = models.ForeignKey(UP, on_delete=models.CASCADE)
    RutaArchivo = models.CharField(max_length=255)
    Descripcion = models.CharField(max_length=255)

    def __str__(self):
        return self.Descripcion

class DetalleUP(models.Model):
    UP = models.ForeignKey(UP, on_delete=models.CASCADE)
    Actividad = models.ForeignKey(ActividadUP, on_delete=models.PROTECT)
    NumeroEmpleados = models.IntegerField()
    Asociatividad = models.BooleanField(default=False)
    AreaCultivada = models.DecimalField(max_digits=10, decimal_places=2)
    AreaPastos = models.DecimalField(max_digits=10, decimal_places=2)
    NumeroPotreros = models.IntegerField()
    NumeroInvernaderos = models.IntegerField()
    NumeroTanques = models.IntegerField()
    NumeroReservorios = models.IntegerField()
    FuentesAgua = models.BooleanField(default=False)
    FechaActualizacion = models.DateField()

class ProductosUPs(models.Model):
    Producto = models.CharField(max_length=255)
    Unidad = models.ForeignKey("Unidades", on_delete=models.PROTECT)

    def __str__(self):
        return self.Producto

class ProduccionUPAgricola(models.Model):
    UP = models.ForeignKey(UP, on_delete=models.CASCADE)
    Producto = models.ForeignKey(ProductosUPs, on_delete=models.PROTECT)
    Cantidad = models.IntegerField()

class ProduccionUPAgroindustrial(models.Model):
    UP = models.ForeignKey(UP, on_delete=models.CASCADE)
    Producto = models.ForeignKey(ProductosUPs, on_delete=models.PROTECT)
    Cantidad = models.IntegerField()
    INVIMA = models.BooleanField(default=False)

class GrupoAnimal(models.Model):
    GrupoAnimal = models.CharField(max_length=255)

    def __str__(self):
        return self.GrupoAnimal

class TiposAves(models.Model):
    TipoAve = models.CharField(max_length=255)

    def __str__(self):
        return self.TipoAve

class Propositos(models.Model):
    Proposito = models.CharField(max_length=255)

    def __str__(self):
        return self.Proposito

class Animales(models.Model):
    GrupoAnimal = models.ForeignKey(GrupoAnimal, on_delete=models.PROTECT)
    Cantidad = models.IntegerField()
    UP = models.ForeignKey(UP, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.GrupoAnimal} - {self.Cantidad}"

class Razas(models.Model):
    Raza = models.CharField(max_length=255)
    Animal = models.ForeignKey(Animales, on_delete=models.PROTECT)

    def __str__(self):
        return self.Raza

class ProductosApicolas(models.Model):
    ProductoApicolas = models.CharField(max_length=255)

    def __str__(self):
        return self.ProductoApicolas

class DetalleBovinos(models.Model):
    Animal = models.ForeignKey(Animales, on_delete=models.CASCADE)
    Raza = models.ForeignKey(Razas, on_delete=models.PROTECT)
    Proposito = models.ForeignKey(Propositos, on_delete=models.PROTECT)
    NumeroMachos = models.IntegerField()
    NumeroHembras = models.IntegerField()
    RUV = models.CharField(max_length=255)

class DetalleAves(models.Model):
    Animal = models.ForeignKey(Animales, on_delete=models.CASCADE)
    Raza = models.ForeignKey(Razas, on_delete=models.PROTECT)
    TipoAve = models.ForeignKey(TiposAves, on_delete=models.PROTECT)
    Cantidad = models.IntegerField()

class DetallePorcinos(models.Model):
    Animal = models.ForeignKey(Animales, on_delete=models.CASCADE)
    Raza = models.ForeignKey(Razas, on_delete=models.PROTECT)
    Proposito = models.ForeignKey(Propositos, on_delete=models.PROTECT)
    Chapeta = models.BooleanField(default=False)

class DetalleEquinos(models.Model):
    Animal = models.ForeignKey(Animales, on_delete=models.CASCADE)
    Raza = models.ForeignKey(Razas, on_delete=models.PROTECT)
    Proposito = models.ForeignKey(Propositos, on_delete=models.PROTECT)

class DetalleCaprinos(models.Model):
    Animal = models.ForeignKey(Animales, on_delete=models.CASCADE)
    Raza = models.ForeignKey(Razas, on_delete=models.PROTECT)
    Proposito = models.ForeignKey(Propositos, on_delete=models.PROTECT)

class DetalleOvinos(models.Model):
    Animal = models.ForeignKey(Animales, on_delete=models.CASCADE)
    Raza = models.ForeignKey(Razas, on_delete=models.PROTECT)
    Proposito = models.ForeignKey(Propositos, on_delete=models.PROTECT)

class DetalleConejos(models.Model):
    Animal = models.ForeignKey(Animales, on_delete=models.CASCADE)
    Raza = models.ForeignKey(Razas, on_delete=models.PROTECT)
    Proposito = models.ForeignKey(Propositos, on_delete=models.PROTECT)

class DetalleCuries(models.Model):
    Animal = models.ForeignKey(Animales, on_delete=models.CASCADE)
    Raza = models.ForeignKey(Razas, on_delete=models.PROTECT)
    Proposito = models.ForeignKey(Propositos, on_delete=models.PROTECT)

class DetallePeces(models.Model):
    Animal = models.ForeignKey(Animales, on_delete=models.CASCADE)
    Raza = models.ForeignKey(Razas, on_delete=models.PROTECT)
    NumeroEstanques = models.IntegerField()

class DetalleApicolas(models.Model):
    Animal = models.ForeignKey(Animales, on_delete=models.CASCADE)
    Raza = models.ForeignKey(Razas, on_delete=models.PROTECT)
    ProductosApicolas = models.ForeignKey(ProductosApicolas, on_delete=models.PROTECT)