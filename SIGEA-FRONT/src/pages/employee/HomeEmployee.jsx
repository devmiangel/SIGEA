import HomeContentEmployee from "../../components/Content/employeeContent/HomeContentEmployee"
import Sidebar from "../../components/navbar/Sidebar"

export default function HomeEmployee(){
    return (
        <>
            <div className="site">
                <div className="sidebar-wrapper">
                    <Sidebar role={'funcionario'}/>
                </div>

                    <div className="content-wrapper">
                    <HomeContentEmployee/>
                </div>
                
                    
            </div> 
        </> 
    )
}