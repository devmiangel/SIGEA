from pathlib import Path

from django.core.management.base import BaseCommand

from documentos.services.pdf_service import generar_visita_tecnica


class Command(BaseCommand):

    def handle(self, *args, **kwargs):

        self.stdout.write("Generando PDF...")

        BASE_DIR = Path(__file__).resolve().parents[4]

        salida = BASE_DIR / "media" / "GDE-F011_Visita_Tecnica.pdf"

        generar_visita_tecnica(str(salida))

        self.stdout.write(self.style.SUCCESS(f"PDF generado correctamente en {salida}"))
