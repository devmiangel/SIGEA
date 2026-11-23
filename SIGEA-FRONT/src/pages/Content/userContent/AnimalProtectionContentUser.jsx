import { useCurrentDataUser } from "../../../hooks/currentUserHook"

export default function AnimalProtectionModuleContentUser(){
    const { user } = useCurrentDataUser();
    
    return(
        <>
            <div>
                <h2>Bienvenido, {user?.email}</h2>
                <p>Tu rol es: {user?.rol}</p>
            
            </div>
        </>
    )
}