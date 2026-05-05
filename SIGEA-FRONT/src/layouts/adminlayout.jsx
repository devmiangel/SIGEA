import { Outlet } from "react-router-dom"
import Sidebar from "../components/SideBar/Sidebar"
import './layout.css'

export default function AdminLayout(){
    return(
        <>
            <Sidebar role={'admin'}/>
            <div className="main-content">
                <Outlet/>
            </div>
            
        </>
    )
 
}