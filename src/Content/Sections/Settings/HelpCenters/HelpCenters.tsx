
//REACT
import  {useState, useEffect, Dispatch, useMemo, SetStateAction } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, Icon, Skeleton, Button } from "@chakra-ui/react"
//COMPONENTS
import EditText from '../../../Components/Reusable/EditText'
import ConfirmBox from '../../../Components/Reusable/ConfirmBox'
import LoadingIconButton from '../../../Components/Reusable/LoadingIconButton'
//ICONS
import { FaCircleDot } from "react-icons/fa6"
import { FaPlus } from "react-icons/fa"
  
function HelpCenters ({helpCentersData, setHelpCentersData}:{helpCentersData:{id: string, name: string, is_live: boolean}[], setHelpCentersData:Dispatch<SetStateAction<{id: string, name: string, is_live: boolean}[]>>}) {

    //CONSTANTS
    const { t } = useTranslation('settings')
    const {  getAccessTokenSilently } = useAuth0()
    const auth = useAuth()
    const navigate = useNavigate()
   
    //DATA
     //CREATE HELP CENTER
    const [showCreate, setShowCreate] = useState<boolean>(false)
 
    useEffect(() => {document.title = `${t('Settings')} - ${t('HelpCenters')} - ${auth.authData.organizationName} - Matil`}, [])


     //FUNCTION FOR DELETING THE TRIGGER
     const AddComponent = () => {

        //NEW HELP CENTER
        const [waitingCreate, setWaitingCreate] = useState<boolean>(false)
        const [newHelpCenter, setNewHelpCenter] = useState<{name:string, id:string}>({name:'', id:''})

        //FUNCTION FOR DELETING AN AUTOMATION
        const createHelpCenter = async () => {
            const newData = {...newHelpCenter, is_live:false, style:{}, languages:[auth.authData.userData?.language], created_by:auth.authData.userId, updated_by:auth.authData.userId}
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/help_centers`, getAccessTokenSilently, method:'post', setWaiting:setWaitingCreate, requestForm:newData,  auth, toastMessages:{works:t('CorrectCreatedHelpCenter'), failed:t('FailedCreatedHelpCenter')}})
            if (response?.status === 200) setHelpCentersData(prev => [...prev as {name: string, is_live: boolean, id: string}[], {name: newData.name, is_live: false, id: newData.id} ])
            setShowCreate(false)
        }

        //FRONT
        return(<>
            <Box p='20px' > 
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('AddHelpCenter')}</Text>
                <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='gray.300'/>
                <Text  mb='.5vh' fontWeight={'medium'}>{t('Name')}</Text>
                <EditText  maxLength={100} placeholder={t('NewHelpCenter')} hideInput={false} value={newHelpCenter.name} setValue={(value) => setNewHelpCenter((prev) => ({...prev, name:value}))}/>
                <Text mt='2vh' mb='.5vh' fontWeight={'medium'}>{t('UrlIdentifier')}</Text>
                <EditText regex={/^[a-zA-Z0-9-_\/]+$/} maxLength={100} placeholder={'matil'} hideInput={false} value={newHelpCenter.id} setValue={(value) => setNewHelpCenter((prev) => ({...prev, id:value}))}/>
            </Box>
            <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                <Button  size='sm' variant={'main'} isDisabled={newHelpCenter.name === '' || newHelpCenter.id === '' || !(/^[a-zA-Z0-9-_\/]+$/).test(newHelpCenter.id)} onClick={createHelpCenter}>{waitingCreate?<LoadingIconButton/>:t('AddHelpCenter')}</Button>
                <Button  size='sm' variant={'common'} onClick={()=> setShowCreate(false)}>{t('Cancel')}</Button>
            </Flex>
        </>)
    }

    //DELETE BOX
    const memoizedAddBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowCreate}> 
            <AddComponent/>
        </ConfirmBox>
    ), [showCreate])
     
    return(<>

    
    {showCreate && memoizedAddBox}
        <Box> 
            <Flex justifyContent={'space-between'} alignItems={'end'}> 
                <Box> 
                    <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('HelpCenters')}</Text>
                    <Text color='gray.600' fontSize={'.9em'}>{t('HelpCentersDes')}</Text>
                </Box>
                <Button  variant='main' size={'sm'} onClick={() => setShowCreate(true)} leftIcon={<FaPlus/>}>{t('CreateHelpCenter')}</Button>
            </Flex>
            <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='3vh'/>
        </Box>

        
        <Skeleton flex='1' style={{ overflow:'scroll'}} isLoaded={helpCentersData !== null}>
            {helpCentersData?.length === 0 ?   
            <Flex height={'100%'} top={0} left={0} width={'100%'} position={'absolute'} alignItems={'center'} justifyContent={'center'}> 
                <Box maxW={'580px'} textAlign={'center'}> 
                    <Text fontWeight={'medium'} fontSize={'2em'} mb='2vh'>{t('NoHelpCenters')}</Text>               
                    <Text fontSize={'1em'} color={'gray.600'} mb='2vh'>{t('NoHelpCentersDes')}</Text>               
                    <Button  variant='main'  onClick={() => setShowCreate(true)} leftIcon={<FaPlus/>}>{t('CreateHelpCenter')}</Button>
                </Box>
            </Flex> : 
            <Flex flexWrap={'wrap'} gap='32px'  >
                {helpCentersData?.map((center, index) => (
                    <Box overflow={'hidden'} onClick={() => navigate(`/settings/help-centers/help-center/${center.id}`)} cursor={'pointer'} borderWidth={'1px'} key={`help-center-${index}`} transition={'box-shadow 0.3s ease-in-out'} _hover={{shadow:'lg'}} borderColor={'gray.300'} shadow={'sm'} borderRadius={'1rem'}>
                        <Box height={'200px'} width={'300px'} bg='brand.text_blue'>
                        </Box>
                        <Box p='20px'>
                            <Text fontWeight={'medium'} fontSize={'1.2em'}>{center.name}</Text>
                            <Flex mt='1vh' alignItems={'center'} gap='10px'>
                                <Icon color={center?.is_live?'#68D391':'#ECC94B'} as={FaCircleDot}/>
                                <Text>{center.is_live?t('Live'):t('NoLive')}</Text>
                            </Flex>
                        </Box>
                    </Box>
                ))}
            </Flex>}
        </Skeleton>
  
    </>)
}
export default HelpCenters