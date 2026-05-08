import {Header} from "../../../components/Tettles-Buttons/Title"
import ButtonLink from "../../../components/Tettles-Buttons/Buttons";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function ScheduleContentAdmin(){
    
    
    return(
        <>
            <Header 
                componentLogo={
                    <CalendarMonthIcon 
                        sx={{fontSize: 40, color:"ActiveCaption"}}
                    />
                } 
                headerText={'Gestion de horarios de visitas'} 
                message={'Gestiona la asignacion de las visitas a productores a los funcionarios correspondientes '} 
                colorLogo={'#55bd85'} 
                firstButton={
                    <ButtonLink buttonText={'Ver asignaciones'}/>
                }
            />
           

        </>
    )
}