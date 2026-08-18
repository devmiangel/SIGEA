import { useEffect, useState, forwardRef, useCallback, useImperativeHandle } from 'react'
import LienzoFirma from './visitas/LienzoFirma'
import { guardarFirmasVisita } from '../../../../services/agroService'
import { useSeccion } from '../../../../hooks/useSeccion'

const SeccionCierre = forwardRef(({ visita }, ref) => {
    const [firmaProductor, setFirmaProductor] = useState('')
    const [firmaFuncionario, setFirmaFuncionario] = useState('')
    const { guardarSeccion } = useSeccion()

    useEffect(() => {
        if (visita?.FirmaProductor) setFirmaProductor(visita.FirmaProductor)
        if (visita?.FirmaFuncionario) setFirmaFuncionario(visita.FirmaFuncionario)
    }, [visita?.FirmaProductor, visita?.FirmaFuncionario])

    const guardar = useCallback(async () => {
        if (!firmaProductor || !firmaFuncionario) {
            return { ok: false, motivo: 'Debe capturar la firma del usuario y del funcionario.' }
        }
        if (!visita?.id) {
            return { ok: false, motivo: 'No se identificó la visita para guardar las firmas.' }
        }
        return guardarSeccion(() => guardarFirmasVisita(visita.id, firmaProductor, firmaFuncionario))
    }, [firmaProductor, firmaFuncionario, visita, guardarSeccion])

    useImperativeHandle(ref, () => ({ guardar }))

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-500">
                Firme sobre cada recuadro. Las firmas quedarán plasmadas en el formulario de caracterización generado.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <LienzoFirma label="Firma del usuario" valor={firmaProductor} onChange={setFirmaProductor} />
                <LienzoFirma label="Firma del funcionario" valor={firmaFuncionario} onChange={setFirmaFuncionario} />
            </div>
        </div>
    )
})

export default SeccionCierre
