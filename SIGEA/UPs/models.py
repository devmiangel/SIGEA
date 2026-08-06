from django.db import models
from Predios.models import Predios
from Usuarios.models import Productores, Funcionarios

class TipoUP(models.Model):
    TipoUP = models.CharField(max_length=255)

    def __str__(self):
        return self.TipoUP

class EstadosUP(models.Model):
    Estado = models.CharField(max_length=255)

    def __str__(self):
        return self.Estado

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
    RUEA = models.CharField(max_length=20, unique=True, blank=True)
    FechaCaracterizacion = models.DateField()
    FechaActualizacion = models.DateField()
    Funcionario = models.ForeignKey(Funcionarios, on_delete=models.PROTECT)
    idEstado = models.ForeignKey(EstadosUP, on_delete=models.PROTECT, null=True, blank=True)

    #GENERACION DE CODIGO RUEA
    def save(self, *args, **kwargs):
        if not self.pk:
            super().save(*args, **kwargs)
            self.RUEA = f"RUDEA-{self.pk:07d}"
            super().save(update_fields=['RUEA'])
        else:
            super().save(*args, **kwargs)

    def __str__(self):
        return f"UP {self.id}"

class ArchivosUP(models.Model):
    UP = models.ForeignKey(UP, on_delete=models.CASCADE)
    RutaArchivo = models.CharField(max_length=255)
    NombreArchivo = models.CharField(max_length=255, blank=True)
    Descripcion = models.CharField(max_length=255)

    def __str__(self):
        return self.Descripcion

class DetalleUP(models.Model):
    UP = models.ForeignKey(UP, on_delete=models.CASCADE)
    Actividad = models.ForeignKey(ActividadUP, on_delete=models.PROTECT, null=True, blank=True)
    NumeroEmpleados = models.IntegerField(null=True, blank=True)
    Asociatividad = models.BooleanField(default=False)
    AreaCultivada = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    AreaPastos = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    NumeroPotreros = models.IntegerField(null=True, blank=True)
    NumeroInvernaderos = models.IntegerField(null=True, blank=True)
    NumeroTanques = models.IntegerField(null=True, blank=True)
    NumeroReservorios = models.IntegerField(null=True, blank=True)
    FuentesAgua = models.BooleanField(default=False)
    FechaActualizacion = models.DateField(blank=True, null=True)

class ProductosUPs(models.Model):
    Producto = models.CharField(max_length=255)
    Unidad = models.ForeignKey("Unidades", on_delete=models.PROTECT, null=True, blank=True)

    def __str__(self):
        return self.Producto

class ProduccionUPAgricola(models.Model):
    UP = models.ForeignKey(UP, on_delete=models.CASCADE)
    Producto = models.ForeignKey(ProductosUPs, on_delete=models.PROTECT)
    Cantidad = models.IntegerField(null=True, blank=True)

class ProduccionUPAgroindustrial(models.Model):
    UP = models.ForeignKey(UP, on_delete=models.CASCADE)
    Producto = models.ForeignKey(ProductosUPs, on_delete=models.PROTECT)
    Cantidad = models.IntegerField(null=True, blank=True)
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
    Cantidad = models.IntegerField(null=True, blank=True)
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
    Raza = models.ForeignKey(Razas, on_delete=models.PROTECT, null=True, blank=True)
    Proposito = models.ForeignKey(Propositos, on_delete=models.PROTECT, null=True, blank=True)
    NumeroMachos = models.IntegerField(null=True, blank=True)
    NumeroHembras = models.IntegerField(null=True, blank=True)
    RUV = models.CharField(max_length=255, null=True, blank=True)

class DetalleAves(models.Model):
    Animal = models.ForeignKey(Animales, on_delete=models.CASCADE)
    Raza = models.ForeignKey(Razas, on_delete=models.PROTECT, null=True, blank=True)
    TipoAve = models.ForeignKey(TiposAves, on_delete=models.PROTECT, null=True, blank=True)
    Cantidad = models.IntegerField(null=True, blank=True)

class DetallePorcinos(models.Model):
    Animal = models.ForeignKey(Animales, on_delete=models.CASCADE)
    Raza = models.ForeignKey(Razas, on_delete=models.PROTECT, null=True, blank=True)
    Proposito = models.ForeignKey(Propositos, on_delete=models.PROTECT, null=True, blank=True)
    Chapeta = models.BooleanField(default=False)

class DetalleEquinos(models.Model):
    Animal = models.ForeignKey(Animales, on_delete=models.CASCADE)
    Raza = models.ForeignKey(Razas, on_delete=models.PROTECT, null=True, blank=True)
    Proposito = models.ForeignKey(Propositos, on_delete=models.PROTECT, null=True, blank=True)

class DetalleCaprinos(models.Model):
    Animal = models.ForeignKey(Animales, on_delete=models.CASCADE)
    Raza = models.ForeignKey(Razas, on_delete=models.PROTECT, null=True, blank=True)
    Proposito = models.ForeignKey(Propositos, on_delete=models.PROTECT, null=True, blank=True)

class DetalleOvinos(models.Model):
    Animal = models.ForeignKey(Animales, on_delete=models.CASCADE)
    Raza = models.ForeignKey(Razas, on_delete=models.PROTECT, null=True, blank=True)
    Proposito = models.ForeignKey(Propositos, on_delete=models.PROTECT, null=True, blank=True)

class DetalleConejos(models.Model):
    Animal = models.ForeignKey(Animales, on_delete=models.CASCADE)
    Raza = models.ForeignKey(Razas, on_delete=models.PROTECT, null=True, blank=True)
    Proposito = models.ForeignKey(Propositos, on_delete=models.PROTECT, null=True, blank=True)

class DetalleCuries(models.Model):
    Animal = models.ForeignKey(Animales, on_delete=models.CASCADE)
    Raza = models.ForeignKey(Razas, on_delete=models.PROTECT, null=True, blank=True)
    Proposito = models.ForeignKey(Propositos, on_delete=models.PROTECT, null=True, blank=True)

class DetallePeces(models.Model):
    Animal = models.ForeignKey(Animales, on_delete=models.CASCADE)
    Raza = models.ForeignKey(Razas, on_delete=models.PROTECT, null=True, blank=True)
    NumeroEstanques = models.IntegerField(null=True, blank=True)

class DetalleApicolas(models.Model):
    Animal = models.ForeignKey(Animales, on_delete=models.CASCADE)
    Raza = models.ForeignKey(Razas, on_delete=models.PROTECT, null=True, blank=True)
    ProductosApicolas = models.ForeignKey(ProductosApicolas, on_delete=models.PROTECT, null=True, blank=True)