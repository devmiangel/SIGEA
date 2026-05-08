import { BrowserRouter, Outlet } from 'react-router-dom'
import { CurrentUserDataProvider } from './context/dataUserContext'

import SigeaRoutes from './routes/SigeaRoutes'

const App = () => {
    return (
        <CurrentUserDataProvider>
            <BrowserRouter>
                <SigeaRoutes/>  
            </BrowserRouter>
        </CurrentUserDataProvider>
            
    )
}

export default App