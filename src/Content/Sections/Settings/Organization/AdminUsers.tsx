
//REACT
import  { useState, useEffect, Dispatch, SetStateAction, useMemo, ReactElement } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
import { useAuth0 } from '@auth0/auth0-react'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, Avatar, Image, Button, Skeleton, Switch,Icon } from "@chakra-ui/react"
import { motion, } from 'framer-motion'
//COMPONENTS
import EditText from '../../../Components/Reusable/EditText'
import LoadingIconButton from '../../../Components/Reusable/LoadingIconButton'
import ConfirmBox from '../../../Components/Reusable/ConfirmBox'
import Table from '../../../Components/Reusable/Table'
import SectionSelector from '../../../Components/Reusable/SectionSelector'
import ActionsBox from '../../../Components/Reusable/ActionsBox'
//ICONS
import { BsStars, BsBarChartFill, BsFillLayersFill } from "react-icons/bs"
import { FaPlus, FaUserPlus, FaUserGroup, FaClock, FaUserTag } from 'react-icons/fa6'
import { IoFileTrayFull, IoPeopleSharp } from 'react-icons/io5'
import { BiSolidBuildings } from 'react-icons/bi'
import { IoIosSettings } from 'react-icons/io'
import { IoIosArrowDown } from 'react-icons/io'
import { IconType } from 'react-icons'
 
//TYPING
interface UserData  {
    name: string
    surname: string
    email: string
    access_role: string
    is_active: boolean
    alias:string
    avatar_image_url:string
    call_status: string
}
interface RolesData  {
    role_name: string
    id: string
    description: string
    created_by: string
    created_at: boolean
    updated_by:string
    updated_at:string
    permissions: string[]
}

//ALL PERMISSIONS
const allPermissions = [
    "conversations_delete",
    "conversations_send_message",
    "conversations_edit",
    
    "contacts_view",
    "contacts_delete",
    "contacts_edit",

    "contacts_business_view",
    "contact_business_delete",
    "contact_business_edit",

    "functions_view",
    "functions_delete",
    "functions_edit",
    "functions_set_to_production",

    "secrets_delete",
    "secrets_view",
    "secrets_edit",

    "stats_view",
    "stats_delete",
    "stats_edit",

    "knowledege_view",
    "knowledege_delete",
    "knowledege_edit",

    "settings_organization_view",
    "settings_organization_edit",

    "settings_channels_view",
    "settings_channels_edit",
    "settings_channels_delete",

    "settings_matilda_configurations_edit",
    "settings_matilda_configurations_view",
    "settings_matilda_configurations_delete",

    "settings_help_centers_view",
    "settings_help_centers_edit",
    "settings_help_centers_delete",

    "settings_data_view",
    "settings_data_edit",
    "settings_data_delete",

    "settings_user_management_view",
    "settings_user_management_edit",
    "settings_user_management_delete",
]

interface NewUserBoxProps {
    userData:UserData[]
    setUserData:Dispatch<SetStateAction<UserData[]>>
    setShowCreateNewUser:Dispatch<SetStateAction<boolean>>
}
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

//BOX FOR CREATING A NEEW USER
const NewUserBox = ({userData, setUserData, setShowCreateNewUser}:NewUserBoxProps) => {

    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('settings')
    const {  getAccessTokenSilently } = useAuth0()

    //SHOW USER ERROR
    const [showError, setShowError] = useState<string>('')

    //CREATE NEW USER LOGIC
    const [waitingCreate, setWaitingCreate] = useState<boolean>(false)
    const [newUserInfo, setNewUserInfo] = useState<{email:string}>({email:''})
     
    //CREATE A NEW USER FUNCTION
    const createNewUser = async() => {
       const response = await fetchData({endpoint:`${auth.authData.organizationId}/settings/user_accesses/invitations`, getAccessTokenSilently,  setWaiting:setWaitingCreate, requestForm:{email_address:newUserInfo.email, role_id:'01952090-8bc7-7b1f-8a5e-f4b7da4ee745'},auth, method:'post'})
       if (response?.status === 200 && response?.data) {
           const newInvitationKey = response.data.invitation_key
           const newUser = {...newUserInfo, is_active:true, invitation_key:newInvitationKey, name:response.data.name, surname:response.data.surname}
           //setUserData([...userData, newUser])
           //auth.setAuthData({users:{...auth.authData.users, [response.data.id]:{name:response.data.name, surname:response.data.surname, email_address:newUserInfo.email, icon:{data:'', type:'image'} }}})
           setShowCreateNewUser(false)
           setNewUserInfo({email:''})
           setShowError('')
        }
       else{
        setShowError(t('UserError'))
       }
      
   } 

    return(
        <> 
        <Box p='20px'> 
            <Text mb='.5vh' fontWeight={'medium'}>{t('Mail')}</Text>
            <EditText  regex={emailRegex} maxLength={100} placeholder={`${t('User').toLocaleLowerCase()}@${t('Company')}.com`} hideInput={false} value={newUserInfo.email} setValue={(value) => setNewUserInfo({...newUserInfo, email:value})}/>
         
            {showError !== '' && <Text mt='2vh' fontSize={'.85em'} color='red'>{showError}</Text>}
         </Box>
        <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'border_color'}>
            <Button  size='sm' variant='main'onClick={createNewUser}>{waitingCreate?<LoadingIconButton/>:t('CreateUser')}</Button>
            <Button  size='sm'variant='common'onClick={()=>setShowCreateNewUser(false)}>{t('Cancel')}</Button>
        </Flex>
      </>
    )
}

