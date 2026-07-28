import logo_sigea from '../../../assets/img/logo_sigea.png'
import titulo from '../../../assets/img/letras_sigea.png'
import {InputLogReg, LinkLog, ButtonLink} from '../../../components/formElements/form-input'
import Selection from '../../../components/selecComponent/Selectstyling'
import { useForm, Controller } from 'react-hook-form'
import OtherCalendar from '../../../components/calendar/OtherCalendar'
 

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
        <div className="flex flex-col lg:flex-row justify-center items-center min-h-screen w-full p-0 lg:gap-24 gap-8 bg-[#fdfcf8]">
            <div className="flex flex-col max-w-62.5">
                <img src={logo_sigea} alt="" />
                <img src={titulo} alt="" />
            </div>

            <div className="my-6 flex flex-col min-w-[30%] max-h-[90vh] overflow-y-auto">
                <h2 className='mx-auto text-[#015d3b] text-2xl font-bold'>Regístrate</h2>
                <form onSubmit={handleSubmit(onSubmit, (errors) =>{
                    console.log('ERRORES:', errors);
                    
                })}>
                    
                    <div className="box-border grid grid-cols-[49%_49%] gap-x-1.25">
                        <div className="relative mb-4">
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
                                <p className='text-[#a22] text-[10px] absolute -bottom-3 left-1'>{errors.primer_nombre.message}</p>
                            )}                                
                        </div>

                        <div className="relative mb-4">
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
                                <p className='text-[#a22] text-[10px] absolute -bottom-3 left-1'>{errors.segundo_nombre.message}</p>
                            )}
                        </div>

                        <div className="relative mb-4">
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
                                <p className='text-[#a22] text-[10px] absolute -bottom-3 left-1'>{errors.primer_apellido.message}</p>
                            )}
                        </div>
                        <div className="relative mb-4">
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
                                <p className='text-[#a22] text-[10px] absolute -bottom-3 left-1'>{errors.segundo_apellido.message}</p>
                            )}
                        </div>
                    </div>

                    <section className="mb-6 relative">
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
                            <p className='text-[#a22] text-[10px] absolute -bottom-4 left-1'>{errors.email.message}</p>
                        )}
                    </section>

                    <section className="mb-6">
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

                    <section className="mb-6 relative">
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
                            <p className='text-[#a22] text-[10px] absolute -bottom-4 left-1'>{errors.numero_documento.message}</p>
                        )}
                    </section>

                    <section className="mb-6">
                        <Controller
                            name='fecha_nacimiento'
                            control={control}
                            defaultValue={null}
                            render={({field}) => (
                                <OtherCalendar 
                                    value={field.value}
                                    onChange={(newValue) => {
                                        field.onChange(newValue);
                                    }}
                                    placeholder={'Fecha Nacimiento'}
                                />
                            )}
                        />
                        
                        
                    </section>
                    
                    <section className="mb-6 relative">
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
                            <p className='text-[#a22] text-[10px] absolute -bottom-4 left-1'>{errors.password.message}</p>
                        )}
                    </section>

                    <section className="mb-6 relative">
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
                            <p className='text-[#a22] text-[10px] absolute -bottom-4 left-1'>{errors.passwconf.message}</p>
                        )}
                    </section>
                    
                    <div>
                        <ButtonLink text={'Registrarse'}/> 
                    </div>
                    
                    <LinkLog href={'https://chatgpt.com/'}>
                        ¿Necesitas ayuda? visita nuestro <strong>centro de ayuda</strong>
                    </LinkLog>
                </form>
            </div>
        </div>
    )
}
