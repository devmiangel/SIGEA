import { forwardRef } from 'react'

export const Input = forwardRef(({ type, placeholder, additionalClass = "", ...rest }, ref) => {
    return (
        <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            className={`block w-full p-3 text-sm rounded-md border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 transition-all placeholder:text-[#9ca3af] ${additionalClass}`}
            {...rest}
        />
    )
})