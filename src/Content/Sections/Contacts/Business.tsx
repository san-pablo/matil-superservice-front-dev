/*
    MAIN CLIENT FUNCTION 
*/

import { useState, useRef, useEffect, useMemo, Fragment } from "react"
import { useAuth } from "../../../AuthContext"
import { useSession } from "../../../SessionContext"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
//FRONT
import { Flex, Box, Text, Avatar, Skeleton, Tooltip, Button, IconButton, chakra, shouldForwardProp, Icon } from '@chakra-ui/react'
import { motion, AnimatePresence, isValidMotionProp } from 'framer-motion' 
//FETCH DATA
import fetchData from "../../API/fetchData"
//COMPONENTS
import Table from "../../Components/Reusable/Table"
import EditText from "../../Components/Reusable/EditText"
import CollapsableSection from "../../Components/Reusable/CollapsableSection"
import CustomAttributes from "../../Components/Reusable/CustomAttributes"
import TagEditor from "../../Components/Reusable/TagEditor"
import ActionsBox from "../../Components/Reusable/ActionsBox"
import RenderSectionPath from "../../Components/Reusable/RenderSectionPath"
//FUNCTIONS
import timeAgo from "../../Functions/timeAgo"
import timeStampToDate from "../../Functions/timeStampToString"
import useOutsideClick from "../../Functions/clickOutside"
//ICONS
import { BsThreeDotsVertical } from "react-icons/bs"
import { HiTrash } from "react-icons/hi2"
import { TbKey } from "react-icons/tb"
import { MdBlock } from "react-icons/md"
//TYPING
import { Clients, ContactBusinessesTable, ViewDefinitionType, contactDicRegex, languagesFlags } from "../../Constants/typing"
import { useAuth0 } from "@auth0/auth0-react"
 
