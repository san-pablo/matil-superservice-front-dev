
//REACT
import  { useState, useEffect, useMemo, useRef } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useAuth0 } from '@auth0/auth0-react'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, IconButton, Button, Icon, Skeleton, Portal } from "@chakra-ui/react"
//COMPONENTS
import EditText from '../../../Components/Reusable/EditText'
import LoadingIconButton from '../../../Components/Reusable/LoadingIconButton'
import ConfirmBox from '../../../Components/Reusable/ConfirmBox'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
//FUNCTIONS
import parseMessageToBold from '../../../Functions/parseToBold'
import useOutsideClick from '../../../Functions/clickOutside'
//ICONS
import { useTranslation } from 'react-i18next'
import { FaBookmark, FaPlus, } from 'react-icons/fa6'
import { FaEdit } from 'react-icons/fa'
import { HiTrash } from 'react-icons/hi2'

 //MAIN FUNCTION
function Themes () {

    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('settings')
    const {  getAccessTokenSilently } = useAuth0()

    //SHORTCUTS DATA
    const [addThemeIndex, setAddThemeIndex] = useState<number | null>(null)
    const [deleteThemeIndex, setDeleteThemeIndex] = useState<number | null>(null)

    const [currentThemes, setCurrentThemes] = useState<{uuid:string, name:string, description:string, emoji:string}[] | null>(null)
    useEffect(() => {if (currentThemes) auth.setAuthData({conversation_themes:currentThemes})},[currentThemes])

    //MODIFY TITLE
    useEffect (() => {
        document.title = `${t('Settings')} - ${t('Themes')} - ${auth.authData.organizationName} - Matil`
        fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/themes`,  setValue:setCurrentThemes, auth,  getAccessTokenSilently})
    }, [])
    
    //ADD SHORTCUT COMPONENT
    const AddThemeComponent = ({index}:{index:number}) => {

        //REFS
        const emojiButtonRef = useRef<HTMLDivElement>(null)
        const emojiBoxRef = useRef<HTMLDivElement>(null)
        const [emojiVisible, setEmojiVisible] = useState<boolean>(false)
        useOutsideClick({ref1:emojiButtonRef, ref2:emojiBoxRef, onOutsideClick:setEmojiVisible})
        const handleEmojiClick = (emojiObject: EmojiClickData) => {setNewOption(prev => ({...prev, emoji:emojiObject.emoji}))}

        //WAITING EDIT OR ADD 
        const [waitingAdd, setWaitingAdd] = useState<boolean>(false)

        //DATA
        const [newOption, setNewOption] = useState<{uuid:string, name:string, description:string, emoji:string}>(index === -1 ? {uuid:'', emoji:'',name:'', description:''}:(currentThemes as any)[index])
        
        //FUNCTION
        const addTheme = async() => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/themes${index !== -1 ?`/${newOption.uuid}` :''}`, method:index === -1 ? 'post':'put', auth, requestForm:newOption, setWaiting:setWaitingAdd, getAccessTokenSilently,  toastMessages:{'works':t('CorrectEditedTheme'), 'failed':t('FailedEditedTheme')}})
            if (response?.status === 200) {
                if (index === -1) newOption.uuid =response.data.uuid
                setCurrentThemes(prev => ([...prev as any, newOption]))
            }
            setAddThemeIndex(null)
        }

        //FRONT
        return(<> 
            <Box p='15px'>
                <Text fontWeight={'medium'} fontSize={'1.2em'} >{index === -1? t('AddTheme'):t('EditTheme')}</Text>

                <Flex mt='2vh' alignItems={'center'} gap='10px'> 
                    <Flex cursor={'pointer'} ref={emojiButtonRef} onClick={() => setEmojiVisible(true)} alignItems={'center'} justifyContent={'center'} width={'32px'} height={'32px'} borderWidth={'1px'} borderColor={'gray.200'} borderRadius={'.5rem'}> 
                        {newOption.emoji ? <Text fontSize={'.9em'}>{newOption.emoji}</Text>:<Icon boxSize={'.9em'} as={FaBookmark}/>}
                    </Flex>
                    <EditText placeholder={t('Name')} hideInput={false} value={newOption.name} setValue={(value:string) => setNewOption(prev => ({...prev, name:value}))}/>
                </Flex>

                <Text  fontWeight={'medium'} fontSize={'.9em'} mt='2vh' mb='.5vh'>{t('Description')}</Text>
                <EditText isTextArea placeholder={`${t('Description')}...`} hideInput={false} value={newOption.description} setValue={(value:string) => setNewOption(prev => ({...prev, description:value}))}/>
                <Flex mt='3vh' gap='15px' flexDir={'row-reverse'}>
                    <Button  size='sm' variant={'main'} onClick={addTheme}>{waitingAdd?<LoadingIconButton/>:index === -1?t('AddTheme'):t('EditTheme')}</Button>
                    <Button  size='sm' variant={'common'} onClick={()=> setAddThemeIndex(null)}>{t('Cancel')}</Button>
                </Flex>  
            </Box>
            {emojiVisible && 
            <Portal> 
                <Box position={'fixed'} zIndex={1000000} pointerEvents={emojiVisible?'auto':'none'} transition='opacity 0.2s ease-in-out' opacity={emojiVisible ? 1:0} top={`${(emojiButtonRef?.current?.getBoundingClientRect().bottom || 0) + 5}px`} left={`${(emojiButtonRef?.current?.getBoundingClientRect().left || 0)}px`}  ref={emojiBoxRef}> 
                <EmojiPicker open={emojiVisible}
                onEmojiClick={handleEmojiClick}  allowExpandReactions={false}/></Box>
            </Portal>}

            </>)
    }
 
    const DeleteThemeComponent = ({index}:{index:number}) => {
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)
        const deleteTheme = async() => {
             const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/themes/${currentThemes?.[index].uuid}`, method:'delete', auth:auth, setWaiting:setWaitingDelete, getAccessTokenSilently,  toastMessages:{'works':t('CorrectDeletedTheme'), 'failed':t('FailedDeletedTheme')}})
            if (response?.status === 200) setCurrentThemes(prev => prev?.filter((_, i) => i !== index) || [] )
            setDeleteThemeIndex(null)
        }
       
        return(<> 
            <Box p='15px'>
                <Text fontSize={'1.2em'}>{parseMessageToBold(t('DeleteThemeQuestion', {name:currentThemes?.[index].name}))}</Text>
                <Text fontSize={'.8em'} mt='2vh' color='gray.600'>{t('DeleteThemeWarning')}</Text>
     
                <Flex  mt='2vh' gap='15px' flexDir={'row-reverse'} >
                    <Button  size='sm' variant={'delete'} onClick={deleteTheme}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                    <Button  size='sm' variant={'common'} onClick={()=> setAddThemeIndex(null)}>{t('Cancel')}</Button>
                </Flex> 
            </Box> 
            </>)
    }
    const memoizedAddThemeBox = useMemo(() => (
        <ConfirmBox setShowBox={() => setAddThemeIndex(null)}> 
            <AddThemeComponent index={addThemeIndex as number}/>
        </ConfirmBox>
    ), [addThemeIndex])

    const memoizedDeleteThemeBox = useMemo(() => (
        <ConfirmBox setShowBox={() => setDeleteThemeIndex(null)}> 
            <DeleteThemeComponent index={deleteThemeIndex as number}/>
        </ConfirmBox>
    ), [deleteThemeIndex])
    
    return(<>
    {addThemeIndex !== null && memoizedAddThemeBox}
    {deleteThemeIndex !== null && memoizedDeleteThemeBox}
 
        <Box px='2vw' pt='2vh'> 
            <Flex justifyContent={'space-between'} alignItems={'end'}> 
                <Box> 
                    <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('Themes')}</Text>
                    <Text color='gray.600' fontSize={'.8em'}>{t('ThemesDes')}</Text>
                </Box>
                <Button variant={'main'} leftIcon={<FaPlus/>} size='sm' onClick={() => setAddThemeIndex(-1)}>{t('AddTheme')}</Button>

            </Flex>
            <Box width='100%' bg='gray.200' height='1px' mt='2vh' />
        </Box>

        <Box flex='1' width={'60%'} px='2vw' mt='2vh' minW={'500px'} pb='5vh'  overflow={'scroll'}> 
            <Skeleton isLoaded={currentThemes !== null}> 
                {currentThemes?.map((theme, index) => (
                    <Box cursor={'pointer'} key={`option-${index}`} mt={index === 0?'0':'1vh'} shadow='sm' p='15px' borderRadius='.5rem' borderColor="gray.200" borderWidth="1px" > 
                        <Flex justifyContent={'space-between'} alignItems={'center'} >
                             <Text fontWeight={'medium'}>{theme.emoji} {theme.name}</Text>
                             <Flex gap='5px'> 
                                <IconButton size='xs' bg='transparent'  variant={'common'} icon={<FaEdit size='14px'/>}  onClick={() => setAddThemeIndex(index)} aria-label="edit-param"/>
                                <IconButton size='xs' bg='transparent' variant={'delete'} onClick={() => setDeleteThemeIndex(index)} icon={<HiTrash  size='14px'/>} aria-label="delete-param"/>
                            </Flex>
                        </Flex>
                        <Text mt='1vh' fontSize={'.9em'}>{theme.description}</Text>
                    </Box>
                ))}
            </Skeleton>
        </Box>
       
             

    </>)
}

export default Themes