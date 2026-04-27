import Sidebar from "../../components/navbar/Sidebar";
import '../pages.css'
import InventaryContentAdmin from "../../components/Content/adminContent/inventaryContentAdmin";


export default function InventaryAdmin (){
    return(
        <>
            <div className="site">
                <div className="sidebar-wrapper">
                    <Sidebar role={'admin'}/>
                </div>

                 <div className="content-wrapper">
                    <InventaryContentAdmin/>
                </div>
                
                 
            </div> 
        </>
    )
}