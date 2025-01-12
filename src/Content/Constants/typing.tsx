//ICONS
import { IconType } from "react-icons"
import { IoMdMail, IoLogoWhatsapp } from "react-icons/io"
import { IoChatboxEllipses, IoLogoGoogle } from "react-icons/io5"
import { AiFillInstagram } from "react-icons/ai"
import { FaPhone } from "react-icons/fa"
import { FaCloud } from "react-icons/fa6"

 
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
export interface Condition {
    column: ConversationColumn
    operation_type: string
    value: any
    is_customizable:boolean
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
  | 'deletion_scheduled_at'
  | 'unseen_changes'
  | 'closed_at'
  | 'call_status'
  | 'call_duration'

  

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
    deletion_scheduled_at: 180,
    unseen_changes: 250,
    call_status:100,
    call_duration:70
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
    user_id:string
    conversation_id: number
    title: string
    channel_id: string
    created_at: string
    updated_at: string
    solved_at: string
    theme: string
    urgency_rating: number
    status: 'new' | 'open' |'solved' | 'pending' | 'closed'
    unseen_changes: boolean
    call_status:'ongoing' | 'completed'
    call_duration:number
    call_url:string
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

 //FUNCTIONS
 export interface FunctionTableData  {
    uuid:string
    name:string
    description:string
    number_of_errors:number
    is_active:boolean
    icon:string
 }
 export interface FunctionsData {
    uuid:string
    name:string
    description:string
    code:string
    is_active:boolean
    parameters:{confirm: boolean, description:string, name: string, required: boolean, type: string, default:any, enum:any[]}[]
    matilda_configurations_uuids:string[]
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
    motherstructure:'conversation' | 'contact' | 'contact_business' | 'custom'
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
    sender_type:string
    type:string
    content:any
}
export type MessagesData = {
    messages:MessagesProps[]
    scheduled_messages:MessagesProps[]
}

//STATES MAP
export const statesMap:{[key in 'new' | 'open' |'solved' | 'pending' | 'closed' | 'ongoing' | 'completed']: [string, string]} = 
{
    'new':['yellow.100', '#B7791F'],
    'completed':['green.100', '#2F855A'],
    'ongoing':['cyan.100', '#00A3C4'],
    'open':['red.200', '#C53030'],
    'pending':['blue.100', '#00A3C4',],
    'solved':['#B7F1CB', '#2F855A'],
    'closed':['gray.200', '#4A5568']
}

//FILTERS AND MAPPING
export type Channels = 'email' | 'whatsapp' | 'instagram' | 'webchat' | 'google_business' | 'phone' | 'voip'
export const logosMap:{[key in Channels]: [IconType, string]} = 
    { 
        'email':[ IoMdMail, 'red.600'],
        'whatsapp':[IoLogoWhatsapp, 'green'], 
        'webchat':[IoChatboxEllipses, 'cyan.400'], 
        'google_business':[ IoLogoGoogle, 'blue.400'],
        'instagram': [AiFillInstagram, 'pink.700'], 
        'phone':[ FaPhone, 'blue.400'],
        'voip':[ FaCloud, 'blue.400']

    }
export type ContactChannel = 'email_address' | 'phone_number' |  'instagram_username' | 'webchat_uuid' |  'google_business_id'
export const contactDicRegex:{[key in ContactChannel]:[RegExp, number, Channels]} = {
    'email_address': [ /^[\w\.-]+@[\w\.-]+\.\w+$/, 50, 'email'],
    'phone_number': [/^\+?\d{1,15}$/, 16, 'whatsapp'],
    'instagram_username': [ /^[a-zA-Z0-9._]{1,30}$/, 30, 'instagram'],
    'webchat_uuid': [/^[a-zA-Z0-9._-]{1,40}$/, 40, 'webchat'],
    'google_business_id':[ /^[a-zA-Z0-9._-]{1,40}$/, 40, 'google_business']
  }

//SETTINGS
export type IconKey = 'organization' | 'users' | 'help-centers' | 'workflows' | 'actions' | 'channels' | 'tilda' | 'integrations' | 'main' 
export type SubSectionProps = (string[][] | any)
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
 
export interface MatildaConfigProps {
    uuid:string 
    name:string 
    description:string
    introduce_assistant:boolean
    assistant_name:string
    base_system_prompt:string 
    tone: string
    allowed_emojis: string[]
    allow_sources:boolean 
    help_center_id:string 
    allow_agent_transfer:boolean
    business_hours_agent_transfer_message:string
    non_business_hours_agent_transfer_message:string
    delay_response:boolean
    minimum_seconds_to_respond: number
    maximum_seconds_to_respond: number
    all_conditions: FieldAction[]
    any_conditions: FieldAction[]
    channel_ids:string[]
    functions_uuids:string[]
    help_centers_ids:string[]
 }

//CONDITIONS TYPES
export type DataTypes = 'bool' | 'int' | 'float' | 'str' | 'timestamp' | 'list'

//CONTENT TYPES
export interface ContentData {
    uuid: string 
    type: 'internal_article' | 'public_article' | 'folder' | 'pdf' | 'snippet' | 'website' | 'subwebsite'
    title: string
    folder_uuid?:string | null
    description?: string
    language: string
    is_available_to_tilda: boolean
    created_at: string
    updated_at: string
    created_by: string
    updated_by: string
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

/*STATS */
export type metrics = 'total_conversations' | 'average_response_time' | 'total_messages' | 'csat_score' | 'nps_score' | 'conversations_with_tilda_involvement' | 'tilda_messages_sent' | 'tilda_words_sent' | 'total_solved_conversations' 
export interface MetricType {
    uuid: string
    report_chart_uuid: string
    metric_name: metrics
    aggregation_type: 'sum' | 'avg' | 'median' | 'count' | 'min' | 'max' 
    legend_label: string
    configurations: {[key:string]:any}
    filter_conjunction: 'AND' | 'OR'
    filters: {field_name: string, operator: 'eq' | 'neq' | 'geq' | 'leq' | 'in' | 'nin' | 'l' | 'g', value: any}[]
}

export interface ChartType   {
    uuid: string
    report_uuid: string
    type: 'KPI' | 'column' | 'bar' | 'donut' | 'line' | 'area' | 'table'
    title: string
    date_range_type: 'relative' | 'fixed'
    date_range_value: string
    view_by: {type: 'time' | 'channel_type' |  'theme' | 'user_id' | 'channel_id' | 'status' | 'urgency_rating' | 'is_transferred', configuration:any}
    segment_by: {type:null | 'time' | 'channel_type' |  'theme' | 'user_id' | 'channel_id' | 'status' | 'urgency_rating' | 'is_transferred',  configuration:any}
    timezone?: string
    configuration: {x:number, y:number, h:number, w:number, [key:string]:any},
    metrics: MetricType[]
    data: {[key:string]:any}[]
  }


export interface ReportDataType {
    uuid: string
    name: string
    icon:string
    description: string
    user_id: string
    organization_id: number
    created_at: string
    updated_at: string
  }
export interface ReportType {
    uuid: string
    name: string
    description: string
    user_id: string
    organization_id: number
    created_at: string
    updated_at: string
    charts:ChartType[]
    chart_positions:{[key:string]:{x:number, y:number, w:number, h:number}}
  }

export interface ConfigProps { 
    uuid:string 
    name:string 
    description:string 
    channels_ids:string[]
}

  
 
export interface ChannelsType  {
    id: string
    uuid: string
    display_id: string
    name: string
    channel_type: string
    is_active: boolean
}

  