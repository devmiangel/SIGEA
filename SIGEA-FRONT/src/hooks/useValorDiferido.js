import { useEffect, useState } from 'react'

// Devuelve `valor` solo cuando deja de cambiar durante `espera` ms.
// Se usa en los buscadores para no consultar la API con cada tecla.
export function useValorDiferido(valor, espera = 300) {
    const [diferido, setDiferido] = useState(valor)

    useEffect(() => {
        const t = setTimeout(() => setDiferido(valor), espera)
        return () => clearTimeout(t)
    }, [valor, espera])

    return diferido
}
