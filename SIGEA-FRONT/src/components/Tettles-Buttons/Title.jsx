export function Header({componentLogo, headerText, message,  colorLogo, firstButton, secondButton}){
    return(
        <div className="bg-[#aaaaaa39] min-w-[96%] h-auto rounded-xl flex p-5 items-center justify-between">
            <div className="flex items-center">
                <div className="flex items-center justify-center w-13.75 h-13.75 rounded-full" style={{backgroundColor: colorLogo}}>
                    {componentLogo}
                </div>
                <div className="m-5">
                    <h3>{headerText}</h3>
                    <p className='my-2.5 text-[12px]'>{message}</p>
                </div>
            </div>
            <div className="flex flex-col gap-1 max-w-25">
                {firstButton}
                {secondButton}
            </div>
        </div>
    )
}


export function Title({componentLogo, children, titleText, colorLogo}){
    return(
        <div className="flex items-center justify-center bg-[#005C39] m-5 max-w-[90%] rounded-xl">
            <div className="flex items-center justify-center w-13.75 h-13.75 rounded-full" style={{backgroundColor: colorLogo}}>
                {componentLogo}
            </div>
            <div className="flex flex-col justify-center mx-5 my-2.5 text-[#ffffffee] max-w-[75%]">
                <h2>{titleText}</h2>
                <div className="m-1">
                    {children} 
                </div>
            </div>
        </div>
    )
}

