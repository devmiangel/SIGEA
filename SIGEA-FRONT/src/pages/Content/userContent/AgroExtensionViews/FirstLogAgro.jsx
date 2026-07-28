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
                <p className="text-sm m-2 text-pretty">
                    Para brindarte el mejor servicio y apoyo técnico, necesitamos conocer tu unidad productiva. 
                    <br /><br />
                    Por favor, solicita una visita de caracterización completando el siguiente formulario. Nuestro equipo técnico visitará tu predio para evaluar tus necesidades y ofrecerte asistencia personalizada.
                </p>
            </Title>

            <div className="bg-white min-h-[80vh] w-[90%] rounded-xl p-5 mb-5">
                <h2 className="flex justify-center p-3">Solicitud de Visita de Caracterización</h2>
                <div className="m-3">
                    <section className="form-section form-user-section">
                        <div className="flex text-[#00000099] m-3">
                            <PersonIcon/>
                            <h3>
                                Información del Productor
                            </h3>
                        </div>
                        <div className="flex justify-between px-[15px] gap-[13px]">
                            <InputDisable textLabel={'Nombre'} dataText={'nombre completo de persona'}/>
                            <InputDisable textLabel={'Correo Electronico'} dataText={'email@completode.com'}/>
                        </div>
                    </section>
                    <section className="form-section form-description-visit-req">
                        <div className="flex text-[#00000099] m-3">
                            <QuestionAnswerIcon/>
                            <h3>
                                Solicitud 
                            </h3>
                        </div>
                        <form className="m-3 w-[96%] h-auto" onSubmit={console.log('enviado una vez')}>
                            <textarea 
                                name="Solicitud_Primera_visita" 
                                className="w-full p-3 h-auto overflow-y-hidden resize-none border-[1.5px] border-[#3e9a8a] rounded-[10px]"
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