import { Dispatch, SetStateAction, useState,useEffect } from "react"
import { useAuth } from "../../../AuthContext"
import { useAuth0 } from "@auth0/auth0-react"
import { useTranslation } from "react-i18next"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Box, Text, Flex, Button, Tooltip } from "@chakra-ui/react"
//COMPONENTS
import Table from "../../Components/Reusable/Table"
//FUNCTIONS
import timeStampToDate from "../../Functions/timeStampToString"
import timeAgo from "../../Functions/timeAgo"
//ICONS
import { FaPlus } from "react-icons/fa6"
 



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
    
    const columnsMap = {'name':[t('Name'), 300], 'created_at':[t('created_at'), 180], 'updated_at':[t('updated_at'), 180], 'peek':[t('Peek'), 300]}

    const [showCreate, setShowCreate] = useState<boolean>(false)
    const [deleteIndex, setDeleteInedex] = useState<number>(-1)


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


    return (
 
    <Flex flexDir={'column'} width={'100%'} height={'100%'} p='1vw'>
        <Flex alignItems={'end'} justifyContent={'space-between'}> 
            <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('Secrets')}</Text>
            <Button variant={'main'} size='sm' leftIcon={<FaPlus/>}>{t('CreateSecret')}</Button>
        </Flex>
        <Box h='1px' w='100%' bg='gray.300' mt='2vh' mb='2vh'/>
        <Box flex='1'> 
            <Text>{t('SecretsWarning')}</Text>
            {(secrets && secrets.length === 0) ? 
                <Flex height={'100%'} top={0} left={0} width={'100%'}  alignItems={'center'} justifyContent={'center'}> 
                    <Box maxW={'580px'} textAlign={'center'}> 
                        <Text fontWeight={'medium'} fontSize={'2em'} mb='2vh'>{t('NoSecrets')}</Text>               
                        <Button  variant='main'  onClick={() => setShowCreate(true)} leftIcon={<FaPlus/>}>{t('CreateSecret')}</Button>
                    </Box>
                </Flex> 
                :
                <Table data={secrets} CellStyle={CellStyle} noDataMessage={t('NoSecrets')} columnsMap={columnsMap} excludedKeys={[] } onClickRow={() => {}} deletableFunction={(row, index) => setDeleteInedex(index)}/> 
            }
        </Box>
    </Flex>
    
    )
}

export default Secrets