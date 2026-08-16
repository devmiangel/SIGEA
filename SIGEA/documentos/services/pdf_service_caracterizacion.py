# -*- coding: utf-8 -*-
import base64
import re
import unicodedata
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
BOTTOM_MARGIN = 35


def _norm(s):
    s = unicodedata.normalize('NFD', s or '')
    return ''.join(c for c in s if not unicodedata.combining(c)).lower()


def _si_no(b):
    return 'Sí' if b else 'No'


def marcar_opciones(linea, valor):
    """Marca con X el guion (___) de la opcion que coincida con el valor."""
    v = _norm(valor or '').strip()
    if not v:
        return linea

    def rep(m):
        token = m.group(1)
        t = _norm(token).strip().rstrip(':')
        if not t:
            return m.group(0)
        prefijo = (len(t) >= 6 and len(v) >= 6 and t[:6] == v[:6])
        if t == v or t in v or v in t or prefijo:
            return token.rstrip() + ' X'
        return m.group(0)

    return re.sub(r'([A-Za-zÁÉÍÓÚÑáéíóúñ/]+[A-Za-zÁÉÍÓÚÑáéíóúñ/ :]*?)(_{2,})', rep, linea)


def _animal(datos, grupo):
    for a in datos.get('Animales', []):
        if _norm(a.get('GrupoAnimal')) == _norm(grupo):
            return a
    return None


def _datos_desde_caracterizacion(visita):
    from UPs.serializers import (
        InfoPersonalCaracterizacionSerializer,
        InfoPredioCaracterizacionSerializer,
        InfoUPCaracterizacionSerializer,
        InfoProduccionAgricolaSerializer,
        InfoProduccionAnimalSerializer,
        InfoProduccionAgroindustrialSerializer,
        InfoAdicionalCaracterizacionSerializer,
    )

    solicitud = visita.Solicitud
    up = solicitud.UP
    datos = {'hay_up': up is not None}

    if up is None:
        return datos

    datos['Personal'] = InfoPersonalCaracterizacionSerializer(up).data
    datos['Predio'] = InfoPredioCaracterizacionSerializer(up).data
    datos['UP'] = InfoUPCaracterizacionSerializer(up).data
    datos['Agricola'] = InfoProduccionAgricolaSerializer(up).data.get('ProduccionAgricola', [])
    datos['Animales'] = InfoProduccionAnimalSerializer(up).data.get('Animales', [])
    datos['Agroindustrial'] = InfoProduccionAgroindustrialSerializer(up).data.get('ProduccionAgroindustrial', [])
    datos['Adicional'] = InfoAdicionalCaracterizacionSerializer(up).data
    datos['fecha'] = str(up.FechaCaracterizacion or solicitud.FechaSolicitud or '')
    datos['observaciones'] = solicitud.Observacion or ''
    datos['firma_usuario'] = visita.FirmaProductor or ''
    datos['firma_extensionista'] = visita.FirmaFuncionario or ''
    return datos


def generar_documento_caracterizacion_bytes(visita_id):
    from Visitas.models import Visitas
    visita = Visitas.objects.get(id=visita_id)
    buf = BytesIO()
    generar_caracterizacion(buf, _datos_desde_caracterizacion(visita))
    return buf.getvalue()


