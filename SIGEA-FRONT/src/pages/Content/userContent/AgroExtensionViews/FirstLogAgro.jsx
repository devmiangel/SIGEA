import './AgroExtensionViews.css'

import { Title } from "../../../../components/Tettles-Buttons/Title"
import InputDisable from "../../../../components/formElements/forms/InputDisable";
import { ButtonLink } from "../../../../components/formElements/form-input";

import AgricultureIcon from '@mui/icons-material/Agriculture';
import PersonIcon from '@mui/icons-material/Person';
import MailIcon from '@mui/icons-material/Mail';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

import { useCurrentDataUser } from "../../../../hooks/currentUserHook";


export default function FirstLogAgro(){
    const {user} = useCurrentDataUser()

    console.log(user);
    
    return(
       <>
            
            <Title 
                componentLogo={<AgricultureIcon sx={{fontSize: 40}}/>} 
                titleText={'¡Bienvenido al modulo extension Agropecuaria!'} 
                colorLogo={'#3e9a8a'}
            >
                <p className="paragraph-title">
                    Para brindarte el mejor servicio y apoyo técnico, necesitamos conocer tu unidad productiva. 
                    <br /><br />
                    Por favor, solicita una visita de caracterización completando el siguiente formulario. Nuestro equipo técnico visitará tu predio para evaluar tus necesidades y ofrecerte asistencia personalizada.
                </p>
            </Title>
           
                

            <div className="firstLogForm">
                <h2 className="title-firstLog">Solicitud de Visita de Caracterización</h2>
                <div className="form-user">
                    <section className="form-section form-user-section">
                        <div className="form-section-header">
                            <PersonIcon/>
                            <h3 className="form-user-data-title">
                                Información del Productor
                            </h3>
                        </div>
                        <div className="form-user-data">
                            <InputDisable textLabel={'Nombre'} dataText={'nombre completo de persona'}/>
                            <InputDisable textLabel={'Correo Electronico'} dataText={'email@completode.com'}/>
                        </div>
                    </section>
                    <section className="form-section form-description-visit-req">
                        <div className="form-section-header">
                            <QuestionAnswerIcon/>
                            <h3 className="form-user-data-title">
                                Solicitud 
                            </h3>
                        </div>
                        <form  className="visit-req-form" onSubmit={console.log('enviado una vez')}>
                            <textarea 
                                name="Solicitud_Primera_visita" 
                                className="req-description" 
                                placeholder="Cuentanos la direccion en la que se encuentra ubicada tu unidad productiva, añade referencias y toda la informacion que creas necesaria para que podamos encontrarte."
                                rows={5}
                            ></textarea>     
                            <ButtonLink text={'enviar'}/>
                        </form>
                    </section>
                    
                        

                </div>
            </div>
       </> 
    )
}