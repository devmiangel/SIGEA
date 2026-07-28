import FirstLogAgro from "./AgroExtensionViews/FirstLogAgro"
import ProductorView from "./AgroExtensionViews/ProductorView"
import UserPreviewCard from "../../../components/UserPreviewCard/UserPreviewCard"


// falta la implementeacion del servicio que hace el get del estado del productor, esto para determinar si el productor esta entrando en el aplicativo por primera vez o si ya ha realizado la solicitudes, asi poder redirigirlo a la pagina adecuada

export default function AgroModuleContentUser(){
    

    const elementToRender = () => {
        
        return <ProductorView/>
        // return <FirstLogAgro/>
    }


    return(
        <>
            <UserPreviewCard />
            <UserPreviewCard/>
            <UserPreviewCard/>
            <UserPreviewCard/>
            <UserPreviewCard/>
            <UserPreviewCard/>
            {/* {elementToRender()} */}
        </>
    )
}