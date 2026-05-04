import { BrowserRouter, Outlet } from 'react-router-dom'

import SigeaRoutes from './routes/SigeaRoutes'

const App = () => {
    return (
        <BrowserRouter>
            <SigeaRoutes/>  
        </BrowserRouter>    
    )
}

export default App