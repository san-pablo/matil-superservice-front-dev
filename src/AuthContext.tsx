/*
  AUTH CONTEXT FILE (STORE DATA TO USE ACROSS THE APP)
*/

//REACT
import { createContext, useContext, useState, ReactNode } from 'react'
//TYPING
import { Views } from './Content/Constants/typing'
 
//AUTH DATA TYPE
type AuthData = {
  email: string
  accessToken: string
  refreshToken:string
  organizationId: number | null
  userId: number | null
  organizationName: string
  views: Views | null
  users:{[key:string | number]:{name:string, surname:string, email_address:string, last_login:string, is_admin:boolean}} | null
  ticket_subjects:string[]
  shortcuts:string[]
  userData:{name: string, surname: string, email_address: string, password: string, language:string, shortcuts_activated:boolean, 
            organizationData:{calls_status:'connected' | 'out' | 'disconnected', avatar_image_url:string, is_admin:boolean, alias:boolean, groups:{id:number, name:string}[]}} | null
}
 
//AUTH CONTEXT TYPE DEFINITION
type AuthContextType = {
    authData: AuthData
    isSignedIn: boolean
    setAuthData: (data: Partial<AuthData>) => void
    signOut: () => void
    signIn: () => void
}

//CONTEXT TOOLS
const AuthContext = createContext<AuthContextType>({
    authData: { email: '', accessToken: '',refreshToken:'', organizationId: null, userId:null, organizationName:'', views:{"private_views": [], "shared_views": []}, users:null, ticket_subjects:[], shortcuts:[], userData:null},
    isSignedIn: false, 
    signIn: () => {},
    signOut: () => {},
    setAuthData: () => {},
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {

    //AUTHDATA
    const [authData, setAuthData] = useState<AuthData>({
        email: '',
        accessToken: '',
        refreshToken: '',
        organizationId: null,
        userId:null,
        organizationName:'',
        views:null, 
        users:null, 
        ticket_subjects:[], 
        shortcuts:[],
        userData:null
    })

    //AUTHENTICATION FUNCTIONALITIES
    const [isSignedIn, setIsSignedIn] = useState(false)

    //EDIT AUTH DATA
    const setAuthDataHandler = (data: Partial<AuthData>) => {setAuthData(prevData => ({ ...prevData, ...data }))}

    //SIGN OUT
    const signOut = () => {
        setAuthData({ email: '', accessToken: '', refreshToken: '',organizationId: null, userId:null, organizationName:'', views:{"private_views": [], "shared_views": []}, users:null, ticket_subjects:[], shortcuts:[], userData:null })
        setIsSignedIn(false)
        localStorage.clear()
    }

    //SIGN IN
    const signIn = () => {setIsSignedIn(true)}

    return (
        <AuthContext.Provider value={{
            authData,
            isSignedIn,
            setAuthData: setAuthDataHandler,
            signIn: signIn,
            signOut: signOut
        }}>
            {children}
        </AuthContext.Provider>
    )
}

//HOOK
export const useAuth = () => useContext(AuthContext)