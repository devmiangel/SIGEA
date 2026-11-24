import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GroupIcon from '@mui/icons-material/Group'
import { Header } from "../../../components/Tettles-Buttons/Title"
import InventoryFilterBar from "../../../components/InventoryFilterBar/InventoryFilterBar"
import PaginationBar from "../../../components/PaginationBar/PaginationBar"
import ProductorPreviewCard from "../../../components/ProductorPreviewCard/ProductorPreviewCard"
import { usePaginatedList } from "../../../hooks/usePaginatedList"
import { getProductores } from "../../../services/usuariosService"
import { getVeredas } from "../../../services/caracterizacionService"
import { AGRO_COLORS } from "../../../utils/agroConstants"

const PAGE_SIZE = 25

export default function ProductoresContentAdmin() {
    const navigate = useNavigate()
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('')
    const [filtroUps, setFiltroUps] = useState('')
    const [filtroVereda, setFiltroVereda] = useState('')
    const [veredas, setVeredas] = useState([])

    const {
        items: productores,
        count,
        page,
        setPage,
        pageSize,
        loading,
        error,
    } = usePaginatedList(
        getProductores,
        {
            search: busqueda.trim(),
            estado: filtroEstado,
            ups: filtroUps,
            vereda: filtroVereda,
        },
        PAGE_SIZE,
    )

    useEffect(() => {
        let activo = true
        getVeredas()
            .then((veredasData) => {
                if (activo) setVeredas(veredasData ?? [])
            })
            .catch(() => {})
        return () => { activo = false }
    }, [])

    const hayFiltros = Boolean(busqueda.trim()) || Boolean(filtroEstado)
        || Boolean(filtroUps) || Boolean(filtroVereda)

    const limpiarFiltros = () => {
        setBusqueda('')
        setFiltroEstado('')
        setFiltroUps('')
        setFiltroVereda('')
        setPage(1)
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
                    <p className="text-xs text-gray-500">{count} productor(es) registrado(s)</p>
                </div>

                <InventoryFilterBar
                    search={busqueda}
                    onSearchChange={(valor) => { setBusqueda(valor); setPage(1) }}
                    searchPlaceholder="Buscar por nombre, documento o correo..."
                    total={count}
                    shown={productores.length}
                    onClear={limpiarFiltros}
                    filters={[
                        {
                            key: 'estado',
                            label: 'Estado',
                            value: filtroEstado,
                            onChange: (valor) => { setFiltroEstado(valor); setPage(1) },
                            options: [
                                { value: 'activo', label: 'Activos' },
                                { value: 'inactivo', label: 'Inactivos' },
                            ],
                        },
                        {
                            key: 'ups',
                            label: 'Unidades productivas',
                            value: filtroUps,
                            onChange: (valor) => { setFiltroUps(valor); setPage(1) },
                            options: [
                                { value: 'con', label: 'Con UPs' },
                                { value: 'sin', label: 'Sin UPs' },
                            ],
                        },
                        {
                            key: 'vereda',
                            label: 'Vereda',
                            value: filtroVereda,
                            onChange: (valor) => { setFiltroVereda(valor); setPage(1) },
                            options: veredas.map((vereda) => ({
                                value: String(vereda.id),
                                label: vereda.NombreVereda,
                            })),
                        },
                    ]}
                />

                {loading ? (
                    <p className="text-gray-500 text-sm">Cargando productores...</p>
                ) : error ? (
                    <p className="text-red-600 text-sm">No se pudieron cargar los productores.</p>
                ) : count === 0 ? (
                    <p className="text-gray-500 text-sm">
                        {hayFiltros
                            ? 'No hay productores que coincidan con la búsqueda o los filtros.'
                            : 'No hay productores registrados en el sistema.'}
                    </p>
                ) : (
                    <>
                        <div className="space-y-3">
                            {productores.map((productor) => (
                                <ProductorPreviewCard
                                    key={productor.id}
                                    productor={productor}
                                    onClick={() => navigate(`/administrador/productores/${productor.id}`)}
                                />
                            ))}
                        </div>
                        <PaginationBar
                            page={page}
                            count={count}
                            pageSize={pageSize}
                            onPageChange={setPage}
                            loading={loading}
                        />
                    </>
                )}
            </div>
        </>
    )
}
