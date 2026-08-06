import { useState } from "react"
import { Title } from "../../../../components/Tettles-Buttons/Title"
import InputDisable from "../../../../components/formElements/forms/InputDisable"
import { SubmitButton } from "../../../../components/formElements/SubmitButton"
import AgricultureIcon from '@mui/icons-material/Agriculture'
import PersonIcon from '@mui/icons-material/Person'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'
import { useCurrentDataUser } from "../../../../hooks/currentUserHook"
import { useSolicitudes } from "../../../../hooks/useSolicitudes"
import { getNombreCompleto, getCorreo } from "../../../../utils/userDisplay"

export default function FirstLogAgro({ onSolicitudCreada }){
    const { user } = useCurrentDataUser()
    const { crear, creando } = useSolicitudes(user)
    const [observacion, setObservacion] = useState('')
    const [error, setError] = useState('')

    const nombreCompleto = getNombreCompleto(user)
    const correo = getCorreo(user)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!observacion.trim() || creando) return
        setError('')
        const result = await crear({ observacion: observacion.trim() })
        if (result.ok) {
            onSolicitudCreada()
        } else {
            setError('Error al enviar la solicitud. Intenta de nuevo.')
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

            <div className="bg-white w-[90%] rounded-xl p-5 mb-5">
                <h2 className="flex justify-center p-3">Solicitud de Visita de Caracterización</h2>
                <div className="m-3">
                    <section className="form-section form-user-section">
                        <div className="flex text-[#00000099] m-3">
                            <PersonIcon/>
                            <h3>Información del Productor</h3>
                        </div>
                        <div className="flex justify-between px-3.75 gap-3.25">
                            <InputDisable textLabel={'Nombre'} dataText={nombreCompleto}/>
                            <InputDisable textLabel={'Correo Electronico'} dataText={correo}/>
                        </div>
                    </section>
                    <section className="form-section form-description-visit-req">
                        <div className="flex text-[#00000099] m-3">
                            <QuestionAnswerIcon/>
                            <h3>Solicitud</h3>
                        </div>
                        <form className="m-3 w-[96%] h-auto" onSubmit={handleSubmit}>
                            <label htmlFor="Solicitud_Primera_visita" className="sr-only">Descripción de la solicitud</label>
                            <textarea
                                id="Solicitud_Primera_visita"
                                name="Solicitud_Primera_visita"
                                className="w-full p-3 h-auto overflow-y-hidden resize-none border-[1.5px] border-[#3e9a8a] rounded-[10px]"
                                placeholder="Cuentanos la direccion en la que se encuentra ubicada tu unidad productiva, añade referencias y toda la informacion que creas necesaria para que podamos encontrarte."
                                rows={5}
                                maxLength={255}
                                value={observacion}
                                onChange={(e) => setObservacion(e.target.value)}
                            />
                            {error && (
                                <p className="text-red-600 text-sm mt-2">{error}</p>
                            )}
                            <SubmitButton text={creando ? 'Enviando...' : 'Enviar'} disabled={creando} />
                        </form>
                    </section>
                </div>
            </div>
       </>
    )
}
