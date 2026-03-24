import {FaChevronDown} from 'react-icons/fa'
import './DropdownButton.css'

export default function DropdownButton({children}){
    return(
    <option className='dropdown-btn'>
        {children} 
        <span className='toggle-icon'>
            <FaChevronDown/>
        </span>
    </option>
    )
}