import logo_sigea from '../../../assets/img/logo_sigea.png'
import titulo from '../../../assets/img/letras_sigea.png'
import {InputLogReg, LinkLog, ButtonLink} from '../../../components/formElements/form-input'

import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { loginService } from '../../../services/authService'
import { useState } from 'react'
import { getRouteByRole } from '../../../utils/roleRedirect'
import { useCurrentDataUser } from '../../../hooks/currentUserHook'

export default function Login() {
    const navigate = useNavigate()
    const [errorMsg, setErrorMsg] = useState("")

    const { login } = useCurrentDataUser()


    const {
        register, 
        handleSubmit, 
        formState: {errors}, 
        reset
    } = useForm({mode: 'onChange'})

    const onSubmit = async(data) => {

        try{
            
            const result = await loginService(data)

            console.log("usuario logeado")

            login(result.user, result.token)

            reset()

            navigate(getRouteByRole(result.user.rol))
        }
        catch (error){
            setErrorMsg(error.response?.data?.detail || error.message || 'Error al iniciar sesión')
            console.error('error en la peticion', error);
        }
    }

    
    return (
        <div className="flex flex-col lg:flex-row justify-center items-center min-h-screen w-full p-0 lg:gap-24 gap-8 bg-[#fdfcf8]">
            <div className="flex flex-col max-w-62.5">
                <img src={logo_sigea} alt="" />
                <img src={titulo} alt="" />
            </div>

            <div className="my-6 flex flex-col min-w-[30%]">
                <h2 className='mx-auto text-[#015d3b] text-2xl font-bold'>Iniciar Sesión</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <section className='mb-6 relative'>
                        <InputLogReg 
                            {...register('email', {
                                required: 'Campo Obligatorio',
                                pattern: {
                                    value: /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/,
                                    message: 'Correo invalido'
                                },
                                minLength: {
                                    value: 10,
                                    message: 'minimo 10 caracteres'
                                }, 
                                maxLength: {
                                    value: 40,
                                    message: 'maximo 40 caracteres'
                                }
                            })}
                        placeholder={'Correo'} />
                        
                        {errors.email && (
                            <p className='text-[#a22] text-[10px] absolute -bottom-4 left-1'>{errors.email.message}</p>
                        )}
                        <LinkLog href={'https://google.com'}>
                            Olvidaste tu correo
                        </LinkLog> 
                    </section>

                    < section className='mb-6 relative'>
                        <InputLogReg 
                            {...register('password', {
                                required: 'Campo Obligatorio entre 6 y 20 caracteres',
                                minLength: {
                                    value: 6,
                                    message: 'minimo 6 caracteres'
                                }, 
                                maxLength: {
                                    value: 20,
                                    message: 'maximo 20 caracteres'
                                }
                            })}
                            type={'password'} 
                            placeholder={'contraseña'} 
                            autoComplete = 'password'
                        />
                        {errors.password && (
                            <p className='text-[#a22] text-[10px] absolute -bottom-4 left-1'>{errors.password.message}</p>
                        )}
                        <LinkLog href={'https://google.com'}>
                            Olvidaste tu contraseña
                        </LinkLog>
                    </section>   
                    
                    <ButtonLink text={'Iniciar sesion'}/>
                    
                    <LinkLog href={'/registro'}>
                        no tienes cuenta? <strong>Registrate</strong>
                    </LinkLog>

                    {errorMsg && (
                        <div className='flex justify-center items-center w-full mt-4'>
                            <div className="text-red-600 text-sm text-center">{errorMsg}</div>
                        </div>
                    )}
                
                </form>
            </div>
        </div>
    )
}
