import { Dispatch, SetStateAction, useState,useEffect } from "react"
import { useAuth } from "../../../AuthContext"
import { useAuth0 } from "@auth0/auth0-react"
import { useTranslation } from "react-i18next"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Box, Text, Flex, Button, Tooltip, IconButton } from "@chakra-ui/react"
//COMPONENTS
import Table from "../../Components/Reusable/Table"
import ActionsBox from "../../Components/Reusable/ActionsBox"
//FUNCTIONS
import timeStampToDate from "../../Functions/timeStampToString"
import timeAgo from "../../Functions/timeAgo"
//ICONS
import { FaPlus } from "react-icons/fa6"
import { PiSidebarSimpleBold } from "react-icons/pi"
import { HiTrash } from "react-icons/hi2"



//GET THE CELL STYLE
const CellStyle = ({column, element}:{column:string, element:any}) => {
    const t_formats = useTranslation('formats').t
    if (column === 'created_at' || column === 'updated_at') {
        return(
        <Tooltip  label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='0.4rem' fontSize='.8em' p='6px'> 
            <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
    }    
    else return ( <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>)
}

const Secrets = ({setHideFunctions}:{setHideFunctions:Dispatch<SetStateAction<boolean>>}) => {   

    const { t } = useTranslation('settings')
    const auth = useAuth()
    const { getAccessTokenSilently } = useAuth0()
    
    const columnsMap:{[key:string]:[string, number]} = {'name':[t('Name'), 200], 'created_at':[t('created_at'), 150], 'updated_at':[t('updated_at'), 150], 'peek':[t('Peek'), 100]}

    const [showCreate, setShowCreate] = useState<number | null>(null)
    const [deleteIndex, setDeleteInedex] = useState<number | null>(null)


    const [secrets, setSecrets] = useState<{name:string,created_at:string, updated_at:string, peek:string}[] | null>(null)
    
    //FETCH NEW DATA WHEN THE VIEW CHANGE
    useEffect(() => {        
        document.title = `${t('Functions')} - ${auth.authData.organizationName} - Matil`
        localStorage.setItem('currentSection', 'functions')
        const fetchInitialData = async() => {
        
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/functions/secrets`,getAccessTokenSilently, setValue:setSecrets, auth})            
        }
        fetchInitialData()
    }, [])

    //ADD OR EDIT SECRET VALUE
    const addSecret = async(name:string, value:string) => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/functions/secrets${showCreate === -1?'':`/${secrets?.[showCreate as number]?.name}`}`,getAccessTokenSilently, auth, method:showCreate === -1?'post':'put', requestForm:{name, value}})            
        if (response?.status === 200) {
            await fetchData({endpoint:`${auth.authData.organizationId}/functions/secrets`,getAccessTokenSilently, setValue:setSecrets, auth})   
            setShowCreate(null)
        }
    }
    const deleteSecret = async() => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/functions/secrets${`/${secrets?.[deleteIndex as number]?.name}`}`,getAccessTokenSilently, auth, method:'delete'})            
        if (response?.status === 200) {
            await fetchData({endpoint:`${auth.authData.organizationId}/functions/secrets`,getAccessTokenSilently, setValue:setSecrets, auth})   
        }
    }
    
    //TABLE ADDITIONAL COMPONENT
    const TableButton = ({row, index}:{row:any, index:number}) => {
        return <Button fontWeight={'semibold'} leftIcon={<HiTrash/>} onClick={(e) =>{e.stopPropagation(); setDeleteInedex(index)}} size='sm' h='25px' variant={'delete'}>{t('Delete')}</Button>
    }
    const additionalComponent = [{width:100, component:TableButton, shouldDisplayAfter:'peek', showOnlyOnHover:true}]

    return (<> 

    <ActionsBox showBox={showCreate} setShowBox={() => setShowCreate(null)} title={showCreate === -1 ? t('CreateSecret'):t('EditSecret', {name:secrets?.[showCreate as number]?.name})} type="action" introduceAtt={showCreate === -1 ? ['name', 'value']:['value']} buttonTitle={showCreate === -1 ? t('CreateSecret'):t('EditValueButton')} des={showCreate === -1 ? t('CreateSecretDes'):t('EditValueDes')} actionFunction={addSecret}/>
    <ActionsBox showBox={deleteIndex} setShowBox={() => setDeleteInedex(null)} title={t('DeleteSecretName', {name:secrets?.[deleteIndex as number]?.name})} type="delete" buttonTitle={t('DeleteSecret')} des={t('DeleteSecretDes')} actionFunction={deleteSecret}/>
    

    <Flex flexDir={'column'} width={'100%'} height={'100%'} px ='2vw' py='2vh'  >
        <Flex alignItems={'center'} justifyContent={'space-between'}>
            <Flex gap='10px' alignItems={'center'}> 
                <IconButton  aria-label="open-tab" variant={'common'} bg='transparent' size='sm' icon={<PiSidebarSimpleBold transform="rotate(180deg)" size={'18px'}/>}  h='28px' w='28px'  onClick={() =>setHideFunctions(prev => (!prev))}/>
                <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('Secrets')}</Text>
            </Flex>
            <Button variant={'main'} size='sm' leftIcon={<FaPlus/>} onClick={() => setShowCreate(-1)}>{t('CreateSecret')}</Button>
        </Flex>
        <Box flex='1'> 
            <Text fontSize={'.8em'} color='text_gray' mt='2vh' mb='1vh' ml='10px'>{t('SecretsWarning')}</Text>
            {(secrets && secrets.length === 0) ? 
                <Flex height={'100%'} top={0} left={0} width={'100%'}  alignItems={'center'} justifyContent={'center'}> 
                    <Box maxW={'580px'} textAlign={'center'}> 
                        <Text fontWeight={'medium'} fontSize={'1.5em'} mb='2vh'>{t('NoSecrets')}</Text>               
                        <Button  variant='main'  onClick={() => setShowCreate(-1)} leftIcon={<FaPlus/>}>{t('CreateSecret')}</Button>
                    </Box>
                </Flex> 
                :
                <Table data={secrets} CellStyle={CellStyle} noDataMessage={t('NoSecrets')} columnsMap={columnsMap} excludedKeys={[]} onClickRow={(row, index) => setShowCreate(index)} additionalComponents={additionalComponent} /> 
            }
        </Box>
    </Flex> 
    </>)
} 

export default Secrets