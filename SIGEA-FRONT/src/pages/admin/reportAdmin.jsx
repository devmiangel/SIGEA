import Sidebar from "../../components/navbar/Sidebar";
import ReportContentAdmin from "../../components/Content/adminContent/ReportContentAdmin";
import '../pages.css'

export default function ReportAdmin (){
    return(
        <>
            <div className="site">
                <div className="sidebar-wrapper">
                    <Sidebar role={'admin'}/>
                </div>

                 <div className="content-wrapper">
                    <ReportContentAdmin/>
                </div>  
            </div> 
        </>
    )
}