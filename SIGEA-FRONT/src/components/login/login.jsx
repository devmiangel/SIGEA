import '../../styles/login.css'

export default function Login() {
    return (
        <div className="login-wrapper">
            <h2>Iniciar Sesión</h2>
            <form>
                <input type="text" placeholder="Correo Electronico"/>
                <input type="password" placeholder="Contraseña"/>
                <div>
                    <input type="submit" value="Iniciar Sesion"/>
                    
                </div>
            </form>
        </div>
    )
}