
//REACT
import  { useState, useEffect, useRef, Dispatch, SetStateAction, useMemo } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, Button, Skeleton, IconButton, Portal, Avatar, chakra, shouldForwardProp, Image, Icon } from "@chakra-ui/react"
import { AnimatePresence, motion, isValidMotionProp } from 'framer-motion'
//COMPONENTS
import EditText from '../../../Components/Reusable/EditText'
import LoadingIconButton from '../../../Components/Reusable/LoadingIconButton'
import useOutsideClick from '../../../Functions/clickOutside'
import ConfirmBox from '../../../Components/Reusable/ConfirmBox'
import showToast from '../../../Components/Reusable/ToastNotification'
import Table from '../../../Components/Reusable/Table'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import SectionSelector from '../../../Components/Reusable/SectionSelector'
//ICONS
import { FaPlus, FaBookmark } from 'react-icons/fa6'
import { useAuth0 } from '@auth0/auth0-react'
import { HiTrash } from 'react-icons/hi2'
import { FaPerson, FaCircleNodes } from "react-icons/fa6";
import parseMessageToBold from '../../../Functions/parseToBold'


//TYPING
interface GroupData  {
    uuid: string,
    name: string,
    distribution_method:'manual' | 'round_robin', 
    emoji:string
    users: string[],
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

 
//MAIN FUNCTION
function Groups () {

    //AUTH CONSTANT
    const auth = useAuth()
    const {  getAccessTokenSilently } = useAuth0()
    const { t } = useTranslation('settings')
    const groupsMapDict:{[key:string]:[string, number]} = {name:[t('Name'), 150], distribution_method:[t('distribution_method'), 120], users:[t('Users'), 500]}
    const newGroup:GroupData = {
        uuid: '-1',
        name: t('NewGroup'),
        distribution_method:'round_robin',
        emoji:'',
        users: []
    }
    const CellStyle = ({column, element}:{column:string, element:any}) => {
        if (column === 'distribution_method') return (
        <Box boxShadow={`1px 1px 1px rgba(0, 0, 0, 0.15)`} display="inline-flex" fontSize='.9em' py='2px' px='8px' fontWeight={'medium'} color='white'  bg={element === 'manual'?'red.100':'green.100'} borderRadius={'.7rem'}> 
            <Text  color={element === 'manual'?'red.600':'green.600'}>{t(element)}</Text>
        </Box>)
        else return <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{column === 'users'?element.map((user:any) => auth.authData.users?.[user].name).join(' - '):element}</Text>
    }
    

    //GROUPS DATA
    const [groupsData, setGroupsData] = useState<GroupData[] | null>(null) 

    //SELECTED GROUP
    const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null)

    //GROUP TO DELETE
    const [groupToDelete, setGroupToDelete] = useState<GroupData | null>(null)


