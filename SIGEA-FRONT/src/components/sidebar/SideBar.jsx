import './Sidebar.css'
import logo_sigea from '../../assets/img/logo_sigea.png'
import letras_sigea from '../../assets/img/letras_sigea.png'
import { SidebarData } from './SidebarData'
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function Sidebar ({role}){
    
    const navigate = useNavigate()
    
    return(
        <div className="Sidebar">
            <div className="elements">
                <section className='logo-wrapper'>
                    <img src={logo_sigea} alt="Logo SIGEA"  className='logo_sigea'/>
                    <p className="logo_letters">SIGEA</p>
                </section>
                <ul className='Sidebar-sections'>
                    {SidebarData
                        .filter(item => item.roles.includes(role))
                        .map((val, key)=>{
                        return(
                            <li 
                                className='Sidebar-item'
                                key={key} 
                                onClick={() => navigate(val.link)}
                            >
                                <div>{val.icon}</div>
                                <div>{val.title}</div>
                            </li>
                        )
                    })}    
                </ul>
            </div>
            <a href="" className="Sidebar-UserLink">
                <AccountCircleIcon/> Perfil
            </a>
            

        </div>
    )
}