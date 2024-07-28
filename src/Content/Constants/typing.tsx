
import { IconType } from "react-icons"
import { IoMdMail, IoLogoWhatsapp } from "react-icons/io"
import { IoChatboxEllipses, IoLogoGoogle } from "react-icons/io5"
import { AiFillInstagram } from "react-icons/ai"

//USER INFO AND ORGANIZATION
export interface Organization {
    id: number
    name: string
    platform_type: string
    is_admin: boolean
  }
export interface userInfo {
    name: string
    surname: string
    organizations: Organization[]
}

//VIEWS
interface Condition {
    column: TicketColumn
    operation_type: 'geq' | 'leq' | 'eq'
    value: any
}
interface Order {
    column: TicketColumn
    order: string
}
export interface View {
    created_at:string
    name: string
    columns: TicketColumn[]
    all_conditions: Condition[]
    any_conditions: Condition[]
    order_by: Order
}
export interface Views {
    private_views: View[]
    shared_views: View[]
    number_of_tickets_per_shared_view?:number[]
    number_of_tickets_per_private_view?:number[]
    number_of_tickets_in_bin?:number
}
export interface ViewType {type:'private' | 'shared' | 'deleted', index:number, name:string}


//HEADER SECTIONS
export type HeaderSectionType = (description: string, code: number, section: 'ticket' | 'client' | 'contact-business', local_id?:number) => void
export type DeleteHeaderSectionType = (element:{description: string, code: number, local_id?:number, type: string}) => void


 
//TICKETS TABLE
export type TicketColumn = 
    'id'
  | 'local_id'
  | 'user_id'
  | 'channel_type'
  | 'created_at'
  | 'updated_at'
  | 'solved_at'
  | 'title'
  | 'subject'
  | 'urgency_rating'
  | 'status'
  | 'deletion_date'
  | 'unseen_changes'
  | 'closed_at'


  

type ColumnsTicketsMap = {[key in TicketColumn]: [string, number]}
  
export const columnsTicketsMap: ColumnsTicketsMap = {
    id: ['Id', 50],
    local_id: ['Id', 50],
    status: ['Estado', 100],
    channel_type: ['Canal', 150],
    subject: ['Tema', 200],
    user_id: ['Agente asignado', 200],
    created_at: ['Creado', 150],
    updated_at: ['Última interacción', 150],
    solved_at: ['Resuelto', 150],
    closed_at: ['Cerrado', 150],
    title: ['Descripción', 300],
    urgency_rating: ['Prioridad', 130],
    deletion_date: ['Fecha de eliminación', 180],
    unseen_changes: ['Mensajes no leídos', 250],
 
  }

export interface TicketsTableProps {
    'id': number
    'local_id': number
    [key:string]: number | string | boolean
 }
export interface Tickets {
    'total_tickets':number
    'page_index':number
    'page_data':TicketsTableProps[]
    'ticket_ids'?:number[]
}
export interface ClientTicketsProps{
    'status':'new' | 'open' |'solved' | 'pending' | 'closed'
    'created_at':string
    'title':string
}

//TICKET SECTION
export interface TicketData {
    'id': number
    'local_id': number
    'user_id':number
    'conversation_id': number
    'title': string
    'channel_type': string
    'created_at': string
    'updated_at': string
    'solved_at': string
    'subject': string
    'urgency_rating': number
    'status': 'new' | 'open' |'solved' | 'pending' | 'closed'
    'unseen_changes': boolean
}


//CLIENTS TABLE
export type ClientColumn = 
  | 'id'
  | 'organization_id'
  | 'contact_business_id'
  | 'created_at'
  | 'name'
  | 'language'
  | 'waba_id'
  | 'phone_number'
  | 'email_address'
  | 'instagram_username'
  | 'google_business_review_id'
  | 'webchat_uuid'
  | 'last_interaction_at'
  | 'rating'
  | 'notes'
  | 'labels'
  | 'is_blocked'


interface ColumnsMap {
    [key:string]: [string, number];
}

export const columnsClientsMap: ColumnsMap = {
    name: ["Nombre", 200],
    contact: ["Contacto", 150],
    labels: ["Etiquetas", 350],
    last_interaction_at: ["Última interacción", 150],
    created_at: ["Creado", 150],
    rating: ["Rating", 60],
    language: ["Idioma", 150],
    notes: ["Notas", 350],
    is_blocked: ["Estado", 150]
 }

 export const languagesFlags: {[key: string]: [string, string]} = {
    "EN": ["Inglés", "🇬🇧"], 
    "ES": ["Español", "🇪🇸"],  
    "EU": ["Euskera", "🇪🇸"],  
    "CA": ["Catalán", "🇪🇸"],  
    "GL": ["Gallego", "🇪🇸"],  
    "ZH": ["Chino Mandarín", "🇨🇳"],  
    "HI": ["Hindú", "🇮🇳"], 
    "AR": ["Árabe", "🇸🇦"],  
    "FR": ["Francés", "🇫🇷"],  
    "RU": ["Ruso", "🇷🇺"],  
    "PT": ["Portugués", "🇵🇹"], 
    "DE": ["Alemán", "🇩🇪"], 
    "JA": ["Japonés", "🇯🇵"],  
    "IT": ["Italiano", "🇮🇹"], 
    "KO": ["Coreano", "🇰🇷"], 
    "TR": ["Turco", "🇹🇷"],  
    "VI": ["Vietnamita", "🇻🇳"], 
    "BN": ["Bengalí", "🇧🇩"], 
    "ID": ["Indonesio", "🇮🇩"], 
    "SV": ["Sueco", "🇸🇪"],  
    "NL": ["Holandés", "🇳🇱"], 
    "EL": ["Griego", "🇬🇷"], 
    "HE": ["Hebreo", "🇮🇱"],  
    "UNKNOWN":["No reconocido", "🏴"]
}


