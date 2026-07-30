export default function InputDisable({ textLabel, dataText }){    
    return(
        <label className="flex flex-col flex-1 bg-[#c4b5b5] p-4 pr-6 rounded-[7px] font-bold">
            {textLabel}
            <div className="text-[rgba(0,0,0,0.512)] bg-[#ffffff61] px-2.25 py-3 mt-1.75 rounded-[15px]">
                {dataText}
            </div>
        </label>
    )
}