import './MenuCard.css'
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function MenuCard({componentLogo, title, message, path, colorLogo}){
    return(
         <>
            <div className="card">
                <div className="content">
                    <div className="logo-wrapper-card" style={{backgroundColor: colorLogo}}>
                        {componentLogo}
                    </div>
                    <h3 className="title">
                        {title}
                    </h3>
                    <p>
                        {message}
                    </p>
                    <div className="link-path-cardMenu-wrapper">
                        <a href={path} className="link-path-cardMenu">
                            ver mas 
                            <NavigateNextIcon/>
                        </a> 
                    </div>
                </div>
            </div>
        </>
    )
   
}