import Sidebar from "../../components/navbar/Sidebar";
import '../pages.css'
import UsersContentAdmin from "../../components/Content/adminContent/UsersContentAdmin";

export default function UsersAdmin (){
    return(
        <>
            <div className="site">
                <div className="sidebar-wrapper">
                    <Sidebar role={'admin'}/>
                </div>

                 <div className="content-wrapper">
                    <UsersContentAdmin/>
                </div>
                
                 
            </div> 
        </>
    )
}