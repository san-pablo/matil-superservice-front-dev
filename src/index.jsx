import ReactDOM from 'react-dom/client'
import App from './App'
import './i18n.js'
import { AuthProvider } from './AuthContext'
import { SessionProvider } from './SessionContext'
import { Auth0Provider } from '@auth0/auth0-react'
import { ReactFlowProvider } from 'reactflow'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'; // Cambiamos a createBrowserRouter
import Clarity from '@microsoft/clarity'

//ENVIORMENT VARIABLES
const VERSION = import.meta.env.VITE_VERSION
const URL = import.meta.env.VITE_PUBLIC_API_URL

//const projectId = "q6pp0oc745"
//Clarity.init(projectId)

const router = createBrowserRouter([
        {
          path: "/*",
          element: <App />,
        },
      ],  {
        future: {
          v7_startTransition: true,
        },
      })
      


const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<>
 
        <AuthProvider> 
                <SessionProvider> 
                        <ReactFlowProvider> 
                                <Auth0Provider domain="https://auth.matil.ai" clientId="SxDsY8SPvGF1MXhDOrSbCRC2utLhWRfS" authorizationParams={{redirect_uri: window.location.origin}}>
                                        <RouterProvider router={router} /> 
                                </Auth0Provider>
                        </ReactFlowProvider> 
                </SessionProvider>
        </AuthProvider>
 </>)
 