    //FETCH INITIAL DATA
    useEffect(() => {
        fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/teams`, setValue:setGroupsData, getAccessTokenSilently, auth})
        document.title = `${t('Settings')} - ${t('Groups')} - ${auth.authData.organizationName} - Matil`
    }, [])

    //DELETE BOX COMPONENT
    const DeleteComponent = () => {

        //WAITING DELETION
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

        //FUNCTION FOR DELETING AN AUTOMATION
        const deleteGroup = async () => {
            setWaitingDelete(true)
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/teams/${groupToDelete?.uuid}`, setWaiting:setWaitingDelete, method:'delete', auth, getAccessTokenSilently, toastMessages:{works:t('CorrectDeletedGroup'), failed:t('FailedDeletedGroup')}})
            if (response?.status == 200) {
                setGroupToDelete(null)
                setGroupsData(prev => {
                    if (prev) return prev.filter((group) => group.uuid !== groupToDelete?.uuid)
                    else return null
                })
            }             
        }

        //FRONT
        return(<>
            <Box p='15px'> 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{parseMessageToBold(t('ConfirmDeleteGroup', {name:groupToDelete?.name}))}</Text>
                <Text mt='2vh' color='gray.600' fontSize={'.8em'}>{t('DeleteGroupWarning')}</Text>
     
                <Flex mt='3vh' gap='15px' flexDir={'row-reverse'}>
                    <Button  size='sm'variant={'delete'} onClick={deleteGroup}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                    <Button  size='sm'variant={'common'} onClick={() => setGroupToDelete(null)}>{t('Cancel')}</Button>
                </Flex>
            </Box>
        </>)
    }

    //DELETE BOX
    const memoizedDeleteBox = useMemo(() => (
        <ConfirmBox setShowBox={(b:boolean) => setGroupToDelete(null)}> 
            <DeleteComponent/>
        </ConfirmBox>
    ), [groupToDelete])


    const memoizedGroupBox = useMemo(() => (
        <ConfirmBox setShowBox={(b:boolean) => setSelectedGroup(null)}> 
            <EditGroup groupData={selectedGroup as GroupData} setGroupData={setSelectedGroup} setGroupsData={setGroupsData}/>
        </ConfirmBox>
    ), [selectedGroup])
    
    return(
        <Box px='2vw' py='2vh'>        

        {groupToDelete !== null && memoizedDeleteBox}
        {selectedGroup !== null  && memoizedGroupBox}
        <Flex justifyContent={'space-between'} alignItems={'end'}> 
            <Box> 
                <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('GroupsTable')}</Text>
                <Text color='gray.600' fontSize={'.8em'}>{t('GroupsDescription')}</Text>
            </Box>
            <Button  variant={'main'}size='sm' leftIcon={<FaPlus/>} onClick={() => setSelectedGroup(newGroup)}>{t('CreateGroup')}</Button>

        </Flex>
        <Box width='100%' bg='gray.200' height='1px' mt='2vh' mb='2vh'/> 
        
        <Flex  mt='2vh' justifyContent={'space-between'} alignItems={'end'}>
            <Skeleton isLoaded={groupsData !== null}> 
                <Text  fontWeight={'medium'} color='gray.600'>{t('GroupsCount', {count:groupsData?.length})}</Text>
            </Skeleton>
         </Flex>

        <Skeleton isLoaded={groupsData !== null}> 
            <Table data={groupsData || []} CellStyle={CellStyle} excludedKeys={['uuid', 'emoji']} noDataMessage={t('NoGroups')} columnsMap={groupsMapDict} onClickRow={(row:any, index:number) => setSelectedGroup(row)} deletableFunction={(row:any, index) => setGroupToDelete(row)}/>
        </Skeleton>
    </Box>)
}

