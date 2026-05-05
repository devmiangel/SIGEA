import { Title } from "../../../../components/Tettles-Buttons/Title"
import AgricultureIcon from '@mui/icons-material/Agriculture';
import './AgroExtensionViews.css'

import PersonIcon from '@mui/icons-material/Person';
import MailIcon from '@mui/icons-material/Mail';


export default function FirstLogAgro(){
    return(
       <>
            
                <Title componentLogo={<AgricultureIcon sx={{fontSize: 40}}/>} titleText={'¡Bienvenido al modulo extension Agropecuaria!'} colorLogo={'#3e9a8a'}>
                    <p className="paragraph-title">
                        Para brindarte el mejor servicio y apoyo técnico, necesitamos conocer tu unidad productiva. 
                        <br /><br />
                        Por favor, solicita una visita de caracterización completando el siguiente formulario. Nuestro equipo técnico visitará tu predio para evaluar tus necesidades y ofrecerte asistencia personalizada.
                    </p>
                </Title>
           
                

            <div className="firstLogForm">
                <h2 className="title-form">Solicitud de Visita de Caracterización</h2>
                <div className="form-user">
                    <div className="form-user-section">
                        <PersonIcon/>
                        <h3 className="form-user-data-title">
                            Información del Productor
                        </h3>
                        
                        <label htmlFor="" className="form-user-input">
                            Nombre Completo
                            <input type="text" />
                        </label>
                        <label htmlFor="" className="form-user-input">
                            Correo Electronico
                            <input type="text" />
                        </label>
                    </div>
                        

                </div>
            </div>
       </> 
    )
}