//COLUMNS COMPONENT
const UserCellStyles = ({column, element, row}:{column:string, element:any, row?:any}) => {

 
    switch (column) {
        case 'name':
            return  (
                <Flex fontSize={'.9em'} alignItems={'center'} gap='5px'> 
                    {row[column]?.profile_picture ? <Image src={row[column]?.profile_picture} h='14px' w='14px' alt={element} /> :<Avatar h='16px' w='16px' size={'xs'} name={element}/> }
                    <Text  fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element} {row[column].surname}</Text>
                </Flex>
            ) 
            
        case 'email':
            return <Text fontSize={'.9em'} whiteSpace={'nowrap'} color={'text_gray'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>
        case 'access_role':
            return <Text  fontSize={'.9em'} whiteSpace={'nowrap'}  textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>
       
        default:
            return <></>
    }
}

//MAIN FUNCTION
function AdminUsers () {

    //CONSTANTS
    const { t } = useTranslation('settings')
    const {  getAccessTokenSilently } = useAuth0()
    const auth = useAuth()
    const usersColumnsMap:{[key:string]:[string, number]} = {'name':[t('Name'), 150], 'surname':[t('Surname'), 200], 'email':[t('Mail'), 200], 'is_admin':[t('Rol'), 90], 'is_active':[t('Status'), 60], 'invitation_key':[t('InvitationCode'), 350]}

    //SECTIONS
    const sectionsList = ['teams', 'invited', 'roles', 'activity-history']
    const sectionsMap:{[key:string]:[string, ReactElement]} = {'teams':[t('teams'), <FaUserGroup/>], 'invited':[t('invited'), <FaUserPlus/>], 'roles':[t('roles'), <FaUserTag/>], 'activity-history':[t('activity-history'), <FaClock/>], }
 

    const [currentSection, setCurrentSection] =  useState<'teams' | 'invited' |  'roles'|  'activity-history'>('teams')

    //DATA AND FILTER WITH TEXT
     const [userData, setUserData] = useState<UserData[] | null>([])
    const [rolesData, setRolesData] = useState<RolesData[] | null>(null)
    const [activityData, setActivityData] = useState<UserData[] | null>([])

    useEffect(() => {
        document.title = `${t('Settings')} - ${t('Users')} - ${auth.authData.organizationName} - Matil`

        if ((currentSection === 'teams' || currentSection === 'invited')) fetchData({endpoint:`${auth.authData.organizationId}/settings/user_accesses`, getAccessTokenSilently, auth, setValue:setUserData})
        
        else  fetchData({endpoint:`${auth.authData.organizationId}/settings/user_accesses/roles`, getAccessTokenSilently, auth, setValue:setRolesData})
    },[currentSection])

    
    const TeamsSection = () => {
        const [text, setText]  =useState<string>('')

        const [filteredUserData, setFilteredUserData] = useState<UserData[]>([])
        useEffect(() => {
            const filterUserData = () => {

                let filtered = userData
                if (text !== '') {
                    filtered = userData.filter(user => {
                        const matchesSearch =
                        (user?.name || '').toLowerCase().includes(text.toLowerCase()) ||
                        (user?.surname || '').toLowerCase().includes(text.toLowerCase()) ||
                        user.email.toLowerCase().includes(text.toLowerCase())
                        const matchesStatus = currentSection === 'teams' ? user.is_active : !user.is_active
                        return matchesSearch && matchesStatus;
                    })
                }
              setFilteredUserData(filtered)
            }
            filterUserData();
          }, [text, currentSection])

          console.log(userData)
          console.log(filteredUserData)

        return (<>
            <Box width={'350px'} mt='2vh'> 
                <EditText value={text} setValue={setText} hideInput={false}/>
            </Box>
            <Flex  mt='2vh'justifyContent={'space-between'} alignItems={'end'}>
                <Skeleton isLoaded={userData !== null}> 
                    <Text fontWeight={'medium'} color={'text_gray'} fontSize={'1em'}>{t('UsersCount', {count:filteredUserData.length})}</Text>
                </Skeleton>
            </Flex>

            <Table waitingInfo={userData === null} data={filteredUserData} onClickRow={(row) => setUserToDelete(row)} CellStyle={UserCellStyles} excludedKeys={['avatar_image_url', 'is_active', 'surname', 'alias', 'call_status']} noDataMessage={t('NoUsers')} columnsMap={usersColumnsMap} />
            </>)
    }

    const InviteSection = () => {

        return (<>
        </>)
    }

    const RolesSection = () => {


        const [currentRoles, setCurrentRoles] = useState<any>(null)
        //ROLES MAPPING
        const sectionsWithPermissions:{[key:string]:{icon:IconType, options:string[]}} = {
            'conversations': {icon:IoFileTrayFull, options:[ "conversations_delete", "conversations_send_message", "conversations_edit"]},
            'persons': {icon:IoPeopleSharp, options:[ "contacts_view", "contacts_delete", "contacts_edit"]},
            'business_contacts': {icon:BiSolidBuildings, options:[  "contacts_business_view", "contact_business_delete", "contact_business_edit"]},
            'functions': {icon:BsStars, options:[ "functions_view", "functions_delete", "functions_edit", "functions_set_to_production",   "secrets_delete", "secrets_view", "secrets_edit"]},
            'stats': {icon:BsBarChartFill, options:[ "stats_view", "stats_delete", "stats_edit"]},
            'sources': {icon:BsFillLayersFill, options:[ "knowledege_view", "knowledege_delete", "knowledege_edit"]},
            'settings': {icon:IoIosSettings, options:[ "settings_organization_view","settings_organization_edit", "settings_channels_view", "settings_channels_edit", "settings_channels_delete", "settings_matilda_configurations_edit", "settings_matilda_configurations_view", "settings_matilda_configurations_delete", "settings_help_centers_view", "settings_help_centers_edit", "settings_help_centers_delete", "settings_data_view", "settings_data_edit", "settings_data_delete", "settings_user_management_view", "settings_user_management_edit", "settings_user_management_delete",]},
        }
        const [selectedRol, setSelectedRol] = useState<string>('admin')
        const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
        useEffect(() => {
            const getPermissions = () => {
                if (selectedRol === 'admin') setSelectedPermissions(allPermissions)
            }
            getPermissions()
        },[selectedRol])

        const [expandedSections, setExpandedSections] = useState<string[]>([])
        const PermissionsBox = ({name, options}:{name:string, options:string[]}) => {
            
            const { t } = useTranslation('settings')
            const isExpanded = expandedSections.includes(name)
            const [isHovering, setIsHovering] = useState<boolean>(false)
        
            return (
                <Box p='20px'  bg={(isExpanded || isHovering) ?'white':'#FDFDFD'}  width={'100%'} mb='3vh'  borderWidth={'1px'} borderColor={(isExpanded || isHovering) ? 'text_blue':'border_color'} borderRadius={'.5rem'} shadow={(isExpanded || isHovering)?'md':'sm'} transition={'box-shadow 0.3s ease-in-out, background-color 0.3s ease-in-out,border-color 0.3s ease-in-out'} onMouseEnter={() => setIsHovering(true)}  onMouseLeave={() => setIsHovering(false)}  >
                    <Flex cursor={'pointer'} alignItems={'center'} justifyContent={'space-between'} onClick={() => {if (expandedSections.includes(name)) setExpandedSections(prev => prev.filter(sec => sec !== name));else {setExpandedSections(prev =>  ([...prev, name]))}} }>
                        <Flex alignItems={'center'} gap='10px'>
                            <Icon boxSize={'16px'} color={(isHovering && !isExpanded)?'text_blue':'text_gray'} as={sectionsWithPermissions[name].icon}/> 
                            <Text color={(isHovering && !isExpanded)?'text_blue':'black'} fontWeight={'medium'} >{t(name)}</Text>
                        </Flex>
                        <IoIosArrowDown color={(isExpanded || isHovering) ? 'rgb(59, 90, 246)':'text_gray'} className={isExpanded ? "rotate-icon-up" : "rotate-icon-down"}/>
                    </Flex>
                    <motion.div initial={false} animate={{height:isExpanded?'auto':0}} exit={{height:isExpanded?0:'auto'}} transition={{duration:.3}} style={{overflow:'hidden'}} >           
                        {options.map((op, index) => (
                            <Flex key={`${name}-option-${index}`} mt={index === 0 ? '2vh':'1vh'} gap='10px' alignItems={'center'} >
                                <Switch size='sm' isChecked={selectedPermissions.includes(op)} onChange={(e) => {if (selectedPermissions.includes(op)) setSelectedPermissions(prev => prev.filter(permission => permission !== op));else {setSelectedPermissions(prev => ([...prev, op]))}} }/>
                                <Text fontWeight={'medium'} color='text_gray' fontSize={'.9em'}>{t(op)}</Text>
                            </Flex>
                        ))}
                    </motion.div>
                </Box>
            )
        }
        return (
        <Flex flex='1' h='100%' minH={0}>
            <Box flex='1' mt='3vh'>
                <Text>{t('SelectRole')}</Text>
            </Box>
            <Flex flexDir={'column'} flex={1} py='3vh' minH={0}  maxH='100%' overflow={'scroll'}>
                {Object.keys(sectionsWithPermissions).map((sec, index) => (
                    <PermissionsBox key={`permissions-${index}`} name={sec} options={sectionsWithPermissions[sec].options}/>
                ))}
            </Flex>
        </Flex>)
    }

    const ActivitySection = () => {

        return (<>
         </>)
    }

    const UsersSection = () => {
        switch (currentSection) {
            case 'teams':
                return <TeamsSection/>
            case 'invited':
                return <InviteSection/>
            case 'roles':
                return <RolesSection/>
            case 'activity-history':
                return <ActivitySection/>
        } 
    }
    
 
    //CREATE USER BOOLEAN
    const [showCreateNewUser, setShowCreateNewUser] = useState<boolean>(false)

    //DELETE USERS LOGIC
    const [userToDelete, setUserToDelete] = useState<UserData | null>(null)
    const handleDeleteUsers = async() => {

        const response = await fetchData({endpoint:`${auth.authData.organizationId}/settings/user_accesses/${(userToDelete as any)?.id}`, getAccessTokenSilently, auth, method:'delete'})
        if (response && response.status === 200) {
            const updatedUserData = userData.filter(user =>  user.email !== userToDelete?.email)
            setUserData(updatedUserData)
            const updatedUsers = { ...auth.authData?.users }
            //if (userToDelete?.email && updatedUsers[userToDelete.email]) delete updatedUsers[userToDelete.email]
            auth.setAuthData({ users: updatedUsers })
        }
        setUserToDelete(null)
    }

    const memoizedNewUserBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowCreateNewUser} > 
            <NewUserBox userData={userData} setUserData={setUserData} setShowCreateNewUser={setShowCreateNewUser}/>
        </ConfirmBox>
    ), [showCreateNewUser])

 
    return(<>
    
    <ActionsBox showBox={userToDelete} type='delete' setShowBox={() => setUserToDelete(null)} title={t('DeleteUserMessage', {user:(userData && userToDelete) ? userToDelete.name +  ' ' + userToDelete.surname:''})} des={t('DeleteUserDes')} buttonTitle={t('DeleteUser')} actionFunction={handleDeleteUsers}/>
  
    <Flex flexDir={'column'} p='2vw' w='calc(70vw - 200px)' h='90vh'>        
        {showCreateNewUser && memoizedNewUserBox}

        <Flex alignItems={'end'} justifyContent={'space-between'}> 
            <Box> 
                <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('UsersTable')}</Text>
                <Text color='text_gray' fontSize={'.8em'}>{t('UsersDes')}</Text>
            </Box>
            <Button leftIcon={<FaPlus/>} size='sm' variant={'main'} onClick={() => {setShowCreateNewUser(!showCreateNewUser)}}>{t('CreateUser')}</Button>
        </Flex>
        <Box h='40px' > 
            <SectionSelector notSection selectedSection={currentSection} sections={sectionsList} sectionsMap={sectionsMap}  onChange={(section) => setCurrentSection(section as any)}/>
            <Box bg='border_color' h='1px' w='100%'/>
        </Box>
        <Flex flexDir={'column'} flex={1}> 
            <UsersSection/>
        </Flex>
        
    </Flex>
    </>)
}

export default AdminUsers