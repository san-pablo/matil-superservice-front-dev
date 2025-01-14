import { Dispatch, SetStateAction, useState,useEffect, useMemo } from "react"
import { useAuth } from "../../../AuthContext"
import { useAuth0 } from "@auth0/auth0-react"
import { useTranslation } from "react-i18next"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { motion, isValidMotionProp } from 'framer-motion'
import { Box, Text, Flex, Button, Tooltip, IconButton, chakra, shouldForwardProp } from "@chakra-ui/react"
//COMPONENTS
import Table from "../../Components/Reusable/Table"
import EditText from "../../Components/Reusable/EditText"
import LoadingIconButton from "../../Components/Reusable/LoadingIconButton"
import ConfirmBox from "../../Components/Reusable/ConfirmBox"
//FUNCTIONS
import timeStampToDate from "../../Functions/timeStampToString"
import timeAgo from "../../Functions/timeAgo"
import parseMessageToBold from "../../Functions/parseToBold"
//ICONS
import { FaPlus } from "react-icons/fa6"
import { PiSidebarSimpleBold } from "react-icons/pi"



//GET THE CELL STYLE
const CellStyle = ({column, element}:{column:string, element:any}) => {
    const t_formats = useTranslation('formats').t
    if (column === 'created_at' || column === 'updated_at') {
        return(
        <Tooltip  label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='0rem' fontSize='.8em' p='6px'> 
            <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
    }    
    else return ( <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>)
}

const Secrets = ({setHideFunctions}:{setHideFunctions:Dispatch<SetStateAction<boolean>>}) => {   

    const { t } = useTranslation('settings')
    const auth = useAuth()
    const { getAccessTokenSilently } = useAuth0()
    
    const columnsMap:{[key:string]:[string, number]} = {'name':[t('Name'), 300], 'created_at':[t('created_at'), 180], 'updated_at':[t('updated_at'), 180], 'peek':[t('Peek'), 300]}

    const [showCreate, setShowCreate] = useState<number | null>(null)
    const [deleteIndex, setDeleteInedex] = useState<number | null>(null)


    const [secrets, setSecrets] = useState<{name:string,created_at:string, updated_at:string, peek:string}[] | null>(null)
    

    //FETCH NEW DATA WHEN THE VIEW CHANGE
    useEffect(() => {        
        document.title = `${t('Functions')} - ${auth.authData.organizationName} - Matil`
        localStorage.setItem('currentSection', 'functions')
        const fetchInitialData = async() => {
        
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions/secrets`,getAccessTokenSilently, setValue:setSecrets, auth})            
        }
        fetchInitialData()
    }, [])


     //ADD SECRET COMPONENT
     const AddSecretComponent = () => {
        const [waitingAdd, setWaitingAdd] = useState<boolean>(false)

        const [name, setName] = useState<string>('')
        const [value, setValue] = useState<string>('')

        const addTheme = async() => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions/secrets${showCreate === -1?'':`/${secrets?.[showCreate as number]?.name}`}`,getAccessTokenSilently, auth, method:showCreate === -1?'post':'put', setWaiting: setWaitingAdd, requestForm:{name, value}})            
            if (response?.status === 200) {
                await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions/secrets`,getAccessTokenSilently, setValue:setSecrets, auth})   
                setShowCreate(null)
            }
        }
        return(<> 
            <Box p='15px'>
                <Text fontWeight={'medium'} fontSize={'1.2em'}>{showCreate === -1 ? t('CreateSecret'):parseMessageToBold(t('EditSecret', {name:secrets?.[showCreate as number]?.name}) )}</Text>
                {showCreate === -1 &&
                <> 
                    <Text mt='2vh' fontWeight={'medium'} fontSize={'.8em'}  mb='.5vh'>{t('Name')}</Text>
                    <EditText hideInput={false}  size="xs" placeholder={t('Name') + '...'}  value={name}  setValue={(value:string) => setName(value)}  />
                </>}
                <Text  fontWeight={'medium'} fontSize={'.8em'} mt='2vh' mb='.5vh'>{showCreate === -1 ? t('Value'):t('NewValue')}</Text>
                <EditText hideInput={false} placeholder={(showCreate === -1 ? t('Value'):t('NewValue') )+ '...'}  value={value}  setValue={(val:string) => setValue(val)}  />
            </Box>
            <Flex p='15px' mt='2vh' gap='15px' flexDir={'row-reverse'}>
                <Button  size='xs' variant={'main'} onClick={addTheme}>{waitingAdd?<LoadingIconButton/>:showCreate === -1?t('CreateSecret'):t('EditSecret')}</Button>
                <Button  size='xs' variant={'common'} onClick={()=> setShowCreate(null)}>{t('Cancel')}</Button>
            </Flex>  
            </>)
    }

    const memoizedAddThemeBox = useMemo(() => (
        <ConfirmBox setShowBox={() => setShowCreate(null)}> 
            <AddSecretComponent />
        </ConfirmBox>
    ), [showCreate])
    

    const DeleteSecretComponent = ({index}:{index:number}) => {
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)
        const deleteTheme = async() => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions/secrets${`/${secrets?.[deleteIndex as number]?.name}`}`,getAccessTokenSilently, auth, method:'delete', setWaiting: setWaitingDelete})            
            if (response?.status === 200) {
                await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions/secrets`,getAccessTokenSilently, setValue:setSecrets, auth})   
                setDeleteInedex(null)
            }
        }
       
        return(<> 
            <Box p='15px'>
                <Text width={'400px'}>{parseMessageToBold(t('DeleteSecretQuestion', {name:secrets?.[deleteIndex as number]?.name}))}</Text>
            </Box>
            <Flex p='15px'borderTopColor={'brand.gray_2'} borderTopWidth={'1px'} bg='brand.hover_gray' mt='2vh' gap='15px' flexDir={'row-reverse'}>
                <Button  size='sm' variant={'delete'} onClick={deleteTheme}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                <Button  size='sm' variant={'common'} onClick={()=> setDeleteInedex(null)}>{t('Cancel')}</Button>
            </Flex>  
            </>)
    }

    const memoizedDeleteSecretBox = useMemo(() => (
        <ConfirmBox setShowBox={() => setDeleteInedex(null)}> 
            <DeleteSecretComponent index={deleteIndex as number}/>
        </ConfirmBox>
    ), [deleteIndex])

    return (<> 
    {deleteIndex !== null && memoizedDeleteSecretBox}
    {showCreate !== null && memoizedAddThemeBox}

    <Flex flexDir={'column'} width={'100%'} height={'100%'} px ='2vw' py='2vh'  >
        <Flex alignItems={'center'} justifyContent={'space-between'}>
            <Flex gap='10px' alignItems={'center'}> 
                <IconButton  aria-label="open-tab" variant={'common'} bg='transparent' size='sm' icon={<PiSidebarSimpleBold transform="rotate(180deg)" size={'18px'}/>}  h='28px' w='28px'  onClick={() =>setHideFunctions(prev => (!prev))}/>
                <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('Secrets')}</Text>
            </Flex>
            <Button variant={'main'} size='sm' leftIcon={<FaPlus/>} onClick={() => setShowCreate(-1)}>{t('CreateSecret')}</Button>
        </Flex>
        <Box flex='1'> 
            <Text fontSize={'.8em'} color='gray.600' mt='3vh'>{t('SecretsWarning')}</Text>
            {(secrets && secrets.length === 0) ? 
                <Flex height={'100%'} top={0} left={0} width={'100%'}  alignItems={'center'} justifyContent={'center'}> 
                    <Box maxW={'580px'} textAlign={'center'}> 
                        <Text fontWeight={'medium'} fontSize={'1.5em'} mb='2vh'>{t('NoSecrets')}</Text>               
                        <Button  variant='main'  onClick={() => setShowCreate(-1)} leftIcon={<FaPlus/>}>{t('CreateSecret')}</Button>
                    </Box>
                </Flex> 
                :
                <Table data={secrets} CellStyle={CellStyle} noDataMessage={t('NoSecrets')} columnsMap={columnsMap} excludedKeys={[]} onClickRow={(row, index) => setShowCreate(index)} deletableFunction={(row, index) => setDeleteInedex(index)}/> 
            }
        </Box>
    </Flex> 
    </>)
}

export default Secrets