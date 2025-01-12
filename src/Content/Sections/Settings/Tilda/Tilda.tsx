//REACT
import { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../../AuthContext"
import { useAuth0 } from "@auth0/auth0-react"
import { useNavigate } from "react-router-dom"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Flex, Button, Skeleton } from "@chakra-ui/react"
//COMPONENTS
import ConfirmBox from "../../../Components/Reusable/ConfirmBox"
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
import Table from "../../../Components/Reusable/Table"
//FUNCTIONS
import parseMessageToBold from "../../../Functions/parseToBold"
//ICONS
import { FaPlus } from "react-icons/fa6"
//TYPING
import { ConfigProps,logosMap } from "../../../Constants/typing"
import { useSession } from "../../../../SessionContext"
 
   
 

//MAIN FUNCTION
function Tilda ({configData}:{configData:ConfigProps[]}) {

    //AUTH CONSTANT
    const auth = useAuth()
    const navigate = useNavigate()
    const { t } = useTranslation('settings')
    const session = useSession()

    //FETCH INITIAL DATA
    useEffect(() => {document.title = `${t('Settings')} - ${t('MatildaConfigs')} - ${auth.authData.organizationName} - Matil`}, [])

      
    const CellStyle = ({column, element}:{column:string, element:any}) => {

        if (column === 'channels_ids') {
            return(
            <Flex fontSize={'.9em'} gap='7px' alignItems={'center'}>
               {element.length === 0 ? <Text>-</Text>
               :<> 
               {element.map((cha:string, index:number) => {
                    const channel = (session.sessionData.additionalData.channels || []).find((channel) => channel.id === cha)
                    if (!channel) return null
                    return (
                    <Flex key={index} alignItems="center" gap="5px">
                        <Text>{(logosMap as any)[channel.channel_type]}</Text>
                        <Text>{channel.name}</Text>
                    </Flex>
                    )
                })}</>}
            </Flex>)
        }    
        else return <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>
    }


    //FRONT
    return(             

        <Box p='2vw' > 
            <Flex alignItems={'end'} justifyContent={'space-between'}> 
                <Box> 
                    <Text fontSize={'1.5em'} fontWeight={'medium'}>{t('MatildaConfigs')}</Text>
                    <Text color='gray.600' fontSize={'.9em'}>{t('AllConfigsDes')}</Text>
                </Box>
                <Button size='sm' leftIcon={<FaPlus/>} variant={'main'} onClick={() => navigate('/settings/tilda/config/new')}>{t('CreateConfig')}</Button>
            </Flex>
             
            <Box bg='gray.300' h='1px' mt='2vh' mb='2vh' w='100%'/>

            <Box width={'calc(96vw - 275px)'}> 
                <Table data={configData} CellStyle={CellStyle} excludedKeys={['uuid']} onClickRow={(row) => navigate(`/settings/tilda/config/${row.uuid}`)} columnsMap={{ 'name':[t('Name'), 200],  'description':[t('Description'), 300], 'channels_ids':[t('EnabledChannels'), 600]}} noDataMessage={t('NoChannels')} />
            </Box>
        </Box>

        
    )
}

export default Tilda

