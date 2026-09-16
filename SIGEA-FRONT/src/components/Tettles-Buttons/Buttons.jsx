export default function ButtonLink({buttonText, onClick}){
    return(
        <button className='bg-[#229e14] py-2 px-5 border-none text-white rounded-[5px] text-[10px] cursor-pointer hover:bg-[#1d8a11] transition-colors' onClick={onClick}>
            {buttonText}
        </button>
    )
}