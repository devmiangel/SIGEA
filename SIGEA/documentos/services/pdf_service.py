from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from reportlab.lib.units import mm


def _buscar_logo():
    logo_dir = Path(__file__).resolve().parents[1] / "logo"
    if not logo_dir.exists():
        return None
    for f in logo_dir.iterdir():
        if f.suffix.lower() in (".png", ".jpg", ".jpeg", ".gif"):
            return f
    return None


LOGO_PATH = _buscar_logo()


def generar_visita_tecnica(salida, datos=None):
    datos = datos or {}

    Path(salida).parent.mkdir(parents=True, exist_ok=True)

    W, H = letter

    c = canvas.Canvas(salida, pagesize=letter)

    # ---------- Layout constants ----------
    LEFT = 35
    RIGHT = W - 35
    TOP = H - 35

    LOGO_W = 65
    INFO_W = 130
    TITLE_X0 = LEFT + LOGO_W
    TITLE_X1 = RIGHT - INFO_W

    ROW_H = 15.5   # standard row height for blank ruled lines
    CHK = 8        # checkbox size


    def h_line(x0, x1, y, w=0.8):
        c.setLineWidth(w)
        c.line(x0, y, x1, y)


    def v_line(x, y0, y1, w=0.8):
        c.setLineWidth(w)
        c.line(x, y0, x, y1)


    def rect(x0, y0, x1, y1, w=0.8, fill=0):
        c.setLineWidth(w)
        c.rect(x0, y0, x1 - x0, y1 - y0, stroke=1, fill=fill)


    def text(x, y, s, size=8, font="Helvetica", bold=False):
        c.setFont("Helvetica-Bold" if bold else font, size)
        c.drawString(x, y, s)


    def text_center(xc, y, s, size=8, bold=False):
        c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
        c.drawCentredString(xc, y, s)


    def checkbox(x, y, label=None, label_size=7.5):
        c.setLineWidth(0.8)
        c.rect(x, y, CHK, CHK, stroke=1, fill=0)
        if label:
            text(x + CHK + 4, y + 1, label, size=label_size)


    def marcar_checkbox(x, y):
        c.setLineWidth(0.9)
        c.line(x + 1.5, y + 1.5, x + CHK - 1.5, y + CHK - 1.5)
        c.line(x + CHK - 1.5, y + 1.5, x + 1.5, y + CHK - 1.5)


    def section_bar(x0, x1, y_top, height, title):
        """Grey-ish double-bordered bar used for section headers."""
        y_bot = y_top - height
        rect(x0, y_bot, x1, y_top, w=1.1)
        # inner thin rule to mimic double-line box in source
        text_center((x0 + x1) / 2, y_bot + height / 2 - 3, title, size=8.5, bold=True)


    def field_row(x0, x1, y_top, row_h, label, label_w, value_line=True):
        """One labeled row: label on the left, ruled line filling the rest."""
        y_bot = y_top - row_h
        h_line(x0, x1, y_bot)
        text(x0 + 3, y_bot + 4, label, size=8, bold=True)
        if value_line:
            h_line(x0 + label_w, y_bot + 3, x1 - 3, y_bot + 3, w=0.6)
        return y_bot


    def rellenar(x0, x1, y_top, row_h, texto, size=8):
        """Write value text vertically centred on the ruled row."""
        texto = str(texto or "").strip()
        if not texto:
            return
        c.setFont("Helvetica", size)
        max_w = x1 - x0 - 6
        while texto and c.stringWidth(texto, "Helvetica", size) > max_w:
            texto = texto[:-1]
        c.drawString(x0 + 3, y_top - row_h / 2 - 3, texto)


    def partir_lineas(texto, x0, x1, size=8):
        c.setFont("Helvetica", size)
        max_w = x1 - x0 - 6
        palabras = texto.split()
        lineas, cur = [], ""
        for p in palabras:
            t = (cur + " " + p).strip()
            if c.stringWidth(t, "Helvetica", size) <= max_w or not cur:
                cur = t
            else:
                lineas.append(cur)
                cur = p
        if cur:
            lineas.append(cur)
        return lineas


    def rellenar_multilinea(rows_y, texto, x0, x1, row_h, size=8, max_lines=None):
        texto = str(texto or "").strip()
        if not texto:
            return
        lineas = partir_lineas(texto, x0, x1, size)
        if max_lines:
            lineas = lineas[:max_lines]
        for i, y_top in enumerate(rows_y[:len(lineas)]):
            rellenar(x0, x1, y_top, row_h, lineas[i], size)


    # =========================================================
    # HEADER
    # =========================================================
    header_h = 62
    header_top = TOP
    header_bot = header_top - header_h

    # Outer header box
    rect(LEFT, header_bot, RIGHT, header_top, w=1.2)

    # Logo cell
    v_line(TITLE_X0, header_bot, header_top)
    logo_x = LEFT + LOGO_W / 2
    logo_y = (header_top + header_bot) / 2
    if LOGO_PATH is not None and LOGO_PATH.exists():
        c.drawImage(str(LOGO_PATH), logo_x - 20, logo_y - 20, width=40, height=40, preserveAspectRatio=True, mask="auto")
    else:
        c.setLineWidth(1)
        c.circle(logo_x, logo_y, 22, stroke=1, fill=0)
        text_center(logo_x, logo_y - 3, "LOGO", size=6.5)

    # Title cell
    v_line(TITLE_X1, header_bot, header_top)
    title_lines = [
        "VISITA TÉCNICA EXTENSIÓN RURAL",
        "AGROPECUARIA Y/O PROTECCIÓN",
        "ANIMAL",
    ]
    tc_x = (TITLE_X0 + TITLE_X1) / 2
    ty = header_top - 18
    for line in title_lines:
        text_center(tc_x, ty, line, size=11, bold=True)
        ty -= 13

    # Info cell (Codigo / Version / Fecha)
    info_row_h = header_h / 3
    for i, (k, v) in enumerate([("CODIGO:", "GDE-F011"), ("VERSION:", "006"), ("FECHA:", "AGOSTO 2025")]):
        ytop = header_top - i * info_row_h
        if i > 0:
            h_line(TITLE_X1, RIGHT, ytop)
        text(TITLE_X1 + 5, ytop - info_row_h + 8, k, size=8, bold=True)
        text(TITLE_X1 + 55, ytop - info_row_h + 8, v, size=8)

    y = header_bot

    # =========================================================
    # SECTION: DATOS DEL USUARIO O PRODUCTOR
    # =========================================================
    sec_h = 14
    y_sec = section_bar(LEFT, RIGHT, y, sec_h, "DATOS DEL USUARIO O PRODUCTOR")
    y -= sec_h

    # Row 1: FECHA DE RECEPCION | date box | Nº RUEA | box
    row_h = 16
    y_bot = y - row_h
    rect(LEFT, y_bot, RIGHT, y, w=0.8)
    label_w = 150
    date_box_w = 110
    mid_x = LEFT + label_w + date_box_w
    text(LEFT + 3, y_bot + 5, "FECHA DE RECEPCIÓN", size=8, bold=True)
    v_line(LEFT + label_w, y_bot, y)
    v_line(mid_x, y_bot, y)
    rueA_label_w = 55
    v_line(mid_x + rueA_label_w, y_bot, y)
    text(mid_x + 3, y_bot + 5, "Nº RUEA", size=8, bold=True)
    rellenar(LEFT + label_w, mid_x, y, row_h, datos.get("fecha_recepcion"))
    rellenar(mid_x + rueA_label_w, RIGHT, y, row_h, datos.get("nruea"))
    y = y_bot

    # Row 2: NOMBRES Y APELLIDOS | line | SISBEN | box
    y_bot = y - row_h
    rect(LEFT, y_bot, RIGHT, y, w=0.8)
    v_line(LEFT + label_w, y_bot, y)
    v_line(mid_x, y_bot, y)
    v_line(mid_x + rueA_label_w, y_bot, y)
    text(LEFT + 3, y_bot + 5, "NOMBRES Y APELLIDOS", size=8, bold=True)
    h_line(LEFT + label_w + 5, mid_x - 5, y_bot + 4, w=0.6)
    text(mid_x + 3, y_bot + 5, "SISBEN", size=8, bold=True)
    rellenar(LEFT + label_w, mid_x, y, row_h, datos.get("nombres_apellidos"))
    rellenar(mid_x + rueA_label_w, RIGHT, y, row_h, datos.get("sisben"))
    y = y_bot

    # Row 3: DOCUMENTO DE IDENTIDAD | line  (full width remainder, no right box)
    y_bot = y - row_h
    rect(LEFT, y_bot, RIGHT, y, w=0.8)
    v_line(LEFT + label_w, y_bot, y)
    text(LEFT + 3, y_bot + 5, "DOCUMENTO DE IDENTIDAD", size=8, bold=True)
    h_line(LEFT + label_w + 5, RIGHT - 5, y_bot + 4, w=0.6)
    rellenar(LEFT + label_w, RIGHT, y, row_h, datos.get("documento_identidad"))
    y = y_bot

    # Row 4: VEREDA / SECTOR
    y_bot = y - row_h
    rect(LEFT, y_bot, RIGHT, y, w=0.8)
    v_line(LEFT + label_w, y_bot, y)
    text(LEFT + 3, y_bot + 5, "VEREDA / SECTOR", size=8, bold=True)
    h_line(LEFT + label_w + 5, RIGHT - 5, y_bot + 4, w=0.6)
    rellenar(LEFT + label_w, RIGHT, y, row_h, datos.get("vereda_sector"))
    y = y_bot

    # Row 5: TELEFONO
    y_bot = y - row_h
    rect(LEFT, y_bot, RIGHT, y, w=0.8)
    v_line(LEFT + label_w, y_bot, y)
    text(LEFT + 3, y_bot + 5, "TELÉFONO", size=8, bold=True)
    h_line(LEFT + label_w + 5, RIGHT - 5, y_bot + 4, w=0.6)
    rellenar(LEFT + label_w, RIGHT, y, row_h, datos.get("telefono"))
    y = y_bot

    # =========================================================
    # SECTION: DESCRIPCION DE LA SOLICITUD
    # =========================================================
    y_sec = section_bar(LEFT, RIGHT, y, sec_h, "DESCRIPCIÓN DE LA SOLICITUD")
    y -= sec_h

    # Tipo de visita row with checkboxes
    tv_row_h = 18
    y_bot = y - tv_row_h
    rect(LEFT, y_bot, RIGHT, y, w=0.8)
    text(LEFT + 3, y_bot + 6, "TIPO DE VISITA:", size=8, bold=True)
    checkbox(LEFT + 105, y_bot + 5, "AGRÍCOLA")
    checkbox(LEFT + 230, y_bot + 5, "PECUARIA")
    checkbox(LEFT + 350, y_bot + 5, "PROTECCIÓN ANIMAL")
    tv = (datos.get("tipo_visita") or "").lower()
    if tv in ("agricola", "agrícola", "a"):
        marcar_checkbox(LEFT + 105, y_bot + 5)
    elif tv in ("pecuaria", "p"):
        marcar_checkbox(LEFT + 230, y_bot + 5)
    elif tv in ("proteccion_animal", "protección animal", "pa"):
        marcar_checkbox(LEFT + 350, y_bot + 5)
    y = y_bot

    # 6 blank ruled rows for description text
    blank_row_h = 17
    desc_rows = []
    for _ in range(6):
        y_bot = y - blank_row_h
        rect(LEFT, y_bot, RIGHT, y, w=0.6)
        desc_rows.append(y)
        y = y_bot
    rellenar_multilinea(desc_rows, datos.get("descripcion_solicitud"), LEFT, RIGHT, blank_row_h, max_lines=6)

    # Diagnostico presuntivo label row
    dp_row_h = 15
    y_bot = y - dp_row_h
    rect(LEFT, y_bot, RIGHT, y, w=0.8)
    text(LEFT + 3, y_bot + 4, "DIAGNÓSTICO PRESUNTIVO:", size=8, bold=True)
    rellenar(LEFT + 105, RIGHT, y, dp_row_h, datos.get("diagnostico_presuntivo"))
    y = y_bot

    # Fecha de visita row
    fv_row_h = 16
    y_bot = y - fv_row_h
    rect(LEFT, y_bot, RIGHT, y, w=0.8)
    fv_label_w = 130
    v_line(LEFT + fv_label_w, y_bot, y)
    text(LEFT + 3, y_bot + 5, "FECHA DE VISITA", size=8, bold=True)
    h_line(LEFT + fv_label_w + 5, LEFT + fv_label_w + 110, y_bot + 4, w=0.6)
    rellenar(LEFT + fv_label_w, LEFT + fv_label_w + 110, y, fv_row_h, datos.get("fecha_visita"))
    y = y_bot

    # =========================================================
    # SECTION: ACCION TOMADA POR LA SECRETARIA
    # =========================================================
    y_sec = section_bar(LEFT, RIGHT, y, sec_h, "ACCIÓN TOMADA POR LA SECRETARÍA")
    y -= sec_h

    # Funcionario que atiende la visita | C.C.
    fq_row_h = 16
    y_bot = y - fq_row_h
    rect(LEFT, y_bot, RIGHT, y, w=0.8)
    cc_x = RIGHT - 160
    v_line(cc_x, y_bot, y)
    text(LEFT + 3, y_bot + 5, "FUNCIONARIO QUE ATIENDE LA VISITA:", size=8, bold=True)
    h_line(LEFT + 235, cc_x - 5, y_bot + 4, w=0.6)
    text(cc_x + 5, y_bot + 5, "C.C.", size=8, bold=True)
    h_line(cc_x + 30, RIGHT - 5, y_bot + 4, w=0.6)
    rellenar(LEFT + 235, cc_x, y, fq_row_h, datos.get("funcionario"))
    rellenar(cc_x + 30, RIGHT, y, fq_row_h, datos.get("cc_funcionario"))
    y = y_bot

    # Checkbox row 1: SEG. Y CONTROL | TRAT. MEDICO | VISITA | INSUMOS
    acciones = datos.get("acciones") or []
    cb_row_h = 18
    y_bot = y - cb_row_h
    rect(LEFT, y_bot, RIGHT, y, w=0.8)
    checkbox(LEFT + 90, y_bot + 5, None)
    text(LEFT + 5, y_bot + 6, "SEG. Y CONTROL", size=8, bold=True)
    checkbox(LEFT + 230, y_bot + 5, "TRAT. MEDICO")
    checkbox(LEFT + 370, y_bot + 5, "VISITA")
    checkbox(RIGHT - 70, y_bot + 5, "INSUMOS")
    if "seg_control" in acciones:
        marcar_checkbox(LEFT + 90, y_bot + 5)
    if "trat_medico" in acciones:
        marcar_checkbox(LEFT + 230, y_bot + 5)
    if "visita" in acciones:
        marcar_checkbox(LEFT + 370, y_bot + 5)
    if "insumos" in acciones:
        marcar_checkbox(RIGHT - 70, y_bot + 5)
    y = y_bot

    # Checkbox row 2: RECOMENDACION | MANEJO | CIRUGIA
    y_bot = y - cb_row_h
    rect(LEFT, y_bot, RIGHT, y, w=0.8)
    checkbox(LEFT + 110, y_bot + 5, None)
    text(LEFT + 25, y_bot + 6, "RECOMENDACIÓN", size=8, bold=True)
    checkbox(LEFT + 280, y_bot + 5, "MANEJO")
    checkbox(LEFT + 400, y_bot + 5, "CIRUGÍA")
    if "recomendacion" in acciones:
        marcar_checkbox(LEFT + 110, y_bot + 5)
    if "manejo" in acciones:
        marcar_checkbox(LEFT + 280, y_bot + 5)
    if "cirugia" in acciones:
        marcar_checkbox(LEFT + 400, y_bot + 5)
    y = y_bot

    # Hora de inicio row
    hi_row_h = 16
    y_bot = y - hi_row_h
    rect(LEFT, y_bot, RIGHT, y, w=0.8)
    hi_label_w = 90
    v_line(LEFT + hi_label_w, y_bot, y)
    text(LEFT + 3, y_bot + 5, "HORA DE INICIO:", size=8, bold=True)
    h_line(LEFT + hi_label_w + 5, LEFT + hi_label_w + 100, y_bot + 4, w=0.6)
    rellenar(LEFT + hi_label_w, LEFT + hi_label_w + 100, y, hi_row_h, datos.get("hora_inicio"))
    y = y_bot

    # blank ruled rows (large writing area, as in source)
    blank2_row_h = 15.3
    accion_rows = []
    for _ in range(10):
        y_bot = y - blank2_row_h
        rect(LEFT, y_bot, RIGHT, y, w=0.6)
        accion_rows.append(y)
        y = y_bot
    rellenar_multilinea(accion_rows, datos.get("accion_tomada"), LEFT, RIGHT, blank2_row_h, max_lines=10)

    # Observaciones o recomendaciones label
    obs_row_h = 15
    y_bot = y - obs_row_h
    rect(LEFT, y_bot, RIGHT, y, w=0.8)
    text(LEFT + 3, y_bot + 4, "OBSERVACIONES O RECOMENDACIONES:", size=8, bold=True)
    y = y_bot

    # 2 blank ruled rows
    obs_rows = []
    for _ in range(2):
        y_bot = y - blank2_row_h
        rect(LEFT, y_bot, RIGHT, y, w=0.6)
        obs_rows.append(y)
        y = y_bot
    rellenar_multilinea(obs_rows, datos.get("observaciones"), LEFT, RIGHT, blank2_row_h, max_lines=2)

    # Hora de salida row (right aligned label+line)
    hs_row_h = 16
    y_bot = y - hs_row_h
    rect(LEFT, y_bot, RIGHT, y, w=0.8)
    hs_label_x = RIGHT - 170
    text(hs_label_x, y_bot + 5, "HORA DE SALIDA:", size=8, bold=True)
    h_line(hs_label_x + 90, RIGHT - 5, y_bot + 4, w=0.6)
    rellenar(hs_label_x + 90, RIGHT, y, hs_row_h, datos.get("hora_salida"))
    y = y_bot

    # Calificacion row
    cal_row_h = 18
    y_bot = y - cal_row_h
    rect(LEFT, y_bot, RIGHT, y, w=0.8)
    text(LEFT + 3, y_bot + 6, "CALIFICACIÓN:", size=8, bold=True)
    checkbox(LEFT + 100, y_bot + 5, "MALO")
    checkbox(LEFT + 190, y_bot + 5, "REGULAR")
    checkbox(LEFT + 290, y_bot + 5, "BUENO")
    checkbox(LEFT + 380, y_bot + 5, "EXCELENTE")
    cal = (datos.get("calificacion") or "").lower()
    if cal in ("malo", "m"):
        marcar_checkbox(LEFT + 100, y_bot + 5)
    elif cal in ("regular", "r"):
        marcar_checkbox(LEFT + 190, y_bot + 5)
    elif cal in ("bueno", "b"):
        marcar_checkbox(LEFT + 290, y_bot + 5)
    elif cal in ("excelente", "e"):
        marcar_checkbox(LEFT + 380, y_bot + 5)
    y = y_bot

    # Signature row
    sig_row_h = 73
    y_bot = y - sig_row_h
    rect(LEFT, y_bot, RIGHT, y, w=0.8)
    mid = (LEFT + RIGHT) / 2
    v_line(mid, y_bot, y)
    sig_line_y = y_bot + 16
    h_line(LEFT + 40, mid - 20, sig_line_y, w=0.6)
    h_line(mid + 20, RIGHT - 40, sig_line_y, w=0.6)
    text_center((LEFT + mid) / 2, y_bot + 6, "FIRMA DEL USUARIO", size=8, bold=True)
    text_center((mid + RIGHT) / 2, y_bot + 6, "FIRMA DEL FUNCIONARIO", size=8, bold=True)
    y = y_bot

    c.showPage()
    c.save()
