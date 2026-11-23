import { useEffect, useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import AsyncSelect from 'react-select/async'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import { Header } from '../../../components/Tettles-Buttons/Title'
import TabList from '../../../components/TabList/TabList'
import VisitaCard from '../../../components/VisitaCard/VisitaCard'
import VisitaInfo from '../../../components/VisitaInfo/VisitaInfo'
import { AGRO_COLORS } from '../../../utils/agroConstants'
import { getNombreCompleto } from '../../../utils/userDisplay'
import { escapeHtml } from '../../../utils/sanitize'
import { buscarProductoresUsuarios, getDetalleUsuario } from '../../../services/usuariosService'
import { crearOrdenVisita, getMisOrdenes, getTiposVisitas } from '../../../services/visitasService'
import { registerUser } from '../../../services/authService'
import { API_BASE_URL } from '../../../services/api'

const INPUT_CLASE = "w-full px-3 py-2 rounded-md border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white"
const LABEL_CLASE = "text-xs font-semibold uppercase tracking-wide text-gray-500"

const SELECT_STYLES = {
    control: (base) => ({
        ...base,
        borderColor: '#015d3b',
        borderRadius: '0.5rem',
        minHeight: '38px',
        boxShadow: 'none',
        fontSize: '14px',
        '&:hover': { borderColor: '#015d3b' },
    }),
    placeholder: (base) => ({ ...base, color: '#9ca3af', fontSize: '14px' }),
    indicatorSeparator: () => ({ display: 'none' }),
}

const modalInputStyle = 'width:100%; padding:9px 12px; border:1.5px solid #015d3b; border-radius:8px; font-size:14px; outline:none; box-sizing:border-box; font-family:inherit; background:#fff; color:#374151;'
const modalLabelStyle = 'display:block; margin-bottom:5px; font-weight:600; font-size:12px; color:#374151;'

function Campo({ label, required = false, children }) {
    return (
        <div className="flex flex-col gap-1">
            <label className={LABEL_CLASE}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
        </div>
    )
}

function etiquetaUP(up) {
    const ruea = up?.RUEA ?? `UP #${up?.id ?? ''}`
    const predio = up?.nombre_predio ?? ''
    const tipo = up?.tipo_up_label ?? ''
    return [ruea, predio, tipo].filter(Boolean).join(' · ')
}

export default function GestionContentEmployee() {
    const [tiposVisitas, setTiposVisitas] = useState([])
    const [tiposDocumento, setTiposDocumento] = useState([])

    const [usuario, setUsuario] = useState(null)
    const [ups, setUps] = useState([])
    const [cargandoUps, setCargandoUps] = useState(false)
    const [upId, setUpId] = useState('')
    const [tipoVisitaId, setTipoVisitaId] = useState('')
    const [fechaVisita, setFechaVisita] = useState('')
    const [ubicacion, setUbicacion] = useState('')
    const [direccion, setDireccion] = useState('')
    const [observacion, setObservacion] = useState('')
    const [enviando, setEnviando] = useState(false)

    const [ordenes, setOrdenes] = useState([])
    const [cargandoOrdenes, setCargandoOrdenes] = useState(true)
    const [selectedOrden, setSelectedOrden] = useState(null)
    const [activeTab, setActiveTab] = useState('Generar orden de visita')

    const cargarOrdenes = useCallback(async () => {
        setCargandoOrdenes(true)
        try {
            const data = await getMisOrdenes()
            setOrdenes(data ?? [])
        } catch {
            setOrdenes([])
        } finally {
            setCargandoOrdenes(false)
        }
    }, [])

    useEffect(() => {
        cargarOrdenes()
    }, [cargarOrdenes])

    useEffect(() => {
        getTiposVisitas().then(setTiposVisitas).catch(() => {})
        fetch(`${API_BASE_URL}/usuarios/tiposDocumentos/`)
            .then((res) => res.json())
            .then((data) => {
                const lista = Array.isArray(data) ? data : (data.results ?? [])
                setTiposDocumento(lista.map((i) => ({ value: i.id, label: i.TipoDocumento })))
            })
            .catch(() => {})
    }, [])

    const cargarUsuarios = async (inputValue) => {
        const data = await buscarProductoresUsuarios(inputValue || '')
        return (data ?? []).map((u) => ({
            value: u.id,
            label: `${getNombreCompleto(u)} · ${u.email}`,
        }))
    }

    const handleUsuarioChange = async (opt) => {
        setUsuario(opt)
        setUpId('')
        if (!opt) {
            setUps([])
            return
        }
        setCargandoUps(true)
        try {
            const detalle = await getDetalleUsuario(opt.value)
            setUps(detalle?.ups ?? [])
        } catch {
            setUps([])
        } finally {
            setCargandoUps(false)
        }
    }

    const limpiarFormulario = () => {
        setUsuario(null)
        setUps([])
        setUpId('')
        setTipoVisitaId('')
        setFechaVisita('')
        setUbicacion('')
        setDireccion('')
        setObservacion('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!usuario) {
            Swal.fire({ icon: 'warning', title: 'Selecciona un productor o usuario', confirmButtonColor: AGRO_COLORS.primary })
            return
        }
        if (!tipoVisitaId) {
            Swal.fire({ icon: 'warning', title: 'Selecciona el tipo de visita', confirmButtonColor: AGRO_COLORS.primary })
            return
        }
        if (!fechaVisita) {
            Swal.fire({ icon: 'warning', title: 'Indica la fecha y hora de la visita', confirmButtonColor: AGRO_COLORS.primary })
            return
        }
        if (!direccion.trim()) {
            Swal.fire({ icon: 'warning', title: 'La dirección es requerida', confirmButtonColor: AGRO_COLORS.primary })
            return
        }
        if (!observacion.trim()) {
            Swal.fire({ icon: 'warning', title: 'La descripción es requerida', confirmButtonColor: AGRO_COLORS.primary })
            return
        }

        setEnviando(true)
        try {
            await crearOrdenVisita({
                usuario_id: usuario.value,
                up_id: upId || null,
                tipo_visita_id: Number(tipoVisitaId),
                fecha_visita: fechaVisita,
                ubicacion: ubicacion.trim() || null,
                direccion: direccion.trim(),
                observacion: observacion.trim(),
            })
            await Swal.fire({
                icon: 'success',
                title: 'Orden de visita generada',
                text: 'La orden quedó asignada a tu agenda.',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 2000,
                timerProgressBar: true,
            })
            limpiarFormulario()
            cargarOrdenes()
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'No se pudo generar la orden',
                text: err?.message || 'Intenta de nuevo.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
        } finally {
            setEnviando(false)
        }
    }

    const abrirNuevoProductor = () => {
        Swal.fire({
            title: 'Nuevo productor',
            width: 'min(94vw, 560px)',
            html: `
                <div style="text-align:left;">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px 14px;">
                        <div>
                            <label style="${modalLabelStyle}">Primer nombre <span style="color:#dc2626;">*</span></label>
                            <input id="np-primer-nombre" placeholder="Ej. Juan" style="${modalInputStyle}">
                        </div>
                        <div>
                            <label style="${modalLabelStyle}">Segundo nombre</label>
                            <input id="np-segundo-nombre" placeholder="Ej. Alberto" style="${modalInputStyle}">
                        </div>
                        <div>
                            <label style="${modalLabelStyle}">Primer apellido <span style="color:#dc2626;">*</span></label>
                            <input id="np-primer-apellido" placeholder="Ej. García" style="${modalInputStyle}">
                        </div>
                        <div>
                            <label style="${modalLabelStyle}">Segundo apellido</label>
                            <input id="np-segundo-apellido" placeholder="Ej. Pérez" style="${modalInputStyle}">
                        </div>
                        <div style="grid-column:1 / -1;">
                            <label style="${modalLabelStyle}">Correo electrónico <span style="color:#dc2626;">*</span></label>
                            <input id="np-email" type="email" placeholder="Ej. juan@correo.com" style="${modalInputStyle}">
                        </div>
                        <div>
                            <label style="${modalLabelStyle}">Tipo de documento <span style="color:#dc2626;">*</span></label>
                            <select id="np-tipo-doc" style="${modalInputStyle}">
                                <option value="">Seleccione...</option>
                                ${tiposDocumento.map((t) => `<option value="${escapeHtml(t.value)}">${escapeHtml(t.label)}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="${modalLabelStyle}">Número de documento <span style="color:#dc2626;">*</span></label>
                            <input id="np-numero-doc" placeholder="Ej. 123456789" style="${modalInputStyle}">
                        </div>
                        <div>
                            <label style="${modalLabelStyle}">Fecha de nacimiento <span style="color:#dc2626;">*</span></label>
                            <input id="np-fecha-nac" type="date" style="${modalInputStyle}">
                        </div>
                        <div>
                            <label style="${modalLabelStyle}">Contraseña <span style="color:#dc2626;">*</span></label>
                            <input id="np-password" type="password" placeholder="Mínimo 8 caracteres" style="${modalInputStyle}">
                        </div>
                        <div style="grid-column:1 / -1; margin-top:-4px;">
                            <ul style="margin:0; padding:0; list-style:none; font-size:10px; line-height:16px;">
                                <li id="np-req-len" style="color:#dc2626;">✗ Al menos 8 caracteres</li>
                                <li id="np-req-num" style="color:#dc2626;">✗ No puede tener solo números: combina letras y números</li>
                                <li id="np-req-data" style="color:#dc2626;">✗ No debe contener tu nombre, apellido, documento ni correo</li>
                                <li style="color:#6b7280;">• Evita contraseñas comunes como “12345678”, “password” o “qwerty123”</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `,
            focusConfirm: false,
            didOpen: () => {
                const $ = (id) => document.getElementById(id)
                const normalizar = (texto) => String(texto ?? '')
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase()
                const partesPersonales = () => {
                    const valor = (id) => $(id)?.value?.trim() ?? ''
                    return [
                        valor('np-primer-nombre'),
                        valor('np-segundo-nombre'),
                        valor('np-primer-apellido'),
                        valor('np-segundo-apellido'),
                        valor('np-numero-doc'),
                        valor('np-email').split('@')[0],
                    ]
                        .flatMap((v) => normalizar(v).split(/[\s._\-+]+/))
                        .filter((parte) => parte.length >= 3)
                }
                const pintar = (id, cumple, texto) => {
                    const el = $(id)
                    if (!el) return
                    el.textContent = `${cumple ? '✓' : '✗'} ${texto}`
                    el.style.color = cumple ? '#015d3b' : '#dc2626'
                }
                const actualizar = () => {
                    const password = $('np-password')?.value ?? ''
                    const clave = normalizar(password)
                    pintar('np-req-len', password.length >= 8, 'Al menos 8 caracteres')
                    pintar(
                        'np-req-num',
                        password.length > 0 && !/^\d+$/.test(password),
                        'No puede tener solo números: combina letras y números'
                    )
                    const contiene = partesPersonales().some((parte) => clave.includes(parte))
                    pintar(
                        'np-req-data',
                        password.length > 0 && !contiene,
                        'No debe contener tu nombre, apellido, documento ni correo'
                    )
                }
                $('np-password')?.addEventListener('input', actualizar)
                ;[
                    'np-primer-nombre',
                    'np-segundo-nombre',
                    'np-primer-apellido',
                    'np-segundo-apellido',
                    'np-numero-doc',
                    'np-email',
                ].forEach((id) => $(id)?.addEventListener('input', actualizar))
                actualizar()
            },
            showCancelButton: true,
            confirmButtonText: 'Crear productor',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: AGRO_COLORS.success,
            cancelButtonColor: '#64748b',
            preConfirm: () => {
                const val = (id) => document.getElementById(id)?.value?.trim() ?? ''
                const primer_nombre = val('np-primer-nombre')
                const primer_apellido = val('np-primer-apellido')
                const email = val('np-email')
                const TipoDocumento = val('np-tipo-doc')
                const numero_documento = val('np-numero-doc')
                const fecha_nacimiento = val('np-fecha-nac')
                const password = val('np-password')

                if (!primer_nombre || !primer_apellido || !email || !TipoDocumento || !numero_documento || !fecha_nacimiento || !password) {
                    Swal.showValidationMessage('Todos los campos con * son obligatorios')
                    return false
                }
                if (password.length < 8) {
                    Swal.showValidationMessage('La contraseña debe tener al menos 8 caracteres')
                    return false
                }
                if (/^\d+$/.test(password)) {
                    Swal.showValidationMessage('La contraseña no puede ser solo números')
                    return false
                }
                const normalizar = (texto) => String(texto ?? '')
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase()
                const partes = [
                    primer_nombre,
                    val('np-segundo-nombre'),
                    primer_apellido,
                    val('np-segundo-apellido'),
                    numero_documento,
                    email.split('@')[0],
                ]
                    .flatMap((v) => normalizar(v).split(/[\s._\-+]+/))
                    .filter((parte) => parte.length >= 3)
                if (partes.some((parte) => normalizar(password).includes(parte))) {
                    Swal.showValidationMessage('La contraseña no debe contener tus datos personales')
                    return false
                }
                const comunes = ['12345678', 'password', 'qwerty123']
                if (comunes.includes(password.toLowerCase())) {
                    Swal.showValidationMessage('Elige una contraseña menos común')
                    return false
                }

                return {
                    primer_nombre,
                    segundo_nombre: val('np-segundo-nombre'),
                    primer_apellido,
                    segundo_apellido: val('np-segundo-apellido'),
                    email,
                    TipoDocumento: Number(TipoDocumento),
                    numero_documento,
                    fecha_nacimiento,
                    password,
                    rol: 'Productores',
                }
            },
        }).then(async (result) => {
            if (!result.isConfirmed) return
            try {
                await registerUser(result.value)
                await Swal.fire({
                    icon: 'success',
                    title: 'Productor creado',
                    text: 'El usuario fue registrado como productor.',
                    confirmButtonColor: AGRO_COLORS.success,
                    timer: 2000,
                    timerProgressBar: true,
                })
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'No se pudo crear el productor',
                    text: err?.message || 'Intenta de nuevo.',
                    confirmButtonColor: AGRO_COLORS.primary,
                })
            }
        })
    }

    return (
        <>
            <Header
                componentLogo={<AssignmentTurnedInIcon sx={{ fontSize: 40, color: 'ActiveCaption' }} />}
                headerText={'Gestión'}
                message={'Genera órdenes de visita para productores y usuarios del sistema'}
                colorLogo={'#9ebd57'}
            />

            <div className="bg-white min-h-screen rounded-xl my-3 p-3 w-full max-w-full min-w-0 sm:p-4 overflow-y-hidden">
                <div className="mb-6">
                    <TabList
                        categories={['Generar orden de visita', 'Visitas generadas']}
                        active={activeTab}
                        onChange={setActiveTab}
                    />
                </div>

                {activeTab === 'Generar orden de visita' ? (
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className={LABEL_CLASE}>
                                Productor o usuario <span className="text-red-500">*</span>
                            </label>
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                loadOptions={cargarUsuarios}
                                value={usuario}
                                onChange={handleUsuarioChange}
                                placeholder="Busca por nombre, documento o correo..."
                                isClearable
                                noOptionsMessage={() => 'Sin resultados'}
                                loadingMessage={() => 'Buscando...'}
                                styles={SELECT_STYLES}
                            />
                        </div>

                        <Campo label="Unidad productiva (UP)">
                            {usuario && cargandoUps ? (
                                <p className="text-xs text-gray-500 py-2">Cargando unidades productivas...</p>
                            ) : ups.length > 0 ? (
                                <select value={upId} onChange={(e) => setUpId(e.target.value)} className={INPUT_CLASE}>
                                    <option value="">Sin UP (caracterización)</option>
                                    {ups.map((up) => (
                                        <option key={up.id} value={up.id}>{etiquetaUP(up)}</option>
                                    ))}
                                </select>
                            ) : (
                                <p className="text-xs text-gray-500 py-2">
                                    {usuario ? 'El usuario no tiene unidades productivas registradas.' : 'Selecciona un productor o usuario.'}
                                </p>
                            )}
                        </Campo>

                        <Campo label="Tipo de visita" required>
                            <select value={tipoVisitaId} onChange={(e) => setTipoVisitaId(e.target.value)} className={INPUT_CLASE}>
                                <option value="">Seleccione...</option>
                                {tiposVisitas.map((t) => (
                                    <option key={t.id} value={t.id}>{t.TipoVisita}</option>
                                ))}
                            </select>
                        </Campo>

                        <Campo label="Fecha y hora" required>
                            <input type="datetime-local" value={fechaVisita} onChange={(e) => setFechaVisita(e.target.value)} className={INPUT_CLASE} />
                        </Campo>

                        <Campo label="Ubicación">
                            <input type="text" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} className={INPUT_CLASE} placeholder="Ej. Finca El Recreo, Vereda Central" />
                        </Campo>

                        <Campo label="Dirección" required>
                            <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} className={INPUT_CLASE} placeholder="Dirección de la visita" />
                        </Campo>

                        <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-3">
                            <label className={LABEL_CLASE}>
                                Descripción <span className="text-red-500">*</span>
                            </label>
                            <textarea value={observacion} onChange={(e) => setObservacion(e.target.value)} className={`${INPUT_CLASE} min-h-22.5 resize-y`} placeholder="Describe el motivo de la visita" />
                        </div>
                    </div>

                    <div className="pt-4 mt-6 flex flex-wrap justify-between items-center gap-3">
                        <button
                            type="button"
                            onClick={abrirNuevoProductor}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#015d3b] text-[#015d3b] text-sm font-semibold hover:bg-[#015d3b]/5 transition-colors"
                        >
                            <PersonAddAltIcon sx={{ fontSize: 18 }} />
                            Nuevo productor
                        </button>
                        <button
                            type="submit"
                            disabled={enviando}
                            className="px-6 py-2 rounded-lg bg-[#015d3b] text-white text-sm font-semibold hover:bg-[#004d2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {enviando ? 'Generando...' : 'Generar orden de visita'}
                        </button>
                    </div>
                </form>
                ) : (
                <div>
                    <h3 className="text-base font-semibold text-gray-900">Visitas generadas</h3>
                    <p className="text-xs text-gray-500 mb-4">Órdenes generadas por ti y asignadas a tu agenda.</p>

                    {cargandoOrdenes ? (
                        <p className="text-gray-500 text-sm">Cargando órdenes...</p>
                    ) : ordenes.length === 0 ? (
                        <p className="text-gray-500 text-sm">Aún no has generado órdenes de visita.</p>
                    ) : (
                        <div className="space-y-3">
                            {ordenes.map((o, i) => (
                                <VisitaCard key={o.id} visita={o} numero={i + 1} onClick={() => setSelectedOrden(o)} />
                            ))}
                        </div>
                    )}
                </div>
                )}
            </div>

            {selectedOrden && (
                <VisitaInfo
                    visita={selectedOrden}
                    numero={ordenes.findIndex((x) => x.id === selectedOrden.id) + 1}
                    onClose={() => setSelectedOrden(null)}
                    onReagendada={cargarOrdenes}
                />
            )}
        </>
    )
}
