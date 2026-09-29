import Select from 'react-select'
import { useEffect, useState} from 'react'

export default function Selection({placeholder, url, labelKey, value, onChange}){

    const [options, setOptions] = useState([])

    useEffect(()=>{
        const token = localStorage.getItem('token')
        fetch(url, {
            headers: token ? { Authorization: `Token ${token}` } : {},
        })
            .then(res => {
                if (!res.ok) throw new Error(`Error ${res.status} al cargar ${url}`)
                return res.json()
            })
            .then(data => {
                // Soporta respuesta paginada {results: []} o lista directa []
                const list = Array.isArray(data) ? data : data.results ?? []
                const formatted = list.map(item => ({
                    value: item.id,
                    label: item[labelKey]
                }))
                setOptions(formatted)
            })
            .catch(() => setOptions([]))
    }, [url, labelKey])

    return(
        <div className="font-mono text-[13px] border border-[#015d3b] rounded-[5px]">
            <Select
                options={options}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
        
    )
}