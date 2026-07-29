import { Outlet } from "react-router-dom"
import Sidebar from "../components/SideBar/Sidebar"

export default function UserLayout(){
    return(
        <div className="flex min-h-screen">
            <Sidebar/>
            <div className="flex-1 min-w-0 flex flex-col md:flex-row flex-wrap bg-[#f1eee3] p-6 m-0 justify-start items-start md:justify-center overflow-x-hidden">
                <Outlet/>
            </div>
        </div>
    )
}
