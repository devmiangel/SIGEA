import Select from 'react-select'

export default function Selection({options, placeholder}){
    return(
        <Select options={options} placeholder={placeholder}/>
    )
}