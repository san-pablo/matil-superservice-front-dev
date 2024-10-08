//FRONT
import { Skeleton, Box } from "@chakra-ui/react"

//MAIN FUNCTION
const GradientIconText = ({ children }: {children:string | number | null}) => {
    return (
        <Skeleton isLoaded={children !== null}> 
            <Box as="span" bgGradient="linear(to-r, rgba(0, 102, 204, 1), rgba(51, 153, 255, 1))" bgClip="text" fontSize="2.6em" fontWeight="bold"> 
            {children !== null? typeof(children) === 'number' ? children.toLocaleString('es-ES',{minimumFractionDigits:0, maximumFractionDigits:2}):children:''}
            </Box>
        </Skeleton>
    )
}

export default GradientIconText