import './tittle.css'

export function Header({componentLogo, headerText, message,  colorLogo, otherElements}){
    return(
        <>
            <div className="header-wrapper">
                <div className="header-data-wrapper">
                    <div className="logo-wrapper-header" style={{backgroundColor: colorLogo}}>
                        {componentLogo}
                    </div>
                    <div className="header-data">
                        <h3 className="header">{headerText}</h3>
                        <p className='header-message'>{message}</p>
                    </div>
                </div>
                <div className="buttons-wrapper">
                    {otherElements}
                </div>
            </div>
        </>
    )
}


export function Title(){
    return(
        <>
        </>
    )
}

