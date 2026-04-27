import AnimalProtectionModuleContentUser from "../../components/Content/userContent/AnimalProtectionContentUser"
import Sidebar from "../../components/navbar/Sidebar"


export default function AnimalProtection(){
    return (
       <>
            <div className="site">
                <div className="sidebar-wrapper">
                    <Sidebar role={'usuario'}/>
                </div>

                    <div className="content-wrapper">
                    <AnimalProtectionModuleContentUser/>
                </div>
                
                    
            </div> 
        </> 
    )
}