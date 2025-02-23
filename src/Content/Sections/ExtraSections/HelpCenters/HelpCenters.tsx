
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
import ActionsBox from '../../../Components/Reusable/ActionsBox'
//ICONS
import { FaCircleDot } from "react-icons/fa6"
import { FaPlus } from "react-icons/fa"
  
function HelpCenters () {

    //CONSTANTS
    const { t } = useTranslation('settings')
    const {  getAccessTokenSilently } = useAuth0()
    const auth = useAuth()
    const navigate = useNavigate()
    const currentSearch = location.search

    //DATA
    const [showCreate, setShowCreate] = useState<boolean>(false)
 
    const [helpCentersData, setHelpCentersData] = useState<{id: string, name: string, is_live: boolean}[] | null>(null)
    useEffect(() => {
        const fetchHelpCenters = async() => {
            const helpCentersData = await fetchData({endpoint:`${auth.authData.organizationId}/help_centers`, auth, setValue:setHelpCentersData ,getAccessTokenSilently})
        }
        fetchHelpCenters()
        document.title = `${t('Settings')} - ${t('HelpCenters')} - ${auth.authData.organizationName} - Matil`
    }, [])

    const createHelpCenter = async (name:string, ) => {
        const newData = {name, is_live:false, style:{}, languages:[auth.authData.userData?.language], created_by:auth.authData.userId, updated_by:auth.authData.userId}
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/help_centers`, getAccessTokenSilently, method:'post', requestForm:newData,  auth, toastMessages:{works:t('CorrectCreatedHelpCenter'), failed:t('FailedCreatedHelpCenter')}})
        if (response?.status === 200) setHelpCentersData(prev => [...prev as {name: string, is_live: boolean, id: string}[], {name: newData.name, is_live: false, id: response.data.id} ])
        setShowCreate(false)
    }


    return(<>

        <ActionsBox showBox={showCreate} setShowBox={setShowCreate} type="action" des={t('AddHelpCenterDes')} title={t('AddHelpCenter')} buttonTitle={t('AddHelpCenter')} actionFunction={createHelpCenter} />

 
        <Box px='2vw' py='2vh'> 
            <Flex justifyContent={'space-between'} alignItems={'end'}> 
                <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('HelpCenters')}</Text>
                <Button  variant='main' size={'xs'} onClick={() => setShowCreate(true)} leftIcon={<FaPlus/>}>{t('CreateHelpCenter')}</Button>
            </Flex>
         </Box>

        
        <Box flex='1'  overflow={'scroll'} >

            {helpCentersData ? 
            <> 
                {helpCentersData?.length === 0 ?   
                <Flex height={'100%'} top={0} left={0} width={'100%'} alignItems={'center'} justifyContent={'center'}> 
                    <Box maxW={'580px'} textAlign={'center'}> 
                        <Text fontWeight={'medium'} fontSize={'2em'} mb='2vh'>{t('NoHelpCenters')}</Text>               
                        <Text fontSize={'1em'} color={'text_gray'} mb='2vh'>{t('NoHelpCentersDes')}</Text>               
                        <Button  variant='main'  onClick={() => setShowCreate(true)} leftIcon={<FaPlus/>}>{t('CreateHelpCenter')}</Button>
                    </Box>
                </Flex> : 
                <Flex flexWrap={'wrap'} gap='32px' px='2vw' >
                    {helpCentersData?.map((center, index) => (
                        <Box overflow={'hidden'} onClick={() => navigate(`/help-center/${center.id}${currentSearch}`)} cursor={'pointer'} borderWidth={'1px'} key={`help-center-${index}`} transition={'box-shadow 0.3s ease-in-out'} _hover={{shadow:'lg'}} borderColor={'border_color'} shadow={'sm'} borderRadius={'1rem'}>
                            <Box height={'200px'} width={'300px'} bg='text_blue'>
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
                </>
                :
                
                <Flex flexWrap={'wrap'} gap='32px' px='2vw' >
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={`skeleton-${index}`} h='200px' w="300px" borderRadius="1rem" />
                    ))}
                </Flex>
            }
        </Box>
  
    </>)
}
export default HelpCenters