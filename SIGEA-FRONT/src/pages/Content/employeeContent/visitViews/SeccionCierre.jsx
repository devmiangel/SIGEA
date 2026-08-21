import { useEffect, useState, forwardRef, useCallback, useImperativeHandle } from 'react'
import LienzoFirma from './visitas/LienzoFirma'
import { guardarFirmasVisita } from '../../../../services/agroService'
import { useSeccion } from '../../../../hooks/useSeccion'

const SeccionCierre = forwardRef(({ visita }, ref) => {
    const [firmaProductor, setFirmaProductor] = useState('')
    const [firmaFuncionario, setFirmaFuncionario] = useState('')
    const [autorizacion, setAutorizacion] = useState(false)
    const { guardarSeccion } = useSeccion()

    useEffect(() => {
        if (visita?.FirmaProductor) setFirmaProductor(visita.FirmaProductor)
        if (visita?.FirmaFuncionario) setFirmaFuncionario(visita.FirmaFuncionario)
        setAutorizacion(!!visita?.Autorizacion)
    }, [visita?.FirmaProductor, visita?.FirmaFuncionario, visita?.Autorizacion])

    const guardar = useCallback(async () => {
        if (!firmaProductor || !firmaFuncionario) {
            return { ok: false, motivo: 'Debe capturar la firma del usuario y del funcionario.' }
        }
        if (!visita?.id) {
            return { ok: false, motivo: 'No se identificó la visita para guardar las firmas.' }
        }
        return guardarSeccion(() => guardarFirmasVisita(visita.id, firmaProductor, firmaFuncionario, autorizacion))
    }, [firmaProductor, firmaFuncionario, autorizacion, visita, guardarSeccion])

    useImperativeHandle(ref, () => ({ guardar }))

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-500">
                Firme sobre cada recuadro. Las firmas quedarán plasmadas en el formulario de caracterización generado.
            </p>

            <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={autorizacion}
                    onChange={(e) => setAutorizacion(e.target.checked)}
                    className="w-4 h-4 accent-[#015d3b] mt-0.5"
                />
                <span className="text-sm text-gray-700">
                    Autoriza a la Secretaría de Desarrollo Económico para realizar el tratamiento de datos
                    personales de conformidad con la Política de Tratamiento de Datos Personales, con fines
                    informativos y de caracterización.
                </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <LienzoFirma label="Firma del usuario" valor={firmaProductor} onChange={setFirmaProductor} />
                <LienzoFirma label="Firma del funcionario" valor={firmaFuncionario} onChange={setFirmaFuncionario} />
            </div>
        </div>
    )
})

export default SeccionCierre
