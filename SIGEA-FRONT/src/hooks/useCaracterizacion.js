import { useState, useCallback } from "react"
import {
    getInfoPersonal, getInfoPredio, getInfoUP,
    getInfoAgricola, getInfoAnimal, getInfoAgroindustrial, getInfoAdicional,
} from "../services/caracterizacionService"

const CALLS = [
    getInfoPersonal,
    getInfoPredio,
    getInfoUP,
    getInfoAgricola,
    getInfoAnimal,
    getInfoAgroindustrial,
    getInfoAdicional,
]

const KEYS = [
    'personal',
    'predio',
    'infoUp',
    'agricola',
    'animal',
    'agroindustrial',
    'adicional',
]

export function useCaracterizacion() {
    const [secciones, setSecciones] = useState(null)
    const [loading, setLoading] = useState(true)

    const cargar = useCallback(async (userId) => {
        if (!userId) return
        setLoading(true)
        try {
            const respuestas = await Promise.all(CALLS.map((fn) => fn(userId)))
            setSecciones(Object.fromEntries(KEYS.map((k, i) => [k, respuestas[i]])))
        } catch {
            setSecciones(null)
        } finally {
            setLoading(false)
        }
    }, [])

    return { secciones, loading, setLoading, refresh: cargar }
}