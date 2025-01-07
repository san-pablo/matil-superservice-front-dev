//REACT
import { useEffect, useRef, useState, lazy, Suspense } from "react"
import { useAuth } from "../../../AuthContext"
import { useTranslation } from "react-i18next"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { useSession } from "../../../SessionContext"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { motion, isValidMotionProp } from 'framer-motion'
import { Text, Box, Flex, Button, Skeleton,chakra, shouldForwardProp, Icon, IconButton } from "@chakra-ui/react"
//COMPONENTS
 import '../../Components/styles.css'
import { FaPlus, FaCircleDot, FaChartSimple, FaEye } from "react-icons/fa6"
//TYPING
import { FunctionTableData } from "../../Constants/typing"
import { useAuth0 } from "@auth0/auth0-react"
//COMPONENTS
const Function = lazy(() => import('./Function'))
const FunctionsStats = lazy(() => import('./FunctionsStats'))
const Secrets = lazy(() => import('./Secrets'))


  
const tryData = {is_active:false, uuid:'', icon:'',name:'Hola', description:'Hola'}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})


const FunctionsTable = () => {
    const { t } = useTranslation('settings')
    const session = useSession()
    const auth = useAuth()
    const location = useLocation().pathname
    const navigate = useNavigate()
    const { getAccessTokenSilently } = useAuth0()
    const scrollRef = useRef<HTMLDivElement>(null)
 
    //FUNCTIONS DATA
    const [hideFunctions, setHideFunctions] = useState<boolean>(false)
  

    const [functionsData, setFunctionsData] = useState<FunctionTableData[] | null>(null)

    //FETCH NEW DATA WHEN THE VIEW CHANGE
    useEffect(() => {        
        document.title = `${t('Functions')} - ${auth.authData.organizationName} - Matil`
        localStorage.setItem('currentSection', 'functions')
        const fetchInitialData = async() => {
            if (session.sessionData.functionsData) setFunctionsData(session.sessionData.functionsData)
            else {
                const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions`,getAccessTokenSilently, setValue:setFunctionsData, auth})
                if (response?.status === 200) session.dispatch({type:'UPDATE_FUNCTIONS',payload:{data:response?.data}})
            }
        }
        fetchInitialData()
    }, [])

    // FILTER FUNCTIONS
    const [text, setText] = useState<string>('')
    const [filteredFunctions, setFilteredFunctions] = useState<FunctionTableData[]>([])
    useEffect(() => {
    const filterUserData = () => {
        if (functionsData) {
            const filtered = functionsData.filter(flow =>
                flow.name.toLowerCase().includes(text.toLowerCase()) ||
                flow.description.toLowerCase().includes(text.toLowerCase()) || 
                flow.uuid.toLowerCase().includes(text.toLowerCase())
            )
            setFilteredFunctions(filtered)
        }
    }
    filterUserData()
    }, [text, functionsData])


    const functionsWidth = hideFunctions ? 0 : 260
    const functionBoxWidth = `calc(100vw - 55px - ${functionsWidth}px)`

    
    return (<> 

        <Flex position={'relative'} width={'calc(100vw - 55px)'} bg='brand.hover_gray' height={'100vh'}> 

            <MotionBox initial={{ width: functionsWidth  }} animate={{ width: functionsWidth}} exit={{ width: functionsWidth }} transition={{ duration: '.2' }}  
                width={functionsWidth}    overflow={'hidden'} >

                <Flex bg='brand.hover_gray' px='1vw' w='260px' zIndex={100} h='100vh'  py='2vh' flexDir={'column'} justifyContent={'space-between'} borderRightWidth={'1px'} borderRightColor='gray.200' >
                    <Box> 
                        <Flex  alignItems={'center'} justifyContent={'space-between'}> 
                            <Text  fontWeight={'medium'} fontSize={'1.2em'}>{t('Functions')}</Text>
                            <IconButton boxShadow={'0 0 7px 0px rgba(0, 0, 0, 0.25)'} bg='white' _hover={{bg:'brand.gray_2', color:'brand.text_blue'}} variant={'common'} icon={<FaPlus size={'16px'}/>} aria-label="create-function" size='xs'  onClick={() => navigate('/functions/function/new')}/>
                        </Flex>
                        <Box h='1px' w='100%' bg='gray.300' mt='2vh' mb='2vh'/>

                        <Flex gap='10px' alignItems={'center'}  bg={location.endsWith('functions')?'white':'transparent'}  transition={location.endsWith('functions')?'box-shadow .2s ease-in-out, border-color .2s ease-in-out, background-color .2s ease-in-out':'box-shadow .2s ease-out, border-color .2s ease-out, background-color .2s ease-out'}    boxShadow={location.endsWith('functions') ? '0 0 3px 0px rgba(0, 0, 0, 0.1)':''} borderWidth={'1px'} borderColor={location.endsWith('functions') ? 'gray.200':'transparent'}  onClick={() => navigate('/functions')} _hover={{bg:location.endsWith('functions')?'white':'brand.gray_2'}}  fontWeight={location.endsWith('functions')? 'medium':'normal'}fontSize={'.9em'} cursor={'pointer'} borderRadius={'.5rem'} p='6px'>
                            <Icon as={FaChartSimple}/>
                            <Text transition={'transform .1s ease-in-out'}   transformOrigin="left center" transform={location.endsWith('functions')?'scale(1.02)':'scale(1)'} whiteSpace={'nowrap'} textOverflow={'ellipsis'}   overflow={'hidden'}>{t('Stats')}</Text>
                         </Flex>
                        <Flex gap='10px' alignItems={'center'}  bg={location.endsWith('secrets')?'white':'transparent'}  transition={location.endsWith('secrets')?'box-shadow .2s ease-in-out, border-color .2s ease-in-out, background-color .2s ease-in-out':'box-shadow .2s ease-out, border-color .2s ease-out, background-color .2s ease-out'}    boxShadow={location.endsWith('secrets') ? '0 0 3px 0px rgba(0, 0, 0, 0.1)':''} borderWidth={'1px'} borderColor={location.endsWith('secrets') ? 'gray.200':'transparent'}  onClick={() => navigate('secrets')} _hover={{bg:location.endsWith('secrets')?'white':'brand.gray_2'}}  fontWeight={location.endsWith('secrets')? 'medium':'normal'}fontSize={'.9em'} cursor={'pointer'} borderRadius={'.5rem'} p='6px'>
                            <Icon as={FaEye}/>
                            <Text transition={'transform .1s ease-in-out'}   transformOrigin="left center" transform={location.endsWith('functions')?'scale(1.02)':'scale(1)'} whiteSpace={'nowrap'} textOverflow={'ellipsis'}   overflow={'hidden'}>{t('Secrets')}</Text>
                         </Flex>

                     </Box>


                    <Box ref={scrollRef} flex='1' > 
                        {functionsData?.length === 0 ? 
                            <Button w='100%'  mt='2vh' onClick={() => navigate('/functions/function/new')} leftIcon={<FaPlus/>} bg='transparent' borderColor={'gray.300'} borderWidth={'1px'} variant={'common'} size='xs'>{t('CreateFunction')}</Button>
                            :
                            <> 
                                {(functionsData ? filteredFunctions: [tryData, tryData, tryData])?.map((func, index) => {
                                    const isSelected = func.uuid === location.split('/')[location.split('/').length - 1]

                                    return (
                                    <Skeleton key={`function-${index}`} isLoaded={functionsData !== null} style={{borderRadius:'.5rem'}}> 
                                        <Flex gap='10px' alignItems={'center'}  bg={isSelected?'white':'transparent'}  transition={isSelected?'box-shadow .2s ease-in-out, border-color .2s ease-in-out, background-color .2s ease-in-out':'box-shadow .2s ease-out, border-color .2s ease-out, background-color .2s ease-out'}    boxShadow={isSelected ? '0 0 3px 0px rgba(0, 0, 0, 0.1)':''} borderWidth={'1px'} borderColor={isSelected ? 'gray.200':'transparent'} key={`shared-view-${index}`} onClick={() => navigate(`function/${func.uuid}`)} _hover={{bg:isSelected?'white':'brand.gray_2'}}  fontWeight={isSelected? 'medium':'normal'}fontSize={'.9em'} cursor={'pointer'} borderRadius={'.5rem'} p='6px'>
                                            <Icon color={func?.is_active?'#68D391':'#ECC94B'} as={FaCircleDot}/>

                                             <Text transition={'transform .1s ease-in-out'}   transformOrigin="left center" transform={isSelected?'scale(1.02)':'scale(1)'} whiteSpace={'nowrap'} textOverflow={'ellipsis'}   overflow={'hidden'}>{func.name}</Text>
                                         </Flex>
                                    </Skeleton>)
                                })}
                        </>
                        }  
                    </Box>
                </Flex>
            </MotionBox>

            <MotionBox  initial={{ width: functionBoxWidth }} animate={{ width: functionBoxWidth,}} exit={{ width: functionBoxWidth, }}  overflowY={'scroll'}  transition={{ duration: '.2'}} 
                zIndex={100} height={'100vh'} overflowX={'hidden'}>
                <Suspense fallback={<></>}>    
                        <Routes >
                            <Route path="/" element={<FunctionsStats  setHideFunctions={setHideFunctions}/>}/>
                            <Route path="/secrets" element={<Secrets  setHideFunctions={setHideFunctions}/>}/>
                            <Route path="/function/*" element={<Function setHideFunctions={setHideFunctions}/>}/>
                        </Routes>
                    </Suspense>

            </MotionBox>
        </Flex>

      

 

     </>)
}

export default FunctionsTable

 