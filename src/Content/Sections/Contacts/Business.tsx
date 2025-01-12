/*
    MAIN CLIENT FUNCTION 
*/

import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent, Dispatch, SetStateAction } from "react"
import { useAuth } from "../../../AuthContext"
import { useSession } from "../../../SessionContext"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import DOMPurify from 'dompurify'
//FRONT
import { Flex, Box, Text, Icon, Textarea, Avatar, Skeleton, IconButton, Tooltip } from '@chakra-ui/react'
//FETCH DATA
import fetchData from "../../API/fetchData"
//COMPONENTS
import Table from "../../Components/Reusable/Table"
import EditText from "../../Components/Reusable/EditText"
//FUNCTIONS
import timeAgo from "../../Functions/timeAgo"
import timeStampToDate from "../../Functions/timeStampToString"
//ICONS
import { PiSidebarSimpleBold } from "react-icons/pi"
import { RxCross2 } from "react-icons/rx"
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io"
//TYPING
import { Clients, ContactBusinessesTable, Channels, ClientColumn, languagesFlags } from "../../Constants/typing"
import { useAuth0 } from "@auth0/auth0-react"
 
//GET THE CELL STYLE
const CellStyle = ({ column, element }:{column:string, element:any}) => {
     
    //TRANSLATION
    const { t } = useTranslation('clients')
    const t_formats = useTranslation('formats').t

    if (column === 'created_at' ||  column === 'last_interaction_at' )  
    return(
        <Tooltip label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='.8em' p='6px'> 
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
    else if (column === 'labels') {
        return(<> 
        <Flex minH={'35px'} alignItems={'center'}> 
        {element === ''? <Text>-</Text>:
            <Flex gap='5px' flexWrap={'wrap'}>
                {element.split(',').map((label:string, index:number) => (
                    <Flex bg='brand.gray_2' borderColor={'gray.300'} borderWidth={'1px'} p='4px' borderRadius={'.5rem'} fontSize={'.8em'} key={`client-label-${index}`}>
                        <Text>{label}</Text>
                    </Flex>
                ))}
            </Flex>
        }
        </Flex>
    </>)
    }
    else if (column === 'language') {
        return(
        <Flex gap='5px' alignItems={'center'}>
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][0]:'No detectado'}</Text>
            <Text fontSize={'.8em'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][1]:'🏴󠁥󠁳󠁣󠁴󠁿'}</Text>
            </Flex>)
    }   
    else if (column === 'is_blocked') return <Text color={element?'red':'black'}>{element?t('is_blocked'):t('Active')}</Text>  
    else return ( <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'}  fontWeight={column === 'name'?'medium':'normal'}  overflow={'hidden'} >{element === ''?'-':element}</Text>)
}
 
