//REACT
import { useState, useEffect,  useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../AuthContext"
import { useNavigate } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Flex, Box, Text, Button, Skeleton, Textarea } from '@chakra-ui/react'
//COMPONENTS
import EditText from "../../Components/Reusable/EditText"
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
import IconsPicker from "../../Components/Reusable/IconsPicker"
//ICONS
import { FaPlus } from "react-icons/fa6"
//TYPING
import { ReportDataType } from "../../Constants/typing"
  
const tryReport = {uuid:'', icon:'', name:'Hola', description:'Hola', user_id:'matilda'}
 
//MAIN FUNCTION
function ReportsTable () {

    //AUTH CONSTANT
    const { getAccessTokenSilently } = useAuth0()
    
    const auth = useAuth()
    const navigate = useNavigate()
    const { t } = useTranslation('stats')
 
    //CREATE BOX AND FOLDER
    const [showCreate, setShowCreate] = useState<boolean>(false)
 
    //GET REPORTS
    const [reports, setReports] = useState<ReportDataType[] | null>(null)

    useEffect(() => {
        const fetchSourceData = async () => {
            const response  = await fetchData({endpoint:`${auth.authData.organizationId}/admin/reports`, setValue:setReports,getAccessTokenSilently, auth})
        }
        document.title = `${t('Stats')} - ${auth.authData.organizationName} - Matil`
        localStorage.setItem('currentSection', 'stats')
        fetchSourceData()
    }, [])
    

    //FILTER DATA
    const [text, setText] = useState<string>('')
    const [filteredReports, setFilteredReports] = useState<ReportDataType[]>([])
    useEffect(() => {
        const filterUserData = () => {
            if (reports) {
                const filtered = reports?.filter(user =>
                    user.name.toLowerCase().includes(text.toLowerCase()) ||
                    user.description.toLowerCase().includes(text.toLowerCase()) 
                )
                setFilteredReports(filtered)
            }
        }
        filterUserData()
    }, [text, reports])
 
    //CREATE BOX
    const CreateBox = () => {

        //NEW FIELD DATA
        const [newReportData, setNewReportData] = useState<{name:string, description:string}>({name:'', description:''})
    
        //BOOLEAN FOR WAITIGN THE EDIT
        const [waitingEdit, setWaitingEdit] = useState<boolean>(false)

        const createReport = async() => {
            const response  = await fetchData({endpoint:`${auth.authData.organizationId}/admin/reports`, method:'post', requestForm:newReportData, setWaiting:setWaitingEdit, getAccessTokenSilently,  auth, toastMessages:{works:t('CorrectCreatedReport'), failed:t('FailedCreatedReport')}})
            if (response?.status === 200) {
                setReports(prev => ([...prev as ReportDataType[], {uuid:response.data.uuid, icon:'', name:newReportData.name, description:newReportData.description, user_id:auth.authData.userId || '',organization_id:auth.authData.organizationId || -1, created_at: Date.now().toString(), updated_at: Date.now().toString() }]))
                navigate(response.data.uuid)
            }
            setShowCreate(false)
        }
        //FRONT
        return(<> 
            <Box p='15px'> 
                <Text  mb='.5vh' fontWeight={'medium'} fontSize={'.9em'}>{t('Name')}</Text>
                <EditText  maxLength={100} placeholder={`${t('Name')}...`} hideInput={false} value={newReportData.name} setValue={(value) => setNewReportData((prev) => ({...prev, name:value}))}/>
                <Text  mt='2vh' mb='.5vh'  fontWeight={'medium'}  fontSize={'.9em'}>{t('Description')}</Text>
                <EditText  maxLength={2000} placeholder={`${t('Description')}...`} hideInput={false} value={newReportData.description} setValue={(value) => setNewReportData((prev) => ({...prev, description:value}))}/>
            
            
                <Flex mt='2vh' gap='15px' flexDir={'row-reverse'}>
                    <Button isDisabled={newReportData.name === ''} size='sm' variant={'main'} onClick={createReport}>{waitingEdit?<LoadingIconButton/>:t('CreateReport')}</Button>
                    <Button  size='sm'variant={'common'} onClick={() => setShowCreate(false)}>{t('Cancel')}</Button>
                </Flex>
        </Box>
      </>)
    }   
    const memoizedDeleteBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowCreate}> 
            <CreateBox/>
        </ConfirmBox>
    ), [showCreate])

    //FRONT
    return(<>
        {showCreate && memoizedDeleteBox}
        <Flex flexDir={'column'} height={'100vh'} width={'calc(100vw - 55px)'} bg='brand.hover_gray'  p='1vw'> 
            <Box> 
                <Flex justifyContent={'space-between'} alignItems={'end'}> 
                    <Box> 
                        <Text mb='2vh' fontSize={'1.4em'} fontWeight={'medium'}>{t('Reports')}</Text>
                        <Box w='350px'> 
                            <EditText value={text} setValue={(value:string) => setText(value)} searchInput={true}/>
                        </Box>
                    </Box>
                    <Button size={'sm'} variant={'main'} leftIcon={<FaPlus/>} onClick={() => setShowCreate(true)}>{t('CreateReport')}</Button>
                </Flex>
                <Box height={'1px'} width={'100%'} bg='gray.300' mt='1vh'  />
            </Box>

            <Box style={{paddingBottom:'3vh', paddingTop:'3vh', flex:1, overflow:'scroll'}}> 
                {(filteredReports.length === 0 && reports) ? 
                <Flex height={'100%'} top={0} left={0} width={'100%'}  alignItems={'center'} justifyContent={'center'}> 
                    <Box maxW={'580px'} textAlign={'center'}> 
                        <Text fontWeight={'medium'} fontSize={'2em'} mb='2vh'>{t('NoReports')}</Text>               
                        <Button  variant='main'  onClick={() => setShowCreate(true)} leftIcon={<FaPlus/>}>{t('CreateReport')}</Button>
                    </Box>
                </Flex> 
                    :

                <Flex flexWrap={'wrap'} gap='32px'  >
                    {(reports ? filteredReports: [tryReport, tryReport, tryReport])?.map((rep, index) => (
                        <Skeleton isLoaded={reports !== null} style={{borderRadius:'1rem'}}> 
                            <Box p='20px' overflow={'hidden'}  width={'400px'}  onClick={() => navigate(rep.uuid)} cursor={'pointer'} borderWidth={'1px'} key={`help-center-${index}`} transition={'box-shadow 0.3s ease-in-out'} _hover={{shadow:'lg'}} shadow={'sm'} borderRadius={'1rem'}>
                                <Flex gap='15px'>
                                    <IconsPicker disabled selectedIcon={rep?.icon || 'FaChartBar'} setSelectedIcon={() => {}}/> 
                                    <Box flex='1'> 
                                        <Text fontWeight={'medium'} fontSize={'1.2em'}>{rep.name}</Text>
                                        <Text color='gray.600' w='295px' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}  fontSize={'.9em'}>{rep.description?rep.description:t('NoDescription')}</Text>
                                    </Box>
                                </Flex>                       
                                <Text mt='1vh' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{t('Created_by', {user: rep.user_id === 'matilda' ?'Matilda':rep.user_id === 'no_user' ? t('NoAgent'):(auth?.authData?.users?.[rep.user_id as string | number].name || '')})}</Text>
                            </Box>
                        </Skeleton>
                    ))}
                </Flex>
                }
            </Box>
        </Flex>
    </>)
}

export default ReportsTable