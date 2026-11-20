import { useCallback, useEffect, useState } from 'react'

export function usePaginatedList(fetcher, filtros = {}, pageSize = 50) {
    const [items, setItems] = useState([])
    const [count, setCount] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const filtrosKey = JSON.stringify(filtros)

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            const data = await fetcher({ page, page_size: pageSize, ...JSON.parse(filtrosKey) })
            const lista = Array.isArray(data) ? data : (data?.results ?? [])
            setItems(lista)
            setCount(Array.isArray(data) ? lista.length : (data?.count ?? 0))
            setError(null)
        } catch (e) {
            if (e?.response?.status === 404 && page > 1) {
                setPage(page - 1)
            } else {
                setError(e)
            }
        } finally {
            setLoading(false)
        }
    }, [fetcher, page, pageSize, filtrosKey])

    useEffect(() => {
        let activo = true
        Promise.resolve().then(() => {
            if (activo) cargar()
        })
        return () => { activo = false }
    }, [cargar])

    return {
        items,
        count,
        page,
        setPage,
        loading,
        error,
        refresh: cargar,
        pageSize,
    }
}
