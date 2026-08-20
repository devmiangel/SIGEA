import Swal from 'sweetalert2'
import { AGRO_COLORS, UP_ESTADO_RAW, normalizarEstadoUP } from '../../utils/agroConstants'
import { escapeHtml } from '../../utils/sanitize'
import { getDetalleUsuario } from '../../services/agroService'
import { abrirModalNuevaSolicitudAdmin } from './NuevaSolicitudAdminModal'

const iconoUsuario = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
const iconoUP = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
const iconoPredio = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 9h6"/><path d="M9 13h6"/><path d="M9 17h6"/></svg>`
const iconoDoc = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>`
const iconoInsumo = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`
const iconoHerramienta = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`
const iconoVehiculo = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h-2v-7l4-4h10l4 4v7h-2"/><rect x="3" y="10" width="18" height="7" rx="1"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/></svg>`
const iconoUPBold = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
const iconoTipo = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`
const iconoReloj = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
const iconoCalendario = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`

function badge(style, texto) {
    return `<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;${style}">${texto}</span>`
}

function estadoUsuario(estado) {
    return estado
        ? badge('background:#d1fae5;color:#047857;', 'Activo')
        : badge('background:#fee2e2;color:#b91c1c;', 'Inactivo')
}

function estadoUP(estado) {
    const normalizado = normalizarEstadoUP(estado)
    const aceptada = normalizarEstadoUP(UP_ESTADO_RAW.ACEPTADA)
    const rechazada = normalizarEstadoUP(UP_ESTADO_RAW.RECHAZADA)
    if (normalizado === aceptada) return badge('background:#d1fae5;color:#047857;', 'Aceptada')
    if (normalizado === rechazada) return badge('background:#fee2e2;color:#b91c1c;', 'Rechazada')
    return badge('background:#fef3c7;color:#92400e;', 'En revisión')
}

function getIniciales(persona, email) {
    const nombre = persona?.primer_nombre?.trim() ?? ''
    const apellido = persona?.primer_apellido?.trim() ?? ''
    const iniciales = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
    return escapeHtml(iniciales || (email?.charAt(0)?.toUpperCase() ?? '?'))
}

function getNombreCompleto(persona, email) {
    const nombre = [persona?.primer_nombre, persona?.primer_apellido]
        .filter(Boolean).join(' ').trim()
    return escapeHtml(nombre || email || 'Nombre no disponible')
}

function seccionUPs(ups) {
    const lista = ups ?? []
    if (lista.length === 0) {
        return `<p style="margin:0;padding:16px;background:#f9fafb;border:1px dashed #d1d5db;border-radius:10px;font-size:13px;color:#6b7280;text-align:center;">No tiene unidades productivas registradas.</p>`
    }
    return lista.map((up) => `
        <div style="background:#fff;border:1px solid #e4ece8;border-radius:12px;overflow:hidden;box-shadow:0 1px 2px rgba(16,40,32,.05);">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 14px;background:linear-gradient(135deg,#f0fdf9,#e9f5f1);border-bottom:1px solid #e4ece8;">
                <div style="display:flex;align-items:center;gap:10px;min-width:0;">
                    <div style="width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,#015d3b,#3e9a8a);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 5px rgba(1,93,59,.2);">${iconoUPBold}</div>
                    <div style="min-width:0;">
                        <p style="margin:0;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:#3e9a8a;">Unidad productiva</p>
                        <p style="margin:2px 0 0;font-size:14.5px;font-weight:600;color:#1f2937;line-height:1.2;">${escapeHtml(up.RUEA ?? `UP ${up.id}` ?? '—')}</p>
                    </div>
                </div>
                ${estadoUP(up.estado_label ?? up.idEstado)}
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;padding:12px 14px;">
                <div class="ui-tile">
                    <div class="ui-label">${iconoTipo} Tipo de UP</div>
                    <p class="ui-value">${escapeHtml(up.tipo_up_label ?? '—')}</p>
                </div>
                <div class="ui-tile">
                    <div class="ui-label">${iconoPredio} Predio</div>
                    <p class="ui-value">${escapeHtml(up.nombre_predio ?? '—')}</p>
                </div>
                <div class="ui-tile">
                    <div class="ui-label">${iconoCalendario} Caracterización</div>
                    <p class="ui-value">${escapeHtml(up.FechaCaracterizacion ?? '—')}</p>
                </div>
                <div class="ui-tile">
                    <div class="ui-label">${iconoReloj} Actualización</div>
                    <p class="ui-value">${escapeHtml(up.FechaActualizacion ?? '—')}</p>
                </div>
            </div>
        </div>
    `).join('')
}

