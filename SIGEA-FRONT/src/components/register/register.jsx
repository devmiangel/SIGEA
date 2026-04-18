import '../../styles/login.css'
import logo_sigea from '../../assets/img/logo_sigea.png'
import titulo from '../../assets/img/letras_sigea.png'
import {InputLogReg, LinkLog, ButtonLink} from '../form-input.jsx'
import Selection from '../selecComponent/Selectstyling.jsx'
import { useForm, Controller } from 'react-hook-form'
import OtherCalendar from '../calendar/OtherCalendar.jsx'
 
        

export default function Register() {
    
    const {
        register, 
        handleSubmit, 
        formState: {errors}, 
        reset, 
        watch,
        control
    } = useForm({mode: 'onChange'})

    const onSubmit = async(data) => {
        const formattedData = {
                ...data,
                TipoDocumento: Array.isArray(data.TipoDocumento)
                    ? data.TipoDocumento[0]?.value
                    : data.TipoDocumento?.value,
                fecha_nacimiento: Array.isArray(data.fecha_nacimiento)
                    ? data.fecha_nacimiento[0].format('YYYY-MM-DD') 
                    : data.fecha_nacimiento?.format('YYYY-MM-DD'),
                TipoDocumento: data.TipoDocumento?.value
            }
            
            // console.log(data)
            // console.log(formattedData)

        const response = await fetch('http://127.0.0.1:8000/api/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData)
            })

        try {
            const result = await response.text()
            console.log(result);
            
            if (!response.ok) {
                console.error('Error:', result);
                return
            }
            console.log('Usuario Resgistrado',result);
            reset()
        } catch (error) {
            console.error('Error en la petición:', error);
        }

        reset();
    }

    return (
        <div className="login-wrapper">
            <div className="logo">
                <img src={logo_sigea} alt="" />
                <img src={titulo} alt="" />
            </div>

            <div className="login-form">
                <h2 className='form-tittle'>Regístrate</h2>
                <form onSubmit={handleSubmit(onSubmit, (errors) =>{
                    console.log('ERRORES:', errors);
                    
                })}>
                    
                    <div className="section-log names">
                        <div className="name-parent">
                            <InputLogReg 
                                {...register('primer_nombre', {
                                    required: 'Campo Obligatorio',
                                    pattern: {
                                        value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/,
                                        message: 'no son permitidos caracteres especiales'
                                    },
                                    minLength: {
                                        value: 2,
                                        message: 'ingresa tu primer nombre completo'
                                    }, 
                                    maxLength: {
                                        value: 20,
                                        message: 'No creo que te llames asi xd'
                                    }
                                })}
                                type={'text'} 
                                placeholder={'Primer Nombre'} 
                                aditionalClass = {'fst-name'}
        
                            />
                            {errors.primer_nombre && (
                                <p className='message-errors'>{errors.primer_nombre.message}</p>
                            )}                                
                        </div>

                        <div className="scnd-name name-parent">
                            <InputLogReg 
                                {...register('segundo_nombre', {
                                    pattern: {
                                        value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/,
                                        message: 'no son permitidos caracteres especiales'
                                    },
                                    minLength: {
                                        value: 3,
                                        message: 'ingresa tu primer segundo completo'
                                    }, 
                                    maxLength: {
                                        value: 20,
                                        message: 'No creo que te llames asi xd'
                                    }
                                })}
                                type={'text'} 
                                placeholder={'Segundo Nombre'} 
                            />
                            {errors.segundo_nombre && (
                                <p className='message-errors'>{errors.segundo_nombre.message}</p>
                            )}
                        </div>

                        <div className="fst-lsname name-parent">
                            <InputLogReg 
                                {...register('primer_apellido', {
                                    required: 'Campo Obligatorio',
                                    pattern: {
                                        value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/,
                                        message: 'no son permitidos caracteres especiales'
                                    },
                                    minLength: {
                                        value: 3,
                                        message: 'ingresa tu primer apellido completo'
                                    }, 
                                    maxLength: {
                                        value: 20,
                                        message: 'No creo que te llames asi xd'
                                    }
                                })}
                                type={'text'} 
                                placeholder={'Primer Apellido'} 
                                
                            />
                            {errors.primer_apellido && (
                                <p className='message-errors'>{errors.primer_apellido.message}</p>
                            )}
                        </div>
                        <div className="scnd-lsname name-parent">
                            <InputLogReg 
                                {...register('segundo_apellido', {
                                    pattern: {
                                        value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/,
                                        message: 'no son permitidos caracteres especiales'
                                    },
                                    minLength: {
                                        value: 3,
                                        message: 'ingresa tu primer apellido completo'
                                    }, 
                                    maxLength: {
                                        value: 20,
                                        message: 'No creo que te llames asi xd'
                                    }
                                })}
                                type={'text'} 
                                placeholder={'Segundo Apellido'}
                            />
                            {errors.segundo_apellido && (
                                <p className='message-errors'>{errors.segundo_apellido.message}</p>
                            )}
                        </div>
                    </div>
                    <section className="section-log name-parent">
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
                            placeholder={'Correo'} 
                            
                        />
                        {errors.email && (
                            <p className='message-errors-form'>{errors.email.message}</p>
                        )}
                    </section>
                    {/* <section className="section-log name-parent">
                        <InputLogReg    
                            {...register('telefono', {
                                required: 'Campo Obligatorio',
                                pattern: {
                                    value: /^\+?[0-9\s\-]{7,20}$/,
                                    message: 'Numero de telefono invalido'
                                },
                                minLength: {
                                    value: 7,
                                    message: 'minimo 7 caracteres'
                                }, 
                                maxLength: {
                                    value: 15,
                                    message: 'maximo 15 caracteres'
                                }
                            })}
                            type={'tel'} 
                            placeholder={'Numero de contacto'}
                        />
                        {errors.telefono && (
                            <p className='message-errors-form'>{errors.telefono.message}</p>
                        )}
                    </section> */}
                    
                    <section className="section-log document-type">
                        <Controller
                            name='TipoDocumento'
                            control={control}
                            rules={{ required: 'Campo obligatorio' }}
                            render={({field}) =>(
                                <Selection
                                    value={field.value} 
                                    url={'http://127.0.0.1:8000/api/usuarios/tiposDocumentos/'} 
                                    placeholder={'Tipos de Documento'} 
                                    labelKey = {'TipoDocumento'} 
                                    onChange={field.onChange}
                                />
                            )}
                        />
                        
                    </section>

                    <section className="section-log name-parent">
                        <InputLogReg    
                            {...register('numero_documento', {
                                required: 'Campo Obligatorio',
                                pattern: {
                                    value: /^\+?[0-9\-]{7,20}$/,
                                    message: 'Documento invalido'
                                },
                                minLength: {
                                    value: 7,
                                    message: 'minimo 7 caracteres'
                                }, 
                                maxLength: {
                                    value: 10,
                                    message: 'maximo 10 caracteres'
                                }
                            })}
                            type={'number'} 
                            placeholder={'Documento'}
                        />
                        {errors.numero_documento && (
                            <p className='message-errors-form'>{errors.numero_documento.message}</p>
                        )}
                    </section>

                    <section  className="section-log name-parent">
                        <Controller
                            name='fecha_nacimiento'
                            control={control}
                            defaultValue={null}
                            render={({field}) => (
                                <OtherCalendar 
                                    value={field.value}
                                    onChange={(newValue) => {
                                        // console.log('Fecha seleccionada:', newValue); 
                                        field.onChange(newValue);
                                    }}
                                    placeholder={'Fecha Nacimiento'}
                                />
                            )}
                        />
                        
                        
                    </section>
                    
                    <section className="section-log name-parent">
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
                              
                        />
                        {errors.password && (
                            <p className='message-errors-form'>{errors.password.message}</p>
                        )}
                    </section>

                    <section className="section-log name-parent">
                        <InputLogReg 
                            {...register('passwconf', {
                                required: 'Campo Obligatorio entre 6 y 20 caracteres',
                                minLength: {
                                    value: 6,
                                    message: 'minimo 6 caracteres'
                                }, 
                                maxLength: {
                                    value: 20,
                                    message: 'maximo 20 caracteres'
                                },
                                validate: (val) =>{
                                    if(watch('password')!= val){
                                        return 'Las contraseñas no coinciden'
                                    }
                                }
                                
                            })}
                            type={'password'} 
                            placeholder={'Confirmar contraseña'}      
                        />
                        {errors.passwconf && (
                            <p className='message-errors-form'>{errors.passwconf.message}</p>
                        )}
                    </section>
                    
                    <div>
                        <ButtonLink text={'Iniciar sesion'}/> 
                    </div>
                    
                    <LinkLog href={'https://google.com'}>
                        ¿Necesitas ayuda? visita nuestro<strong>centro de ayuda</strong>
                    </LinkLog>
                </form>
            </div>
        </div>
    )
}