
//REACT
import  { useState, useEffect, Dispatch, SetStateAction, Fragment, useMemo } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, IconButton, Tooltip, Button, Checkbox, Skeleton } from "@chakra-ui/react"
//COMPONENTS
import EditText from '../../../Components/Reusable/EditText'
import LoadingIconButton from '../../../Components/Reusable/LoadingIconButton'
import ConfirmBox from '../../../Components/Reusable/ConfirmBox'
import Table from '../../../Components/Reusable/Table'
//FUNCTIONS
import copyToClipboard from '../../../Functions/copyTextToClipboard'
import parseMessageToBold from '../../../Functions/parseToBold'
//ICONS
import { BsClipboard2Check, BsTrash3Fill } from "react-icons/bs"
import { FaPlus } from 'react-icons/fa6'

//TYPING
interface UserData  {
    name: string
    surname: string
    email: string,
    is_admin: boolean,
    is_active: boolean,
    invitation_key: string
}
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

    //SHOW USER ERROR
    const [showError, setShowError] = useState<string>('')

    //CREATE NEW USER LOGIC
    const [waitingCreate, setWaitingCreate] = useState<boolean>(false)
    const [newUserInfo, setNewUserInfo] = useState<{email:string, is_admin:boolean}>({email:'', is_admin:true})
     
    //CREATE A NEW USER FUNCTION
    const createNewUser = async() => {
       const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/users`, setWaiting:setWaitingCreate, requestForm:newUserInfo,auth:auth, method:'post'})
       if (response?.status === 200 && response?.data) {
           const newInvitationKey = response.data.invitation_key
           const newUser = {...newUserInfo, is_active:true, invitation_key:newInvitationKey, name:response.data.name, surname:response.data.surname}
           setUserData([...userData, newUser])
           auth.setAuthData({users:{...auth.authData.users, [response.data.id]:{name:response.data.name, surname:response.data.surname, email_address:newUserInfo.email, last_login:'', is_admin:newUserInfo.is_admin}}})
           setShowCreateNewUser(false)
           setNewUserInfo({email:'', is_admin:true})
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
            <Text mt='2vh' mb='.5vh' fontWeight={'medium'}>{t('Rol')}</Text>
            <Flex gap='10px'>
                <Button size='xs' bg={newUserInfo.is_admin?'blackAlpha.800':'gray.200'} color={newUserInfo.is_admin?'white':'none'} _hover={{bg:newUserInfo.is_admin?'blackAlpha.900':'gray.300'}}  onClick={() => setNewUserInfo({...newUserInfo, is_admin: true})}>{t('Admin')}</Button>
                <Button size='xs' bg={!newUserInfo.is_admin?'blackAlpha.800':'gray.200'} color={!newUserInfo.is_admin?'white':'none'} _hover={{bg:!newUserInfo.is_admin?'blackAlpha.900':'gray.300'}}  onClick={() => setNewUserInfo({...newUserInfo, is_admin:false})}>{t('Basic')}</Button>
            </Flex>
            {showError !== '' && <Text mt='2vh' fontSize={'.85em'} color='red'>{showError}</Text>}
         </Box>
        <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
            <Button  size='sm' color='white' bg='blackAlpha.800' _hover={{bg:'blackAlpha.900'}} onClick={createNewUser}>{waitingCreate?<LoadingIconButton/>:t('CreateUser')}</Button>
            <Button  size='sm' bg='gray.200' _hover={{color:'blue.400'}} onClick={()=>setShowCreateNewUser(false)}>{t('Cancel')}</Button>
        </Flex>
      </>
    )
}

//COLUMNS COMPONENT
const UserCellStyles = ({column, element}:{column:string, element:any}) => {

    const { t } = useTranslation('settings')

    switch (column) {
        case 'name':
        case 'surname':
        case 'email':
            return <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>
        case 'is_admin':
            return <Text whiteSpace={'nowrap'}  textOverflow={'ellipsis'} overflow={'hidden'}>{element?t('Admin'):t('User')}</Text>
        case 'is_active':
            return (

            <Box boxShadow={`1px 1px 1px rgba(0, 0, 0, 0.15)`}   display="inline-flex" fontSize='.9em' py='2px' px='8px' fontWeight={'medium'} color={element?'green.600':'red.600'}  bg={element?'green.100':'red.100'} borderRadius={'.7rem'}> 
                <Text whiteSpace={'nowrap'}  textOverflow={'ellipsis'} overflow={'hidden'}>{element?t('ActiveM'):t('InactiveM')}</Text>
            </Box>)
        case 'invitation_key':
            return (<> 
                <Text whiteSpace={'nowrap'}  textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>
                <Tooltip label={t('CopyCode')}  placement='top' hasArrow bg='black' color='white'  borderRadius='.4rem' fontSize='sm' p='6px'> 
                    <IconButton size='xs' onClick={() => copyToClipboard(element)}  aria-label={'copy-invitation-code'} icon={<BsClipboard2Check/>}/>
                </Tooltip>
            </>)
        default:
            return <></>
    }
}

//MAIN FUNCTION
function AdminUsers () {

    //CONSTANTS
    const { t } = useTranslation('settings')
    const auth = useAuth()
    const usersColumnsMap:{[key:string]:[string, number]} = {'name':[t('Name'), 150], 'surname':[t('Surname'), 200], 'email':[t('Mail'), 200], 'is_admin':[t('Rol'), 90], 'is_active':[t('Status'), 60], 'invitation_key':[t('InvitationCode'), 350]}

    const [waitingInfo, setWaitingInfo] = useState<boolean>(true)

    //DATA AND FILTER WITH TEXT
    const [text, setText]  =useState<string>('')
    const [userData, setUserData] = useState<UserData[]>([])
    const [filteredUserData, setFilteredUserData] = useState<UserData[]>([])
      useEffect(() => {
        const filterUserData = () => {
          const filtered = userData.filter(user =>
            user.name.toLowerCase().includes(text.toLowerCase()) ||
            user.surname.toLowerCase().includes(text.toLowerCase()) ||
            user.email.toLowerCase().includes(text.toLowerCase())
          )
          setFilteredUserData(filtered)
        }
        filterUserData()
      }, [text, userData])

    
    //FETCH INITIAL DATA
    useEffect(() => {
        fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/users`, setValue:setUserData, setWaiting:setWaitingInfo, auth})
        document.title = `${t('Settings')} - ${t('Users')} - ${auth.authData.organizationName} - Matil`
    }, [])
 
    //CREATE USER BOOLEAN
    const [showCreateNewUser, setShowCreateNewUser] = useState<boolean>(false)

    //DELETE USERS LOGIC
    const [waitingDelete, setWaitingDelete] = useState<boolean>(false)
    const [userToDelete, setUserToDelete] = useState<UserData | null>(null)
    const handleDeleteUsers = async() => {

        const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/users`, setWaiting:setWaitingDelete, params:{email:userToDelete?.email},auth:auth, method:'delete'})
        if (response && response.status === 200) {
            const updatedUserData = userData.filter(user =>  user.email !== userToDelete?.email)
            setUserData(updatedUserData)
            const updatedUsers = { ...auth.authData.users }
            auth.setAuthData({users: updatedUsers})
        }
        setUserToDelete(null)
    }

    const memoizedNewUserBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowCreateNewUser} isSectionWithoutHeader={true}> 
            <NewUserBox userData={userData} setUserData={setUserData} setShowCreateNewUser={setShowCreateNewUser}/>
        </ConfirmBox>
    ), [showCreateNewUser])

    const memoizedDeleteBox = useMemo(() => (
        <ConfirmBox setShowBox={(b:boolean) => setUserToDelete(null)} isSectionWithoutHeader={true}> 
            <Box maxW={'400px'} p='20px'> 
                <Text>{parseMessageToBold(t('DeleteUserMessage', {user:(userData && userToDelete) ? userToDelete.name +  ' ' + userToDelete.surname:''}))}</Text>
            </Box>
            <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                <Button  size='sm' bg='red.100' color='red.600' _hover={{bg:'red.200'}} onClick={handleDeleteUsers}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                <Button  size='sm' _hover={{color:'blue.400'}} onClick={()=> setUserToDelete(null)}>{t('Cancel')}</Button>
            </Flex>
        </ConfirmBox>
    ), [userToDelete])

    return(<>
    <>        
        {userToDelete && memoizedDeleteBox}
        {showCreateNewUser && memoizedNewUserBox}

        <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('UsersTable')}</Text>
        <Text color='gray.600' fontSize={'.9em'}>{t('UsersDes')}</Text>

        <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='3vh'/>
      
        <Box width={'350px'}> 
            <EditText value={text} setValue={setText} searchInput={true}/>
        </Box>

        <Flex  mt='2vh'justifyContent={'space-between'} alignItems={'end'}>
            <Skeleton isLoaded={!waitingInfo}> 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('UsersCount', {count:userData.length})}</Text>
            </Skeleton>
        
            <Button leftIcon={<FaPlus/>} size='sm' onClick={() => {setShowCreateNewUser(!showCreateNewUser)}}>{t('CreateUser')}</Button>
        
        </Flex>

         <Skeleton  isLoaded={!waitingInfo}> 
            <Table data={filteredUserData} CellStyle={UserCellStyles} noDataMessage={t('NoUsers')} columnsMap={usersColumnsMap} onlyOneSelect deletableFunction={(row, index) => setUserToDelete(row)}/>
        </Skeleton>
        </> 
    </>)
}

export default AdminUsers