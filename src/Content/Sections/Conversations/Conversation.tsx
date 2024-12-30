/*
  MAIN CONVERSATION FUNCTION TO HANDLE CLIENT AND CONVERSATION INFORMATION (/conversation/{conversation_id})
*/

//REACT
import { useState, useEffect, Suspense, lazy } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useSession } from "../../../SessionContext"
import { useAuth } from "../../../AuthContext"
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from "../../API/fetchData"
//TYPING
import { Conversations, ConversationsData, ClientData, MessagesData, HeaderSectionType, ContactBusinessesTable, DeleteHeaderSectionType, Clients } from "../../Constants/typing" 
import { useAuth0 } from "@auth0/auth0-react"
 
//SECTIONS
const ConversationResponse = lazy(() => import('./ConversationResponse'))
 
//TYPING
interface ConversationProps {
  socket:any
}

//MAIN FUNCTION
function Conversation ({socket }:ConversationProps) {
    
    //TRANSLATION
    const { t } = useTranslation('conversations')
    const { getAccessTokenSilently } = useAuth0()

    //CONSTANTS
    const auth = useAuth()
    const session = useSession()
    const location = useLocation().pathname
    const navigate = useNavigate()

    //CURRENT SECTION
    const [section, setSection] = useState<'conversation' | 'client' | 'bussiness'>('conversation')
  
    //ALL CONVERSATION DATA
    const [conversationData, setConversationData] = useState<ConversationsData | null>(null)

    //GET CONVERSATIONS INFO
    const [messagesList, setMessagesList] = useState<MessagesData | null>(null)

    //SAVE USER INFO
    const [clientData, setClientData] = useState<ClientData | null>(null)
    const [clientId, setClientId] = useState<number>(-1)

    //CLIENT CONVERSATIONS
    const [clientConversations, setClientConversations] = useState<Conversations | null>(null)

    //SAVE CONTACT BUSINESS INFO
    const [businessData, setBusinessData] = useState<ContactBusinessesTable | null>(null)
    
    //BUSINESS CLIENTS
    const [businessClients, setBusinessClients] = useState<Clients | null>(null)

     //REQUEST CONVERSATIONS, CONVERSATIONS AND CLIENT INFO
    useEffect(() => { 
       const loadData = async () => {
        
        setSection('conversation')
        localStorage.setItem('currentSection', location)
        
        //FIND IF TGHE CONVERSATION IS OPENED
        const conId = parseInt(location.split('/')[location.split('/').length - 1])
        const conversationSectionData = session.sessionData.headerSectionsData
        const converElement = conversationSectionData.find(value => value.id === conId && value.type === 'conversation')
        //EDIT UNSEEEN CHANGES ON ENTER
        session.dispatch({type: 'CHANGE_UNSEEN_CHANGES', payload: conId})
        
        //CONVERSATION IS OPENED
        if (converElement) {
          setConversationData(converElement.data.conversationData)
          setMessagesList(converElement.data.messagesList)
          setClientData(converElement.data.clientData)
          if (converElement.data.clientConversations) setClientConversations(converElement.data.clientConversations)
          else {
            const reponse = await fetchData({endpoint:`${auth.authData.organizationId}/conversations`, params:{page_index:1, view_index:0,view_type:'', retrieve_exclusively_for_client:true, contact_id:converElement.data.clientData?.id}, getAccessTokenSilently, setValue:setClientConversations, auth })         
            session.dispatch({type:'UPDATE_HEADER_SECTIONS',payload:{action:'add', data:{id:conId, type:'conversation', data:{...converElement.data ,clientConversations:reponse?.data}}}})
          }
          setBusinessData(converElement.data.businessData)
          setBusinessClients(converElement.data.businessClients)
        }

        //CALL THE API AND REQUEST (CONVERSATION DATA, CONTACT BUSINESS, CLIENT DATA, CLIENT CONVERSATION AND CONTACT BUSINESS)
        else {
          const conversationResponse = await fetchData({endpoint:`${auth.authData.organizationId}/conversations/${conId}`, getAccessTokenSilently,setValue:setConversationData, auth})
          if (conversationResponse?.status === 200) {
            const data = conversationResponse?.data

            //addHeaderSection(data.title ? data.title: t('NoTitle'), data.id, 'conversation',data.local_id)
            document.title = `${t('Conversation')}: ${data.local_id} - ${auth.authData.organizationName} - Matil`
 
            socket.current.emit(JSON.stringify({event: 'open_conversation', data:{id:conversationResponse?.data.conversation_id , access_token: auth.authData.accessToken, organization_id: auth.authData.organizationId}}))
            if (data) {
           
              setClientId(conversationResponse.data.contact_id)
              setMessagesList({messages: conversationResponse.data.messages, scheduled_messages:conversationResponse.data.scheduled_messages})
    
                const clientResponse = await fetchData({endpoint:`${auth.authData.organizationId}/contacts/${conversationResponse?.data?.contact_id}`,getAccessTokenSilently, setValue:setClientData, auth })
                  
                if (clientResponse?.status === 200)
                  {
                    const conversationsResponse = await fetchData({endpoint:`${auth.authData.organizationId}/conversations`, getAccessTokenSilently,params:{page_index:1, view_index:0,view_type:'', retrieve_exclusively_for_contact:true, contact_id:clientResponse.data.id}, setValue:setClientConversations, auth })         
                    
                    let businessDict:ContactBusinessesTable = {id:-1, domain: '',name:'', notes: '', labels:'', created_at:'', last_interaction_at:''}
                    if (clientResponse.data.contact_business_id && clientResponse.data.contact_business_id !== -1)  {
                      const businessResponse = await fetchData({endpoint:`${auth.authData.organizationId}/contact_businesses/${clientResponse.data.contact_business_id}`, getAccessTokenSilently,setValue:setBusinessData, auth })
                      businessDict = businessResponse?.data
                    }
                    else setBusinessData(businessDict)
                    
                    if (conversationsResponse?.status === 200) {
                        session.dispatch({type:'UPDATE_HEADER_SECTIONS',payload:{action:'add', data:{id:conId, type:'conversation', data:{conversationData:conversationResponse.data, clientData:clientResponse.data, messagesList:{messages: conversationResponse.data.messages,  scheduled_messages:conversationResponse.data.scheduled_messages}, clientConversations:conversationsResponse?.data, businessData:businessDict}}}})
                    }
                }
            }
          }   
          else navigate('/conversations')
        }
      }
      loadData()
    }, [location])
 
    
    //FRONT
    return(
        <>
          <ConversationResponse socket={socket}  conversationData={conversationData} setConversationData={setConversationData} messagesList={messagesList}  setMessagesList={setMessagesList} clientData={clientData} setClientData={setClientData} clientId={clientId} clientConversations={clientConversations} setClientConversations={setClientConversations}/>
        </>)
}

export default Conversation