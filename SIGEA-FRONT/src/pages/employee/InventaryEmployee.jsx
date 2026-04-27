import Sidebar from "../../components/navbar/Sidebar"
import InventaryContentEmployee from "../../components/Content/employeeContent/InventaryContentEmployee"

export default function InventaryEmployee(){
    return (
        <>
            <div className="site">
                <div className="sidebar-wrapper">
                    <Sidebar role={'funcionario'}/>
                </div>

                    <div className="content-wrapper">
                    <InventaryContentEmployee/>
                </div>
                
                    
            </div> 
        </>
    )
}