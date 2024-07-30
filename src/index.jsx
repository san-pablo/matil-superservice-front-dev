import ReactDOM from 'react-dom/client'
import App from './App'
import './i18n.js'
import { AuthProvider } from './AuthContext'
import { SessionProvider } from './SessionContext'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <AuthProvider> 
        <SessionProvider> 
            <App/>
        </SessionProvider>
    </AuthProvider>
)
 