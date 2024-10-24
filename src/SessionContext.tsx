/*
  SESSION CONTEXT FILE (STORE SECTION DATA TO AVOID RE-FETCHING DATA)
*/

//REACT
import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react'
//TYPING
import { Clients, ConversationColumn,  Channels , Conversations, ConversationsData, ClientColumn, ClientData, ContactBusinessesProps, ContactBusinessesTable, FlowsData ,FunctionsData, MessagesData, MessagesProps, ContentData } from './Content/Constants/typing'

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
//STATS SECTION DATA TYPE
type StatsSection = {data:any, filters:{channels:Channels[], selectedMonth:number, selectedYear:number}}
type StatsSectionData = {
    conversations: StatsSection
    matilda: StatsSection
    users: StatsSection
    csat: StatsSection
}

//SESSION DATA TYPE
type SessionData = {
    conversationsTable:ConversationsTable[]
    clientsTable:ClientsTable | null
    contactBusinessesTable:ContactBusinessesSection | null
    flowsFunctions:{flows:FlowsData[] | null, functions:FunctionsData[] | null},
    contentData:ContentData[] | null
    headerSectionsData:HeaderSections[]
    statsSectionData:StatsSectionData
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
    flowsFunctions:{flows:null, functions:null},
    contentData: null,
    headerSectionsData: [],
    statsSectionData: {
        conversations: { data: null, filters: { channels: [], selectedMonth: new Date().getFullYear(), selectedYear: new Date().getMonth() } },
        matilda: { data: null, filters: { channels: [], selectedMonth: new Date().getFullYear(), selectedYear: new Date().getMonth() } },
        users: { data: null, filters: { channels: [], selectedMonth: new Date().getFullYear(), selectedYear: new Date().getMonth() } },
        csat: { data: null, filters: { channels: [], selectedMonth: new Date().getFullYear(), selectedYear: new Date().getMonth() } }
    }
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
        case 'UPDATE_FLOWS':
            return { ...state, flowsFunctions: { ...state.flowsFunctions, flows:action.payload.data }}
        case 'DELETE_FLOWS':
            return { ...state, flowsFunctions: { ...state.flowsFunctions, flows:null }}
        case 'UPDATE_FUNCTIONS':
            return { ...state, flowsFunctions: { ...state.flowsFunctions, functions:action.payload.data }}

        //ADD A NEW HEADER SECTION (CONVERSATION, CLIENT, CONTACT_BUSINESS)
        case 'UPDATE_HEADER_SECTIONS':
            if (action.payload.action === 'add') {
                const exists = state.headerSectionsData.some(section =>section.id === action.payload.data.id && section.type === action.payload.data.type)
                return exists ? state : { ...state, headerSectionsData: [...state.headerSectionsData, action.payload.data] }
            } else if (action.payload.action === 'remove') {
                return { ...state, headerSectionsData: state.headerSectionsData.filter((section, idx) => idx !== action.payload.index)}
            }
            return state

        //UPDATE A CONVERSATION
        case 'EDIT_HEADER_SECTION_CONVERSATION':
            let updatedHeaderSectionsConversation =  state.headerSectionsData

            updatedHeaderSectionsConversation = state.headerSectionsData.filter((section) => {
                if (section.type === 'conversation' && section?.data?.conversationData?.id === action.payload.new_data.id && action.payload.is_deleted) return false              
                else return true    
            }).map((section, idx) => {
                
            if (action.payload?.is_new && section.type === 'conversation'  && action.payload.client_id === section?.data?.clientData?.id) return { ...section, data:{...section.data, clientConversations:null}}
            else if (section.type === 'conversation' && section?.data?.conversationData?.id === action.payload.new_data.id) return { ...section, data:{...section.data, conversationData: action.payload.new_data, clientConversations:null}}
        
            if (section.type === 'client' && action.payload.client_id === section.id) return { ...section, data:{...section.data, clientConversations:null}}
            return section
            })
            
            return {...state, headerSectionsData: updatedHeaderSectionsConversation}
         
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
        
        //UPDATE CONTACT BUSINESS
        case 'EDIT_HEADER_SECTION_BUSINESS':
                
            let updatedHeaderSectionsBusiness =  state.headerSectionsData        
            if (!action.payload.is_new) {
                updatedHeaderSectionsBusiness = state.headerSectionsData.map((section, idx) => {

                    if (section.type === 'business' && section?.data?.businessData?.id === action.payload.data.id) return { ...section, data: {...section.data, businessData: action.payload.data}} 
                    else if (section.type === 'client' && section.data.clientData?.contact_business_id === action.payload.data.id) return { ...section, data: {...section.data, businessData: action.payload.data}}
                    else if (section.type === 'conversation' && section.data.clientData && section.data.clientData.contact_business_id === action.payload.data.id) {
                        return { ...section, data: { ...section.data,  businessData: action.payload.data }}
                    }            
                    
                    return section
                })
            }
            return {...state, contactBusinessesTable: null, headerSectionsData: updatedHeaderSectionsBusiness}
        
        //CHANGE THE BUSINESS OF A CLIENT
        case 'EDIT_CONTACT_BUSINESS':
            let updatedHeaderSectionsChange =  state.headerSectionsData        

            updatedHeaderSectionsChange = state.headerSectionsData.map((section, idx) => {
                if ((section.type === 'conversation' || section.type === 'client') && section.data.clientData?.id === action.payload.id) return { ...section, data: { ...section.data, businessData:action.payload.data, businessClients:null }}
                return section
            })
            
            return {...state, contactBusinessesTable: null, headerSectionsData: updatedHeaderSectionsChange}
            
        //UPDATE MESSAGES
        case 'EDIT_HEADER_SECTION_MESSAGES':
                    
            let updatedHeaderSectionsMessages =  state.headerSectionsData        
            updatedHeaderSectionsMessages = state.headerSectionsData.map((section, idx) => {
                if (section.type === 'conversation' && section.data.conversationData?.id === action.payload.data.id) {
                    if (action.payload.type === 'message') 
                        {
                            action.payload.data.new_messages.forEach((msg:any) => {msg.sender_type = action.payload.data.sender_type})
                            const newMessages = action.payload.data.new_messages
                            return { ...section, data: { ...section.data, messagesList:{ ...section.data.messagesList as MessagesData,  scheduled_messages:[], messages:[...section?.data?.messagesList?.messages as MessagesProps[], ...newMessages]} }}
                        }
                    else if (action.payload.type === 'scheduled-new') return { ...section, data: { ...section.data, messagesList:{ ...section.data.messagesList as MessagesData, scheduled_messages:[...section?.data?.messagesList?.scheduled_messages as MessagesProps[], ...action.payload.data.new_messages]} }}
                    
                    else if (action.payload.type === 'scheduled-canceled'){
                        return { ...section, data: { ...section.data, messagesList:{ ...section.data.messagesList as MessagesData, scheduled_messages:[]} }}
                    }              
                }
                return section
            })
            
            return {...state, contactBusinessesTable: null, headerSectionsData: updatedHeaderSectionsMessages}
            
        //DELETE ALL VIEWS
        case 'DELETE_VIEW_FROM_CONVERSATIONS_LIST':         
            return {...state, conversationsTable: []}
            
        //DELETE ALL CLIENTS
        case 'DELETE_VIEW_FROM_CLIENT_LIST':         
            return {...state, clientsTable: null}

        //UPDATE AN STAT SECTION
        case 'UPDATE_STATS_SECTION':
            return { ...state, statsSectionData: { ...state.statsSectionData, ...action.payload } }

        //DELETE ALL SESSION DATA (LOG OUT OR ORGANIZATION CHANGE)
        case 'DELETE_ALL_SESSION':
            return {
                conversationsTable: [],
                clientsTable: null,
                contactBusinessesTable:null,
                flowsFunctions:{flows:null, functions:null},
                headerSectionsData: [],
                contentData: null,
                statsSectionData: {
                    conversations: { data: null, filters: { channels: [], selectedMonth: new Date().getFullYear(), selectedYear: new Date().getMonth() } },
                    matilda: { data: null, filters: { channels: [], selectedMonth: new Date().getFullYear(), selectedYear: new Date().getMonth() } },
                    users: { data: null, filters: { channels: [], selectedMonth: new Date().getFullYear(), selectedYear: new Date().getMonth() } },
                    csat: { data: null, filters: { channels: [], selectedMonth: new Date().getFullYear(), selectedYear: new Date().getMonth() } }
                }
            }

        //CHANGE UNSEEN_CHANGES ON OPEN VIEWS WHEN ENTERING A clientConversations
        case 'CHANGE_UNSEEN_CHANGES':

            let updatedConversationsTables = state.conversationsTable.map((section) => {
                let updatedSection = { ...section }
                if (updatedSection?.data?.page_data) {
                    let updatedData = section.data.page_data.map((con) => {
                        if (con.id === action.payload && con.hasOwnProperty('unseen_changes')) {
                            let updatedCon = { ...con }
                            updatedCon.unseen_changes = false
                            return updatedCon
                        }
                        return con
                    })
                    updatedSection.data.page_data = updatedData
                }
                return updatedSection
            })
            return { ...state, conversationsTable: updatedConversationsTables }
            
            
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