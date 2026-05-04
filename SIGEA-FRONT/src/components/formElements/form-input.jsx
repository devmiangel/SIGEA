import { forwardRef } from 'react'
import './components_login.css'

export const InputLogReg = forwardRef(({type ,placeholder, aditionalClass = "", ...rest}, ref) => {
    return(
        <input 
            ref={ref}
            type={type} 
            placeholder={placeholder} 
            className={`input-log ${aditionalClass}`}
            {...rest}  
        />          
    )
})

export function LinkLog({children, href}){
    return(
        <a href={href} className='log-link'>
            {children} 
        </a>
    )
}


export function ButtonLink({text}){
    return(
        <button type="submit" className='log-button'>
            {text}
        </button>
    )
}