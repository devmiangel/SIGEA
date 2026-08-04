import { Outlet } from "react-router-dom"
import Sidebar from "../components/SideBar/Sidebar"

export default function AdminLayout(){
    return(
        <div className="flex min-h-screen">
            <Sidebar/>
            <div className="flex-1 min-w-0 flex flex-wrap bg-[#f1eee3] p-2 m-0 justify-center items-start overflow-x-hidden sm:p-5">
                <Outlet/>
            </div>
        </div>
    )
}
