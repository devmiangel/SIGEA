import { Outlet } from "react-router-dom"
import Sidebar from "../components/SideBar/Sidebar"

export default function EmployeeLayout(){
    return(
        <div className="flex min-h-screen">
            <Sidebar role={'funcionario'}/>
            <div className="flex-1 w-screen flex flex-col lg:flex-row flex-wrap bg-[#f1eee3]  lg:justify-center justify-start items-start p-4">
                <Outlet/>
            </div>
        </div>
    )
}