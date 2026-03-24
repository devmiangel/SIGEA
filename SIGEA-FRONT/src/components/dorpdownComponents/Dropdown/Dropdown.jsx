import DropdownButton from "../DropdownButton/DropdownButton"
import DropdownContent from "../DropdownContent/DropdownContent"

export default function Dropdown({buttonText,content}){
    return(
        <select className="GeneralDropdown">
            <DropdownButton>
                {buttonText}
            </DropdownButton>
            <DropdownContent>
                {content}
            </DropdownContent>
        </select>
    )
}