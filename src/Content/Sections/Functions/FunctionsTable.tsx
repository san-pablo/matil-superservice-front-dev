//REACT
import { useEffect, useRef, useState, lazy } from "react"
import { useAuth } from "../../../AuthContext"
import { useTranslation } from "react-i18next"
import { useSession } from "../../../SessionContext"
import { useLocation, useNavigate } from "react-router-dom"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { motion, isValidMotionProp, AnimatePresence } from 'framer-motion'
import { Text, Box, Flex, Button, Textarea, Skeleton, Tooltip, IconButton, chakra, shouldForwardProp, Icon, Switch, Radio, Spinner } from "@chakra-ui/react"
//PYTHON CODE EDITOR
import CodeMirror from "@uiw/react-codemirror"
import { python } from "@codemirror/lang-python"
import { oneDark } from "@codemirror/theme-one-dark"
//COMPONENTS
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
import EditText from "../../Components/Reusable/EditText"
import '../../Components/styles.css'
//FUNCTIONS
import copyToClipboard from "../../Functions/copyTextToClipboard"
import useOutsideClick from "../../Functions/clickOutside"
import parseMessageToBold from "../../Functions/parseToBold"
//ICONS
import { IconType } from "react-icons"

import { FaPlus, FaCircleExclamation ,FaCircleQuestion, FaCircleDot, FaCode  } from "react-icons/fa6"
//TYPING
import { FunctionsData, FunctionTableData, ConfigProps } from "../../Constants/typing"
import { useAuth0 } from "@auth0/auth0-react"
//COMPONENTS
const Function = lazy(() => import('./Function'))
  
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


    const functionsWidth = hideFunctions ? 0 : 300
    const functionBoxWidth = `calc(100vw - 55px - ${hideFunctions ? functionsWidth:0}px)`

    console.log(functionBoxWidth)
    return (<> 

        <Flex position={'relative'} width={'calc(100vw - 55px)'} bg='brand.hover_gray' height={'100vh'}> 

            <MotionBox initial={{ width: functionsWidth  }} animate={{ width: functionsWidth}} exit={{ width: functionsWidth }} transition={{ duration: '.2' }}  
                width={functionsWidth}    overflow={'hidden'} >

                <Flex bg='brand.hover_gray' px='1vw' w='300px' zIndex={100} h='100vh' gap='20px' py='2vh' flexDir={'column'} justifyContent={'space-between'} borderRightWidth={'1px'} borderRightColor='gray.200' >
                    <Box> 
                        <Text mb='1vh' fontWeight={'medium'} fontSize={'1.2em'}>{t('Functions')}</Text>
                        <EditText value={text} setValue={(value) => setText(value)} searchInput={true}/>
                    </Box>
                    <Box ref={scrollRef} flex='1' > 
                        {functionsData?.length === 0 ? 
                            <Flex height={'100%'} top={0} left={0} width={'100%'} alignItems={'center'} justifyContent={'center'}> 
                                <Box maxW={'580px'} textAlign={'center'}> 
                                    <Text fontWeight={'medium'} fontSize={'2em'} mb='2vh'>{t('NoFunctions')}</Text>               
                                    <Button  variant={'main'} leftIcon={<FaPlus/>}  onClick={() => navigate('/functions/new')}>{t('CreateFunction')}</Button>
                                </Box>
                            </Flex> 
                            :
                            <> 
                                {(functionsData ? filteredFunctions: [tryData, tryData, tryData])?.map((func, index) => {
                                    const isSelected = func.uuid === location.split('/')[location.split('/').length - 1]

                                    return (
                                    <Skeleton key={`function-${index}`} isLoaded={functionsData !== null} style={{borderRadius:'.5rem'}}> 
                                        <Flex gap='10px' alignItems={'center'} bg={isSelected?'white':'transparent'}  transition={isSelected?'box-shadow .2s ease-in-out, border-color .2s ease-in-out, background-color .2s ease-in-out':'box-shadow .2s ease-out, border-color .2s ease-out, background-color .2s ease-out'}    boxShadow={isSelected ? '0 0 3px 0px rgba(0, 0, 0, 0.1)':''} borderWidth={'1px'} borderColor={isSelected ? 'gray.200':'transparent'} key={`shared-view-${index}`} onClick={() => navigate(func.uuid)} _hover={{bg:isSelected?'white':'brand.gray_2'}}  fontWeight={isSelected? 'medium':'normal'}fontSize={'.9em'} cursor={'pointer'} borderRadius={'.5rem'} p='8px'>
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
                <Function setHideFunctions={setHideFunctions}/>
            </MotionBox>
        </Flex>

      

 

     </>)
}

export default FunctionsTable

 