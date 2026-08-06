import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react'
import TabList from "../../../../components/TabList/TabList"
import { Header } from "../../../../components/Tettles-Buttons/Title"
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import SeccionProductor from './SeccionProductor'
import SeccionPredio from './SeccionPredio'
import SeccionUP from './SeccionUP'
import SeccionAgricola from './SeccionAgricola'
import SeccionPecuaria from './SeccionPecuaria'
import SeccionAgroindustrial from './SeccionAgroindustrial'
import SeccionAdicional from './SeccionAdicional'
import VisitaResumen from "../../../../components/VisitaResumen/VisitaResumen"
import EstadoVisita from "../../../../components/EstadoVisita/EstadoVisita"
import { marcarVisitaRealizada } from "../../../../services/agroService"
import Swal from 'sweetalert2'
import { AGRO_COLORS } from "../../../../utils/agroConstants"
import { escapeHtml } from "../../../../utils/sanitize"

const SECCIONES = [
    { nombre: 'Productor', componente: SeccionProductor },
    { nombre: 'Predio', componente: SeccionPredio },
    { nombre: 'UP', componente: SeccionUP },
    { nombre: 'Agricola', componente: SeccionAgricola },
    { nombre: 'Pecuaria', componente: SeccionPecuaria },
    { nombre: 'Agroindustrial', componente: SeccionAgroindustrial },
    { nombre: 'Adicional', componente: SeccionAdicional },
]

export default function CaracterForm() {
    const location = useLocation()
    const navigate = useNavigate()
    const visita = location.state?.visita
    const userId = visita?.solicitud_info?.solicitante?.usuario_id
    const solicitudId = visita?.solicitud_info?.id
    const [active, setActive] = useState(SECCIONES[0].nombre)
    const [finalizando, setFinalizando] = useState(false)
    const seccionesRef = useRef({})

    const finalizar = async () => {
        setFinalizando(true)

        const fallidas = []
        for (const s of SECCIONES) {
            const ref = seccionesRef.current[s.nombre]
            if (!ref?.guardar) continue
            const res = await ref.guardar()
            if (!res?.ok) {
                fallidas.push({ seccion: s.nombre, motivo: res?.motivo || 'No se pudo guardar la sección.' })
            }
        }

        if (fallidas.length) {
            Swal.fire({
                icon: 'error',
                title: 'No se pudo finalizar la visita',
                html: fallidas
                    .map((f) => `<strong>${escapeHtml(f.seccion)}</strong>: ${escapeHtml(f.motivo)}`)
                    .join('<br/>'),
                confirmButtonColor: AGRO_COLORS.primary,
            })
            setFinalizando(false)
            return
        }

        try {
            await marcarVisitaRealizada(visita.id)
            Swal.fire({
                icon: 'success',
                title: 'Visita realizada',
                text: 'La visita fue marcada como realizada y aparecerá en "Visitas Realizadas".',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 2000,
                timerProgressBar: true
            }).then(() => navigate('/funcionario/agenda'))
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo marcar la visita como realizada. Intenta de nuevo.',
                confirmButtonColor: AGRO_COLORS.primary
            })
        } finally {
            setFinalizando(false)
        }
    }

    return (
        <div className="w-full max-w-full">
            <Header
                componentLogo={
                    <AccountBalanceIcon sx={{ fontSize: 40, color: "ActiveCaption" }} />
                }
                headerText={'Formulario de caracterización'}
                message={
                    userId
                        ? `Registro de la unidad productiva del productor que solicitó la visita.`
                        : 'No se pudo identificar el productor de la visita.'
                }
                colorLogo={'#55bd85'}
            />

            <div className="bg-white min-h-screen rounded-xl m-3 p-4 w-full max-w-full">
                {!visita ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-sm mb-4">
                            No se recibió la información de la visita.
                        </p>
                        <button
                            onClick={() => navigate('/funcionario/agenda')}
                            className="px-4 py-2 rounded-lg bg-[#015d3b] text-white text-sm font-semibold hover:bg-[#004d2f] transition-colors"
                        >
                            Volver a la agenda
                        </button>
                    </div>
                ) : !userId ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-sm mb-4">
                            La visita no tiene un productor asociado para caracterizar.
                        </p>
                        <button
                            onClick={() => navigate('/funcionario/agenda')}
                            className="px-4 py-2 rounded-lg bg-[#015d3b] text-white text-sm font-semibold hover:bg-[#004d2f] transition-colors"
                        >
                            Volver a la agenda
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-start mb-4">
                            <EstadoVisita estado={visita?.estado} />
                        </div>

                        <VisitaResumen visita={visita} />

                        <div className="mb-6 w-full overflow-x-auto">
                            <div className="inline-flex">
                                <TabList
                                    categories={SECCIONES.map((s) => s.nombre)}
                                    active={active}
                                    onChange={setActive}
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            {SECCIONES.map((s) => {
                                const Seccion = s.componente
                                return (
                                    <div key={s.nombre} className={s.nombre === active ? 'block' : 'hidden'}>
                                        <Seccion
                                            ref={(el) => { seccionesRef.current[s.nombre] = el }}
                                            userId={userId}
                                            solicitudId={solicitudId}
                                        />
                                    </div>
                                )
                            })}
                        </div>

                        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <button
                                onClick={() => navigate('/funcionario/agenda')}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Volver a la agenda
                            </button>
                            <div className="flex gap-3">
                                {visita?.estado ? (
                                    <span className="px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-semibold">
                                        Visita completada
                                    </span>
                                ) : (
                                    <button
                                        onClick={finalizar}
                                        disabled={finalizando}
                                        className="px-4 py-2 rounded-lg bg-[#015d3b] text-white text-sm font-semibold hover:bg-[#004d2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {finalizando ? 'Guardando...' : 'Guardar y finalizar visita'}
                                    </button>
                                )}
                                {active !== SECCIONES[SECCIONES.length - 1].nombre && (
                                    <button
                                        onClick={() => {
                                            const idx = SECCIONES.findIndex((s) => s.nombre === active)
                                            setActive(SECCIONES[idx + 1].nombre)
                                        }}
                                        className="px-4 py-2 rounded-lg border border-[#015d3b] text-[#015d3b] text-sm font-semibold hover:bg-[#015d3b]/5 transition-colors"
                                    >
                                        Siguiente sección
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}