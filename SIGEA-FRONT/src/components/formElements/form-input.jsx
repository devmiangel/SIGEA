import { forwardRef } from 'react'

export const InputLogReg = forwardRef(({type, placeholder, aditionalClass = "", ...rest}, ref) => {
    return(
        <input 
            ref={ref}
            type={type} 
            placeholder={placeholder} 
            className={`block w-full p-3 mt-6 rounded-md border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 transition-all ${aditionalClass}`}
            {...rest}  
        />          
    )
})

export function LinkLog({children, href}){
    return(
        <a href={href} className='text-[10px] text-black no-underline ml-1 hover:text-[#015d3b] transition-colors'>
            {children} 
        </a>
    )
}

export function ButtonLink({text}){
    return(
        <button type="submit" className='block w-full py-2.5 px-5 bg-[#015d3b] border-none rounded-xl text-white font-bold cursor-pointer hover:bg-[#004d2f] transition-colors'>
            {text}
        </button>
    )
}
