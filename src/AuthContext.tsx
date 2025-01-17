/*
  AUTH CONTEXT FILE (STORE DATA TO USE ACROSS THE APP)
*/

//REACT
import { createContext, useContext, useState, ReactNode } from 'react'
//TYPING
import { Views } from './Content/Constants/typing'
 
//TYPING
type fieldConfigType = {name:string, type:'bool' | 'int' | 'float' | 'str' | 'timestamp', default:string}

//AUTH DATA TYPE
type AuthData = {
    email: string
    accessToken: string
    organizationId: number | null
    userId: string | null
    organizationName: string
    views: Views | null
    users:{[key:string | number]:{name:string, surname:string, email_address:string, last_login:string, is_admin:boolean}} | null
    conversation_themes:string[]
    shortcuts:string[]
    userData:{name: string, surname: string, email_address: string, password: string, language:string, shortcuts_activated:boolean} | null
    organizationData:{calls_status:'connected' | 'out' | 'disconnected', avatar_image_url:string, is_admin:boolean, alias:string, groups:{id:number, name:string}[]} | null
    customAttributes:{conversation:fieldConfigType[], contact:fieldConfigType[], contact_business:fieldConfigType[]} | null
    active_integrations:string[]
}
 
//AUTH CONTEXT TYPE DEFINITION
type AuthContextType = {
    authData: AuthData
    isSignedIn: boolean
    setAuthData: (data: Partial<AuthData>) => void
    signOut: () => void
}

//CONTEXT TOOLS
const AuthContext = createContext<AuthContextType>({
    authData: { email: '', accessToken: '', organizationId: null, userId:null, organizationName:'', views:{"private_views": [], "shared_views": []}, users:null, conversation_themes:[], shortcuts:[], userData:null, organizationData:null, customAttributes:null, active_integrations:[]},
    isSignedIn: false, 
    signOut: () => {},
    setAuthData: () => {},
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {

    //AUTHDATA
    const [authData, setAuthData] = useState<AuthData>({
        email: '',
        accessToken: '',
        organizationId: null,
        userId:null,
        organizationName:'',
        views:null, 
        users:null, 
        conversation_themes:[], 
        shortcuts:[],
        userData:null,
        organizationData:null,
        customAttributes:null,
        active_integrations:[]
    })

    //AUTHENTICATION FUNCTIONALITIES
    const [isSignedIn, setIsSignedIn] = useState(false)

    //EDIT AUTH DATA
    const setAuthDataHandler = (data: Partial<AuthData>) => {setAuthData(prevData => ({ ...prevData, ...data }))}

    //SIGN OUT
    const signOut = () => {
        setAuthData({ email: '', accessToken: '', organizationId: null, userId:null, organizationName:'', views:{"private_views": [], "shared_views": []}, users:null, conversation_themes:[], shortcuts:[], userData:null,organizationData:null, customAttributes:null, active_integrations:[]})
        localStorage.clear()
    }

    return (
        <AuthContext.Provider value={{
            authData,
            isSignedIn,
            setAuthData: setAuthDataHandler,
            signOut: signOut
        }}>
            {children}
        </AuthContext.Provider>
    )
}

//HOOK
export const useAuth = () => useContext(AuthContext)