from django.db import migrations


def seed_estado_en_revision(apps, schema_editor):
    EstadosUP = apps.get_model('UPs', 'EstadosUP')
    UP = apps.get_model('UPs', 'UP')

    estado_en_revision, _ = EstadosUP.objects.get_or_create(Estado='En revision')

    UP.objects.filter(idEstado__isnull=True).update(idEstado=estado_en_revision)


def unseed_estado_en_revision(apps, schema_editor):
    EstadosUP = apps.get_model('UPs', 'EstadosUP')
    UP = apps.get_model('UPs', 'UP')

    en_revision = EstadosUP.objects.filter(Estado='En revision').first()
    if en_revision is not None:
        UP.objects.filter(idEstado=en_revision).update(idEstado=None)
        en_revision.delete()


class Migration(migrations.Migration):

    dependencies = [
        ('UPs', '0002_initial'),
    ]

    operations = [
        migrations.RunPython(seed_estado_en_revision, unseed_estado_en_revision),
    ]