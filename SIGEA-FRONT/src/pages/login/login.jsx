import '../../styles/login.css'
import logo_sigea from '../../assets/img/logo_sigea.png'
import titulo from '../../assets/img/letras_sigea.png'
import {InputLogReg, LinkLog, ButtonLink} from '../../components/form-input'


export default function Login() {
    return (
        <div className="login-wrapper">
            <div className="logo">
                <img src={logo_sigea} alt="" />
                <img src={titulo} alt="" />
            </div>

            <div className="login-form">
                <h2 className='form-tittle'>Iniciar Sesión</h2>
                <form>
                    <section className='section-log section-email'>
                        <InputLogReg type={'text'} placeholder={'Correo'}/>
                        
                        <LinkLog href={'https://google.com'}>
                            Olvidaste tu correo
                        </LinkLog>
                    </section>
                    < section className='section-log section-password'>
                        <InputLogReg type={'password'} placeholder={'contraseña'}/>
                        <LinkLog href={'https://google.com'}>
                            Olvidaste tu contraseña
                        </LinkLog>
                    </section>   
                    
                    <ButtonLink text={'Iniciar sesion'}/>
                    
                    <LinkLog href={'https://google.com'}>
                        no tienes cuenta? <strong>Registrate</strong>
                    </LinkLog>
                </form>
            </div>
        </div>
    )
}