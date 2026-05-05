import { Outlet } from "react-router-dom"
import Sidebar from "../components/SideBar/Sidebar"
import './layout.css'

export default function EmployeeLayout(){
    return(
        <>
            <Sidebar role={'funcionario'}/>
            <div className="main-content">
                <Outlet/>
            </div>
        </>
    )
}