function seccionAsignaciones(asignaciones) {
    const a = asignaciones ?? {}
    const insumos = a.insumos ?? []
    const herramientas = a.herramientas ?? []
    const vehiculos = a.vehiculos ?? []

    const renderInsumos = insumos.length === 0
        ? `<p style="margin:0;font-size:12.5px;color:#9ca3af;">Sin insumos asignados.</p>`
        : insumos.map((i) => `
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;background:#f9fafb;border:1px solid #eef1f4;border-radius:8px;padding:8px 12px;">
                <span style="font-size:13px;color:#1f2937;"><strong>${escapeHtml(i.insumo_nombre ?? '—')}</strong></span>
                <span style="font-size:12.5px;color:#6b7280;">${escapeHtml(i.cantidad ?? '—')} ${escapeHtml(i.unidad ?? '')}</span>
            </div>
        `).join('')

    const renderHerramientas = herramientas.length === 0
        ? `<p style="margin:0;font-size:12.5px;color:#9ca3af;">Sin herramientas asignadas.</p>`
        : herramientas.map((h) => `
            <div style="background:#f9fafb;border:1px solid #eef1f4;border-radius:8px;padding:8px 12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
                    <span style="font-size:13px;color:#1f2937;"><strong>${escapeHtml(h.herramienta_nombre ?? '—')}</strong></span>
                    <span style="font-size:11px;padding:2px 8px;border-radius:999px;${h.Entregado ? 'background:#d1fae5;color:#047857;' : 'background:#fef3c7;color:#92400e;'}">${h.Entregado ? 'Entregado' : 'Pendiente'}</span>
                </div>
                <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Asignación: ${escapeHtml(h.FechaAsignacion ?? '—')}${h.FechaDevolucion ? ` · Devolución: ${escapeHtml(h.FechaDevolucion)}` : ''}</p>
            </div>
        `).join('')

    const renderVehiculos = vehiculos.length === 0
        ? `<p style="margin:0;font-size:12.5px;color:#9ca3af;">Sin vehículos asignados.</p>`
        : vehiculos.map((v) => `
            <div style="background:#f9fafb;border:1px solid #eef1f4;border-radius:8px;padding:8px 12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
                    <span style="font-size:13px;color:#1f2937;"><strong>${escapeHtml(v.placa ?? '—')}</strong> <span style="color:#6b7280;font-weight:400;">${escapeHtml(v.modelo ?? '')}</span></span>
                    <span style="font-size:11px;padding:2px 8px;border-radius:999px;${v.Entregado ? 'background:#d1fae5;color:#047857;' : 'background:#fef3c7;color:#92400e;'}">${v.Entregado ? 'Entregado' : 'Pendiente'}</span>
                </div>
                <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Asignación: ${escapeHtml(v.FechaAsignacion ?? '—')}${v.FechaDevolucion ? ` · Devolución: ${escapeHtml(v.FechaDevolucion)}` : ''}</p>
            </div>
        `).join('')

    return `
        <div class="ui-bloque">
            <div class="ui-bloque-titulo">${iconoInsumo} Insumos</div>
            <div style="display:flex;flex-direction:column;gap:8px;">${renderInsumos}</div>
        </div>
        <div class="ui-bloque">
            <div class="ui-bloque-titulo">${iconoHerramienta} Herramientas</div>
            <div style="display:flex;flex-direction:column;gap:8px;">${renderHerramientas}</div>
        </div>
        <div class="ui-bloque">
            <div class="ui-bloque-titulo">${iconoVehiculo} Vehículos</div>
            <div style="display:flex;flex-direction:column;gap:8px;">${renderVehiculos}</div>
        </div>
    `
}