def generar_caracterizacion(salida, datos=None):
    datos = datos or {}
    if isinstance(salida, (str, Path)):
        Path(salida).parent.mkdir(parents=True, exist_ok=True)

    c = canvas.Canvas(salida, pagesize=letter)


    # ---------------- low level helpers ----------------
    def h_line(x0, x1, y, w=0.8):
        c.setLineWidth(w)
        c.line(x0, y, x1, y)

    def v_line(x, y0, y1, w=0.8):
        c.setLineWidth(w)
        c.line(x, y0, x, y1)

    def rect(x0, y0, x1, y1, w=0.8):
        c.setLineWidth(w)
        c.rect(x0, y0, x1 - x0, y1 - y0, stroke=1, fill=0)

    def text(x, y, s, size=8, bold=False):
        c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
        c.drawString(x, y, s)

    def text_center(xc, y, s, size=8, bold=False):
        c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
        c.drawCentredString(xc, y, s)

    def wrap_text(s, font, size, max_w):
        words = s.split(" ")
        lines, cur = [], ""
        for wd in words:
            trial = (cur + " " + wd).strip()
            if c.stringWidth(trial, font, size) <= max_w:
                cur = trial
            else:
                if cur:
                    lines.append(cur)
                cur = wd
        if cur:
            lines.append(cur)
        return lines

    # ---------------- structural helpers ----------------
    def cell_text(x0, x1, y_top, y_bot, lines, bold=False, size=8, align="left"):
        if isinstance(lines, str):
            lines = [lines]
        n = len(lines)
        line_h = 9.5
        block_h = n * line_h
        ty = (y_top + y_bot) / 2 + block_h / 2 - 8
        for line in lines:
            if align == "left":
                text(x0 + 4, ty, line, size=size, bold=bold)
            elif align == "center":
                text_center((x0 + x1) / 2, ty, line, size=size, bold=bold)
            ty -= line_h

    def row(y_top, height, cells, x0=LEFT, total_w=TOTAL_W, outer_w=0.8):
        y_bot = y_top - height
        rect(x0, y_bot, x0 + total_w, y_top, w=outer_w)
        cx = x0
        for cell in cells:
            wf, lines, bold, align = cell[0], cell[1], cell[2], cell[3]
            size = cell[4] if len(cell) > 4 else 8
            cw = wf * total_w
            if cx > x0:
                v_line(cx, y_bot, y_top)
            cell_text(cx, cx + cw, y_top, y_bot, lines, bold=bold, align=align, size=size)
            cx += cw
        return y_bot

    def title_bar(y_top, height, title, x0=LEFT, total_w=TOTAL_W):
        y_bot = y_top - height
        rect(x0, y_bot, x0 + total_w, y_top, w=1.0)
        text_center(x0 + total_w / 2, (y_top + y_bot) / 2 - 3, title, size=9, bold=True)
        return y_bot

    def dibujar_firma(b64, x0, x1, linea_y, max_h=30):
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

    # ---------------- header ----------------
    def draw_header(y_top):
        header_h = 68
        header_bot = y_top - header_h
        logo_w = 70
        info_w = 145
        title_x0 = LEFT + logo_w
        title_x1 = RIGHT - info_w

        rect(LEFT, header_bot, RIGHT, y_top, w=1.2)
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
            c.circle(LEFT + logo_w / 2, (y_top + header_bot) / 2, 24, stroke=1, fill=0)
            text_center(LEFT + logo_w / 2, (y_top + header_bot) / 2 - 3, "LOGO", size=6.5)

        title_lines = [
            "CARACTERIZACIÓN",
            "ACTUALIZACIÓN Y SEGUIMIENTO A",
            "USUARIOS DEL SERVICIO PÚBLICO",
            "DE EXTENSIÓN RURAL",
            "AGROPECUARIA",
        ]
        tc_x = (title_x0 + title_x1) / 2
        ty = y_top - 14
        for line in title_lines:
            text_center(tc_x, ty, line, size=10.5, bold=True)
            ty -= 11.5

        row_h = header_h / 3
        y1 = y_top
        text(title_x1 + 6, y1 - row_h + 8, "GDE-F-", size=9, bold=True)
        text(title_x1 + 75, y1 - row_h + 8, "035", size=9)
        h_line(title_x1, RIGHT, y1 - row_h)
        text(title_x1 + 6, y1 - 2 * row_h + 8, "VERSIÓN", size=9, bold=True)
        text(title_x1 + 75, y1 - 2 * row_h + 8, "001", size=9)
        h_line(title_x1, RIGHT, y1 - 2 * row_h)
        text(title_x1 + 6, y1 - 3 * row_h + 8, "FECHA: FEBRERO 2025", size=8.5, bold=True)

        return header_bot

    personal = datos.get('Personal') or {}
    predio = datos.get('Predio') or {}
    up = datos.get('UP') or {}
    agricola = datos.get('Agricola') or []
    agroindustrial = datos.get('Agroindustrial') or []

    nombre = ' '.join(filter(None, [
        personal.get('PrimerNombreProductor'),
        personal.get('SegundoNombreProductor'),
        personal.get('PrimerApellidoProductor'),
        personal.get('SegundoApellidoProductor'),
    ]))

    def siguiente(items, default=''):
        if not items:
            return default
        return items.pop(0)

    def con_opciones(valor, opciones):
        """Si el valor es una opcion conocida la marca con X; si no, lo antepone al listado."""
        is_list = isinstance(opciones, list)
        if not is_list:
            opciones = [opciones]
        marcadas = [marcar_opciones(op, valor) for op in opciones]
        if any(m != o for m, o in zip(marcadas, opciones)):
            res = marcadas
        elif _norm(valor or '').strip():
            res = [f"{valor}   {opciones[0]}"] + opciones[1:]
        else:
            res = opciones
        return res if is_list else res[0]

    # ============================================================
    # PAGE 1
    # ============================================================
    y = draw_header(TOP)
    y -= 10

    # FECHA: standalone box
    fh = 18
    fw = 300
    y_bot = y - fh
    rect(LEFT, y_bot, LEFT + fw, y, w=0.9)
    v_line(LEFT + 70, y_bot, y)
    text(LEFT + 6, y_bot + 6, "FECHA:", size=8.5, bold=True)
    text(LEFT + 74, y_bot + 6, str(datos.get('fecha') or ''), size=8.5)
    y = y_bot - 8

    # ---------- INFORMACIÓN PERSONAL ----------
    y = title_bar(y, 14, "INFORMACIÓN PERSONAL")
    y = row(y, 14, [(0.28, "NOMBRE:", True, "left"), (0.72, nombre, False, "left")])
    y = row(y, 14, [(0.28, "RAZÓN SOCIAL:", True, "left"), (0.72, personal.get('RazonSocialProductor') or '', False, "left")])
    repr_legal = nombre if personal.get('RazonSocialProductor') else ''
    y = row(y, 14, [(0.28, "REPRESENTANTE LEGAL:", True, "left"), (0.72, repr_legal, False, "left")])
    y = row(y, 14, [(0.24, "TIPO DE DOCUMENTO:", True, "left"), (0.24, personal.get('TipoDocumentoProductor') or '', False, "left"),
                    (0.26, "NÚMERO DE DOCUMENTO:", True, "left"), (0.26, personal.get('DocumentoProductor') or '', False, "left")])
    y = row(y, 14, [(0.28, "CELULAR:", True, "left"), (0.72, personal.get('Celular') or '', False, "left")])
    y = row(y, 14, [(0.28, "CORREO ELECTRÓNICO:", True, "left"), (0.72, personal.get('Correo') or '', False, "left")])
    y = row(y, 14, [(0.28, "FECHA DE NACIMIENTO:", True, "left"), (0.30, str(personal.get('FechaNacimiento') or ''), False, "left"),
                    (0.14, "EDAD:", True, "left"), (0.28, str(personal['Edad']) if personal.get('Edad') is not None else '', False, "left")])
    nivel = personal.get('NivelEducativo') or ''
    y = row(y, 26, [(0.28, "NIVEL EDUCATIVO:", True, "left"),
                    (0.72, con_opciones(nivel, ["Sin Estudio ___   Primaria ___   Secundaria___   Bachiller ___",
                                                "Técnico ___   Tecnólogo ___   Profesional ___   Posgrado ___"]), False, "left")])
    y = row(y, 14, [(0.28, "RUEA:", True, "left"), (0.30, personal.get('Rudea') or up.get('RUEA') or '', False, "left"),
                    (0.14, "SISBEN:", True, "left"), (0.28, personal.get('Sisben') or '', False, "left")])

    y -= 6

    # ---------- INFORMACIÓN DEL PREDIO ----------
    y = title_bar(y, 14, "INFORMACIÓN DEL PREDIO")
    y = row(y, 14, [(0.28, "VEREDA:", True, "left"), (0.72, predio.get('Vereda') or '', False, "left")])
    y = row(y, 14, [(0.28, "SECTOR:", True, "left"), (0.72, predio.get('Sector') or '', False, "left")])
    y = row(y, 14, [(0.28, "NOMBRE DEL PREDIO:", True, "left"), (0.72, predio.get('NombrePredio') or '', False, "left")])
    ica = ', '.join(predio.get('RegistroICA') or []) if predio.get('RegistroICA') else ''
    y = row(y, 14, [(0.28, "ÁREA TOTAL:", True, "left"), (0.24, str(predio.get('AreaPredio') or ''), False, "left"),
                    (0.20, "REGISTRO ICA:", True, "left"), (0.28, f"{con_opciones('Si' if ica else 'No', 'Si ___  No___')}  {('Cual: ' + ica) if ica else ''}", False, "left")])
    y = row(y, 14, [(0.28, "TENENCIA DEL PREDIO:", True, "left"),
                    (0.72, con_opciones(predio.get('TipoTenencia') or '', 'Propio_______   Arrendado ____   Poseedor ______'), False, "left")])
    y = row(y, 14, [(0.24, "SEGURO:", True, "left"), (0.32, predio.get('Seguro') or '', False, "left"),
                    (0.24, "ACCESO A CRÉDITOS:", True, "left"), (0.20, _si_no(predio.get('AccesoCredito')), False, "left")])
    y = row(y, 14, [(0.28, "USO DE SUELO:", True, "left"), (0.72, _si_no(predio.get('UsoSuelo')), False, "left")])

    y -= 6

    # ---------- INFORMACIÓN DE LA UNIDAD PRODUCTIVA / EMPRESA ----------
    y = title_bar(y, 14, "INFORMACIÓN DE LA UNIDAD PRODUCTIVA / EMPRESA")
    y = row(y, 14, [(0.24, "SISTEMA:", True, "left"),
                    (0.76, con_opciones(up.get('TipoUP_Nombre') or '', 'Agrícola ___   Pecuario ___   Agropecuario ___   Agroindustrial___'), False, "left")])
    y = row(y, 14, [(0.24, "ACTIVIDAD PRINCIPAL:", True, "left"),
                    (0.76, con_opciones(up.get('ActividadUP') or '', 'Agrícola ________   Pecuario ________   Cual:'), False, "left")])
    y = row(y, 14, [(0.24, "# EMPLEADOS", True, "left"), (0.76, str(up.get('NumeroEmpleados') or ''), False, "left")])
    y = row(y, 14, [(0.24, "CERTIFICACIONES:", True, "left"), (0.76, '', False, "left")])
    y = row(y, 14, [(0.24, "ASOCIATIVIDAD:", True, "left"), (0.76, _si_no(up.get('Asociatividad')), False, "left")])
    try:
        anio_produccion = str(datos.get('fecha') or '')[:4]
    except Exception:
        anio_produccion = ''
    y = row(y, 14, [(0.24, "PRODUCCIÓN AÑO:", True, "left"), (0.76, anio_produccion or '', False, "left")])
    y = row(y, 14, [(0.24, "ÁREA DE PASTOS:", True, "left"), (0.36, str(up.get('AreaPastos') or ''), False, "left"),
                    (0.16, "# POTREROS:", True, "left"), (0.24, str(up.get('NumeroPotreros') or ''), False, "left")])
    y = row(y, 14, [(0.24, "ÁREA CULTIVADA:", True, "left"), (0.76, str(up.get('AreaCultivada') or ''), False, "left")])
    y = row(y, 14, [(0.24, "# DE INVERNADEROS:", True, "left"), (0.76, str(up.get('NumeroInvernaderos') or ''), False, "left")])
    y = row(y, 14, [(0.24, "# TANQUES DE ENFRIAMIENTO:", True, "left"), (0.76, str(up.get('NumeroTanques') or ''), False, "left")])
    y = row(y, 14, [(0.24, "FUENTE DE AGUA:", True, "left"), (0.36, _si_no(up.get('FuentesAgua')), False, "left"),
                    (0.16, "# RESERVORIOS:", True, "left"), (0.24, str(up.get('NumeroReservorios') or ''), False, "left")])

    y -= 6

    # ---------- SISTEMA AGRÍCOLA ----------
    y = title_bar(y, 14, "SISTEMA AGRÍCOLA")
    hay_agricola = bool(agricola)
    y = row(y, 14, [(0.20, "", False, "left"),
                    (0.80, marcar_opciones("Huerta Casera___        Producción Para Venta___", 'Producción Para Venta' if hay_agricola else 'Huerta Casera'), False, "left")])
    prod_agricola = list(agricola)
    for i in range(1, 7):
        item = siguiente(prod_agricola)
        prod = (item or {}).get('NombreProducto', '')
        cant = (item or {}).get('Cantidad', '')
        unidad = (item or {}).get('UnidadMedida', '')
        y = row(y, 14, [(0.20, f"PRODUCTO {i}:", True, "left"), (0.55, prod, False, "left"),
                        (0.10, "Cantidad:", True, "left"), (0.15, f"{cant} {unidad}".strip(), False, "left")])

    y = title_bar(y, 14, "SISTEMA PECUARIO")

    c.showPage()

    # ============================================================
    # PAGE 2
    # ============================================================
    y = draw_header(TOP)
    y -= 4


    def name_size(name):
        return 6.2 if len(name) > 10 else 8

    def pecuario_pair(y_top, name, l1, l2, v1='', v2=''):
        fr = [0.13, 0.17, 0.20, 0.20, 0.30]
        cells = [(fr[0], name, True, "left", name_size(name)), (fr[1], l1, True, "left"), (fr[2], v1, False, "left"),
                 (fr[3], l2, True, "left"), (fr[4], v2, False, "left")]
        return row(y_top, 15, cells)

    def pecuario_wide(y_top, name, label, value=''):
        fr = [0.13, 0.17, 0.70]
        cells = [(fr[0], name, True, "left", name_size(name)), (fr[1], label, True, "left"), (fr[2], value, False, "left")]
        return row(y_top, 15, cells)

    det = lambda a: (a or {}).get('Detalles') or {}

    # BOVINOS
    bovinos = _animal(datos, 'Bovinos')
    bd = det(bovinos)
    y = pecuario_pair(y, "BOVINOS", "Cantidad:", "Raza Predominante:",
                      str(bovinos.get('CantidadTotal') if bovinos else ''), bd.get('Raza', ''))
    y = pecuario_pair(y, "", "# De Machos:", "# De Hembras:",
                      str(bd.get('Machos') or ''), str(bd.get('Hembras') or ''))
    prop = bd.get('Proposito', '')
    y = row(y, 20, [(0.13, "", False, "left"),
                    (0.37, [marcar_opciones("Leche: ___   Carne: ___", prop),
                            marcar_opciones("Doble Propósito: ___", prop)], False, "left"),
                    (0.20, "RUV:", True, "left"), (0.30, bd.get('RUV', ''), False, "left")])

    # AVES
    aves = _animal(datos, 'Aves')
    ad = det(aves)
    y = pecuario_pair(y, "AVES", "# Gallinas:", "Tipo:",
                      str(aves.get('CantidadTotal') if aves else ''), ad.get('TipoAve', ''))
    y = pecuario_pair(y, "", "# Pollos:", "Codornices:")
    y = pecuario_pair(y, "", "# Patos:", "Otros:")

    # PORCINOS
    porcinos = _animal(datos, 'Porcinos')
    pd = det(porcinos)
    y = row(y, 15, [(0.13, "PORCINOS", True, "left"), (0.17, "Cantidad:", True, "left"),
                    (0.20, str(porcinos.get('CantidadTotal') if porcinos else ''), False, "left"),
                    (0.20, "Chapeta:", True, "left"), (0.30, _si_no(pd.get('Chapeta')), False, "left")])
    y = pecuario_wide(y, "", "Raza:", pd.get('Raza', ''))
    y = pecuario_wide(y, "", "Propósito:", pd.get('Proposito', ''))

    # EQUINOS, CONEJOS/CURIES, OVINOS, CAPRINOS
    for grupo, etiqueta in [("EQUINOS", "EQUINOS"), ("Conejos", "CONEJOS/CURIES"), ("OVINOS", "OVINOS"), ("CAPRINOS", "CAPRINOS")]:
        if grupo == "Conejos":
            a = _animal(datos, 'Conejos') or _animal(datos, 'Curies')
        else:
            a = _animal(datos, grupo)
        d = det(a)
        y = pecuario_wide(y, etiqueta, "Cantidad:", str(a.get('CantidadTotal') if a else ''))
        y = pecuario_wide(y, "", "Raza:", d.get('Raza', ''))
        y = pecuario_wide(y, "", "Propósito:", d.get('Proposito', ''))

    # APICOLAS
    apicolas = _animal(datos, 'Abejas')
    ad2 = det(apicolas)
    y = pecuario_wide(y, "APICOLAS", "# Colmenas:", str(apicolas.get('CantidadTotal') if apicolas else ''))
    y = pecuario_wide(y, "", "Raza:", ad2.get('Raza', ''))
    y = pecuario_wide(y, "", "Productos:", ad2.get('ProductosApicolas', ''))

    # PECES
    peces = _animal(datos, 'Peces')
    fd = det(peces)
    y = pecuario_wide(y, "PECES", "Cantidad:", str(peces.get('CantidadTotal') if peces else ''))
    y = pecuario_wide(y, "", "Raza:", fd.get('Raza', ''))
    y = pecuario_wide(y, "", "# Estanques:", str(fd.get('Estanques') or ''))

    y -= 8

    # ---------- SISTEMA AGROINDUSTRIAL ----------
    y = title_bar(y, 14, "SISTEMA AGROINDUSTRIAL")
    prod_agro = list(agroindustrial)
    for i in range(1, 4):
        item = siguiente(prod_agro)
        prod = (item or {}).get('NombreProducto', '')
        cant = (item or {}).get('Cantidad', '')
        unidad = (item or {}).get('UnidadMedida', '')
        invima = (item or {}).get('INVIMA', False)
        y = row(y, 14, [(0.16, f"PRODUCTO {i}:", True, "left"), (0.40, prod, False, "left"),
                        (0.12, "Cantidad:", True, "left"), (0.16, f"{cant} {unidad}".strip(), False, "left"),
                        (0.08, "INVIMA:", True, "left"), (0.08, _si_no(invima), False, "left")])

    y -= 20

    # ---------- OBSERVACIONES ----------
    text(LEFT, y, "OBSERVACIONES:", size=9, bold=True)
    label_w = c.stringWidth("OBSERVACIONES:", "Helvetica-Bold", 9)
    h_line(LEFT + label_w + 4, RIGHT, y - 1, w=0.7)
    obs_texto = datos.get('observaciones') or ''
    lineas = []
    if obs_texto:
        words = obs_texto.split()
        cur = ''
        for wd in words:
            trial = (cur + ' ' + wd).strip()
            if c.stringWidth(trial, "Helvetica", 8.5) <= TOTAL_W - 10:
                cur = trial
            else:
                if cur:
                    lineas.append(cur)
                cur = wd
        if cur:
            lineas.append(cur)
    for i in range(max(2, len(lineas))):
        contenido = lineas[i] if i < len(lineas) else ''
        y = row(y, 16, [(1.0, contenido, False, "left")])
    y -= 18

    # ---------- Authorization paragraph ----------
    paragraph = ("Autoriza a la Secretaría de Desarrollo Económico para realizar el tratamiento de datos "
                 "personales de conformidad con la Política de Tratamiento de Datos Personales, con fines "
                 "informativos y de caracterización.")
    lines = wrap_text(paragraph, "Helvetica", 9.5, TOTAL_W - 20)
    for ln in lines:
        text(LEFT + 15, y, ln, size=9.5)
        y -= 13
    text(LEFT + 15, y, "SI___  NO___", size=9.5, bold=True)
    y -= 55

    # ---------- Signatures ----------
    sig_w = 200
    x_left_sig = LEFT + 30
    x_right_sig = RIGHT - 30 - sig_w
    h_line(x_left_sig, x_left_sig + sig_w, y, w=0.8)
    h_line(x_right_sig, x_right_sig + sig_w, y, w=0.8)
    dibujar_firma(datos.get('firma_usuario'), x_left_sig, x_left_sig + sig_w, y)
    dibujar_firma(datos.get('firma_extensionista'), x_right_sig, x_right_sig + sig_w, y)
    y -= 11
    text_center(x_left_sig + sig_w / 2, y, "FIRMA DEL USUARIO", size=8.5, bold=True)
    text_center(x_right_sig + sig_w / 2, y, "FIRMA DEL EXTENSIONISTA", size=8.5, bold=True)

    c.showPage()
    c.save()