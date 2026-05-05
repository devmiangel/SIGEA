import { Outlet } from "react-router-dom"
import Sidebar from "../components/SideBar/Sidebar"
import './layout.css'

export default function UserLayout(){
    return(
        <>
            <Sidebar role={'usuario'}/>
            <div className="main-content">
                <Outlet/>
            </div>
        </>
    )
}