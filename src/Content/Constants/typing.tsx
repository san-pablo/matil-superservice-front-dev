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

export type sectionsType = 'conversations' | 'persons' | 'businesses' | 'functions' | 'reports' | 'sources'

//VIEWS DEFINITION 
export type FilterType = {logic:'AND' | 'OR', groups:{logic:'AND' | 'OR', conditions:{col:string, op:string, val:any}[]}[] }
export type ViewDefinitionType =  {id:string, name:string, is_standard?:boolean, icon:{type:'emoji' | 'icon' | 'image', data:string}, model:sectionsType, sort?:{column: string, order:'asc' | 'desc'}[], filters:FilterType, superconditions?:{col:string, op:string, val:any}[]}
export type defaultViewsType = 'my_inbox' | 'mentions' |  'all' | 'unassigned' | 'matilda' | 'bin' | 'created_by_me'
export type sectionPathType = { id: string; name?: string; icon?: { type: 'emoji' | 'icon' | 'image'; data: string } }[] 

//CONVERSATIONS TABLE
export type ConversationColumn = 
  | 'local_id'
  | 'user_id'
  | 'channel_type'
  | 'created_at'
  | 'updated_at'
  | 'solved_at'
  | 'title'
  | 'theme_id'
  | 'unseen_changes'
  | 'closed_at'
  | 'call_status'
  | 'call_duration'
  | 'tags'
  | 'team_id'
  | 'created_by'
  | 'deletion_scheduled_at'
  | 'move_to_bin_at'




export interface ConversationsTableProps {
    'id': number
    'local_id': number
    [key:string]: number | string | boolean
 }
export interface Conversations {
    'total_items':number
    'page_index':number
    'page_data':ConversationsTableProps[]
    'conversations_ids'?:number[]
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
    is_matilda_engaged:boolean
    updated_at: string
    solved_at: string
    theme_id: string
    urgency_rating: number
    tags:string[]
    status: 'new' | 'open' |'solved' | 'pending' | 'closed'
    unseen_changes: boolean
    call_status:'ongoing' | 'completed'
    call_duration:number
    call_url:string
    team_id:string
    created_by:string
    is_closed:boolean
    cdas:{ [key: string]: any }
}


//CLIENTS TABLE
export type ClientColumn = 
  | 'id'
  | 'business_id'
  | 'created_at'
  | 'name'
  | 'language'
  | 'waba_id'
  | 'phone_number'
  | 'email_address'
  | 'instagram_username'
  | 'google_business_review_id'
  | 'webchat_id'
  | 'last_interaction_at'
  | 'rating'
  | 'notes'
  | 'tags'
  | 'is_blocked'
  | 'updated_at'



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
    business_id: number
    name: string
    language: string
    phone_number?: string
    email_address?: string
    instagram_username?: string
    webchat_id?:string
    google_business_id?:string
    rating: number
    last_interaction_at: string
    created_at: string
    notes: string
    tags: string[]
    is_blocked:boolean
    cdas:{ [key: string]: any }
  }
export interface Clients {
    total_items:number
    page_index:number
    page_data:ClientData[]
}

//CONTACT BUSINESSSES TABLE
export interface ContactBusinessesTable {
    id:number
    name: string
    domain:string
    tags: string[]
    created_at:string
    last_interaction_at: string
    notes: string
    is_blocked:boolean
    cdas:{ [key: string]: any }
}
export interface ContactBusinessesProps {
    total_items:number
    page_data:ContactBusinessesTable[]
}
export interface ContactBusiness {
    name: string
    notes: string
    tags: string[]
    created_at:string
    last_interaction_at: string
    is_blocked:boolean
    cdas:{ [key: string]: any }
}

 //FUNCTIONS
 export interface FunctionTableData  {
    id:string
    name:string
    description:string
    is_active:boolean
  }
 export interface FunctionsData {
    id:string
    name:string
    description:string
    code:string
    is_compiled:boolean
    parameters:parameterType[]
    created_by:string
    updated_by:string
    created_at:string
    updated_at:string
}
export interface FlowData { 
    id:string
    matilda_configurations_ids:string[]
    name:string
    description:string
    organization_id:number
    created_by:string
    updated_by:string
    created_at:string
    updated_at:string
    is_active:boolean
    versions:{id:string, name:string, is_production:boolean}[]
}
export interface VersionData { 
    id:string
    name:string
    function_id:string
    description:string
    created_by:string
    updated_by:string
    created_at:string
    updated_at:string
    is_flow_valid:boolean
    flow_errors:string[]
    is_production:boolean
    blocks:any
    flow:any
}