//MAIN FUNCTION
function Business ({socket}: {socket:any}) {
    
    //CONSTANTS
    const auth = useAuth()
    const session = useSession()
    const location = useLocation().pathname
    const navigate = useNavigate()
    const { t } = useTranslation('businesses')
    const t_formats = useTranslation('formats').t
    const t_clients = useTranslation('clients').t
    const { getAccessTokenSilently } = useAuth0()

    const columnsClientsMap:{[key:string]:[string, number]} = {name: [t_clients('name'), 200], contact: [t_clients('contact'), 150], labels: [t_clients('labels'), 350], last_interaction_at: [t_clients('last_interaction_at'), 150], created_at: [t_clients('created_at'), 150], rating: [t_clients('rating'), 60], language: [t_clients('language'), 150], notes: [t_clients('notes'), 350], is_blocked: [t_clients('is_blocked'), 150]}

    //SCROLL REFS
    const scrollRef1 = useRef<HTMLDivElement>(null)

    //WEBSOCKET ACTIONS, THEY TRIGEGR ONLY IF THE USER IS INSIDE THE SECTION
    useEffect(() => {
        socket?.current.on('business_contact', (data:any) => {
        if (data?.is_new){
            setBusinessDataEdit(data.data)
        }
    })},[])

    //BUSINESS DATA
    const [businessDataEdit, setBusinessDataEdit] = useState<ContactBusinessesTable | null>( null)
    const businessDataEditRef = useRef<ContactBusinessesTable | null>( null)
     
    //TABLE OF CLIENTS
    const [businessClientsEdit, setBusinessClientsEdit] = useState<Clients | null>( null)
    const [clientsFilters, setClientsFilters ] = useState<{page_index:number, channel_types:Channels[], sort_by?:ClientColumn , search?:string, order?:'asc' | 'desc'}>({page_index:1, channel_types:[]}) 
    
    //REQUEST CLIENT, CONVERSATIONS AND CLIENT INFO
    useEffect(() => { 
        const loadData = async () => {

    
            //FIND BUSINESS ELEMENT IN SECTIONS
            const businessId = parseInt(location.split('/')[location.split('/').length - 1])
            const headerSectionsData = session.sessionData.headerSectionsData
            const businessElement = headerSectionsData.find(value => value.id === businessId && value.type === 'business')
                
             //SET TITLE
            document.title = `${t('Business')}: ${location.split('/')[location.split('/').length - 1]} - ${auth.authData.organizationName} - Matil`
            localStorage.setItem('currentSection', `/contacts/businesses/${businessId}`)

            //SET DATA IF BUSINESS FOUND
            if (businessElement && businessElement.data.businessData ) {
                setBusinessDataEdit(businessElement.data.businessData)
                businessDataEditRef.current = businessElement.data.businessData
                if (businessElement.data.businessClients) setBusinessClientsEdit(businessElement.data.businessClients)
                else {
                    const businessClientsResponse = await fetchData({endpoint:`${auth.authData.organizationId}/contacts`,getAccessTokenSilently, params:{page_index:1, contact_business_id:businessElement.data.businessData.id}, setValue:setBusinessClientsEdit, auth })
                }
            }

            //FETCH THE DATA
            else {
                const businessResponse = await fetchData({endpoint:`${auth.authData.organizationId}/contact_businesses/${businessId}`, getAccessTokenSilently,setValue:setBusinessDataEdit,  auth})    

                if (businessResponse?.status === 200 ) {
                    const businessClientsResponse = await fetchData({endpoint:`${auth.authData.organizationId}/contacts`,getAccessTokenSilently, params:{page_index:1, contact_business_id:businessResponse.data.id}, setValue:setBusinessClientsEdit, auth })
                    businessDataEditRef.current = businessResponse?.data
                    session.dispatch({type:'UPDATE_HEADER_SECTIONS',payload:{action:'add', data:{type:'business', id: businessId, data:{businessData:businessResponse?.data, businessClients:businessClientsResponse?.data} }}})
                }
                else navigate('/contacts/businesses')
                
            }
            
          
        }
        loadData()
        }, [location])
  
    //UPDATE CLIENTS TABLE
    const updateTable = async(applied_filters:{page_index:number, channel_types:Channels[], sort_by?:ClientColumn , search?:string, order?:'asc' | 'desc'} | null) => {

        let filtersToSend = applied_filters ? applied_filters:{page_index:1, channel_types:[]}
        const clientsResponse = await fetchData({endpoint:`${auth.authData.organizationId}/contacts`,getAccessTokenSilently, params:{...filtersToSend, contact_business_id:businessDataEdit?.id}, setValue:setBusinessClientsEdit, auth })         
        if (clientsResponse?.status == 200) setClientsFilters(filtersToSend)
        
    } 

    //TRIGGER UPDATE DATA ON CHANGES
    const updateData = async(newData?:ContactBusinessesTable | null) => {
        const compareData = newData ?newData:businessDataEdit as ContactBusinessesTable

        if (JSON.stringify(businessDataEditRef.current) !== JSON.stringify(compareData)){
            const updateResponse = await fetchData({endpoint:`${auth.authData.organizationId}/contact_businesses/${businessDataEdit?.id}`, getAccessTokenSilently, auth, requestForm:compareData, method:'put', toastMessages:{'works':`La empresa #/{${businessDataEdit?.id}}/ se actualizó correctamente.`,'failed':`Hubo un problema al actualizar la información.`}})
            if (updateResponse?.status === 200) {
                businessDataEditRef.current = compareData
            }
        }
    }

    //TABLE LOGIC
    const clickRow = (client:any, index:number) => {
        session.dispatch({type:'UPDATE_CLIENTS_TABLE_SELECTED_ITEM', payload:{index}})
        navigate(`/contacts/clients/${client.id}`)
    }

    ///////////////////////////
    //EDIT DATA LOGIC   
    ///////////////////////////

    //NOTES LOGIC
    const textareaNotasRef = useRef<HTMLTextAreaElement>(null)
    const adjustTextareaHeight = (textarea:any) => {
        if (!textarea) return
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 'px'
    }
   
    useEffect(() =>{if (businessDataEdit) adjustTextareaHeight(textareaNotasRef.current)}, [businessDataEdit?.notes])

    //TAGS LOGIC
    const [inputValue, setInputValue] = useState<string>('')
    const handleKeyDown = (event:KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          const newTag = inputValue.trim()
          if (newTag) {
            let newClientData:ContactBusinessesTable | null = null
            if (businessDataEdit) {
                const labelsArray = businessDataEdit.labels ? businessDataEdit.labels.split(',') : []
                labelsArray.push(newTag)
                newClientData = { ...businessDataEdit, labels: labelsArray.join(',') }
            }
            updateData(newClientData)
            setBusinessDataEdit(newClientData)
            setInputValue('')
          }
        }
      } 
    const removeTag = (index: number) => {
        let newClientData:ContactBusinessesTable | null = null
        if (businessDataEdit && businessDataEdit.labels) {
            const labelsArray = businessDataEdit.labels.split(',')
            labelsArray.splice(index, 1)
            newClientData = { ...businessDataEdit, labels: labelsArray.join(',') }
          }
          updateData(newClientData)
          setBusinessDataEdit(newClientData)
    }

    //CHANGE NAME
    const handelChangeName = (value:string) => {if (businessDataEdit) setBusinessDataEdit(prevData => prevData ? ({ ...prevData, name:value}) as ContactBusinessesTable : null)}
    
    return (<> 

        <Flex flexDir={'column'} height={'100vh'}   width={'100%'}>
            <Box px='1vw' pt='1vw' > 
                <Flex   gap='3vw' justifyContent={'space-between'}> 
                    <Flex  flex='1' gap='20px'  alignItems={'center'}>
                        <IconButton  aria-label='expand-data' icon={<PiSidebarSimpleBold size='18px'/>} size='sm'  variant={'common'} bg='transparent'  onClick={() => navigate('/contacts/businesses') }/>
                            <Flex gap='10px'  flex='1'  alignItems={'center'}>
                            <Avatar size='sm' name={businessDataEdit?.name}/>
                            <Skeleton width={'100%'} isLoaded={businessDataEdit !== null}> 
                                <EditText fontSize="1.2em" nameInput={true} size='md' maxLength={70} updateData={(text:string | undefined) => updateData({...businessDataEdit as ContactBusinessesTable, name:text as string})} value={businessDataEdit?.name === ''? t('WebClient'):businessDataEdit?.name} setValue={handelChangeName}/>
                            </Skeleton>
                        </Flex>

                    </Flex>
                
                </Flex>
                <Box h='1px' w='100%' bg='gray.200' mt='2vh'/>
            </Box>

       
            <Flex flex='1'> 
                <Box flex='1' py='2vh'  ref={scrollRef1} px='1vw' borderRightColor={'gray.200'} borderRightWidth={'1px'}  overflow={'scroll'}  >
                    <Flex  gap='10px' > 
                        <Text mt='10px' fontSize='.8em' whiteSpace={'nowrap'} flex='1' textOverflow={'ellipsis'} overflow={'hidden'}  fontWeight={'medium'} color='gray.600'>{t('labels')}</Text>
                        <Skeleton isLoaded={businessDataEdit !== null} style={{flex:2}}>
                    
                            <Box  minHeight="30px" maxH="300px" border="1px solid transparent" _hover={{border:"1px solid #CBD5E0"}} transition={'border-color .2s ease-in-out, box-shadow .2s ease-in-out'}  p="5px" _focusWithin={{ borderColor:'transparent', boxShadow:'0 0 0 3px rgb(59, 90, 246)'}} borderRadius=".5rem" overflow="auto" display="flex" gap='5px' flexWrap="wrap" alignItems="center" onKeyDown={handleKeyDown}  tabIndex={0}>
                                {(!businessDataEdit?.labels ||businessDataEdit?.labels === '') ? <></>:
                                <> 
                                    {((businessDataEdit?.labels || '').split(',')).map((label, index) => (
                                        <Flex key={`label-${index}`}  borderRadius=".4rem" p='4px' fontSize={'.75em'} alignItems={'center'}  bg='brand.gray_1'  gap='5px'>
                                            <Text>{label}</Text>
                                            <Icon as={RxCross2} onClick={() => removeTag(index)} cursor={'pointer'} />
                                        </Flex>
                                    ))}
                                </>
                                }
                                <Textarea  maxLength={20} p='2px' placeholder={t('labels') + '...'} resize={'none'} borderRadius='.5rem' rows={1} fontSize={'.8em'}  borderColor='transparent' borderWidth='0px' _hover={{borderColor:'transparent',borderWidth:'0px'}} focusBorderColor={'transparent'}  value={inputValue}  onChange={(event) => {setInputValue(event.target.value)}}/>
                            </Box>
                        </Skeleton>
                    </Flex>

                    <Flex mt='2vh' alignItems={'center'}  gap='10px'  > 
                        <Text flex='1' fontSize='.8em' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  fontWeight={'medium'} color='gray.600'>{t('notes')}</Text>
                        <Skeleton isLoaded={businessDataEdit !== null} style={{flex:2}}>
                            <EditText placeholder={t('notes') + '...'} value={businessDataEdit?.notes} setValue={(value:string) => setBusinessDataEdit(prevData => prevData ? ({ ...prevData, notes:value}) as ContactBusinessesTable : null)           }/>
                        </Skeleton>
                    </Flex>

                    <Flex mt='2vh' alignItems={'center'}  gap='10px'  > 
                        <Text flex='1' fontSize='.8em' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  fontWeight={'medium'} color='gray.600'>{t('created_at')}</Text>
                        <Text flex='2' p='7px' ml='7px' fontSize={'.8em'}>{timeAgo(businessDataEdit?.created_at, t_formats)}</Text>
                    </Flex>

                    <Flex mt='2vh' alignItems={'center'}  gap='10px'  > 
                        <Text flex='1' fontSize='.8em' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  fontWeight={'medium'} color='gray.600'>{t('last_interaction_at')}</Text>
                        <Text flex='2' p='7px' ml='7px' fontSize={'.8em'}>{timeAgo(businessDataEdit?.last_interaction_at, t_formats)}</Text>
                    </Flex>
                </Box>
                <Flex flex='2' py='2vh'  overflow={'hidden'} flexDir={'column'} px='1vw'> 
                    <Flex  justifyContent={'space-between'} >
                        <Skeleton isLoaded={businessClientsEdit !== null}> 
                            <Text fontWeight={'medium'}>{t('Clients', {count:businessClientsEdit?.page_data.length})}</Text>
                        </Skeleton>

                        <Flex p='10px' mb='1vh' alignItems={'center'} justifyContent={'end'} gap='10px' flexDir={'row-reverse'}>
                            <IconButton isRound size='xs' aria-label='next-page' icon={<IoIosArrowForward />} isDisabled={clientsFilters.page_index > Math.floor((businessClientsEdit?.total_contacts || 0)/ 25)} onClick={() => updateTable({...clientsFilters,page_index:clientsFilters.page_index + 1})}/>
                            <Text fontWeight={'medium'} fontSize={'.8em'} color='gray.600'>{t('Page')} {clientsFilters.page_index}</Text>
                            <IconButton isRound size='xs' aria-label='next-page' icon={<IoIosArrowBack />} isDisabled={clientsFilters.page_index === 1} onClick={() => updateTable({...clientsFilters,page_index:clientsFilters.page_index - 1})}/>
                        </Flex>
                    </Flex>
                    <Table data={businessClientsEdit?.page_data || []} CellStyle={CellStyle} noDataMessage={t('NoClients')}   excludedKeys={['id', 'contact_business_id', 'phone_number', 'email_address', 'instagram_username', 'webchat_uuid', 'google_business_review_id']}columnsMap={columnsClientsMap} onClickRow={clickRow} />
                </Flex>

            </Flex>

        </Flex>
     
 
     </>)
}

export default Business

 