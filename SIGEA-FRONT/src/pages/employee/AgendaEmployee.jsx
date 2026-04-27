import Sidebar from "../../components/navbar/Sidebar"
import AgendaContentEmployee from "../../components/Content/employeeContent/AgendaContentEmployee"

export default function AgendaEmployee(){
    return (
        <>
            <div className="site">
                <div className="sidebar-wrapper">
                    <Sidebar role={'funcionario'}/>
                </div>

                    <div className="content-wrapper">
                    <AgendaContentEmployee/>
                </div>
                
                    
            </div> 
        </> 
    )
}