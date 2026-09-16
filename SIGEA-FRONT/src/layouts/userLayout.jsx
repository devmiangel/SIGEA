import { Outlet } from "react-router-dom"
import Sidebar from "../components/SideBar/Sidebar"

export default function UserLayout(){
    return(
        <div className="flex min-h-screen">
            <Sidebar/>
            <div className="flex-1 min-w-0 flex flex-col bg-[#f1eee3] p-2 m-0 justify-start items-center overflow-x-hidden sm:p-5">
                <Outlet/>
            </div>
        </div>
    )
}
