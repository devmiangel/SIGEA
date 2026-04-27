import '../../styles/login.css'
import logo_sigea from '../../assets/img/logo_sigea.png'
import titulo from '../../assets/img/letras_sigea.png'
import {InputLogReg, LinkLog, ButtonLink} from '../form-input'
import { useForm } from 'react-hook-form'
import './login.css'


export default function Login() {

    const {
        register, 
        handleSubmit, 
        formState: {errors}, 
        reset
    } = useForm({mode: 'onChange'})

    const onSubmit = async(data) => {
        
        try{
            const response = await fetch('http://127.0.0.1:8000/api/usuarios/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            const result = await response.json()
            console.log(result);
            
            if (!response.ok){
                document.querySelector('.error').textContent = 'Credenciales Invalidas'
                return
            }
            
            console.log('usuario logeado',result);
            
        }
        catch (error){
            console.error('error en la peticion', error);
        }
    }

    

    return (
        <div className="login-wrapper">
            <div className="logo">
                <img src={logo_sigea} alt="" />
                <img src={titulo} alt="" />
            </div>

            <div className="login-form">
                <h2 className='form-tittle'>Iniciar Sesión</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <section className='section-log section-email name-parent'>
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
                            <p className='message-errors-login'>{errors.email.message}</p>
                        )}
                        <LinkLog href={'https://google.com'}>
                            Olvidaste tu correo
                        </LinkLog> 
                    </section>

                    < section className='section-log section-password'>
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
                            autoComplete = 'pass'
                        />
                        {errors.passw && (
                            <p className='message-errors-login'>{errors.passw.message}</p>
                        )}
                        <LinkLog href={'https://google.com'}>
                            Olvidaste tu contraseña
                        </LinkLog>
                    </section>   
                    
                    <ButtonLink text={'Iniciar sesion'}/>
                    
                    <LinkLog href={'./register'}>
                        no tienes cuenta? <strong>Registrate</strong>
                    </LinkLog>
                    <section className='error-wrapper'>
                        <div className="error"></div>
                    </section>
                
                </form>
            </div>
        </div>
    )
}