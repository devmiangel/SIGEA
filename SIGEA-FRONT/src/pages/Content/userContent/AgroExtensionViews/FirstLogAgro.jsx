import { useState } from "react"
import { Title } from "../../../../components/Tettles-Buttons/Title"
import InputDisable from "../../../../components/formElements/forms/InputDisable";
import { ButtonLink } from "../../../../components/formElements/form-input";
import { crearSolicitud } from "../../../../services/agroService"

import AgricultureIcon from '@mui/icons-material/Agriculture';
import PersonIcon from '@mui/icons-material/Person';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

import { useCurrentDataUser } from "../../../../hooks/currentUserHook";

export default function FirstLogAgro({ onSolicitudCreada }){
    const {user} = useCurrentDataUser()
    const [observacion, setObservacion] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [error, setError] = useState('')

    const nombreCompleto = user?.persona_info
        ? `${user.persona_info.primer_nombre || ''} ${user.persona_info.primer_apellido || ''}`.trim()
        : user?.email || 'Nombre no disponible'

    const correo = user?.email || 'Correo no disponible'

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!observacion.trim() || enviando) return
        setEnviando(true)
        setError('')
        try {
            await crearSolicitud(observacion.trim())
            onSolicitudCreada()
        } catch {
            setError('Error al enviar la solicitud. Intenta de nuevo.')
        } finally {
            setEnviando(false)
        }
    }
    
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
                            <InputDisable textLabel={'Nombre'} dataText={nombreCompleto}/>
                            <InputDisable textLabel={'Correo Electronico'} dataText={correo}/>
                        </div>
                    </section>
                    <section className="form-section form-description-visit-req">
                        <div className="flex text-[#00000099] m-3">
                            <QuestionAnswerIcon/>
                            <h3>
                                Solicitud 
                            </h3>
                        </div>
                        <form className="m-3 w-[96%] h-auto" onSubmit={handleSubmit}>
                            <textarea 
                                name="Solicitud_Primera_visita" 
                                className="w-full p-3 h-auto overflow-y-hidden resize-none border-[1.5px] border-[#3e9a8a] rounded-[10px]"
                                placeholder="Cuentanos la direccion en la que se encuentra ubicada tu unidad productiva, añade referencias y toda la informacion que creas necesaria para que podamos encontrarte."
                                rows={5}
                                value={observacion}
                                onChange={(e) => setObservacion(e.target.value)}
                            />
                            {error && (
                                <p className="text-red-600 text-sm mt-2">{error}</p>
                            )}
                            <div className={enviando ? 'opacity-50 pointer-events-none' : ''}>
                                <ButtonLink text={enviando ? 'Enviando...' : 'Enviar'}/>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
       </> 
    )
}