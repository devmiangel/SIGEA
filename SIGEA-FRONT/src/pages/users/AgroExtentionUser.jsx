
import AgroModuleContentUser from "../../components/Content/userContent/AgroExtentionContentUser"
import Sidebar from "../../components/navbar/Sidebar"

export default function AgroExtension(){
    return (
            <>
                <div className="site">
                    <div className="sidebar-wrapper">
                        <Sidebar role={'usuario'}/>
                    </div>
    
                        <div className="content-wrapper">
                        <AgroModuleContentUser/>
                    </div>
                    
                        
                </div> 
            </> 
    )
}