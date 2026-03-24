import '../styles/components_login.css'

export function InputLogReg({type ,placeholder}){
    return(
        <input type={type} placeholder={placeholder} className='input-log'/>    
    )
}

export function InputListaLogReg({valueInput, nameInput}){
    return(
        <label className='input-radio'>
            <input type='radio'  value={valueInput} name={nameInput}/>
            {valueInput}
        </label>
    )
}

export function LinkLog({children, href}){
    return(
        <a href={href} className='log-link' target='_blank'>{children} </a>
    )
}


export function ButtonLink({text}){
    return(
        <button type="submit" className='log-button'>{text}</button>
    )
}