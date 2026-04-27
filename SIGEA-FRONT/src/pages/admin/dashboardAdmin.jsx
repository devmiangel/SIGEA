import Sidebar from "../../components/navbar/Sidebar";
import DashboardContentAdmin from "../../components/Content/adminContent/DashboardContentAdmin"
import '../pages.css'


export default function DashboardAdmin (){
    return(
        <>
            <div className="site">
                <div className="sidebar-wrapper">
                    <Sidebar role={'admin'}/>
                </div>

                 <div className="content-wrapper">
                    <DashboardContentAdmin/>
                </div>
                
                 
            </div> 
        </> 
    )
}