function construirHtml(detail) {
    const usuario = detail?.usuario ?? {}
    const persona = usuario?.persona_info ?? {}
    const rol = detail?.rol ?? usuario?.rol ?? 'Sin rol'
    const tipoDocumento = persona?.TipoDocumento_info?.TipoDocumento ?? persona?.TipoDocumento ?? '—'

    const seccionRol = rol === 'Productores'
        ? `
            <div class="ui-bloque-titulo" style="margin-top:6px;display:flex;align-items:center;gap:8px;">
                ${iconoUP} Unidades productivas
                <span style="display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;border-radius:999px;background:#015d3b;color:#fff;font-size:11px;font-weight:600;">${(detail?.ups ?? []).length}</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px;">${seccionUPs(detail.ups)}</div>
        `
        : rol === 'Funcionarios'
        ? `
            <div class="ui-bloque-titulo" style="margin-top:6px;">Asignaciones del funcionario</div>
            <div style="display:flex;flex-direction:column;gap:12px;margin-top:10px;">${seccionAsignaciones(detail.asignaciones)}</div>
        `
        : ''

    const botonNuevaSolicitud = rol === 'Productores'
        ? `
            <button id="swal-nueva-solicitud" type="button"
                style="display:inline-flex;align-items:center;gap:6px;padding:9px 14px;border:none;border-radius:9px;background:linear-gradient(135deg,#015d3b,#3e9a8a);color:#fff;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 2px 6px rgba(1,93,59,.25);transition:filter .15s ease;flex-shrink:0;"
                onmouseover="this.style.filter='brightness(1.08)'" onmouseout="this.style.filter='brightness(1)'">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Nueva solicitud
            </button>
        `
        : ''

    return `
        <style>
            .ui-card { font-family: 'Roboto', sans-serif; text-align: left; }
            .ui-tile {
                background: #f9fafb; border: 1px solid #eef1f4; border-radius: 10px;
                padding: 10px 12px; transition: box-shadow .15s ease, border-color .15s ease;
            }
            .ui-tile:hover { box-shadow: 0 4px 12px rgba(1, 93, 59, 0.10); border-color: #3e9a8a; }
            .ui-label {
                display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600;
                color: #6b7280; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 4px;
            }
            .ui-value { margin: 0; font-size: 13px; font-weight: 500; color: #1f2937; }
            .ui-bloque-titulo {
                display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 600;
                color: #6b7280; text-transform: uppercase; letter-spacing: .4px;
            }
            .ui-bloque { display: flex; flex-direction: column; gap: 8px; }
        </style>
        <div class="ui-card">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;padding-bottom:14px;border-bottom:2px solid #eef1f4;">
                <div style="display:flex;align-items:center;gap:14px;min-width:0;">
                    <div style="width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,#015d3b,#3e9a8a);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 6px rgba(1,93,59,0.25);">${iconoUsuario}</div>
                    <div style="min-width:0;">
                        <p style="margin:0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:#9ca3af;">Información del usuario</p>
                        <h2 style="margin:2px 0 0;font-size:17px;font-weight:600;color:#1f2937;line-height:1.3;">${getNombreCompleto(persona, usuario.email)}</h2>
                        <p style="margin:4px 0 0;font-size:12.5px;color:#6b7280;">${escapeHtml(usuario.email ?? '—')}</p>
                    </div>
                </div>
                ${botonNuevaSolicitud}
            </div>

            <div style="display:flex;gap:10px;padding:12px 0;">
                ${estadoUsuario(usuario.Estado)}
                ${badge('background:#015d3b;color:#fff;', escapeHtml(rol))}
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;padding-bottom:12px;">
                <div class="ui-tile">
                    <div class="ui-label">${iconoDoc} Documento</div>
                    <p class="ui-value">${escapeHtml(persona?.numero_documento ?? '—')}</p>
                </div>
                <div class="ui-tile">
                    <div class="ui-label">${iconoDoc} Tipo de documento</div>
                    <p class="ui-value">${escapeHtml(tipoDocumento)}</p>
                </div>
                <div class="ui-tile">
                    <div class="ui-label">Fecha de nacimiento</div>
                    <p class="ui-value">${escapeHtml(persona?.fecha_nacimiento ?? '—')}</p>
                </div>
            </div>

            ${seccionRol ? `<div style="border-top:2px solid #eef1f4;padding-top:12px;">${seccionRol}</div>` : ''}
        </div>
    `
}

export function mostrarInfoUsuario(user) {
    if (!user) return

    return Swal.fire({
        title: '',
        width: 'min(94vw, 720px)',
        html: `<p style="font-family:'Roboto',sans-serif;font-size:14px;color:#6b7280;text-align:center;padding:20px 0;">Cargando información del usuario...</p>`,
        showCloseButton: true,
        closeButtonText: 'Cerrar',
        showConfirmButton: false,
        allowOutsideClick: () => false,
        didOpen: async () => {
            try {
                const detail = await getDetalleUsuario(user.id)
                Swal.update({
                    html: construirHtml(detail),
                    showConfirmButton: true,
                    confirmButtonText: 'Cerrar',
                    confirmButtonColor: AGRO_COLORS.primary,
                })
                const btn = document.getElementById('swal-nueva-solicitud')
                if (btn) {
                    btn.addEventListener('click', () => abrirModalNuevaSolicitudAdmin(detail))
                }
            } catch {
                Swal.update({
                    html: `
                        <p style="font-family:'Roboto',sans-serif;font-size:14px;color:#b91c1c;text-align:center;padding:20px 0;">
                            No se pudo cargar la información del usuario. Intenta de nuevo.
                        </p>
                    `,
                    showConfirmButton: true,
                    confirmButtonText: 'Cerrar',
                    confirmButtonColor: AGRO_COLORS.primary,
                })
            }
        }
    })
}