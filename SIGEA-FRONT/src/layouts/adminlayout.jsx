import { Outlet } from "react-router-dom"
import Sidebar from "../components/SideBar/Sidebar"

export default function AdminLayout(){
    return(
        <div className="flex min-h-screen">
            <Sidebar/>
            <div className="flex-1 min-w-0 flex flex-col md:flex-row flex-wrap bg-[#f1eee3] p-0 m-0 justify-center items-start">
                <Outlet/>
            </div>
        </div>
    )
}
