import { useEffect } from 'react'

// Ejecuta `cargar` al montar el componente y cada vez que `cargar` cambie
// (envolverla en useCallback con sus dependencias).
//
// La llamada se difiere a una microtarea: así los setState que hace `cargar`
// (p. ej. setLoading(true)) no ocurren de forma síncrona dentro del efecto
// (regla react-hooks/set-state-in-effect), y no se ejecuta si el componente
// ya se desmontó.
export function useCargarAlMontar(cargar) {
    useEffect(() => {
        let activo = true
        Promise.resolve().then(() => {
            if (activo) cargar()
        })
        return () => { activo = false }
    }, [cargar])
}
