//FRONT
import { Flex, Text, Box, Skeleton } from "@chakra-ui/react"
//CHARTS
import ColumnChart from "../Charts/ColumnChart"
import CompareChart from '../Charts/CompareChart'
import GradientIconText from '../Charts/GradientIconText'

//TYPING
interface MatildaProps {
    data:any
    waitingFilters:boolean
}

//MAIN FUNCTION
function Matilda ({data, waitingFilters}:MatildaProps) {

    return(<> 
        <Skeleton flex='1' isLoaded={data !== null && !waitingFilters}> 
            <Flex mt='2vw' width='100%' height={'40vh'} gap='1vw'>

                <Flex width={'5%'} overflow={'hidden'}  flex='1'  flexDir={'column'} gap='3vh' height={'40vh'}     justifyContent={'space-between'}  bg='white' p='1vw' borderRadius={'1rem'}  boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} > 
                    <Box> 
                        <GradientIconText children={parseFloat(data?.total_tickets_participated || 0)} />
                        <Text mb='1vh'  color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>Tickets Participados</Text>
                        <GradientIconText children={parseFloat(data?.total_tickets_solved || 0)} />
                        <Text color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>Tickets Resueltos</Text>
                    </Box> 
                    <CompareChart totalValue={data?.total_tickets_participated || 0} firstValue={data?.total_tickets_solved || 0} firstString="Cerrados"  secondString="Sin cerrar"/>
                </Flex>
            
                <Box width={'5%'} overflow={'hidden'} height={'40vh'}  bg='white' p='1vw' borderRadius={'1rem'} flex='1' boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} >
                    <GradientIconText children={parseFloat(data?.average_matilda_rating_score || 0)} />
                    <Text mb='1vh'  color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>Puntuación media</Text>
                    <GradientIconText children={parseFloat(data?.total_messages_sent || 0)} />
                    <Text mb='1vh'  color='gray.600' fontSize={'.8em'} fontWeight={'medium'}> Mensajes enviados</Text>
                    <GradientIconText children={parseFloat(data?.total_words_generated || 0)} />
                    <Text color='gray.600' fontSize={'.8em'} fontWeight={'medium'}>Palabras generadas</Text>
                </Box>

                <Box bg='white' p='1vw' borderRadius={'1rem'} width={'5%'} flex='3'boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} > 
                    <Text fontWeight={'medium'} >Tiempo de respuesta comparado</Text>
                    <Box  height={'calc(100% - 2vw )'} >
                    <ColumnChart  xaxis={data?.avg_response_time_comparison.X || []} yaxis1={data?.avg_response_time_comparison.Y_matilda || []} yaxis2={data?.avg_response_time_comparison.Y_team_users || []} ytitle1={'Matilda'} ytitle2={'Usuarios'}/>
                    </Box>
                </Box>

            </Flex>
        </Skeleton>

        <Skeleton flex='1' isLoaded={data !== null && !waitingFilters}> 
            <Flex mt='2vw' flex='1'  gap='1vw' height={'50vh'} >
                
                <Box bg='white' p='1vw' borderRadius={'1rem'} width={'5%'} flex='1'boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} > 
                    <Text fontWeight={'medium'}>Tickets totales por canal</Text>
                    <Box height={'calc(100% - 2vw )'}  >
                        <ColumnChart  isChannels={true} xaxis={data?.solved_transfered_tickets_by_channel.map((element:any) => {return element.channel}) || []} yaxis1={data?.solved_transfered_tickets_by_channel.map((element:any) => {return element.transfered}) || []} yaxis2={data?.solved_transfered_tickets_by_channel.map((element:any) => {return element.solved}) || []} ytitle1={'Transferidas'} ytitle2={'Resueltas'}/>
                    </Box>
                </Box>

                <Box bg='white' p='1vw' borderRadius={'1rem'} width={'5%'} flex='1'boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} > 
                    <Text fontWeight={'medium'}>Tickets totales por tema</Text>
                    <Box height={'calc(100% - 2vw )'}  >
                    <ColumnChart xaxis={data?.solved_transfered_tickets_by_subject.map((element:any) => {return element.subject}) || []} yaxis1={data?.solved_transfered_tickets_by_subject.map((element:any) => {return element.transfered}) || []} yaxis2={data?.solved_transfered_tickets_by_subject.map((element:any) => {return element.solved}) || []} ytitle1={'Transferidas'} ytitle2={'Resueltas'}/>
                    </Box>
                </Box>
                
            </Flex>
        </Skeleton>
        </>
    )
}

export default Matilda