//GET THE CELL STYLE
const CellStyle = ({ column, element, row }:{column:string, element:any, row?:any}) => {
     
    //TRANSLATION
    const { t } = useTranslation('clients')
    const auth = useAuth()
    const t_formats = useTranslation('formats').t
 
    if (column === 'created_at' ||  column === 'last_interaction_at' || column === 'updated_at' )  
    return(
        <Tooltip label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='.8em' p='6px'> 
            <Text whiteSpace={'nowrap'} fontSize={'.9em'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)

    else if (column === 'contact') 
    return (
        <Flex gap='10px'>
            {['email_address', 'webchat_id', 'phone_number', 'instagram_username'].map((con, index) => (
            <Fragment key={`contact-${index}`}>
                {row[con] && 
                <Tooltip label={row[con]}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='.8em' p='6px'> 
                    <Box>
                        <Icon color='text_gray' as={(contactDicRegex as any)[con][3]}/>
                    </Box>
                </Tooltip>}
            </Fragment>))}
        </Flex>
    )
    else if (column === 'tags') {
        const tags = auth.authData.tags
        return (
            <Flex minH={'35px'} alignItems={'center'}> 
                {element.length === 0? <Text>-</Text>:
                    <Flex gap='5px' flexWrap={'wrap'}>
                        {element.map((label:string, index:number) => (
                            <Flex  bg='gray_1' borderWidth={'1px'} p='4px' borderRadius={'.5rem'} fontSize={'.8em'} key={`client-label-${index}`}>
                                <Text>{tags?.find(tag => tag.id === label)?.name}</Text>
                            </Flex>
                        ))}
                    </Flex>
                }
            </Flex>
        )
    }
    else if (column === 'language') {
        return(
        <Flex gap='5px' fontSize={'.9em'}  alignItems={'center'}>
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][0]:'No detectado'}</Text>
            <Text fontSize={'.8em'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][1]:'🏴󠁥󠁳󠁣󠁴󠁿'}</Text>
        </Flex>)
    }   
    else if (column === 'is_blocked') return <Text color={element?'red':'black'}>{element?t('is_blocked'):t('Active')}</Text>  
    else return ( <Text fontSize={'.9em'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'}  fontWeight={column === 'name'?'medium':'normal'}  overflow={'hidden'} >{element?element:'-'}</Text>)
}


//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})
 
interface BusinessProps {
    socket:any 
    businessId?:string
    sectionsPath:string[]
    sectionsPathMap:{[key:string]:{icon:{type:'image' | 'emoji' | 'icon', data:string}, name:string}}
    selectedView?:ViewDefinitionType
    sideBarWidth:number
}


//MAIN FUNCTION
function Business ({businessId, socket, sectionsPath, sectionsPathMap, selectedView}: BusinessProps) {
    
    //CONSTANTS
    const auth = useAuth()
    const session = useSession()
    const location = useLocation().pathname
    const navigate = useNavigate()
    const { t } = useTranslation('businesses')
    const t_formats = useTranslation('formats').t
    const t_clients = useTranslation('clients').t
    const { getAccessTokenSilently } = useAuth0()
    const columnsClientsMap:{[key:string]:[string, number]} = {name: [t_clients('name'), 150], contact: [t_clients('contact'), 120], language: [t_clients('language'), 150], tags: [t_clients('tags'), 350], last_interaction_at: [t_clients('last_interaction_at'), 150], updated_at: [t_clients('updated_at'), 150], created_at: [t_clients('created_at'), 150], rating: [t_clients('rating'), 60], notes: [t_clients('notes'), 350],  is_blocked: [t_clients('is_blocked'), 150], instagram_followers:[t_clients('instagram_followers'), 150]}
    const [searchParams] = useSearchParams()
    const isExpanded = searchParams.get("v") === "expanded"


    //WAIT NEW INFO
    const [waitingInfo, setWaitingInfo] = useState<boolean>(false)

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
    
    //REQUEST CLIENT, CONVERSATIONS AND CLIENT INFO
    useEffect(() => { 
        const loadData = async () => {

              //SET TITLE
            document.title = `${t('Business')}: ${location.split('/')[location.split('/').length - 1]} - ${auth.authData.organizationName} - Matil`
            localStorage.setItem('currentSection', `/contacts/businesses/${businessId}`)

            setWaitingInfo(true)
            //FETCH THE DATA
            if (!location.endsWith('businesses')) {
                const businessResponse = await fetchData({endpoint:`${auth.authData.organizationId}/businesses/${businessId}`, getAccessTokenSilently,setValue:setBusinessDataEdit,  auth})    

                if (businessResponse?.status === 200 ) {
                    const businessClientsResponse = await fetchData({endpoint:`${auth.authData.organizationId}/persons`,getAccessTokenSilently, params:{page_index:1, filters:{logic:'AND', groups:[{logic:'AND', conditions:[{col:'business_id', op:'eq', val:businessId}]} ]}}, setValue:setBusinessClientsEdit, auth })
                    businessDataEditRef.current = businessResponse?.data
                }
             }
            setWaitingInfo(false)   
        }
        loadData()
        }, [location])

    //TRIGGER UPDATE DATA ON CHANGES
     
    //UPDATE DATA ON CHANGE
    const updateData = async(updatedKey:string, newData?:any) => {       
        fetchData({endpoint:`${auth.authData.organizationId}/businesses/${businessDataEdit.id}`, auth, getAccessTokenSilently, requestForm:{[updatedKey]:newData}, method:'put' })
        setBusinessDataEdit( prev => ({...prev, [updatedKey]:newData}))
    }

    //UPDATE A CISTOM ATTRIBUTE
    const updateCustomAttributes = (attributeName:string, newValue:any) => {
        const updatedCustomAttributes = {...businessDataEdit.cdas}
        updatedCustomAttributes[attributeName] = newValue
        updateData('cdas',  updatedCustomAttributes)
     }


    //TABLE LOGIC
    const clickRow = (client:any, index:number) => {
        session.dispatch({type:'UPDATE_CLIENTS_TABLE_SELECTED_ITEM', payload:{index}})
        navigate(`/contacts/clients/${client.id}`)
    }

    //EXPAND SECTIONS
    const [sectionsExpanded, setSectionsExpanded] = useState<string[]>(['contact', 'info', 'custom-attributes'])
    const onSectionExpand = (section: string) => {
        setSectionsExpanded((prevSections) => {
        if (prevSections.includes(section)) return prevSections.filter((s) => s !== section)
        else return [...prevSections, section]
        })
    }
    
    //NOTES LOGIC
    const textareaNotasRef = useRef<HTMLTextAreaElement>(null)
    const adjustTextareaHeight = (textarea:any) => {
        if (!textarea) return
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 'px'
    }
   
    useEffect(() =>{if (businessDataEdit) adjustTextareaHeight(textareaNotasRef.current)}, [businessDataEdit?.notes])

    //CHANGE NAME
    const handelChangeName = (value:string) => {if (businessDataEdit) setBusinessDataEdit(prevData => prevData ? ({ ...prevData, name:value}) as ContactBusinessesTable : null)}
    
    //BLOCK LOGIC 
    const [showBlock, setShowBlock] = useState<boolean>(false)

    //SHOW ACTIONNS BUTTON
    const settingsButtonRef = useRef<HTMLButtonElement>(null)
    const settingsBoxRef = useRef<HTMLDivElement>(null)
    const [showSettings, setShowSettings] = useState<boolean>(false)
    useOutsideClick({ref1:settingsButtonRef, ref2:settingsBoxRef, onOutsideClick:() => setShowSettings(false)})

    //DELETE A CLIENT 
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false)

    
    const deleteBusiness = async() => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/businesses/${businessDataEdit.id}`, method:'delete', getAccessTokenSilently,  auth})
        const responseOrg = await fetchData({endpoint:`${auth.authData.organizationId}/user`, getAccessTokenSilently,  auth})
        if (response?.status === 200 && responseOrg.status === 200) navigate('contacts/businesses')
    }
    const blockBusiness = async() => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/businesses/${businessDataEdit.id}`, method:'delete', getAccessTokenSilently,  auth})
        const responseOrg = await fetchData({endpoint:`${auth.authData.organizationId}/user`, getAccessTokenSilently,  auth})
        if (response?.status === 200 && responseOrg.status === 200) navigate('contacts/businesses')
    }

   
 
    return (<> 

        <ActionsBox showBox={showConfirmDelete} setShowBox={setShowConfirmDelete} title={t('DeleteBusiness', {name:businessDataEdit?.name})} type="delete" buttonTitle={t('Delete')} actionFunction={deleteBusiness} des={t('DeleteBusinessDes')}/>
        <ActionsBox showBox={showBlock} setShowBox={setShowBlock} title={t('BlockBusiness', {name:businessDataEdit?.name})} type="delete" buttonTitle={t('Block')} actionFunction={blockBusiness} des={t('BlockDes')}/>
        

        <Flex flexDir={'column'} height={'100vh'}   width={'100%'}>


        <Flex borderBottomWidth={'1px'} borderBottomColor={'border_color'} h='50px' px='1vw'  gap='3vw' justifyContent={'space-between'}> 
                <Flex  flex='1' gap='10px'  alignItems={'center'}>

                <Flex alignItems={'center'} flex='1'>
                    {isExpanded &&<RenderSectionPath sectionsPath={sectionsPath} sectionsPathMap={sectionsPathMap} selectedView={selectedView}/>}
                    <Skeleton style={{borderRadius:'50%'}} isLoaded={businessDataEdit !== null && !waitingInfo}> 
                        <Avatar size='xs' name={businessDataEdit?.name}/>
                    </Skeleton>
                    <Skeleton isLoaded={businessDataEdit !== null && !waitingInfo} style={{flex:1, fontSize:'.8em'}}> 
                        <EditText placeholder={t('Name') + '...'} value={businessDataEdit?.name} setValue={(value:string) => updateData('name', value)} className="title-textarea"/>
                    </Skeleton>
                </Flex>

                <Box position={'relative'}> 
                    <IconButton ref={settingsButtonRef} aria-label='conver-settings' icon={<BsThreeDotsVertical/>} size='sm'  variant={'common'} color={showSettings ? 'text_blue':'black'} bg={showSettings ? 'gray_1':'transparent' } onClick={() => {setShowSettings(!showSettings)}}/>
                    <AnimatePresence> 
                        {showSettings && 
                        <MotionBox initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '.1', ease: 'easeOut'}}
                        maxH='40vh'p='8px'  style={{ transformOrigin: 'top right' }}  mt='5px' right={0} overflow={'scroll'} top='100%' gap='10px' ref={settingsBoxRef} fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.1)'} bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.5rem'} borderWidth={'1px'} borderColor={'border_color'}>
                
                            <Flex   px='7px' py='5px'  borderRadius={'.5rem'} cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'gray_2'}} onClick={() => {if (!businessDataEdit?.is_blocked) setShowBlock(true); else updateData('is_blocked', false)}}>
                                <Icon color='text_gray'  boxSize={'15px'} as={businessDataEdit?.is_blocked?TbKey:MdBlock}/>
                                <Text whiteSpace={'nowrap'}>{businessDataEdit?.is_blocked?t('Deblock'):t('Block')}</Text>
                            </Flex>
                            <Flex  color='red' onClick={() => {setShowSettings(false) ;setShowConfirmDelete(true)}}   px='7px' py='5px'  borderRadius={'.5rem'} cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'red.100'}}>
                                <Icon boxSize={'15px'} as={HiTrash}/>
                                <Text whiteSpace={'nowrap'}>{t('Delete')}</Text>
                            </Flex>
                        </MotionBox>}   
                    </AnimatePresence>                 
                </Box>   

                </Flex>
               
            </Flex>
       
            <Flex flex='1'> 
                <Box flex='1' py='2vh'  ref={scrollRef1} px='1vw' borderRightColor={'border_color'} borderRightWidth={'1px'}  overflow={'scroll'}  >
                    
                    <CollapsableSection section={'info'} isExpanded={sectionsExpanded.includes('info')} onSectionExpand={onSectionExpand} sectionsMap={{'info':t('Info'), 'tags':t('Tags'), 'custom-attributes':t('CustomAttributes')}}> 
                 
                        <Flex mt='2vh' alignItems={'center'}  gap='10px'  > 
                            <Text flex='1' fontSize='.8em' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  fontWeight={'medium'} color='text_gray'>{t('notes')}</Text>
                            <Skeleton isLoaded={businessDataEdit !== null && !waitingInfo} style={{flex:2}}>
                                <EditText placeholder={t('notes') + '...'} value={businessDataEdit?.notes} setValue={(value:string) => updateData('notes', value) }/>
                            </Skeleton>
                        </Flex>

                        <Flex mt='2vh' alignItems={'center'}  gap='10px'  > 
                            <Text flex='1' fontSize='.8em' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  fontWeight={'medium'} color='text_gray'>{t('created_at')}</Text>
                            <Skeleton isLoaded={businessDataEdit !== null  && !waitingInfo} style={{flex:2}}> 
                                <Text flex='2' p='7px'  fontSize={'.8em'}>{timeAgo(businessDataEdit?.created_at, t_formats)}</Text>
                            </Skeleton>
                        </Flex>

                        <Flex mt='2vh' alignItems={'center'}  gap='10px'  > 
                            <Text flex='1' fontSize='.8em' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  fontWeight={'medium'} color='text_gray'>{t('last_interaction_at')}</Text>
                            <Skeleton isLoaded={businessDataEdit !== null  && !waitingInfo} style={{flex:2}}> 
                                <Text flex='2' p='7px' fontSize={'.8em'}>{timeAgo(businessDataEdit?.last_interaction_at, t_formats)}</Text>
                            </Skeleton>
                        </Flex>
                    </CollapsableSection>

                    <CollapsableSection mt='3vh' section={'tags'} isExpanded={sectionsExpanded.includes('tags')} onSectionExpand={onSectionExpand} sectionsMap={{'info':t('Info'), 'tags':t('Tags'), 'custom-attributes':t('CustomAttributes')}}> 
                        <Skeleton style={{marginTop:'2vh'}} isLoaded={businessDataEdit !== null && !waitingInfo}>
                        <TagEditor section={'businesses'} data={businessDataEdit}  setData={setBusinessDataEdit}/>
                        </Skeleton>
                    </CollapsableSection>

                    <CollapsableSection mt='3vh' section={'custom-attributes'} isExpanded={sectionsExpanded.includes('custom-attributes')} onSectionExpand={onSectionExpand} sectionsMap={{'info':t('Info'), 'tags':t('Tags'), 'custom-attributes':t('CustomAttributes')}}> 
                        <Skeleton style={{marginTop:'2vh'}} isLoaded={businessDataEdit !== null && !waitingInfo}>
                            <CustomAttributes motherstructureType="businesses" motherstructureId={businessDataEdit?.id || 0} customAttributes={businessDataEdit?.cdas || {}} updateCustomAttributes={updateCustomAttributes}/>
                        </Skeleton>
                    </CollapsableSection>

                </Box>
                <Flex flex='2' py='2vh'  overflow={'hidden'} flexDir={'column'} px='1vw'> 
                    <Flex  justifyContent={'space-between'} >
                        <Skeleton isLoaded={businessClientsEdit !== null  && !waitingInfo}> 
                            <Text fontWeight={'medium'}>{t('Clients', {count:businessClientsEdit?.total_items})}</Text>
                        </Skeleton>
                    </Flex>
                    <Table  waitingInfo={waitingInfo} onFinishScroll={() => {}}   data={businessClientsEdit?.page_data || []} numberOfItems={businessClientsEdit?.total_items || 0} CellStyle={CellStyle} noDataMessage={t('NoClients')}   excludedKeys={['id', 'phone_number', 'email_address', 'instagram_username', 'webchat_id', 'google_business_review_id']}columnsMap={columnsClientsMap} onClickRow={clickRow} />
                </Flex>

            </Flex>

        </Flex>
     
 
     </>)
}

export default Business

 