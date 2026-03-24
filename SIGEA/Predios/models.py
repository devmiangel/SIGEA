from django.db import models

class Sectores(models.Model):
    NombreSector = models.CharField(max_length=255)

    def __str__(self):
        return self.NombreSector


class Veredas(models.Model):
    NombreVereda = models.CharField(max_length=255)
    Sector = models.ForeignKey(Sectores, on_delete=models.PROTECT)
    def __str__(self):
        return self.NombreVereda


class TiposTenencias(models.Model):
    TipoTenencia = models.CharField(max_length=255)

    def __str__(self):
        return self.TipoTenencia


class Seguros(models.Model):
    NombreSeguro = models.CharField(max_length=255)

    def __str__(self):
        return self.NombreSeguro


class TiposRegistrosICA(models.Model):
    CodigoICA = models.CharField(max_length=255)

    def __str__(self):
        return self.CodigoICA


class Predios(models.Model):
    NombrePredio = models.CharField(max_length=255)
    AreaPredio = models.DecimalField(max_digits=10, decimal_places=3)
    AccesoCredito = models.BooleanField(default=False)
    UsoSuelo = models.BooleanField(default=False)
    Latitud = models.DecimalField(max_digits=16, decimal_places=14, null=True, blank=True)
    Longitud = models.DecimalField(max_digits=16, decimal_places=14, null=True, blank=True)
    Direccion = models.CharField(max_length=255, null=True, blank=True)
    TipoTenencia = models.ForeignKey(TiposTenencias, on_delete=models.PROTECT)
    Seguro = models.ForeignKey(Seguros, on_delete=models.PROTECT, null=True, blank=True)
    Sector = models.ForeignKey(Sectores, on_delete=models.PROTECT, null=True, blank=True)
    TiposRegistroICA = models.ManyToManyField(TiposRegistrosICA, blank=True)

    def __str__(self):
        return self.NombrePredio
