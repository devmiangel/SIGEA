export function Header({componentLogo, headerText, message,  colorLogo, firstButton, secondButton}){
    return(
        <div className="w-full bg-[#aaaaaa39] rounded-xl flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-center gap-3 min-w-0 sm:gap-5">
                <div className="flex items-center justify-center shrink-0 w-12 h-12 rounded-full sm:w-13.75 sm:h-13.75" style={{backgroundColor: colorLogo}}>
                    {componentLogo}
                </div>
                <div className="min-w-0">
                    <h3 className="text-base font-semibold leading-tight sm:text-lg">{headerText}</h3>
                    <p className="mt-1.5 text-xs text-pretty sm:text-[12px]">{message}</p>
                </div>
            </div>
            {(firstButton || secondButton) && (
                <div className="flex flex-col gap-2 w-full sm:w-auto sm:max-w-44 sm:shrink-0">
                    {firstButton}
                    {secondButton}
                </div>
            )}
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