const EditGroup = ({groupData, setGroupData, setGroupsData}:{groupData:GroupData, setGroupData:Dispatch<SetStateAction<GroupData | null>>, setGroupsData:Dispatch<SetStateAction<GroupData[] | null>> }) => {

    //CONSTANTS
    const auth = useAuth()
    const {  getAccessTokenSilently } = useAuth0()
    const { t } = useTranslation('settings')

    //REFS
    const emojiButtonRef = useRef<HTMLDivElement>(null)
    const emojiBoxRef = useRef<HTMLDivElement>(null)
    const [emojiVisible, setEmojiVisible] = useState<boolean>(false)
    useOutsideClick({ref1:emojiButtonRef, ref2:emojiBoxRef, onOutsideClick:setEmojiVisible})
    const handleEmojiClick = (emojiObject: EmojiClickData) => {setCurrentGroupData(prev => ({...prev, emoji:emojiObject.emoji}))}
    const scrollRef = useRef<HTMLDivElement>(null)
 
    //BOOLEAN FOR WAIT TO THE SEND GROUP
    const [waitingSend, setWaitingSend] = useState<boolean>(false)

    //GROUP DATA
    const groupDataRef = useRef<GroupData>(groupData)
    const [currentGroupData, setCurrentGroupData] = useState<GroupData>(groupData)

    //ADD A USER TO A GROUP
    const addUser = async(user:string) => {

        if (groupData.uuid !== '-1') {
            const userResponse = await fetchData({endpoint: `${auth.authData.organizationId}/admin/settings/teams/${groupData.uuid}/users/${user}`, getAccessTokenSilently,  method: 'post', auth})
            if (userResponse?.status === 200) {
                setCurrentGroupData(prev => {return {...prev, users:[...prev.users, user ]}})
                setGroupsData(prev => {
                    if (prev) {
                        return prev?.map((group) => {
                            if (group.uuid === groupData.uuid) return {...group, users:[...group.users, user ]}
                            else return group
                        })
                    }
                    else return null
                })
            }
        }
        else setCurrentGroupData(prev => {return {...prev, users:[...prev.users, user ]}})
    }

    //DELETE A USER FROM A GROUP
    const deleteUser = async(index:number, userId:string) => {

        if (groupData.uuid !== '-1') {
            const userResponse = await fetchData({endpoint: `${auth.authData.organizationId}/admin/settings/teams/${groupData.uuid}/users/${userId}`,  getAccessTokenSilently,method: 'delete', auth})
            if (userResponse?.status === 200) {
                setCurrentGroupData(prev => {
                    const newUsers = [...prev.users]
                    newUsers.splice(index, 1)
                    return {...prev, users:newUsers}
                })
                setGroupsData(prev => {
                    if (prev) {
                        return prev?.map((group) => {
                            if (group.uuid === groupData.uuid) return {...group, users:group.users.splice(index, 1)}
                            else return group
                        })
                    }
                    else return null
                })
            }
        }
        else {
            setCurrentGroupData(prev => {
                const newUsers = [...prev.users]
                newUsers.splice(index, 1)
                return {...prev, users:newUsers}
            })
        }
    }
    
    //EDIT AND CREATE A GROUP
    const sendEditGroup = async () => {
        setWaitingSend(true)    

        if (groupData.uuid === '-1') {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/teams`, requestForm:{name:currentGroupData.name, emoji:currentGroupData.emoji, distribution_method:currentGroupData.distribution_method}, getAccessTokenSilently, method:'post', auth})
             if (response?.status === 200) {
                const assignUserPromises = currentGroupData.users.map(async (user) => {
                    const userResponse = await fetchData({endpoint: `${auth.authData.organizationId}/admin/settings/teams/${response?.data.uuid}/users/${user}`,  getAccessTokenSilently,method: 'post',auth})
                    if (userResponse?.status !== 200) throw new Error(`Failed to add user ${user}`)
                    return userResponse
                })
                try {
                    await Promise.all(assignUserPromises)
                    showToast({ message: t('CorrectAddedGroup'), type: 'works' })
                    setGroupsData(prev => {
                        if (prev) return [...prev, {...currentGroupData, id:response.data.id}]
                        else return null
                    })
                    setGroupData(null)
                } 
                catch (error) {showToast({ message: t('FailedToAddSomeUsers'), type: 'failed' })}
            }
            else showToast({message:t('FailedAddedGroup'), type:'failed'})
        } 
        else {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/teams/${groupData.uuid}`, getAccessTokenSilently, requestForm:{name:currentGroupData.name, emoji:currentGroupData.emoji, distribution_method:currentGroupData.distribution_method}, method:'put', auth, toastMessages:{'works':t('CorrectEditedGroup'),'failed':t('FailedEditedGroup')}})
            
            if (response?.status === 200) {
                setGroupsData(prev => {
                    if (prev) {
                        return prev?.map((group) => {
                            if (group.uuid === groupData.uuid) return currentGroupData
                            else return group
                        })
                    }
                    else return null
                })
                setGroupData(null)
            }
 
        }
        setWaitingSend(false)    

    }
    
    //FIND USER BOX
    const FindUser = () => {

        //OBTAINING A LIST WITH ALL
        const userList = Object.entries(auth?.authData?.users || {}).map(([id, user]) => {return {id: id,  name: user.name, surname: user.surname, email: user.email_address, profile_picture: user.profile_picture, is_admin: user.is_admin}})
  
        //REFS
        const buttonRef = useRef<HTMLDivElement>(null)
        const boxRef = useRef<HTMLDivElement>(null)
        
        //FILER USERS LIST
        const [text, setText] = useState<string>('')
        const [showResults, setShowResults] = useState<boolean>(false)
        const [filteredUsers, setFilteredUsers] = useState<{id: string,  name: string, surname: string, email: string, profile_picture:string, is_admin: boolean}[]>(userList)

        //BOOLEAN TO CONTROL THE VISIBILITY OF THE LIST AND CLOSE ON OUTSIDE CLICK
        useOutsideClick({ref1:buttonRef, ref2:boxRef, containerRef:scrollRef, onOutsideClick:setShowResults})
    
        useEffect(() => {
            if (text === '') {setShowResults(false)}
            else {
                setShowResults(true)
                const filtered = (userList).filter((user:any) => {
                    const fullNameEmail = `${user.name} ${user.surname} ${user.email}`.toLowerCase()
                    const userExistsInGroup = currentGroupData.users.some(groupUser => groupUser === user.id)
                    return fullNameEmail.includes(text.toLowerCase()) && !userExistsInGroup
                  })
                setFilteredUsers(filtered)
            }
        }, [text])
    
 
     return (
         <Box position={'relative'} maxW={'300px'}>
            <Box > 
                <EditText value={text} setValue={setText} searchInput={true} placeholder={t('FindUser')}/> 
            </Box>
            <AnimatePresence> 
                {showResults && 
                <MotionBox initial={{ opacity: 5, marginTop: -5 }} animate={{ opacity: 1, marginTop: 5 }}  exit={{ opacity: 0,marginTop:-5}} transition={{ duration: '0.2',  ease: 'easeOut'}}
                 maxH='30vh' overflow={'scroll'} width='140%' gap='10px' ref={boxRef} fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100000} position={'absolute'} left={0} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'gray.300'}>
                        <Box maxH='30vh'>
                            {filteredUsers.length === 0? 
                            <Box p='15px'><Text fontSize={'.9em'} color='gray.600'>{t('NoCoincidence')}</Text></Box>
                            :<> 
                            {filteredUsers.map((user:{id: string,  name: string, surname: string, email: string, profile_picture:string, is_admin: boolean}, index:number) => (
                                <Flex _hover={{bg:'gray.50'}} cursor={'pointer'} alignItems={'center'} onClick={() => {setText('');setShowResults(false);addUser(user.id)}} key={`user-${index}`} p='10px' gap='10px' >
                                    
                                    {user.profile_picture ? 
                                        <Image h='20px' w='20px' src={user.profile_picture}/>
                                        :
                                        <Avatar size='20px' name={user.name + ' ' + user.surname}/>
                                    }
                                    <Box>
                                        <Text fontWeight={'medium'} fontSize={'.9em'}>{user.name} {user.surname}</Text>
                                        <Text fontSize={'.9em'}>{user.email}</Text>
                                    </Box>
                                </Flex>
                            ))}</>}
                        </Box>

                </MotionBox>} 
            </AnimatePresence>
         </Box>
     )
    }

    //FRONT
    return (<>    
        <Box p='15px'> 
    
            <Text fontWeight={'medium'} fontSize={'1.2em'}  >{currentGroupData.uuid === '-1'? t('CreateGroup'):t('EditGroup')}</Text>
            <Flex mt='2vh' alignItems={'center'} gap='10px'> 
                <Flex cursor={'pointer'} ref={emojiButtonRef} onClick={() => setEmojiVisible(true)} alignItems={'center'} justifyContent={'center'} width={'32px'} height={'32px'} borderWidth={'1px'} borderColor={'gray.200'} borderRadius={'.5rem'}> 
                    {currentGroupData.emoji ? <Text fontSize={'.9em'}>{currentGroupData.emoji}</Text>:<Icon boxSize={'.9em'} as={FaBookmark}/>}
                </Flex>
                <EditText placeholder={t('Name')} hideInput={false} value={currentGroupData.name} setValue={(value:string) => setCurrentGroupData(prev => ({...prev, name:value}))}/>
            </Flex>

            <Text mt='2vh' mb='.5vh' fontSize={'.8em'} fontWeight={'medium'}>{t('DistributionMethod')}</Text>
            <SectionSelector size='xs' sections={['round_robin', 'manual']} selectedSection={currentGroupData.distribution_method} sectionsMap={{'round_robin':[t('round_robin'), <FaCircleNodes/>], 'manual':[t('manual'), <FaPerson/>]}} onChange={(value) => setCurrentGroupData(prev => ({...prev, distribution_method:value}))}/>

            <Box mt='2vh' flex={1} >
                <Text mb='1vh' fontSize={'.8em'} fontWeight={'medium'}>{t('AddUsersGroup')}</Text>
                <FindUser/>
                <Box maxW={'600px'} mt='2vh'> 
                    {currentGroupData.users.length === 0 ?<Text mt='2vh' fontSize={'.8em'} color='gray.600' fontWeight={'medium'}>{t('NoUsers')}</Text>:<>
                    {currentGroupData.users.map((user, index) => (
                    <Flex justifyContent={'space-between'} borderBottomColor={'gray.300'} borderBottomWidth={'1px'} _hover={{bg:'gray.50'}} cursor={'pointer'} alignItems={'center'}  key={`user-selected-${index}`} p='10px' gap='10px' >
                        <Flex  alignItems={'center'} gap='10px'> 
                            {auth.authData.users?.[user].profile_picture ? 
                                <Image h='20px' w='20px' src={auth.authData.users?.[user].profile_picture}/>
                                :
                                <Avatar h='28px' size='sm' fontSize={'10px'} w='28px' name={auth.authData.users?.[user].name + ' ' + auth.authData.users?.[user].surname}/>
                            }
                            <Box>
                                <Text fontWeight={'medium'} fontSize={'.8em'}>{auth.authData.users?.[user].name} {auth.authData.users?.[user].surname}</Text>
                                <Text fontSize={'.75em'} color='gray.600'>{auth.authData.users?.[user].email_address}</Text>
                            </Box>
                        </Flex>
                        <IconButton aria-label='delete-user' icon={<HiTrash/>} size='sm' bg='transparent' variant={'delete'} onClick={() => deleteUser(index, user)}/>
                    </Flex>
                    ))}</>}
                </Box>
            </Box>
    
            <Flex mt='3vh' gap='15px' flexDir={'row-reverse'}>
                <Button size='sm' variant={'main'} onClick={sendEditGroup} isDisabled={currentGroupData.name === ''  || currentGroupData.users.length === 0 || ((JSON.stringify(currentGroupData) === JSON.stringify(groupDataRef.current)))}>{waitingSend?<LoadingIconButton/>:groupData.uuid === '-1'?t('CreateGroup'):t('SaveChanges')}</Button>
                <Button size='sm' variant={'common'} onClick={() => setGroupData(null)}>{t('Cancel')}</Button>
            </Flex>
        </Box>

        {emojiVisible && 
        <Portal> 
            <Box id='custom-portal' position={'fixed'} zIndex={1000000} pointerEvents={emojiVisible?'auto':'none'} transition='opacity 0.2s ease-in-out' opacity={emojiVisible ? 1:0} top={`${(emojiButtonRef?.current?.getBoundingClientRect().top || 0)}px`} right={`${window.innerWidth - (emojiButtonRef?.current?.getBoundingClientRect().left || 0) + 5}px`}  ref={emojiBoxRef}> 
                <EmojiPicker open={emojiVisible} onEmojiClick={handleEmojiClick}  allowExpandReactions={false}/>
            </Box>
        </Portal>}
    </>)
}

export default Groups