import { useCurrentDataUser } from "../../../hooks/currentUserHook"

export default function AnimalProtectionModuleContentUser(){
     const { id, email,rol } = useCurrentDataUser();
    
    return(
        <>
            <div>
                <h2>Bienvenido, {email}</h2>
                <p>Tu token activo es: {rol}</p>
            
            </div>
        </>
    )
}