
//REACT
import  { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../../../AuthContext'

//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, IconButton, Button, Textarea, Skeleton } from "@chakra-ui/react"
//COMPONENTS
import EditText from '../../../Components/Reusable/EditText'
import LoadingIconButton from '../../../Components/Reusable/LoadingIconButton'
import ConfirmBox from '../../../Components/Reusable/ConfirmBox'
//FUNCTIONS
import parseMessageToBold from '../../../Functions/parseToBold'
//ICONS
import { useTranslation } from 'react-i18next'
import { FaPlus, } from 'react-icons/fa6'
 import { FaEdit } from 'react-icons/fa'
import { HiTrash } from 'react-icons/hi2'
import { useAuth0 } from '@auth0/auth0-react'
//MAIN FUNCTION
function Themes () {

    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('settings')
    const {  getAccessTokenSilently } = useAuth0()

    //SHORTCUTS DATA
    const [addThemeIndex, setAddThemeIndex] = useState<number | null>(null)
    const [deleteThemeIndex, setDeleteThemeIndex] = useState<number | null>(null)

    const [currentThemes, setCurrentThemes] = useState<{name:string, description:string}[] | null>(null)

    //MODIFY TITLE
    useEffect (() => {
        document.title = `${t('Settings')} - ${t('Themes')} - ${auth.authData.organizationName} - Matil`
        fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/themes`,  setValue:setCurrentThemes, auth,  getAccessTokenSilently})
    }, [])
    
    //ADD AND DELETE SHORTCUT
    const handleAddTheme = async(newThemes:{name:string, description:string}[]) => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/themes`, method:'put', auth:auth, requestForm:newThemes, getAccessTokenSilently,  toastMessages:{'works':t('CorrectEditedTheme'), 'failed':t('FailedEditedTheme')}})
        if (response?.status === 200) {
            auth.setAuthData({conversation_themes:newThemes?.map(theme => theme.name)})  
            setCurrentThemes(newThemes)
        }
    }
    
    //ADD SHORTCUT COMPONENT
    const AddThemeComponent = ({index}:{index:number}) => {
        const [waitingAdd, setWaitingAdd] = useState<boolean>(false)
        const [newOption, setNewOption] = useState<{name:string, description:string}>(index === -1 ? {name:'', description:''}:(currentThemes as {name:string, description:string}[])[index])
        const addTheme = async() => {
            setWaitingAdd(true)
            await handleAddTheme(index === -1 ?[...currentThemes as {name:string, description:string}[], newOption ]:(currentThemes?.map((theme, i) => i === index ? newOption : theme) || []))
            setWaitingAdd(false)
            setAddThemeIndex(null)
        }
        return(<> 
            <Box p='20px'>
                <Text fontWeight={'medium'} fontSize={'.9em'}  mb='.5vh'>{t('Name')}</Text>
                <EditText hideInput={false} placeholder={t('Name')}  value={newOption.name}  setValue={(value:string) => setNewOption(prev => ({...prev, name:value}))}  />
                <Text  fontWeight={'medium'} fontSize={'.9em'} mt='2vh' mb='.5vh'>{t('Description')}</Text>
                <Textarea resize={'none'} maxLength={2000} height={'auto'} placeholder={`${t('Description')}...`} maxH='300px' value={newOption.description} onChange={(e) => setNewOption((prev) => ({...prev, description:e.target.value}))} p='8px'  borderRadius='.5rem' fontSize={'.9em'}  _hover={{border: "1px solid #CBD5E0" }} _focus={{p:'7px',borderColor: "rgb(59, 90, 246)", borderWidth: "2px"}}/>
            </Box>
            <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'}bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                <Button  size='sm' variant={'main'} onClick={addTheme}>{waitingAdd?<LoadingIconButton/>:index === -1?t('AddTheme'):t('EditTheme')}</Button>
                <Button  size='sm' variant={'common'} onClick={()=> setAddThemeIndex(null)}>{t('Cancel')}</Button>
            </Flex>  
            </>)
    }
 
    const DeleteThemeComponent = ({index}:{index:number}) => {
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)
        const deleteTheme = async() => {
            setWaitingDelete(true)
            await handleAddTheme(currentThemes?.filter((_, i) => i !== index) || [] )
            setWaitingDelete(false)
            setDeleteThemeIndex(null)
        }
       
        return(<> 
            <Box p='20px'>
                <Text width={'400px'}>{parseMessageToBold(t('DeleteThemeQuestion', {name:currentThemes?.[index].name}))}</Text>
            </Box>
            <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'}bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                <Button  size='sm' variant={'delete'} onClick={deleteTheme}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                <Button  size='sm' variant={'common'} onClick={()=> setAddThemeIndex(null)}>{t('Cancel')}</Button>
            </Flex>  
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

            <Box width='100%' bg='gray.300' height='1px' mt='2vh' />
        </Box>

        <Box flex='1' width={'60%'} px='2vw' mt='2vh' minW={'500px'} pb='5vh'  overflow={'scroll'}> 
            <Skeleton isLoaded={currentThemes !== null}> 
                {currentThemes?.map((theme, index) => (
                    <Box cursor={'pointer'} key={`option-${index}`} mt={index === 0?'0':'1vh'} shadow='sm' p='15px' borderRadius='.5rem' borderColor="gray.200" borderWidth="1px" > 
                        <Flex justifyContent={'space-between'} alignItems={'center'} >
                            <Text fontWeight={'medium'} fontSize={'1.1em'}>{theme.name}</Text>
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