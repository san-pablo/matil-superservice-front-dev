//FRONT
import { Flex, Box, Text, Skeleton} from '@chakra-ui/react'
 
//TYPING
interface StatBoxProps {
    stat:number | string
    description:string
    add?:string
}

//MAIN FUNCTION
const StatBox = ({stat, description, add}:StatBoxProps) => {
    return(
    <Skeleton isLoaded={stat !== null && stat !== undefined }> 
        <Flex justifyContent={'center'} minW={'170px'} flex='1'   flexBasis={'170px'}  flexGrow={1} flexShrink={1} color={'white'} bg='linear-gradient(to right, rgba(0, 102, 204, 1),rgba(51, 153, 255, 1))' alignItems={'center'} gap='10px'  p='1vw' borderRadius={'1rem'}  boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.25)'}>
            <Box > 
                <Flex gap='10px' alignItems={'center'} justifyContent={'center'}> 
                    <Text fontSize={'2em'} fontWeight={'medium'}>{stat} {add}</Text>
                </Flex>  
                <Text textAlign={'center'} whiteSpace={'nowrap'} fontWeight={'medium'} color='gray.100'>{description}</Text>    
            </Box>
        </Flex>
    </Skeleton>
    )
}

export default StatBox