//REACT
import { ReactNode } from "react"
//FRONT
import { Box, Flex, Text } from "@chakra-ui/react"
import '../styles.css'
//ICONS
import { IoIosArrowDown } from "react-icons/io"

const CollapsableSection = ({ section, isExpanded, onSectionExpand, children, sectionsMap, mt}:{section:string, isExpanded:boolean, onSectionExpand:(key:string) => void ,children:ReactNode, sectionsMap:{[key:string]:string},  mt?:string}) => {

    return (
        <Box pb='3vh' mt={mt} borderBottomColor={'border_color'} borderBottomWidth={'1px'}> 
            <Flex cursor={'pointer'} alignItems={'center'} justifyContent={'space-between'} onClick={() => onSectionExpand(section)} _hover={{color:'text_blue'}}>
                <Text fontWeight={'semibold'}  fontSize={'.9em'}>{sectionsMap[section]}</Text>
                <IoIosArrowDown  className={isExpanded ? "rotate-icon-up" : "rotate-icon-down"}/>
            </Flex>
            <div className={`expandable-container ${isExpanded ? 'expanded' : 'collapsed'}`} style={{ overflow: isExpanded ? 'visible' : 'hidden',   transition: isExpanded ?'max-height .2s ease-in-out, opacity 0.2s ease-in-out': 'max-height .2s ease-out, opacity 0.2s ease-out'}}>      
                {children}
            </div>
        </Box>
    )
}

export default CollapsableSection