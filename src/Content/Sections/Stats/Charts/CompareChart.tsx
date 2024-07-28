import { Flex, Text } from "@chakra-ui/react"

//TYPING
interface CompareChartProps {
    totalValue:number
    firstValue:number
    firstString:string
    secondString:string
}

//MAIN FUNCTION
const CompareChart = ({totalValue, firstValue, firstString, secondString}:CompareChartProps)  => {
    return(
        <Flex fontWeight={'medium'} width='100%' flex='1' mt='1vh' borderRadius={'.5rem'}overflow={'hidden'}>
            {firstValue > 0 && <Flex bg='linear-gradient(to right, rgba(0, 102, 204, 1),rgba(51, 153, 255, 1))' flexDir='column'justifyContent={'center'} alignItems={'center'} width={`${firstValue/totalValue  * 100 || 50}%`}>
                <Text color='white'>{firstString}</Text>
                <Text color='white'>({(firstValue/totalValue * 100).toLocaleString('es-ES',{minimumFractionDigits:0, maximumFractionDigits:2})} %)</Text>
            </Flex>}
            {(totalValue - firstValue) > 0 && <Flex bg='linear-gradient(to right, rgba(102, 204, 255, 1),rgba(153, 204, 255, 1))'flexDir='column'justifyContent={'center'} alignItems={'center'}  width={`${(totalValue - firstValue)/totalValue * 100 || 50}%`}>
                <Text color='white'>{secondString}</Text>
                <Text color='white'>({((totalValue - firstValue)/totalValue * 100).toLocaleString('es-ES',{minimumFractionDigits:0, maximumFractionDigits:2})} %)</Text>
            </Flex>}
        </Flex>
    )
}

export default CompareChart