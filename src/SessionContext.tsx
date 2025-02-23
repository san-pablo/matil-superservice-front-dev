/*
  SESSION CONTEXT FILE (STORE SECTION DATA TO AVOID RE-FETCHING DATA)
*/

//REACT
import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react'
//TYPING
import { Clients, ConversationColumn,  Channels , FunctionTableData, ReportDataType, Conversations, ConversationsData, ClientColumn, ClientData, ContactBusinessesProps, ContactBusinessesTable, MessagesData, MessagesProps, ContentData } from './Content/Constants/typing'

//CONVERSATIONS TABLE DATA TYPE
type ConversationsTable = {
    data:Conversations
    selectedIndex:number
    view:{view_type:'shared' | 'private' | 'deleted', view_index:number}
    filters:{page_index:number, sort_by?:ConversationColumn | 'not_selected', search:string, order:'asc' | 'desc'}
}
//CLIENTS TABLE DATA TYPE
type ClientsTable = {
    data: Clients
    selectedIndex:number
    filters: {page_index:number,  channel_types:Channels[], sort_by?:ClientColumn, search?:string, order?:'asc' | 'desc'}
}
//CONTACT BUSINESSES TABLE DATA TYPE
type ContactBusinessesSection = {
    data: ContactBusinessesProps
    selectedIndex:number
    filters:{page_index:number, sort_by?:ClientColumn, search?:string, order?:'asc' | 'desc'}
}
//HEADER SECTIONS DATA TYPE (CLIENTS OR CONVERSATIONS)
type HeaderSections = { 
    id:number
    local_id?:number
    type:'client' | 'conversation' | 'business'
    data:{
        conversationData:ConversationsData | null,
        messagesList:MessagesData | null,  
        clientData:ClientData | null, 
        clientConversations:Conversations | null,
        businessData:ContactBusinessesTable | null, 
        businessClients:Clients | null,
    }
}

//CHANNELS TYOE
type ChannelsType = {
    id: string
    uuid: string
    display_id: string
    name: string
    channel_type: string
    is_active: boolean
}

//SESSION DATA TYPE
type SessionData = {
    conversationsTable:ConversationsTable[]
    clientsTable:ClientsTable | null
    contactBusinessesTable:ContactBusinessesSection | null
    functionsData:FunctionTableData[] | null
    contentData:ContentData[] | null
    headerSectionsData:HeaderSections[]
    statsSectionTableData:ReportDataType[] | null
    additionalData:{channels:null | ChannelsType[]}
}

//AUTH CONTEXT TYPE DEFINITION
type AuthContextType = {
    sessionData: SessionData
    dispatch: Dispatch<any>
}


const SessionContext = createContext<AuthContextType | undefined>(undefined)

//INITIAL SESSION DATA
const initialState: SessionData = {
    conversationsTable: [],
    clientsTable: null,
    contactBusinessesTable:null,
    functionsData:null,
    contentData: null,
    headerSectionsData: [],
    statsSectionTableData:null,
    additionalData:{channels:null}

}

