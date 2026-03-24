import '../../styles/login.css'
import logo_sigea from '../../assets/img/logo_sigea.png/'
import titulo from '../../assets/img/letras_sigea.png/'
import {InputLogReg, LinkLog, ButtonLink} from '../../components/form-input.jsx/'
import Selection from '../../components/selecComponent/Selectstyling'

import Select from 'react-select'


export default function Register() {
    return (
        <div className="login-wrapper">
            <div className="logo">
                <img src={logo_sigea} alt="" />
                <img src={titulo} alt="" />
            </div>

            <div className="login-form">
                <h2 className='form-tittle'>Regístrate</h2>
                <form>
                    <div className="section-log names">
                        <InputLogReg type={'text'} placeholder={'Primer Nombre'}/>
                        <InputLogReg type={'text'} placeholder={'Segundo Nombre'}/>
                        <InputLogReg type={'text'} placeholder={'Primer Apellido'}/>
                        <InputLogReg type={'text'} placeholder={'segundo Apellido'}/>
                    </div>
                    <section className="section-log">
                        <InputLogReg type={'email'} placeholder={'Correo'}/>
                    </section>
                    <section className="section-log ">
                        <InputLogReg type={'number'} placeholder={'Numero de contacto'}/>
                    </section>
                    
                    <section className="section-log document-type">
                        <Selection options={[{value: 'C.C', label: 'Cedula de ciudadania' },
                            { value: 'T.I', label: 'Targeta de Identidad' }]} placeholder={'Tipos de Documento'} />
                    </section>
                    
                    <section className="section-log">
                        <InputLogReg type={'password'} placeholder={'contraseña'}/>
                    </section>
                    <section className="section-log">
                        <InputLogReg type={'password'} placeholder={'Confirmar Contraseña'}/>
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