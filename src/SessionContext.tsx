/*
  SESSION CONTEXT FILE (STORE SECTION DATA TO AVOID RE-FETCHING DATA)
*/

//REACT
import { createContext, useContext, useReducer, ReactNode } from 'react'
//TYPING
import { Clients, TicketColumn,  Channels , Tickets, TicketData, ClientColumn, ClientData, ContactBusinessesProps, ContactBusinessesTable, MessagesData, MessagesProps } from './Content/Constants/typing'

//TICKETS TABLE DATA TYPE
type TicketsTable = {
    data:Tickets
    view:{view_type:'shared' | 'private' | 'deleted', view_index:number}
    filters:{page_index:number, sort_by?:TicketColumn | 'not_selected', search:string, order:'asc' | 'desc'}
}
//CLIENTS TABLE DATA TYPE
type ClientsTable = {
    data: Clients | null,
    filters: {page_index:number,  channel_types:Channels[], sort_by?:ClientColumn, search?:string, order?:'asc' | 'desc'}
}
//CONTACT BUSINESSES TABLE DATA TYPE
type ContactBusinessesSection = {
    data: ContactBusinessesProps,
    filters:{page_index:number, sort_by?:ClientColumn, search?:string, order?:'asc' | 'desc'}
}
//HEADER SECTIONS DATA TYPE (CLIENTS OR TICKETS)
type HeaderSections = { 
    id:number
    local_id?:number
    type:'client' | 'ticket' | 'business'
    data:{
        ticketData:TicketData | null,
        messagesList:MessagesData | null,  
        clientData:ClientData | null, 
        clientTickets:Tickets | null,
        businessData:ContactBusinessesTable | null, 
        businessClients:Clients | null
    }
}
//STATS SECTION DATA TYPE
type StatsSection = {data:any, filters:{channels:Channels[], selectedMonth:number, selectedYear:number}}
type StatsSectionData = {
    tickets: StatsSection
    matilda: StatsSection
    users: StatsSection
}

//SESSION DATA TYPE
type SessionData = {
    ticketsTable:TicketsTable[]
    clientsTable:ClientsTable | null
    contactBusinessesTable:ContactBusinessesSection | null
    headerSectionsData:HeaderSections[]
    statsSectionData:StatsSectionData
}

//AUTH CONTEXT TYPE DEFINITION
type AuthContextType = {
    sessionData: SessionData
    dispatch: React.Dispatch<any>
}


const SessionContext = createContext<AuthContextType | undefined>(undefined)


