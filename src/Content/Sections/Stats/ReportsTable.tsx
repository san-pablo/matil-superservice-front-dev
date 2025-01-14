//REACT
import { useState, useEffect,  useMemo, Suspense, lazy } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../AuthContext"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"

//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Flex, Box, Text, Button, Skeleton, Icon, IconButton } from '@chakra-ui/react'
//COMPONENTS
import EditText from "../../Components/Reusable/EditText"
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
import IconsPicker from "../../Components/Reusable/IconsPicker"
//ICONS
import { FaPlus } from "react-icons/fa6"
//TYPING
 import { ReportDataType } from "../../Constants/typing"
//COMPONENTS
const Report = lazy(() => import('./Report'))
const CreateReport = lazy(() => import('./CreateReport'))


const tryReport = {uuid:'', icon:'', name:'Hola', description:'Hola', user_id:'matilda'}
 
//MAIN FUNCTION
function ReportsTable () {

    //AUTH CONSTANT
    const { getAccessTokenSilently } = useAuth0()
    
    const auth = useAuth()
    const navigate = useNavigate()
    const { t } = useTranslation('stats')
    const location = useLocation().pathname
 
    //CREATE BOX AND FOLDER
    const [showCreate, setShowCreate] = useState<boolean>(false)
    const [hideReports, setHideReports] = useState<boolean>(false)

    //GET REPORTS
    const [reports, setReports] = useState<ReportDataType[] | null>(null)

    useEffect(() => {
        const fetchSourceData = async () => {
            const response  = await fetchData({endpoint:`${auth.authData.organizationId}/admin/reports`, setValue:setReports,getAccessTokenSilently, auth})
            if (response?.data.length > 0) navigate(`report/${response?.data[0].uuid}`)
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


    const tableWidthHideView =`calc(100vw - 45px)`  
    const tableWidthShowView =`calc(100vw - 45px - 220px)`  
    
    
    //FRONT
    return(<>
        {showCreate && memoizedDeleteBox}
        <Flex position={'relative'} width={'calc(100vw - 45px)'} bg='brand.hover_gray' height={'100vh'}> 

                <Flex zIndex={10} h='100vh' overflow={'hidden'} width={hideReports ? 0:220}transition={'width ease-in-out .2s'}  gap='20px' py='2vh' flexDir={'column'} justifyContent={'space-between'} borderRightColor={'gray.200'} borderRightWidth={'1px'}>
                    <Flex bg='brand.hover_gray' px='1vw' zIndex={100} h='100vh'  flexDir={'column'} justifyContent={'space-between'}  >
                        <Box> 
                            <Flex  alignItems={'center'} justifyContent={'space-between'}> 
                                <Text  fontWeight={'semibold'} fontSize={'1.2em'}>{t('Reports')}</Text>
                                <IconButton bg='transparent' borderWidth={'1px'} borderColor={'gray.200'}  h='28px' w='28px'  _hover={{bg:'brand.gray_1', color:'brand.text_blue'}} variant={'common'} icon={<FaPlus size={'16px'}/>} aria-label="create-function" size='xs'  onClick={() => setShowCreate(true)}/>
                            </Flex>
                            <Box h='1px' w='100%' bg='gray.300' mt='2vh' mb='2vh'/>
                        </Box>


                        <Box flex='1' > 
                            {reports?.length === 0 ? 
                                <Button w='100%'  mt='2vh' onClick={() => setShowCreate(true)} leftIcon={<FaPlus/>} bg='transparent' borderColor={'gray.300'} borderWidth={'1px'} variant={'common'} size='xs'>{t('CreateReport')}</Button>
                                :
                                <> 
                                    {(reports ? reports: [tryReport, tryReport, tryReport])?.map((func, index) => {
                                        const isSelected = func.uuid === location.split('/')[location.split('/').length - 1]

                                        return (
                                        <Skeleton key={`function-${index}`} isLoaded={reports !== null} style={{borderRadius:'.5rem'}}> 
                                            <Flex gap='10px' alignItems={'center'}  bg={isSelected?'white':'transparent'}  transition={isSelected?'box-shadow .2s ease-in-out, border-color .2s ease-in-out, background-color .2s ease-in-out':'box-shadow .2s ease-out, border-color .2s ease-out, background-color .2s ease-out'}    boxShadow={isSelected ? '0 0 3px 0px rgba(0, 0, 0, 0.1)':''} borderWidth={'1px'} borderColor={isSelected ? 'gray.200':'transparent'} key={`shared-view-${index}`} onClick={() => navigate(`report/${func.uuid}`)} _hover={{bg:isSelected?'white':'brand.gray_2'}}  fontWeight={isSelected? 'medium':'normal'}fontSize={'.9em'} cursor={'pointer'} borderRadius={'.5rem'} p='6px'>
                                                    <Text transition={'transform .1s ease-in-out'}   transformOrigin="left center" transform={isSelected?'scale(1.02)':'scale(1)'} whiteSpace={'nowrap'} textOverflow={'ellipsis'}   overflow={'hidden'}>{func.name}</Text>
                                                </Flex>
                                        </Skeleton>)
                                    })}
                            </>
                            }  
                        </Box>
                    </Flex>
                </Flex>
                            
                <Flex bg='brand.hover_gray' h='100vh' flexDir={'column'}  width={hideReports ? tableWidthHideView:tableWidthShowView} transition={'width ease-in-out .2s'} right={0}   position="absolute" top={0} >

                    <Suspense fallback={<></>}>    
                        <Routes >
                            <Route path="/" element={<CreateReport setReports={setReports}/>}/>

                            <Route path="/report/*" element={<Report hideReports={hideReports} setHideReports={setHideReports}/>}/>
                        </Routes>
                    </Suspense>

                </Flex>

        </Flex>
    </>)
}

export default ReportsTable