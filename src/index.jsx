import ReactDOM from 'react-dom/client'
import App from './App'
import './i18n.js'
import { AuthProvider } from './AuthContext'
import { SessionProvider } from './SessionContext'
import { Auth0Provider } from '@auth0/auth0-react';


//ENVIORMENT VARIABLES
const URL = import.meta.env.VITE_PUBLIC_API_URL

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<>
        {URL.endsWith('v2/') ? 
    
        <AuthProvider> 
            <SessionProvider> 
                    <App/>
            </SessionProvider>
        </AuthProvider>
        :
        <Auth0Provider
        domain="https://auth.matil.ai"
        clientId="SxDsY8SPvGF1MXhDOrSbCRC2utLhWRfS"
        authorizationParams={{redirect_uri: window.location.origin}}>
        <AuthProvider> 
        <SessionProvider> 
                <App/>
        </SessionProvider>
        </AuthProvider>
        </Auth0Provider>}

</>)
 