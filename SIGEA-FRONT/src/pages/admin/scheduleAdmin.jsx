import Sidebar from "../../components/navbar/Sidebar";
import ScheduleContentAdmin from "../../components/Content/adminContent/ScheduleContentAdmin";
import '../pages.css'

export default function ShceduleAdmin (){
    return(
        <>
            <div className="site">
                <div className="sidebar-wrapper">
                    <Sidebar role={'admin'}/>
                </div>

                 <div className="content-wrapper">
                    <ScheduleContentAdmin/>
                </div>
                
                 
            </div> 
        </>
    )
}