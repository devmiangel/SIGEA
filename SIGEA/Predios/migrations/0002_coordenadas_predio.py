# Generated to fix coordenadas: 16,14 solo permitia 2 enteros + 14 decimales
# y rechazaba precision normal de GPS. Se amplia a 11,8 (3 enteros + 8 decimales).
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Predios', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='predios',
            name='Latitud',
            field=models.DecimalField(blank=True, decimal_places=8, max_digits=11, null=True),
        ),
        migrations.AlterField(
            model_name='predios',
            name='Longitud',
            field=models.DecimalField(blank=True, decimal_places=8, max_digits=11, null=True),
        ),
    ]
