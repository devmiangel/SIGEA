import Select from 'react-select'
import { useEffect, useState} from 'react'
import './select.css'

export default function Selection({placeholder, url, labelKey, value, onChange}){

    const [options, setOptions] = useState([])

    useEffect(()=>{
        fetch(url)
            .then(res => res.json())
            .then(data => {
                const formatted = data.map(item => ({
                    value: item.id,
                    label: item[labelKey]
                }))
                setOptions(formatted)
            })
    }, [url, labelKey])

    return(
        <div className="selection">
            <Select
                options={options}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
        
    )
}