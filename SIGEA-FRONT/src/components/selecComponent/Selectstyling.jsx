import Select from 'react-select'
import { useEffect, useState} from 'react'

const SELECT_STYLES = {
    control: (base) => ({
        ...base,
        borderColor: '#015d3b',
        borderRadius: '0.375rem',
        minHeight: '44px',
        boxShadow: 'none',
        fontSize: '14px',
        '&:hover': { borderColor: '#015d3b' },
        '&:focus-within': { borderColor: '#015d3b', boxShadow: '0 0 0 3px rgba(1, 93, 59, 0.25)' },
    }),
    placeholder: (base) => ({ ...base, color: '#9ca3af', fontSize: '14px' }),
    indicatorSeparator: () => ({ display: 'none' }),
    valueContainer: (base) => ({ ...base, padding: '0 12px' }),
    singleValue: (base) => ({ ...base, color: '#1f2937', fontSize: '14px' }),
    input: (base) => ({ ...base, color: '#1f2937', fontSize: '14px' }),
    menu: (base) => ({ ...base, fontSize: '14px' }),
    option: (base) => ({ ...base, fontSize: '14px' }),
}

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
        <div className="w-full">
            <Select
                options={options}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                styles={SELECT_STYLES}
            />
        </div>
        
    )
}