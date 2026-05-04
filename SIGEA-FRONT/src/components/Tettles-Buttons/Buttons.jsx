import './tittle.css'

export default function ButtonLink({buttonText, buttonRef}){
    const handleClick = (buttonRef) => {
        alert('holaaaaaa')
    }
    
    return(
        <>
            <button className='ButtonLink' onClick={handleClick}>
                {buttonText}
            </button>
        </>
    )
}