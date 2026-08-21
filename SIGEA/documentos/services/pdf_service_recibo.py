# -*- coding: utf-8 -*-
import base64
from io import BytesIO
from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

W, H = letter
LEFT = 35
RIGHT = W - 35
TOTAL_W = RIGHT - LEFT
TOP = H - 35


def _datos_desde_visita(visita):
    solicitud = visita.Solicitud
    up = solicitud.UP
    persona = solicitud.Usuario.persona

    telefono = ''
    try:
        cel = persona.contactos.filter(TipoContacto__TipoContacto='Celular').first()
        telefono = cel.contacto if cel else ''
    except Exception:
        telefono = ''

    sector = up.Predio.Sector if up and up.Predio.Sector else None
    datos = {
        'fecha': str(visita.FechaYHoraVisita.date()) if visita.FechaYHoraVisita else '',
        'usuario': (persona.primer_nombre or '') + ' ' + (persona.primer_apellido or ''),
        'cedula': persona.numero_documento or '',
        'vereda': sector.Vereda.NombreVereda if sector and sector.Vereda else '',
        'telefono': telefono,
        'sector': sector.NombreSector if sector else '',
        'ruea': up.RUEA if up else '',
        'funcionario': str(visita.Funcionario.usuario.persona),
        'firma_usuario': visita.FirmaProductor or '',
        'firma_extensionista': visita.FirmaFuncionario or '',
        'observaciones': solicitud.Observacion or '',
        'servicios': list(),
    }

    from Visitas.models import VisitasServiciosPagos

    for sp in VisitasServiciosPagos.objects.filter(Visita=visita).select_related('ServicioPago', 'Apero', 'Pajilla'):
        datos['servicios'].append({
            'ServicioPago': sp.ServicioPago.ServicioPago,
            'Apero': sp.Apero.Apero if sp.Apero else '',
            'NumeroHoras': sp.NumeroHoras,
            'ValorHora': sp.Apero.ValorHora if sp.Apero else 0,
            'NumeroPajillas': sp.NumeroPajillas,
            'ValorPajilla': sp.Pajilla.ValorPajilla if sp.Pajilla else 0,
            'Pajilla': sp.Pajilla.Pajilla if sp.Pajilla else '',
            'Toro': sp.Toro,
            'ValorTotal': sp.ValorTotal,
        })
    return datos


def generar_documento_recibo_bytes(visita_id):
    from Visitas.models import Visitas

    visita = Visitas.objects.get(id=visita_id)
    buf = BytesIO()
    generar_recibo(buf, _datos_desde_visita(visita))
    return buf.getvalue()


