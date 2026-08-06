import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link } from 'react-router-dom';

export default function MenuCard({componentLogo, title, message, path, colorLogo}){
    return(
        <div className="rounded-xl w-[98%] lg:w-auto lg:min-w-100 h-58.75 bg-[#ddd9] border-2 border-[#0000001a] m-2.5">
            <div className="p-6.25">
                <div className="flex items-center justify-center w-17.5 h-17.5 rounded-full" style={{backgroundColor: colorLogo}}>
                    {componentLogo}
                </div>
                <h3 className="my-2.5 mb-0.5 font-bold">{title}</h3>
                <p className='text-[15px]'>{message}</p>
                <div className="mt-5 border-t-2 border-[#00000030] h-6.25 flex items-center">
                    <Link to={path} className="flex items-center justify-between pt-1 no-underline text-black w-full rounded px-2.5 hover:bg-[#41414116] transition-colors">
                        ver mas 
                        <NavigateNextIcon/>
                    </Link> 
                </div>
            </div>
        </div>
    )
   
}