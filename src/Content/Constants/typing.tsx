//ICONS
import { IconType } from "react-icons"
import { IoMdMail, IoLogoWhatsapp } from "react-icons/io"
import { IoChatboxEllipses, IoLogoGoogle } from "react-icons/io5"
import { AiFillInstagram } from "react-icons/ai"
import { FaPhone } from "react-icons/fa"

//USER INFO AND ORGANIZATION
export interface Organization {
    id: number
    name: string
    platform_type: string
    is_admin: boolean
    calls_status:'connected' | 'out' | 'disconnected',
    avatar_image_url:string
    alias:string
    groups:{id:number, name:string}[]  
}
export interface userInfo {
    name: string
    surname: string
    organizations: Organization[]
}

//VIEWS
interface Condition {
    column: ConversationColumn
    operation_type: 'geq' | 'leq' | 'eq'
    value: any
}
interface Order {
    column: ConversationColumn
    order: string
}
export interface View {
    created_at?:string
    name?: string
    columns: ConversationColumn[]
    all_conditions: Condition[]
    any_conditions: Condition[]
    order_by: Order
}
export interface Views {
    private_views: View[]
    shared_views: View[]
    number_of_conversations_per_shared_view?:number[]
    number_of_conversations_per_private_view?:number[]
    number_of_conversations_in_bin?:number
}
export interface ViewType {type:'private' | 'shared' | 'deleted', index:number, name:string}
 

//HEADER SECTIONS
export type HeaderSectionType = (description: string, code: number, section: 'conversation' | 'client' | 'contact-business', local_id?:number) => void
export type DeleteHeaderSectionType = (element:{description: string, code: number, local_id?:number, type: string}) => void


//CONVERSATIONS TABLE
export type ConversationColumn = 
    'id'
  | 'local_id'
  | 'user_id'
  | 'channel_type'
  | 'created_at'
  | 'updated_at'
  | 'solved_at'
  | 'title'
  | 'theme'
  | 'urgency_rating'
  | 'status'
  | 'deletion_date'
  | 'unseen_changes'
  | 'closed_at'

  

type ColumnsConversationsMap = {[key in ConversationColumn]: number}
  
export const columnConversationsMap: ColumnsConversationsMap = {
    id: 50,
    local_id: 50 ,
    status:  100,
    channel_type: 150,
    theme:  200,
    user_id: 200,
    created_at: 150,
    updated_at: 150,
    solved_at: 150,
    closed_at: 150,
    title: 300,
    urgency_rating: 130,
    deletion_date: 180,
    unseen_changes: 250,
  }

export interface ConversationsTableProps {
    'id': number
    'local_id': number
    [key:string]: number | string | boolean
 }
export interface Conversations {
    'total_conversations':number
    'page_index':number
    'page_data':ConversationsTableProps[]
    'conversations_ids'?:number[]
}
export interface ClientConversationsProps{
    'status':'new' | 'open' |'solved' | 'pending' | 'closed'
    'created_at':string
    'title':string
}

//CONVERSATIONS SECTION
export interface ConversationsData {
    id: number
    local_id: number
    user_id:number
    conversation_id: number
    title: string
    channel_type: string
    created_at: string
    updated_at: string
    solved_at: string
    theme: string
    urgency_rating: number
    status: 'new' | 'open' |'solved' | 'pending' | 'closed'
    unseen_changes: boolean
    custom_attributes:{ [key: string]: any }
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
    [key:string]: number;
}

export const columnsClientsMap: ColumnsMap = {
    name: 200,
    contact: 150,
    labels: 350,
    last_interaction_at: 150,
    created_at: 150,
    rating: 60,
    language: 150,
    notes: 350,
    is_blocked: 150
 }

 export const languagesFlags: {[key: string]: [string, string]} = {
    "EN": ["English", "🇬🇧"], 
    "ES": ["Español", "🇪🇸"],  
    "EU": ["Euskara", "🇪🇸"],  
    "CA": ["Català", "🇪🇸"],  
    "GL": ["Galego", "🇪🇸"],  
    "ZH": ["中文", "🇨🇳"],  
    "HI": ["हिन्दी", "🇮🇳"], 
    "AR": ["العربية", "🇸🇦"],  
    "FR": ["Français", "🇫🇷"],  
    "RU": ["Русский", "🇷🇺"],  
    "PT": ["Português", "🇵🇹"], 
    "DE": ["Deutsch", "🇩🇪"], 
    "JA": ["日本語", "🇯🇵"],  
    "IT": ["Italiano", "🇮🇹"], 
    "KO": ["한국어", "🇰🇷"], 
    "TR": ["Türkçe", "🇹🇷"],  
    "VI": ["Tiếng Việt", "🇻🇳"], 
    "BN": ["বাংলা", "🇧🇩"], 
    "ID": ["Bahasa Indonesia", "🇮🇩"], 
    "SV": ["Svenska", "🇸🇪"],  
    "NL": ["Nederlands", "🇳🇱"], 
    "EL": ["Ελληνικά", "🇬🇷"], 
    "HE": ["עברית", "🇮🇱"],  
    "UNKNOWN": ["Unrecognized", "🏴"]
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
    custom_attributes:{ [key: string]: any }
  }
export interface Clients {
    'total_contacts':number
    'page_index':number
    'page_data':ClientData[]
}

//CONTACT BUSINESSSES TABLE
export const columnsBusinessesMap: ColumnsMap = {
    name: 200,
    labels:  350,
    created_at:  150,
    last_interaction_at:  150,
    notes: 350,
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
    name: string
    notes: string
    labels: string
    created_at:string
    last_interaction_at: string
    custom_attributes:{ [key: string]: any }
}

