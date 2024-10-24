// TRANSLATION
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../../AuthContext'
//FRONT
import { Flex, Text, Box, Skeleton } from "@chakra-ui/react"
//CHARTS
import ColumnChart from "../Charts/ColumnChart"
import CompareChart from '../Charts/CompareChart'
import GradientIconText from '../Charts/GradientIconText'
 
//TYPING
interface UsersProps {
    data:any
    waitingFilters:boolean
}

//MAIN FUNCTION
function Users ({data, waitingFilters}:UsersProps) {

    //TRANSLATION
    const auth = useAuth()
    const { t } = useTranslation('stats')


    return(<> 
        <Skeleton flex='1' isLoaded={data !== null && !waitingFilters}> 
            <Flex mt='2vw' width='100%' height={'40vh'} gap='1vw'>

                
                <GradientIconText children={parseFloat(data?.total_conversations_participated_by_users || 0)} />
                <Text mb='1vh'  color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('ParticipatedConversations')}</Text>
                        <GradientIconText children={parseFloat(data?.total_conversations_solved_by_users || 0)} />
                        <Text color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('SolvedConversations')}</Text>
                
                    <CompareChart totalValue={data?.total_conversations_participated_by_users || 0} firstValue={data?.total_conversations_solved_by_users || 0} firstString="Cerrados"  secondString="Sin cerrar"/>
         
            
                <Box width={'5%'} overflow={'hidden'} height={'40vh'}  bg='white' p='1vw' borderRadius={'1rem'} flex='1' boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} >
                    <GradientIconText children={parseFloat(data?.average_users_rating_score || 0)} />
                    <Text mb='1vh'  color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('AverageScore')}</Text>
                    <GradientIconText children={parseFloat(data?.total_active_users || 0)} />
                    <Text mb='1vh'  color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>{t('ActiveUsers')}</Text>
                </Box>

                <Box  bg='white' p='1vw' borderRadius={'1rem'} width={'5%'} flex='3'boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} > 
                    <Text fontWeight={'medium'}>{t('ResponseTime')}</Text>
                    <Box  height={'calc(100% - 2vw )'} >
                    <ColumnChart  xaxis={data?.conversations_by_users.X || []} yaxis1={data?.conversations_by_users.Y_participated || []} yaxis2={data?.conversations_by_users.Y_solved || []} ytitle1={t('Participated')} ytitle2={t('Solved')}/>
                    </Box>
                </Box>      

            </Flex>
        </Skeleton>

        <Skeleton flex='1' isLoaded={data !== null && !waitingFilters}> 
            <Flex mt='2vw' flex='1'  gap='1vw' height={'50vh'} >

                <Box bg='white' p='1vw' borderRadius={'1rem'} width={'5%'} flex='1'boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} > 
                    <Text fontWeight={'medium'} >{t('TotalChannelConversations')}</Text>
                    <Box height={'calc(100% - 2vw )'}  >
                        <ColumnChart  isChannels={true}  xaxis={data?.solved_transfered_conversations_by_channel.map((element:any) => {return element.channel}) || []} yaxis1={data?.solved_transfered_conversations_by_channel.map((element:any) => {return element.transfered}) || []} yaxis2={data?.solved_transfered_conversations_by_channel.map((element:any) => {return element.solved}) || []} ytitle1={t('Transfered')} ytitle2={t('Solved')}/>
                    </Box>
                </Box>

                <Box bg='white' p='1vw' borderRadius={'1rem'} width={'5%'} flex='1'boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} > 
                    <Text fontWeight={'medium'}>{t('TotalSubjectConversations')}</Text>
                    <Box height={'calc(100% - 2vw )'}  >
                    <ColumnChart xaxis={data?.solved_transfered_conversations_by_theme.map((element:any) => {return element.theme}) || []} yaxis1={data?.solved_transfered_conversations_by_theme.map((element:any) => {return element.transfered}) || []} yaxis2={data?.solved_transfered_conversations_by_theme.map((element:any) => {return element.solved}) || []} ytitle1={t('Transfered')} ytitle2={t('Solved')}    />
                    </Box>
                </Box>

            </Flex>
        </Skeleton>
    </>)
}

export default Users