export interface ClientData {
    id:number
    contact_business_id: number
    name: string
    language: string
    phone_number?: string
    email_address?: string
    instagram_username?: string
    webchat_uuid?:string
    google_business_id?:string
    rating: number
    last_interaction_at: string
    created_at: string
    notes: string
    labels: string
    is_blocked:boolean
  }
export interface Clients {
    'total_clients':number
    'page_index':number
    'page_data':ClientData[]
}

//CONTACT BUSINESSSES TABLE
export const columnsBusinessesMap: ColumnsMap = {
    name: ["Nombre", 200],
    labels: ["Etiquetas", 350],
    created_at: ["Creado", 150],
    last_interaction_at: ["Última interacción", 150],
    notes: ["Notas", 350],

 }

export interface ContactBusinessesTable {
    'id':number
    'name': string
    'domain':string
    'labels': string
    'created_at':string
    'last_interaction_at': string
    'notes': string
  }

export interface ContactBusinessesProps {
    'total_contact_businesses':number
    'page_data':ContactBusinessesTable[]
}
export interface ContactBusiness {
    'name': string
    'notes': string
    'labels': string
    'created_at':string
    'last_interaction_at': string
}

//MESSAGES
export type MessagesProps = {
    id:number
    timestamp:string
    sender_type:number
    type:string
    content:any
}
export type MessagesData = {
    messages:MessagesProps[]
    extracted_data:{[key:string]:any} |  null
    scheduled_messages:MessagesProps[]
}

//STATES MAP
export const statesMap = 
{
    'new':['Nuevo', 'gray.400', 'gray.500'],
    'open':['Abierto', 'red.500', 'red.600'],
    'pending':['Pendiente','blue.500', 'blue.600',],
    'solved':['Resuelto','green.400', 'green.500'],
    'closed':['Cerrado','gray.700', 'gray.800']
}

//FILTERS AND MAPPING
export type Channels = 'email' | 'whatsapp' | 'instagram' | 'webchat' | 'google_business'
export const logosMap:{[key in Channels]: [string, IconType, string]} = 
    {
        'email':['Mail', IoMdMail, 'red.600'],
        'webchat':['Web',IoChatboxEllipses, 'cyan.400'], 
        'whatsapp':['Whatsapp',IoLogoWhatsapp, 'green'], 
        'instagram': ['Instagram', AiFillInstagram, 'pink.700'], 
        'google_business':['Google Business', IoLogoGoogle, 'blue.400'],
    }
export type ContactChannel = 'email_address' | 'phone_number' |  'instagram_username' | 'webchat_uuid' |  'google_business_id'
export const contactDicRegex:{[key in ContactChannel]:[string, RegExp, number, Channels]} = {
    'email_address': ['Mail', /^[\w\.-]+@[\w\.-]+\.\w+$/, 50, 'email'],
    'phone_number': ['Teléfono', /^\+?\d{1,15}$/, 16, 'whatsapp'],
    'instagram_username': ['Instagram', /^[a-zA-Z0-9._]{1,30}$/, 30, 'instagram'],
    'webchat_uuid': ['Web Id', /^[a-zA-Z0-9._-]{1,40}$/, 40, 'webchat'],
    'google_business_id':['Google Business', /^[a-zA-Z0-9._-]{1,40}$/, 40, 'google_business']
  }

//SETTINGS
export type IconKey = 'organization' | 'people' | 'channels' | 'integrations' | 'main'
export type SubSectionProps = string[][]
export type SectionsListProps = {[key in IconKey]: string}

//MATILDA CONFIGURATION PROPS
export interface configProps {
    is_matilda_enabled:boolean,
    is_restricted_to_business_days:boolean,
    answer_inmediately:boolean
    maximum_seconds_to_respond:string,
    minimum_seconds_to_respond:string
    business_day_end:number
    business_day_start:number
    business_days:number[]
    notify_about_agent_transfer:boolean
    agent_transfer_message:string
    out_of_business_agent_transfer_message: string
    ask_for_requirement_confirmation:boolean
}