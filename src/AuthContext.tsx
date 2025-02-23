/*
  AUTH CONTEXT FILE (STORE DATA TO USE ACROSS THE APP)
*/

//REACT
import { createContext, useContext, useState, ReactNode } from 'react'
//TYPING
import { CDAsType, TagsType, ViewDefinitionType, Channels } from './Content/Constants/typing'
 
//TYPING
 
//AUTH DATA TYPE
type AuthData = {
    email: string
    organizationId: number | null
    accessToken:string
    userId: string | null
    organizationName: string
    userData:{id:string, name: string, surname: string, email: string, language:string, icon:{type: 'image' | 'emoji' | 'icon', data:string}, color_theme:'light' | 'dark', created_at:string, organizations:{id:string, name:string}[], invitations:{id:string, organization_id:string, organization_name:string, role_name:string, status:string}[] } | null
    views: ViewDefinitionType[] | null
    preferences: {shortcuts:string[], objects_layout:{[key in 'conversations' | 'persons' | 'businesses']:any} | null} | null
    users:{id:string, name:string, surname:string, email_address:string, icon:{type:'image' | 'emoji' | 'icon', data:string}}[] | null
    themes:{id:string, name:string, description:string, icon:{type:'image' | 'emoji' | 'icon', data:string} }[]
    channels:{display_id:string, id:string, is_active:boolean, name:string, type:Channels}[]
    teams:{id:string, name:string, distribution_method:'manual' | 'round_robin', icon:{type:'image' | 'emoji' | 'icon', data:string}, users:string[]}[]
    cdas:CDAsType[] | null
    tags:TagsType[] | null
    api_keys:{id:string, name:string}[] | null
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
    authData: { email: '', organizationId: null, userId:null, organizationName:'', accessToken:'', views:null, teams:[], channels:[], users:null, preferences:null, themes:[], userData:null , api_keys:null, cdas:null, tags:null},
    isSignedIn: false, 
    signOut: () => {},
    setAuthData: () => {},
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {

    //AUTHDATA
    const [authData, setAuthData] = useState<AuthData>({
        email: '',
        organizationId: null,
        userId:null,
        organizationName:'',
        views:null, 
        channels:[],
        users:null, 
        themes:[], 
        preferences:null,
        teams:[],
        api_keys:[],
        userData:null,
        cdas:null,
        tags:null,
        accessToken:''
    })

    //AUTHENTICATION FUNCTIONALITIES
    const [isSignedIn, setIsSignedIn] = useState(false)

    //EDIT AUTH DATA
    const setAuthDataHandler = (data: Partial<AuthData>) => {setAuthData(prevData => ({ ...prevData, ...data }))}

    //SIGN OUT
    const signOut = () => {
        setAuthData({ email: '', organizationId: null, channels:[], tags:null, userId:null, organizationName:'', accessToken:'', views:null, teams:[], users:null, themes:[], preferences:null, userData:null, cdas:null, api_keys:null})
        localStorage.clear()
    }

    return (
        <AuthContext.Provider value={{
            authData,
            isSignedIn,
            setAuthData: setAuthDataHandler,
            signOut: signOut}}>
            {children}
        </AuthContext.Provider>
    )
}

//HOOK
export const useAuth = () => useContext(AuthContext)