export type nodeTypesDefinition = 'function' | 'add'
export type actionTypesDefinition = 'function' | 'flow' | 'condition' | 'param' | 'code' | 'variable'
export type parameterType = {confirm: boolean, description:string, name: string, required: boolean, type: string, enum:any[]}
export interface LogsType  {
    function_id: string
    occurred_at: string
    successful: boolean
    execution_time_ms: number
    memory_usage_kb: number
    result: any
    arguments:any
}
export interface ErrorsType {
    function_id: string
    occurred_at: string
    id:string
    description: string
    line:number
    arguments:any
}

export type Branch = {name:string, next_node_index:number, group:{logic:'AND' | 'OR', conditions:{var:string, op:string, val:any}[]} }
export type FunctionNodeData = {   
    id:string 
    name:string
    description:string
    code:string
    is_compiled:boolean
    parameters:parameterType[]
    variables:{name:string, type:string}[]
    errors:ErrorsType[]
    logs:LogsType[]
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
    'closed':['border_color', '#4A5568']
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
export type ContactChannel = 'email_address' | 'phone_number' |  'instagram_username' | 'webchat_id' |  'google_business_id'
export const contactDicRegex:{[key in ContactChannel]:[RegExp, number, Channels, IconType]} = {
    'email_address': [ /^[\w\.-]+@[\w\.-]+\.\w+$/, 50, 'email', IoMdMail],
    'phone_number': [/^\+?\d{1,15}$/, 16, 'whatsapp', IoLogoWhatsapp],
    'instagram_username': [ /^[a-zA-Z0-9._]{1,30}$/, 30, 'instagram', AiFillInstagram],
    'webchat_id': [/^[a-zA-Z0-9._-]{1,40}$/, 40, 'webchat', IoChatboxEllipses],
    'google_business_id':[ /^[a-zA-Z0-9._-]{1,40}$/, 40, 'google_business', IoLogoGoogle]
  }

//SETTINGS
export type IconKey = 'organization' | 'user' | 'help-centers' | 'workflows' | 'actions' | 'channels' | 'tilda' | 'integrations' | 'main' 
export type SubSectionProps = (string[][] | any)
export type SectionsListProps = {[key in IconKey]: string}

export type ActionsType = 'email_csat' |  'whatsapp_csat' | 'webchat_csat' | 'agent_email_notification' | 'motherstructure_update'
export interface ActionDataType  {
    name: string,
    description: string,
    filters: FilterType
    actions:{type:ActionsType, arguments:any}[]
}
 
//MATILDA CONFIGURATION PROPS
 
export interface MatildaConfigProps {
    id:string 
    name:string 
    description:string
    introduce_assistant:boolean
    assistant_name:string
    tone: string
    allowed_emojis: string[]
    allow_sources:boolean 

    allow_agent_transfer:boolean
    direct_transfer:boolean
    transfer_to:string

    business_hours_agent_transfer_message:string
    non_business_hours_agent_transfer_message:string
    delay_response:boolean
    minimum_seconds_to_respond: number
    maximum_seconds_to_respond: number
    conversation_filters: FilterType
    person_filters: FilterType
    business_filters: FilterType
    channel_ids?:string[]
    functions_ids?:string[]
    help_centers_ids?:string[]
    sources_description:string
 }

//CONDITIONS TYPES
export type DataTypes = 'bool' | 'int' | 'float' | 'str' | 'timestamp' | 'list'

//CONTENT TYPES
export type InternalArticleSource = { raw_text: string; text: string };
export type PublicArticleSource = { status: 'draft' | 'published';  raw_text: string; text: string };
type WebsiteSource = { url: string; webpage_count: number };
type WebpageSource = { website_url: string; url: string; raw_text: string; text: string };
type SnippetSource = { text: string; raw_text: string };
type DocumentSource = { url: string; file_name: string; file_size: number; text: string };
type SourceTypeMap = {
    internal_article: InternalArticleSource
    public_article: PublicArticleSource
    website: WebsiteSource
    webpage: WebpageSource
    snippet: SnippetSource
    document: DocumentSource
}
type SourceType = {status:'draft' | 'published', raw_text:string, text:string} | {raw_text:string, text:string} | {url:string, webpage_count:number} | {website_url:string, url:string, raw_text:string, text:string} | {text:string, raw_text:string} | {url:string, file_name:string, file_size:number,  text:string}
export interface ContentData<T extends keyof SourceTypeMap = keyof SourceTypeMap> {
    id: string 
    common_id:string,
    type: 'internal_article' | 'public_article' | 'document' | 'snippet' | 'website' | 'webpage'
    title: string
    description?: string
    language: string
    is_available_to_tilda: boolean
    created_at: string
    updated_at: string
    created_by: string
    updated_by: string
    is_ingested?:boolean
    tags: string[]
    data: SourceTypeMap[T]
}
 

/*STATS */
export type metrics = 'total_conversations' | 'average_response_time' | 'total_messages' | 'csat_score' | 'nps_score' | 'conversations_with_tilda_involvement' | 'tilda_messages_sent' | 'tilda_words_sent' | 'total_solved_conversations' 
export interface MetricType {
    id: string
    report_chart_id: string
    metric_name: metrics
    aggregation_type: 'sum' | 'avg' | 'median' | 'count' | 'min' | 'max' 
    legend_label: string
    configurations: {[key:string]:any}
    filters: FilterType
}

export interface ChartType   {
    id: string
    report_id: string
    type: 'KPI' | 'column' | 'bar' | 'donut' | 'line' | 'area' | 'table'
    title: string
    date_range_type: 'relative' | 'fixed'
    date_range_value: string
    view_by: {type: 'time' | 'channel_type' |  'theme_id' | 'user_id' | 'channel_id' |  'is_transferred', configuration:any}
    segment_by: {type:null | 'time' | 'channel_type' |  'theme_id' | 'user_id' | 'channel_id' | 'is_transferred',  configuration:any}
    timezone?: string
    configuration: {x:number, y:number, h:number, w:number, [key:string]:any},
    metrics: MetricType[]
    data: {[key:string]:any}[]
  }


export interface ReportDataType {
    id: string
    name: string
    icon:string
    description: string
    user_id: string
    organization_id: number
    created_at: string
    updated_at: string
  }
export interface ReportType {
    id: string
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
    id:string 
    name:string 
    description:string 
    channels_ids:string[]
}
export interface ChannelsType  {
    id: string
    display_id: string
    name: string
    channel_type: string
    is_active: boolean
}

export interface CDAsType {
    id:string
    structure: 'conversations' | 'persons' | 'businesses'
    type: 'boolean' | 'integer' | 'number' | 'string' | 'array'
    name: string
    description: string 
    allowed_values: any[]
    created_by: string
    created_at: string
    archived_at: string | null,
    is_archived: boolean
}

export interface TagsType {
    id: string
    organization_id: number
    name:string
    description:string
    conversations_affected:number
    persons_affected:number
    businesses_affected:number
    created_by:string
    created_at:string
    archived_at:string | null
    is_archived:boolean
}
  
export interface SectionType  {
    allowed_urls:string[]
    allowed_devices:string[]
    lure_by_seconds:boolean 
    seconds_to_lure_in:number 
    lure_by_click:boolean 
    show_incoming_messages:boolean,
    reference_to_lure_in:string 
    pages_references:{[key:string]:string}
    initial_message:{[key:string]:string} 
    options:{[key:string]:string[]}
}


export interface ChatBotData  {
    welcome_message:{[key:string]:string}
    chat_position:'right' | 'left'
    actions_color:string
    messages_opacity:number | string
    bot_name:string
    mesh_colors:[string, string]
    ai_message:{[key:string]:string}
    header_background: [string, string]
    header_color: string
    chat_avatar: string
    client_background: [string, string]
    client_color: string
    options: {[key:string]:string[]}
    sections: SectionType[]
}


 
//ALL FILTERS LOGIC
export const allowedConversationFilters = ['local_id', 'user_id', 'contact_id', 'theme_id', 'team_id', 'created_at', 'updated_at', 'solved_at', 'closed_at', 'created_by', 'channel_type', 'channel_id', 'title', 'tags', 'unseen_changes','is_matilda_engaged','is_csat_offered']
export const allowedContactsFilters = ['id', 'business_id', 'created_at', 'last_interaction_at', 'name', 'language', 'phone_number','email_address','instagram_username','instagram_followers','webchat_id','notes','tags','is_blocked']
export const allowedBusinessFilters = ['id', 'created_at', 'last_interaction_at', 'name', 'domain', 'notes', 'tags', 'is_blocked']
 
export const typesMap = {
    'boolean':['eq', 'neq', 'exists'], 
    'integer':['eq','neq', 'leq', 'geq',  'exists'], 
    'number':['eq','neq', 'leq', 'geq',   'exists'],
    'string': ['eq','neq', 'contains', 'ncontains','starts_with', 'ends_with', 'exists'], 
    'array': ['in', 'nin',  'exists'], 
    'timestamp':['eq', 'neq', 'leq', 'geq', 'between', 'exists']
}

 
export type searchSectionType = 'conversations' | 'persons' | 'businesses' | 'reports' | 'functions' | 'sources' | 'navigate' | 'assign' | null