
//REACT
import  { useState, useEffect } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
import { useAuth0 } from '@auth0/auth0-react'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, IconButton } from "@chakra-ui/react"
//COMPONENTS
import EditText from '../../../Components/Reusable/EditText'
//ICONS
import { HiTrash } from 'react-icons/hi2'
  
//MAIN FUNCTION
function Shortcuts () {

    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('settings')
    const {  getAccessTokenSilently } = useAuth0()


    //SHORTCUTS DATA
    const [currentShorcuts, setCurrentShortcuts] = useState<string[]>(auth.authData.preferences.shortcuts)

    //MODIFY TITLE
    useEffect (() => {document.title = `${t('Settings')} - ${t('Shortcuts')} - ${auth.authData.organizationName} - Matil`}, [])
    
    //ADD AND DELETE SHORTCUT
    const addOption = (newOption:string) => {
        const shortCutsCopy = [...currentShorcuts]
        const newShortcuts = [...shortCutsCopy, newOption]
        sendEditShortcut(newShortcuts)
    }
    const removeOption = (index:number) => {
        const shortCutsCopy = [...currentShorcuts]
        const newShortcuts = shortCutsCopy.filter((_, i) => i !== index)
        sendEditShortcut(newShortcuts)
    }

    //UPDATE SHORTCUTS
    const sendEditShortcut = async(newShortCuts:string[]) => {
        setCurrentShortcuts(newShortCuts)
        const newViews = {...auth.authData.views, shortcuts:newShortCuts}
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/user`, method:'put', auth:auth,  getAccessTokenSilently, requestForm:newViews, toastMessages:{'works':t('CorrectAddedShortcut'), 'failed':t('FailedAddedShortcut')}})
        //if (response?.status === 200) auth.setAuthData({shortcuts:currentShorcuts})  
    }
    
    //ADD SHORTCUT COMPONENT
    const AddOptionComponent = () => {

        const [newOption, setNewOption] = useState<string>('')

        return(<Box mt='1vh'>
                <EditText placeholder={t('AddShortcut')}  value={newOption} updateData={() => {if (newOption !== '') addOption(newOption)}} setValue={setNewOption} hideInput={true} />
            </Box>)
    }
 
    return(
    <Flex flexDir={'column'} h='100vh'>
        <Box px='2vw' pt='2vw'> 
            <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('Shortcuts')}</Text>
            <Text color='text_gray' fontSize={'.8em'}>{t('ShortcutsDes')}</Text>
            <Box width='100%' bg='border_color' height='1px' mt='2vh' mb='2vh'/>

        </Box>
 

         <Box width={'60%'}  minW={'500px'} px='2vw' pb='2vh'> 
            {currentShorcuts?.map((option, index) => (
                <Flex key={`option-${index}`} mt={index === 0?'0':'1vh'} justifyContent={'space-between'}  shadow='sm' p='5px' borderRadius='.5rem' borderColor="border_color" borderWidth="1px"  >
                    <Text fontSize={'.9em'}>{option}</Text>
                    <IconButton color={'red'} onClick={() => removeOption(index)} aria-label="remove-option" icon={<HiTrash  size='15px'/>} size="xs" border='none' bg='transparent'  />
                </Flex>
            ))}
            <AddOptionComponent/>       
        </Box>
             
   
    </Flex>)
}

export default Shortcuts