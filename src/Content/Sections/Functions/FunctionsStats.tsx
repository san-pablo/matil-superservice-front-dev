// REACT
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../AuthContext"
import { useAuth0 } from "@auth0/auth0-react"
// FECTH DATA
import fetchData from "../../API/fetchData"
// FRONT
import { Flex, Text, Box, Skeleton, Grid, IconButton } from "@chakra-ui/react"
//COMPONENTS
import KPI from "../Stats/Charts/KPI"
import ColumnChart from "../Stats/Charts/ColumnChart"
//ICONS
import { PiSidebarSimpleBold } from "react-icons/pi"
//TYPING
import { FunctionTableData } from "../../Constants/typing"
 
interface FunctionDataType {
    total_calls: number
    total_errors: number
    mean_execution_time_ms:number
    mean_memory_consumed_kb:number
    function_stats: {name:string, total_calls: number, total_errors: number, mean_execution_time_ms:number, mean_memory_consumed_kb: number}[] 
}
const FunctionsStats = ({functionsList, setHideFunctions}:{functionsList:FunctionTableData[] | null, setHideFunctions:Dispatch<SetStateAction<boolean>>}) => {   

    const { t } = useTranslation('settings')
    const auth = useAuth()
    const { getAccessTokenSilently } = useAuth0()

    const unitsList = ['', '', 'ms', 'KB']
    const [data, setData] = useState<FunctionDataType | null>(null)
    
    //FETCH FUNCTION DATA
    useEffect(() => {      
        const fetchInitialData = async() => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/functions/stats`, getAccessTokenSilently, setValue:setData, auth})
        }
        fetchInitialData()
    }, [])


    return (
    <Flex h='100vh' w='100%' p ='1vw'  flexDir={'column'}>
 
        <Flex mb='1vw' alignItems={'center'} gap='10px' >
            <IconButton  aria-label="open-tab" variant={'common'} bg='transparent' size='sm' icon={<PiSidebarSimpleBold transform="rotate(180deg)" size={'20px'}/>} onClick={() =>setHideFunctions(prev => (!prev))}/>

            <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('Stats')}</Text>
        </Flex>
        <Flex flex='1' flexDir={'column'} overflow={'scroll'}>
            <Flex gap='1vw'> 
                {['total_calls', 'total_errors', 'mean_execution_time_ms', 'mean_memory_consumed_kb'].map((name, index) => (
                    <Skeleton key={`chart-${index}`} isLoaded={data !== null} style={{flex:1}}>
                        <Flex flexDir={'column'} justifyContent={'center'} > 
                            <Text fontWeight={'medium'}>{t(name)}</Text>
                            <Box  width={'100%'} > 
                                <KPI configuration={{show_unit:true, unit:unitsList[index]}} value={(data as any)?.[name] || 0}/>
                            </Box>
                        </Flex>
                     </Skeleton>
                ))} 
            </Flex>
            <Grid mt='1vw' flex='1' templateColumns="repeat(2, 1fr)" gap='1vw'>
                
                {['total_calls', 'total_errors', 'mean_execution_time_ms', 'mean_memory_consumed_kb']?.map((stat, index) => {
                    
                    const totalList = (functionsList || [])?.map(func => {
                        const statFound = data?.function_stats.find(item => item?.name === func.name)
                        return statFound ? [(statFound as any)[stat]] : [0]
                      });

      
                    return (
                    <Skeleton key={`func-${index}`} isLoaded={data !== null} style={{flex:1}}>
                        <Flex flexDir={'column'} width={'100%'} h='100%'> 
                            <Text fontWeight={'medium'}>{t(stat)}</Text>
                            <Box height={'calc(100% - 20px)'}  > 
                                <ColumnChart  segmentxAxis={[]} yaxisSum={[]} key={`func-${index}`} xaxis={functionsList?.map((func) => {return func.name}) || []} yaxis={[ totalList ]} ytitle={[t(stat)]} chartType={'column'} configuration={{show_percentage:false, is_stacked:false}}/>
                            </Box>
                        </Flex>
                    </Skeleton>)

                })}
                 
            
            </Grid>
        </Flex>
    </Flex>)
}

export default FunctionsStats