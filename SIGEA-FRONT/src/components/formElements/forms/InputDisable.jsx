import './formsStyles.css'

export default function InputDisable({ textLabel, dataText }){    
    return(
        <>
            <label className='disable-data-form'>
                {textLabel}
                <div className="text-disable-data">
                    {dataText}
                </div>
            </label>
        </>
    )
}