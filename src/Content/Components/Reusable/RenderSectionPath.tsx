//FRONT
import { Flex, Text, Icon, Box } from "@chakra-ui/react"

//COMPONENTS
import RenderIcon from "./RenderIcon"
//ICONS
import { FiChevronRight } from "react-icons/fi"
//TYPING
import { ViewDefinitionType } from "../../Constants/typing"
import { useNavigate } from "react-router-dom"
 
const RenderSectionPath = ({sectionsPath, sectionsPathMap, selectedView}:{sectionsPath:string[], sectionsPathMap:{[key:string]:{icon:{type:'image' | 'emoji' | 'icon', data:string}, name:string}}, selectedView?:ViewDefinitionType, }) => {
    
    const navigate = useNavigate()

    const handleClearPath = () => {
        const searchParams = new URLSearchParams(location.search)
        searchParams.delete("p")
        navigate(`?${searchParams.toString()}`, { replace: true })
    }

    const handleNavigateToPath = (index:number) => {
        const newPath = sectionsPath.slice(0, index + 1).join(",")
        const searchParams = new URLSearchParams(location.search)
        searchParams.set("p", newPath)
        navigate(`?${searchParams.toString()}`, { replace: true })
    }
    


    return (
        <Flex mr='5px'  fontSize="0.8em"  alignItems="center"   >
            {selectedView && 
            <Flex alignItems={'center'}  onClick={handleClearPath} gap='5px' px='6px' py='2px' borderRadius={'.5rem'} cursor={'pointer'} _hover={{bg:'gray_2'}}>
                <RenderIcon icon={selectedView.icon}/>
                 <Text whiteSpace={'nowrap'}>{selectedView.name}</Text>
            </Flex>}
            <Icon as={FiChevronRight} mx='1px' boxSize={'12px'} />
            {(sectionsPath.length > 0 ? sectionsPath: ['2']).slice(0, -1).map((item, index) => (
                <Flex key={`path-${index}`} alignItems="center">
                        <Flex alignItems={'center'} gap='5px'  px='6px' py='2px' borderRadius={'.5rem'} onClick={() => handleNavigateToPath(index)} cursor={'pointer'} _hover={{bg:'gray_2'}}>
                            <RenderIcon icon={sectionsPathMap[item].icon}/>
                            <Text whiteSpace={'nowrap'}>{sectionsPathMap[item].name}</Text>
                        </Flex> 
                    <Icon as={FiChevronRight} mx='1px' boxSize={'12px'}/>
                </Flex>
            ))}
           
    </Flex>
    )
}

export default RenderSectionPath