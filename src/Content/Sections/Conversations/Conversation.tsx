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
//FRONT
import { Flex, Skeleton, Text, Icon } from '@chakra-ui/react'
//COMPONENTS
import StateMap from "../../Components/Reusable/StateMap"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
import CreateBusiness from "../Businesses/CreateBusiness"
//ICONS
import { BsPersonFill } from "react-icons/bs" 
import { FaBuilding } from "react-icons/fa6"
//TYPING
import { Conversations, ConversationsData, ClientData, MessagesData, HeaderSectionType, ContactBusinessesTable, DeleteHeaderSectionType, Clients } from "../../Constants/typing" 
 
//SECTIONS
const ConversationResponse = lazy(() => import('./ConversationResponse'))
const Client = lazy(() => import('../Clients/Client'))
const Business = lazy(() => import('../Businesses/Business'))
 
//TYPING
interface ConversationProps {
  addHeaderSection:HeaderSectionType
  deleteHeaderSection: DeleteHeaderSectionType
  socket:any
}

//MAIN FUNCTION
function Conversation ({ addHeaderSection, deleteHeaderSection, socket }:ConversationProps) {
    
    //TRANSLATION
    const { t } = useTranslation('conversations')

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
            const reponse = await fetchData({endpoint:`${auth.authData.organizationId}/conversations`, params:{page_index:1, view_index:0,view_type:'', retrieve_exclusively_for_client:true, contact_id:converElement.data.clientData?.id}, setValue:setClientConversations, auth })         
            session.dispatch({type:'UPDATE_HEADER_SECTIONS',payload:{action:'add', data:{id:conId, type:'conversation', data:{...converElement.data ,clientConversations:reponse?.data}}}})
          }
          setBusinessData(converElement.data.businessData)
          setBusinessClients(converElement.data.businessClients)
        }

        //CALL THE API AND REQUEST (CONVERSATION DATA, CONTACT BUSINESS, CLIENT DATA, CLIENT CONVERSATION AND CONTACT BUSINESS)
        else {
          const conversationResponse = await fetchData({endpoint:`${auth.authData.organizationId}/conversations/${conId}`, setValue:setConversationData, auth})
          if (conversationResponse?.status === 200) {
            const data = conversationResponse?.data

            addHeaderSection(data.title ? data.title: t('NoTitle'), data.id, 'conversation',data.local_id)
            document.title = `${t('Conversation')}: ${data.local_id} - ${auth.authData.organizationName} - Matil`
 
            socket.current.emit(JSON.stringify({event: 'open_conversation', data:{id:conversationResponse?.data.conversation_id , access_token: auth.authData.accessToken, organization_id: auth.authData.organizationId}}))
            if (data) {
           
              setClientId(conversationResponse.data.contact_id)
              setMessagesList({messages: conversationResponse.data.messages, scheduled_messages:conversationResponse.data.scheduled_messages})
    
                const clientResponse = await fetchData({endpoint:`${auth.authData.organizationId}/contacts/${conversationResponse?.data?.contact_id}`, setValue:setClientData, auth })
                  
                if (clientResponse?.status === 200)
                  {
                    const conversationsResponse = await fetchData({endpoint:`${auth.authData.organizationId}/conversations`, params:{page_index:1, view_index:0,view_type:'', retrieve_exclusively_for_contact:true, contact_id:clientResponse.data.id}, setValue:setClientConversations, auth })         
                    
                    let businessDict:ContactBusinessesTable = {id:-1, domain: '',name:'', notes: '', labels:'', created_at:'', last_interaction_at:''}
                    if (clientResponse.data.contact_business_id && clientResponse.data.contact_business_id !== -1)  {
                      const businessResponse = await fetchData({endpoint:`${auth.authData.organizationId}/contact_businesses/${clientResponse.data.contact_business_id}`, setValue:setBusinessData, auth })
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
 
    //CREATE A NEW CONTACT BUSINESS, FOR AN EXISTING CLIENT
    const handleCreateContactBusiness = async (new_data:ContactBusinessesTable) => {
      setBusinessData(new_data)
      const newClientData = {...clientData as ClientData, contact_business_id:new_data?.id }
      const updateResponse = await fetchData({endpoint:`${auth.authData.organizationId}/contacts/${clientData?.id}`, auth:auth, requestForm:newClientData, method:'put'})
      if (updateResponse?.status === 200) setClientData(newClientData)
    }

    //FRONT
    return(
        <>
        <Flex overflowX={'scroll'} width={'calc(100vw - 55px)'} px='30px' height='60px' bg='#e8e8e8' borderBottomWidth={'1px'} borderBottomColor='gray.200' flex='1' alignItems={'center'} >
            <Flex borderRadius={'.3rem'} height={'70%'}  alignItems={'center'} borderWidth={'1px 1px 1px 1px'}  borderColor='gray.300'> 
                
                <Flex alignItems='center' gap='6px'onClick={() => setSection('bussiness')}    cursor={'pointer'}  bg={section === 'bussiness' ?  'brand.blue_hover':'transparent' } height={'100%'}  borderRightWidth={'1px'} borderRightColor='gray.300'  px={{md:'10px',lg:'20px'}}> 
                    <Icon as={FaBuilding} boxSize={'14px'} />
                    <Skeleton isLoaded={businessData !== null}> <Text whiteSpace={'nowrap'} fontSize={{md:'.8em',lg:'1em'}} >{businessData?.id === -1?t('NoBusiness'):businessData?.name}</Text></Skeleton>
                </Flex> 
                <Flex alignItems='center' gap='6px'  onClick={() => setSection('client')} cursor={'pointer'}  bg={section === 'client' ?  'brand.blue_hover':'transparent'} height={'100%'} borderRightWidth={'1px'} borderRightColor='gray.300'  px={{md:'10px',lg:'20px'}}> 
                    <Icon as={BsPersonFill} boxSize={'17px'} />
                    <Skeleton isLoaded={clientData !== null}> <Text whiteSpace={'nowrap'} fontSize={{md:'.8em',lg:'1em'}} >{clientData?.name === ''? t('WebClient'):clientData?.name}</Text></Skeleton>
                </Flex> 
                <Flex cursor='pointer' px={{md:'10px',lg:'20px'}} gap='8px' onClick={() => setSection('conversation')} bg={section === 'conversation' ? 'brand.blue_hover': 'transparent' } height={'100%'} alignItems={'center'}> 
                  <Skeleton isLoaded={conversationData !== null}>
                    {conversationData?.status && <StateMap state={conversationData.status}/>}
                  </Skeleton>
                  <Skeleton isLoaded={!conversationData !== null}>
                    <Text  whiteSpace={'nowrap'} fontSize={{md:'.8em',lg:'1em'}} color='gray.600'>{conversationData?.theme} #{conversationData?.local_id}</Text>
                  </Skeleton>
                </Flex>
            </Flex>
        </Flex>

        <Suspense fallback={<></>}>    
          {section === 'conversation' ?
              <ConversationResponse socket={socket}  conversationData={conversationData} setConversationData={setConversationData} messagesList={messagesList}  setMessagesList={setMessagesList} clientData={clientData} setClientData={setClientData} clientId={clientId} clientConversations={clientConversations} setClientConversations={setClientConversations} deleteHeaderSection={deleteHeaderSection}/>
            :
            <> 
              {section === 'client'?
                <Client socket={socket} comesFromConversation={true} addHeaderSection={addHeaderSection} deleteHeaderSection={deleteHeaderSection} 
                clientData={clientData} setClientData={setClientData} 
                clientConversations={clientConversations} setClientConversations={setClientConversations} 
                businessData={businessData} setBusinessData={setBusinessData} 
                businessClients={businessClients} setBusinessClients={setBusinessClients}  />
                :<>
                  {(businessData?.id !== -1) ? 
                  <Business  socket={socket} comesFromConversation={true} businessData={businessData} setBusinessData={setBusinessData} businessClients={businessClients} setBusinessClients={setBusinessClients}  addHeaderSection={addHeaderSection}/>
                  :
                  <ConfirmBox setShowBox={(key:boolean) => setSection('conversation')}> 
                      <CreateBusiness setShowBox={(key:boolean) => setSection('conversation')} actionTrigger={(data:any) => handleCreateContactBusiness(data)}/>
                  </ConfirmBox>
                  }</>
              
              }
            </>
          }
        </Suspense>
    
        </>
  
        )
}

export default Conversation