//REDUCER
const sessionReducer = (state: SessionData, action: { type: string; payload: any }): SessionData => {
    switch (action.type) {

        //SAVE THE INFORMATION ABOUT THE DIFFERNET CONVERSATIONS VIEWS
        case 'UPDATE_CONVERSATIONS_TABLE':
            let updatedConversationsActivity = state.conversationsTable

 
            const index = state.conversationsTable.findIndex(con =>
                con.view.view_type === action.payload.view.view_type &&
                con.view.view_index === action.payload.view.view_index
            )
 
            if (index !== -1) {
                updatedConversationsActivity[index] = action.payload
                return { ...state, conversationsTable: updatedConversationsActivity }
            } 
            else return { ...state, conversationsTable: [...state.conversationsTable, action.payload] }     
        case 'UPDATE_CONVERSATIONS_TABLE_SELECTED_ITEM':
                let updatedConversationsActivity2 = state.conversationsTable

                const index2 = state.conversationsTable.findIndex(con =>
                    con.view.view_type === action.payload.view.view_type &&
                    con.view.view_index === action.payload.view.view_index
                )
                if (index2 !== -1) {
                    updatedConversationsActivity2[index2].selectedIndex = action.payload.index
                    return { ...state, conversationsTable: updatedConversationsActivity2 }
                } 
                else return state

        //SAVE CLIENTS TABLE INFORMATION
        case 'UPDATE_CLIENTS_TABLE':
            return { ...state, clientsTable: { ...state.clientsTable, ...action.payload }}
        case 'UPDATE_CLIENTS_TABLE_SELECTED_ITEM':
            if (state.clientsTable) return { ...state, clientsTable: { ...state.clientsTable, selectedIndex:action.payload.index }}
            else return state

        //SAVE CONTACT BUSINESSES TABLE INFORMATION
        case 'UPDATE_BUSINESSES_TABLE':
            return { ...state, contactBusinessesTable: { ...state.contactBusinessesTable, ...action.payload } }
        case 'UPDATE_BUSINESSES_TABLE_SELECTED_ITEM':
            if (state.contactBusinessesTable) return { ...state, contactBusinessesTable: { ...state.contactBusinessesTable, selectedIndex:action.payload.index }}
            else return state

        //SAVE CONTENT DATA TABLE
        case 'UPDATE_CONTENT_TABLE':
            return { ...state, contentData: action.payload.data }

        //SAVE FLOWS AND FUNCTIONS INFORMATION
        case 'UPDATE_FUNCTIONS':
            return { ...state, functionsData: action.payload.data }
        
        //ADD A NEW HEADER SECTION (CONVERSATION, CLIENT, CONTACT_BUSINESS)
        case 'UPDATE_HEADER_SECTIONS':
            if (action.payload.action === 'add') {
                const exists = state.headerSectionsData.some(section =>section.id === action.payload.data.id && section.type === action.payload.data.type)
                return exists ? state : { ...state, headerSectionsData: [...state.headerSectionsData, action.payload.data] }
            } else if (action.payload.action === 'remove') {
                return { ...state, headerSectionsData: state.headerSectionsData.filter((section, idx) => idx !== action.payload.index)}
            }
            return state

 
        case 'UPDATE_CONVERSATIONS_VIEWS':
            return {...state, conversationsTable: action.payload}
            
        //UPDATE A CLIENT
        case 'EDIT_HEADER_SECTION_CLIENT':

            let updatedHeaderSectionsClient =  state.headerSectionsData
        
            updatedHeaderSectionsClient = state.headerSectionsData.map((section, idx) => {
                if (!action.payload.is_new) {
                    if (section.type === 'client' && section?.data?.clientData?.id  === action.payload.data.id) return { ...section, data: {...section.data, clientData: action.payload.data}}    
                    else if (section.type === 'conversation' && section.data.clientData?.id === action.payload.data.id) return {  ...section, data: {...section.data, clientData: action.payload.data} }         
                }
                else if (section.type === 'business' && section?.data?.businessData?.id  === action.payload.data.contact_business_id) return {  ...section, data: {...section.data, businessClients: null} }  
                
                return section
            })
        
            return {...state, clientsTable: null, headerSectionsData: updatedHeaderSectionsClient}
      
    
        //DELETE ALL VIEWS
        case 'DELETE_VIEW_FROM_CONVERSATIONS_LIST':         
            return {...state, conversationsTable: []}
            
        //DELETE ALL CLIENTS
        case 'DELETE_VIEW_FROM_CLIENT_LIST':         
            return {...state, clientsTable: null}

        //UPDATE AN STAT SECTION
        case 'UPDATE_STATS_SECTION':
            return { ...state, statsSectionTableData: action.payload  }

        //DELETE ALL SESSION DATA (LOG OUT OR ORGANIZATION CHANGE)
        case 'DELETE_ALL_SESSION':
            return {
                conversationsTable: [],
                clientsTable: null,
                contactBusinessesTable:null,
                functionsData:null,
                headerSectionsData: [],
                contentData: null,
                statsSectionTableData: null,
                additionalData:{channels:null}
            }

 
        //ADD CHANNELS
        case 'ADD_CHANNELS':
            return { ...state, additionalData: {channels:action.payload} }
            
        default:
            return state
    }
}

//SESSION PROVIDER
export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [sessionData, dispatch] = useReducer(sessionReducer, initialState)
    return (
        <SessionContext.Provider value={{ sessionData, dispatch }}>
            {children}
        </SessionContext.Provider>
    )
}

// CUSTOM HOOK
export const useSession = () => {
    const context = useContext(SessionContext)
    if (!context) throw new Error('useAuth must be used within an SessionProvider')
    return context
}