//SESSION DATA
const initialState: SessionData = {
    ticketsTable: [],
    clientsTable: null,
    contactBusinessesTable:null,
    headerSectionsData: [],
    statsSectionData: {
        tickets: { data: null, filters: { channels: [], selectedMonth: new Date().getFullYear(), selectedYear: new Date().getMonth() } },
        matilda: { data: null, filters: { channels: [], selectedMonth: new Date().getFullYear(), selectedYear: new Date().getMonth() } },
        users: { data: null, filters: { channels: [], selectedMonth: new Date().getFullYear(), selectedYear: new Date().getMonth() } }
    }
}

 
const sessionReducer = (state: SessionData, action: { type: string; payload: any }): SessionData => {
    switch (action.type) {

        //SAVE THE INFORMATION ABOUT THE DIFFERNET TICKETS VIEWS
        case 'UPDATE_TICKETS_TABLE':
            let updatedTicketsActivity = state.ticketsTable
            const index = state.ticketsTable.findIndex(ticket =>
                ticket.view.view_type === action.payload.view.view_type &&
                ticket.view.view_index === action.payload.view.view_index
            )
            if (index !== -1) {
                updatedTicketsActivity[index] = action.payload
                return { ...state, ticketsTable: updatedTicketsActivity }
            } else return { ...state, ticketsTable: [...state.ticketsTable, action.payload] };
            
        //SAVE CLIENTS TABLE INFORMATION
        case 'UPDATE_CLIENTS_TABLE':
            return { ...state, clientsTable: { ...state.clientsTable, ...action.payload }}

        //SAVE CONTACT BUSINESSES TABLE INFORMATION
        case 'UPDATE_BUSINESSES_TABLE':
            return { ...state, contactBusinessesTable: { ...state.contactBusinessesTable, ...action.payload } }

        //ADD A NEW HEADER SECTION (TICKET, CLIENT, CONTACT_BUSINESS)
        case 'UPDATE_HEADER_SECTIONS':
            if (action.payload.action === 'add') {
                const exists = state.headerSectionsData.some(section =>section.id === action.payload.data.id && section.type === action.payload.data.type)
                return exists ? state : { ...state, headerSectionsData: [...state.headerSectionsData, action.payload.data] }
            } else if (action.payload.action === 'remove') {
                return { ...state, headerSectionsData: state.headerSectionsData.filter((section, idx) => idx !== action.payload.index)}
            }
            return state

        //UPDATE A TICKET
        case 'EDIT_HEADER_SECTION_TICKET':
            let updatedHeaderSectionsTicket =  state.headerSectionsData

            updatedHeaderSectionsTicket = state.headerSectionsData.filter((section) => {
                if (section.type === 'ticket' && section?.data?.ticketData?.id === action.payload.new_data.id && action.payload.is_deleted) return false              
                else return true    
            }).map((section, idx) => {
                
            if (action.payload?.is_new && section.type === 'ticket'  && action.payload.client_id === section?.data?.clientData?.id) return { ...section, data:{...section.data, clientTickets:null}}
            else if (section.type === 'ticket' && section?.data?.ticketData?.id === action.payload.new_data.id) return { ...section, data:{...section.data, ticketData: action.payload.new_data, clientTickets:null}}
        
            if (section.type === 'client' && action.payload.client_id === section.id) return { ...section, data:{...section.data, clientTickets:null}}
            return section
            })
            
            return {...state, headerSectionsData: updatedHeaderSectionsTicket}
         
        case 'UPDATE_TICKETS_VIEWS':
            return {...state, ticketsTable: action.payload}
            
        //UPDATE A CLIENT
        case 'EDIT_HEADER_SECTION_CLIENT':

            let updatedHeaderSectionsClient =  state.headerSectionsData
        
            updatedHeaderSectionsClient = state.headerSectionsData.map((section, idx) => {
                if (!action.payload.is_new) {
                    if (section.type === 'client' && section?.data?.clientData?.id  === action.payload.data.id) return { ...section, data: {...section.data, clientData: action.payload.data}}    
                    else if (section.type === 'ticket' && section.data.clientData?.id === action.payload.data.id) return {  ...section, data: {...section.data, clientData: action.payload.data} }         
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
                    else if (section.type === 'ticket' && section.data.clientData && section.data.clientData.contact_business_id === action.payload.data.id) {
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
                if ((section.type === 'ticket' || section.type === 'client') && section.data.clientData?.id === action.payload.id) return { ...section, data: { ...section.data, businessData:action.payload.data, businessClients:null }}
                return section
            })
            
            return {...state, contactBusinessesTable: null, headerSectionsData: updatedHeaderSectionsChange}
            
        //UPDATE MESSAGES
        case 'EDIT_HEADER_SECTION_MESSAGES':
                    
            let updatedHeaderSectionsMessages =  state.headerSectionsData        

            updatedHeaderSectionsMessages = state.headerSectionsData.map((section, idx) => {
                if (section.type === 'ticket' && section.data.ticketData?.conversation_id=== action.payload.data.id) {
                    if (action.payload.type === 'new_message') 
                        {
                            action.payload.data.new_messages.forEach((msg:any) => {msg.sender_type = action.payload.data.sender_type})
                            const newMessages = action.payload.data.new_messages
                            return { ...section, data: { ...section.data, messagesList:{ ...section.data.messagesList as MessagesData,  scheduled_messages:[], messages:[...section?.data?.messagesList?.messages as MessagesProps[], ...newMessages]} }}
                        }
                    else if (action.payload.type === 'new_scheduled') return { ...section, data: { ...section.data, messagesList:{ ...section.data.messagesList as MessagesData, scheduled_messages:[...section?.data?.messagesList?.scheduled_messages as MessagesProps[], ...action.payload.data.new_messages]} }}
                    
                    else if (action.payload.type === 'canceled_scheduled'){
                        return { ...section, data: { ...section.data, messagesList:{ ...section.data.messagesList as MessagesData, scheduled_messages:[]} }}
                    }              
                }
                return section
            })
            
            return {...state, contactBusinessesTable: null, headerSectionsData: updatedHeaderSectionsMessages}
            
        //DELETE ALL VIEWS
        case 'DELETE_VIEW_FROM_TICKET_LIST':         
            return {...state, ticketsTable: []}
            
        //DELETE ALL CLIENTS
        case 'DELETE_VIEW_FROM_CLIENT_LIST':         
            return {...state, clientsTable: null}

        //UPDATE AN STAT SECTION
        case 'UPDATE_STATS_SECTION':
            return { ...state, statsSectionData: { ...state.statsSectionData, ...action.payload } }

        //DELETE ALL SESSION DATA (LOG OUT OR ORGANIZATION CHANGE)
        case 'DELETE_ALL_SESSION':
            return {
                ticketsTable: [],
                clientsTable: null,
                contactBusinessesTable:null,
                headerSectionsData: [],
                statsSectionData: {
                    tickets: { data: null, filters: { channels: [], selectedMonth: new Date().getFullYear(), selectedYear: new Date().getMonth() } },
                    matilda: { data: null, filters: { channels: [], selectedMonth: new Date().getFullYear(), selectedYear: new Date().getMonth() } },
                    users: { data: null, filters: { channels: [], selectedMonth: new Date().getFullYear(), selectedYear: new Date().getMonth() } }
                }
            }

        //CHANGE UNSEEN_CHANGES ON OPEN VIEWS WHEN ENTERING A TICKET
        case 'CHANGE_UNSEEN_CHANGES':

            let updatedTicketsTables = state.ticketsTable.map((section) => {
                let updatedSection = { ...section }
                let updatedData = section.data.page_data.map((ticket) => {
                    if (ticket.id === action.payload && ticket.hasOwnProperty('unseen_changes')) {
                        let updatedTicket = { ...ticket }
                        updatedTicket.unseen_changes = false
                        return updatedTicket
                    }
                    return ticket
                })
                updatedSection.data.page_data = updatedData
                return updatedSection
            })
            return { ...state, ticketsTable: updatedTicketsTables }
            
        default:
            return state
    }
}

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [sessionData, dispatch] = useReducer(sessionReducer, initialState)

        return (
        <SessionContext.Provider value={{ sessionData, dispatch }}>
            {children}
        </SessionContext.Provider>
    );
};

// CUSTOM HOOK
export const useSession = () => {
    const context = useContext(SessionContext)
    if (!context) {
        throw new Error('useAuth must be used within an SessionProvider')
    }
    return context
}