//FLOWS
export type FlowsColumn = 
  | 'id'
  | 'name'
  | 'description'
  | 'is_active'
  | 'number_of_channels'
  | 'created_at'
  | 'updated_at'

export interface FlowsData {
    id:number
    name: string
    description:string
    is_active: boolean
    number_of_channels:number
    created_at:string
    updated_at:string
  }
export const columnsFlowsMap: ColumnsMap = {
    name: 200,
    description:  350,
    is_active: 100,
    number_of_channels:180,
    created_at:  180,
    updated_at: 180
 }

 //FUNCTIONS
 export interface FunctionTableData  {
    uuid:string
    name:string
    description:string
    number_of_errors:number
    is_active:boolean
 }
 export interface FunctionsData {
    uuid:string
    name:string
    description:string
    code:string
    is_active:boolean
    parameters:{confirm: boolean, description:string, name: string, required: boolean, type: string, default:any, enum:any[]}[]
    channels_basic_data:{channel_type: string, display_id: string, id: string, is_active: boolean, name: string, uuid: string}[]
    errors: {message: string, line: number, timestamp: string, arguments: {name: string, type: string, value: any}[]}[] 
}

 
export type nodeTypesDefinition = 'add' | 'extractor' | 'brancher' | 'sender' | 'function' | 'terminator' | 'transfer' | 'reset' | 'flow_swap' | 'motherstructure_updates'
export type actionTypesDefinition = 'message' | 'condition' | 'extract' | 'flow_result' | 'edit_fields' | 'function'
export type Branch = {
    name:string, 
    conditions:{variable_index:number, operation:string, value:any}[],
    next_node_index:number
  }
export type FlowMessage = {
    type:'generative' | 'preespecified',
    generation_instructions:string,
    preespecified_messages:{[key: string]:string}
}

export type FieldAction = {
    motherstructure:'conversation' | 'contact' | 'contact_business'
    is_customizable:boolean
    name:string
    operation?:string
    value?:string
}
export type FunctionType = {
    uuid:string
    variable_args:{[key:string]:number}
    motherstructure_args:{[key:string]:FieldAction}
    hardcoded_args:{[key:string]:string}
    error_nodes_ids:{[key:number]:number | null}
    next_node_index:string | null
    outputs_to_variables:{[key:string]:number}
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
    scheduled_messages:MessagesProps[]
}

//STATES MAP
export const statesMap:{[key in 'new' | 'open' |'solved' | 'pending' | 'closed']: [string, string]} = 
{
    'new':['yellow.100', 'yellow.600'],
    'open':['red.100', 'red.600'],
    'pending':['cyan.100', 'cyan.600',],
    'solved':['green.100', 'green.600'],
    'closed':['gray.100', 'gray.600']
}

//FILTERS AND MAPPING
export type Channels = 'email' | 'whatsapp' | 'instagram' | 'webchat' | 'google_business' | 'phone'
export const logosMap:{[key in Channels]: [IconType, string]} = 
    { 
        'email':[ IoMdMail, 'red.600'],
        'whatsapp':[IoLogoWhatsapp, 'green'], 
        'webchat':[IoChatboxEllipses, 'cyan.400'], 
        'google_business':[ IoLogoGoogle, 'blue.400'],
        'instagram': [AiFillInstagram, 'pink.700'], 
        'phone':[ FaPhone, 'blue.400']

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
export type IconKey = 'organization' | 'users' | 'support' | 'workflows' | 'actions' | 'channels' | 'integrations' | 'main'
export type SubSectionProps = string[][]
export type SectionsListProps = {[key in IconKey]: string}

export type ActionsType = 'email_csat' |  'whatsapp_csat' | 'webchat_csat' | 'agent_email_notification' | 'motherstructure_update'
export interface ActionDataType  {
    name: string,
    description: string,
    all_conditions:FieldAction[]
    any_conditions:FieldAction[]
    actions:{type:ActionsType, arguments:any}[]
}
 
//MATILDA CONFIGURATION PROPS
export interface configProps {
    is_matilda_enabled: boolean
    tone: "professional"
    ask_if_intention_is_not_clear: boolean
    allowed_emojis: string[]
    answer_inmediately: boolean
    minimum_seconds_to_respond: number
    maximum_seconds_to_respond: number
    is_restricted_to_business_days: boolean
    business_days: number[]
    business_day_start: number
    business_day_end: number
    notify_about_agent_transfer: boolean
    agent_transfer_message: string
    out_of_business_agent_transfer_message: string
    allow_variable_confirmation: boolean
    contact_all_conditions: FieldAction[]
    contact_any_conditions: FieldAction[]

 }

//CONDITIONS TYPES
export type DataTypes = 'bool' | 'int' | 'float' | 'str' | 'timestamp' | 'list'

//CONTENT TYPES
export interface ContentData {
    uuid: string 
    type: 'internal_article' | 'public_article' | 'folder' | 'pdf' | 'snippet' | 'website' | 'subwebsite'
    title: string
    folder_uuid?:string
    description?: string
    language: string
    is_available_to_tilda: boolean
    created_at: string
    updated_at: string
    created_by: number
    updated_by: number
    tags: string[]
    is_ingested?:boolean
    public_article_help_center_collections:string[]
    public_article_common_uuid?: string
    public_article_status: 'published' | 'draft'
    content?: any,
    public_article_content?: {text: string}
    internal_article_content?: {text: string},
    pdf_content?: {url: string, text: string},
    website_content?: {pages: {url: string, text: string}}
}

//FOLDERS
export interface Folder {
    uuid: string
    name: string
    emoji:string
    disabled?:boolean
    children: Folder[]
}


