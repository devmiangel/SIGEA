import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GroupIcon from '@mui/icons-material/Group'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import { Header } from "../../../components/Tettles-Buttons/Title"
import { DetailCard, DetailField } from "../../../components/DetailCard/DetailCard"
import InventoryFilterBar from "../../../components/InventoryFilterBar/InventoryFilterBar"
import { getProductores } from "../../../services/agroService"
import { getApiErrorMessage } from "../../../utils/getApiErrorMessage"
import { esRegistroActivo } from "../../../utils/insumoHelpers"
import { ACTIVO_STYLE, AGRO_COLORS } from "../../../utils/agroConstants"
import Swal from 'sweetalert2'

const nombrePersona = (productor) => {
    const persona = productor?.persona_info ?? {}
    const nombre = [
        persona.primer_nombre,
        persona.segundo_nombre,
        persona.primer_apellido,
        persona.segundo_apellido,
    ].filter(Boolean).join(' ').trim()
    return nombre || productor?.email || 'Productor sin nombre'
}

const documentoPersona = (productor) => {
    const persona = productor?.persona_info ?? {}
    const tipo = persona.TipoDocumento_info?.TipoDocumento ?? ''
    const numero = persona.numero_documento ?? ''
    return `${tipo} ${numero}`.trim() || 'Sin documento'
}

export default function ProductoresContentAdmin() {
    const navigate = useNavigate()
    const [productores, setProductores] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('')
    const [filtroUps, setFiltroUps] = useState('')

    useEffect(() => {
        let activo = true
        const cargar = async () => {
            setLoading(true)
            try {
                const data = await getProductores()
                if (!activo) return
                setProductores(Array.isArray(data) ? data : [])
                setError(false)
            } catch (e) {
                if (!activo) return
                setError(true)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: getApiErrorMessage(e, 'No se pudieron cargar los productores.'),
                    confirmButtonColor: AGRO_COLORS.primary,
                })
            } finally {
                if (activo) setLoading(false)
            }
        }
        cargar()
        return () => { activo = false }
    }, [])

    const productoresFiltrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase()
        return productores.filter((productor) => {
            const persona = productor.persona_info ?? {}
            const texto = [
                persona.primer_nombre,
                persona.segundo_nombre,
                persona.primer_apellido,
                persona.segundo_apellido,
                persona.numero_documento,
                productor.email,
            ].filter(Boolean).join(' ').toLowerCase()
            const coincideTexto = !q || texto.includes(q)
            const activo = esRegistroActivo(productor)
            const coincideEstado = !filtroEstado
                || (filtroEstado === 'activo' ? activo : !activo)
            const cantidadUps = Number(productor.ups_count ?? 0)
            const coincideUps = !filtroUps
                || (filtroUps === 'con' ? cantidadUps > 0 : cantidadUps === 0)
            return coincideTexto && coincideEstado && coincideUps
        })
    }, [productores, busqueda, filtroEstado, filtroUps])

    const limpiarFiltros = () => {
        setBusqueda('')
        setFiltroEstado('')
        setFiltroUps('')
    }

    return (
        <>
            <Header
                componentLogo={<GroupIcon sx={{ fontSize: 40, color: 'ActiveCaption' }} />}
                headerText={'Productores'}
                message={'Consulta los productores registrados, sus datos y sus unidades productivas'}
                colorLogo={AGRO_COLORS.primaryLight}
            />

            <div className="bg-white min-h-screen rounded-xl my-3 p-3 w-full max-w-full min-w-0 sm:p-4">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Productores del sistema</h3>
                    <p className="text-xs text-gray-500">
                        {productores.length} productor(es) registrado(s)
                    </p>
                </div>

                {loading ? (
                    <p className="text-gray-500 text-sm">Cargando productores...</p>
                ) : error ? (
                    <p className="text-red-600 text-sm">No se pudieron cargar los productores.</p>
                ) : productores.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay productores registrados en el sistema.</p>
                ) : (
                    <>
                        <InventoryFilterBar
                            search={busqueda}
                            onSearchChange={setBusqueda}
                            searchPlaceholder="Buscar por nombre, documento o correo..."
                            total={productores.length}
                            shown={productoresFiltrados.length}
                            onClear={limpiarFiltros}
                            filters={[
                                {
                                    key: 'estado',
                                    label: 'Estado',
                                    value: filtroEstado,
                                    onChange: setFiltroEstado,
                                    options: [
                                        { value: 'activo', label: 'Activos' },
                                        { value: 'inactivo', label: 'Inactivos' },
                                    ],
                                },
                                {
                                    key: 'ups',
                                    label: 'Unidades productivas',
                                    value: filtroUps,
                                    onChange: setFiltroUps,
                                    options: [
                                        { value: 'con', label: 'Con UPs' },
                                        { value: 'sin', label: 'Sin UPs' },
                                    ],
                                },
                            ]}
                        />

                        {productoresFiltrados.length === 0 ? (
                            <p className="text-gray-500 text-sm">
                                No hay productores que coincidan con la búsqueda o los filtros.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
                                {productoresFiltrados.map((productor) => {
                                    const activo = esRegistroActivo(productor)
                                    return (
                                        <DetailCard
                                            key={productor.id}
                                            icon={<GroupIcon sx={{ fontSize: 22, color: '#fff' }} />}
                                            title={nombrePersona(productor)}
                                            badgeClass={activo ? ACTIVO_STYLE.activo : ACTIVO_STYLE.inactivo}
                                            badgeLabel={activo ? 'Activo' : 'Inactivo'}
                                            subtitle={productor.email || 'Sin correo'}
                                            onClick={() => navigate(`/administrador/productores/${productor.id}`)}
                                        >
                                            <DetailField
                                                icon={<BadgeOutlinedIcon sx={{ fontSize: 14, color: AGRO_COLORS.primaryLight }} />}
                                                label="Documento"
                                                value={documentoPersona(productor)}
                                            />
                                            <DetailField
                                                icon={<EmailOutlinedIcon sx={{ fontSize: 14, color: AGRO_COLORS.primaryLight }} />}
                                                label="Correo"
                                                value={productor.email || '—'}
                                            />
                                            <DetailField
                                                icon={<AgricultureIcon sx={{ fontSize: 14, color: AGRO_COLORS.primaryLight }} />}
                                                label="Unidades productivas"
                                                value={String(productor.ups_count ?? 0)}
                                            />
                                        </DetailCard>
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    )
}
