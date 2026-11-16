export default function ButtonLink({buttonText, onClick}){
    return(
        <button className='w-full bg-[#229e14] py-2.5 px-5 border-none text-white rounded-[5px] text-xs cursor-pointer hover:bg-[#1d8a11] transition-colors sm:py-2 sm:text-[10px]' onClick={onClick}>
            {buttonText}
        </button>
    )
}