def generar_recibo(salida, datos=None):
    datos = datos or {}
    servicios = datos.get('servicios', [])

    c = canvas.Canvas(salida, pagesize=letter)

    def h_line(x0, x1, y, w=0.8):
        c.setLineWidth(w)
        c.line(x0, y, x1, y)

    def v_line(x, y0, y1, w=0.8):
        c.setLineWidth(w)
        c.line(x, y0, x, y1)

    def rect(x0, y0, x1, y1, w=0.8):
        c.setLineWidth(w)
        c.rect(x0, y0, x1 - x0, y1 - y0, stroke=1, fill=0)

    def text(x, y, s, size=9, bold=False):
        c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
        c.drawString(x, y, s)

    def text_center(xc, y, s, size=9, bold=False):
        c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
        c.drawCentredString(xc, y, s)

    def checkbox(x, y, size=10, checked=False):
        c.setLineWidth(0.8)
        c.rect(x, y, size, size, stroke=1, fill=0)
        if checked:
            text(x + 2, y + 1, "X", size=9, bold=True)

    def cell_text(x0, x1, y_top, y_bot, s, bold=False, size=9, align="left"):
        ty = (y_top + y_bot) / 2 - size * 0.35
        if align == "left":
            text(x0 + 4, ty, s, size=size, bold=bold)
        elif align == "center":
            text_center((x0 + x1) / 2, ty, s, size=size, bold=bold)

    def row(y_top, height, cells, x0=LEFT, total_w=TOTAL_W, outer_w=0.8):
        y_bot = y_top - height
        rect(x0, y_bot, x0 + total_w, y_top, w=outer_w)
        cx = x0
        for cell in cells:
            wf, s, bold, align = cell[0], cell[1], cell[2], cell[3]
            size = cell[4] if len(cell) > 4 else 9
            cw = wf * total_w
            if cx > x0:
                v_line(cx, y_bot, y_top)
            cell_text(cx, cx + cw, y_top, y_bot, s, bold=bold, align=align, size=size)
            cx += cw
        return y_bot

    def dibujar_firma(b64, x0, x1, linea_y, max_h=34):
        if not b64:
            return
        b64 = str(b64).strip()
        if ',' in b64 and b64.lower().startswith('data:'):
            b64 = b64.split(',', 1)[1]
        try:
            data = base64.b64decode(b64)
            img = ImageReader(BytesIO(data))
            iw, ih = img.getSize()
        except Exception:
            return
        max_w = x1 - x0
        scale = min(max_w / iw, max_h / ih)
        w = iw * scale
        h = ih * scale
        x = x0 + (max_w - w) / 2
        y = linea_y + 4
        c.drawImage(img, x, y, width=w, height=h, mask='auto')

    # ---------------- encabezado ----------------
    def draw_header(y_top):
        header_h = 55
        header_bot = y_top - header_h
        logo_w = 70
        info_w = 175
        title_x0 = LEFT + logo_w
        title_x1 = RIGHT - info_w

        rect(LEFT, header_bot, RIGHT, y_top, w=1.1)
        v_line(title_x0, header_bot, y_top)
        v_line(title_x1, header_bot, y_top)

        logo_dir = Path(__file__).resolve().parents[1] / "logo"
        logo_path = None
        if logo_dir.exists():
            for f in logo_dir.iterdir():
                if f.suffix.lower() in (".png", ".jpg", ".jpeg", ".gif"):
                    logo_path = f
                    break
        if logo_path is not None and logo_path.exists():
            c.drawImage(str(logo_path), LEFT + logo_w / 2 - 20, (y_top + header_bot) / 2 - 20,
                        width=40, height=40, preserveAspectRatio=True, mask="auto")
        else:
            c.setLineWidth(1)
            c.circle(LEFT + logo_w / 2, (y_top + header_bot) / 2, 20, stroke=1, fill=0)
            text_center(LEFT + logo_w / 2, (y_top + header_bot) / 2 - 3, "LOGO", size=6)

        title_lines = ["RECIBO DE PAGO DE SERVICIOS", "AGROPECUARIOS"]
        tc_x = (title_x0 + title_x1) / 2
        ty = y_top - 22
        for line in title_lines:
            text_center(tc_x, ty, line, size=11, bold=True)
            ty -= 14

        info_lines = [("CÓDIGO:", "GDE-F005"), ("VERSIÓN:", "006"), ("FECHA:", "AGOSTO 2025")]
        ty = y_top - 15
        for k, v in info_lines:
            text(title_x1 + 6, ty, k, size=8.5, bold=True)
            text(title_x1 + 70, ty, v, size=8.5)
            ty -= 13

        return header_bot

    # ---------------- un recibo completo ----------------
    def es_maquinaria(s):
        return 'maquinaria' in s.get('ServicioPago', '').lower() or s.get('Apero')

    def es_inseminacion(s):
        return 'inseminacion' in s.get('ServicioPago', '').lower() or s.get('Pajilla')

    maq = [s for s in servicios if es_maquinaria(s)]
    ins = [s for s in servicios if es_inseminacion(s)]

    y = draw_header(TOP)
    y -= 8

    # Fila: Fecha | [] Maquinaria Agrícola | [] Inseminación Artificial
    fr = [0.14, 0.22, 0.32, 0.32]
    y = row(y, 20, [
        (fr[0], "Fecha:", True, "left"), (fr[1], datos.get('fecha') or '', False, "left"),
        (fr[2], "", False, "left"), (fr[3], "", False, "left")])
    cb_size = 10
    cb_y = y + 5
    x_maq = LEFT + (fr[0] + fr[1]) * TOTAL_W
    x_ins = x_maq + fr[2] * TOTAL_W
    for x0, lab, marcado in [(x_maq, "Maquinaria Agrícola", bool(maq)),
                             (x_ins, "Inseminación Artificial", bool(ins))]:
        checkbox(x0 + 4, cb_y, cb_size, checked=marcado)
        text(x0 + 4 + cb_size + 3, cb_y + 1, lab, size=9)

    # Filas: Usuario/Cédula, Vereda/Teléfono, Sector/RUEA
    for l1, v1, l2, v2 in [
            ("Usuario:", datos.get('usuario') or '', "Cédula:", datos.get('cedula') or ''),
            ("Vereda:", datos.get('vereda') or '', "Teléfono:", datos.get('telefono') or ''),
            ("Sector:", datos.get('sector') or '', "Nº de RUEA:", datos.get('ruea') or '')]:
        y = row(y, 18, [(0.16, l1, False, "left"), (0.34, v1, False, "left"),
                        (0.16, l2, False, "left"), (0.34, v2, False, "left")])

    y -= 14

    # Tabla 1: Nº Horas | Valor Unitario | Valor Total | Apero o Implemento
    fr1 = [0.16, 0.22, 0.20, 0.42]
    y = row(y, 16, [(fr1[0], "Nº Horas", True, "center"), (fr1[1], "Valor Unitario", True, "center"),
                    (fr1[2], "Valor Total", True, "center"), (fr1[3], "Apero o Implemento", True, "center")])
    for i in range(3):
        a = maq[i] if i < len(maq) else None
        hora = a['NumeroHoras'] if a else ''
        unit = a['ValorHora'] if a else ''
        total = a['ValorTotal'] if a else ''
        apero = a['Apero'] if a else ''
        y = row(y, 18, [(fr1[0], str(hora), False, "center"), (fr1[1], str(unit), False, "center"),
                        (fr1[2], str(total), False, "center"), (fr1[3], str(apero), False, "left")])

    y -= 22

    # Tabla 2: No. Pajillas | Toro | Valor Unitario | Valor Total
    t2_w = TOTAL_W * 0.85
    t2_x0 = LEFT + (TOTAL_W - t2_w) / 2
    y = row(y, 16, [(0.22, "No. Pajillas", True, "center"), (0.28, "Toro", True, "center"),
                    (0.25, "Valor Unitario", True, "center"), (0.25, "Valor Total", True, "center")],
            x0=t2_x0, total_w=t2_w)
    for i in range(3):
        a = ins[i] if i < len(ins) else None
        paj = a['NumeroPajillas'] if a else ''
        toro = 'SI' if (a and a['Toro']) else ('NO' if a else '')
        unit = a['ValorPajilla'] if a else ''
        total = a['ValorTotal'] if a else ''
        y = row(y, 18, [(0.22, str(paj), False, "center"), (0.28, str(toro), False, "center"),
                        (0.25, str(unit), False, "center"), (0.25, str(total), False, "center")],
                x0=t2_x0, total_w=t2_w)

    y -= 30

    # Observaciones
    obs = datos.get('observaciones') or ''
    y = row(y, 18, [(0.16, "Observaciones:", True, "left"), (0.84, obs, False, "left")])

    y -= 60

    # Firmas (líneas bajas: espacio amplio para poder firmar encima)
    sig_w = 210
    x_left_sig = LEFT + 5
    x_right_sig = RIGHT - 5 - sig_w
    dibujar_firma(datos.get('firma_extensionista'), x_left_sig, x_left_sig + sig_w, y)
    dibujar_firma(datos.get('firma_usuario'), x_right_sig, x_right_sig + sig_w, y)
    h_line(x_left_sig, x_left_sig + sig_w, y, w=0.8)
    h_line(x_right_sig, x_right_sig + sig_w, y, w=0.8)
    y -= 14
    text_center(x_left_sig + sig_w / 2, y, "FIRMA DEL FUNCIONARIO", size=9)
    text_center(x_right_sig + sig_w / 2, y - 13, "FIRMA DEL USUARIO", size=9)

    c.showPage()
    c.save()