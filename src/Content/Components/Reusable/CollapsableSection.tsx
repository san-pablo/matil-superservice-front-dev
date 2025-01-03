//REACT
import { ReactNode } from "react"
//FRONT
import { Box, Flex, Text } from "@chakra-ui/react"
import { motion } from 'framer-motion'
//ICONS
import { IoIosArrowDown } from "react-icons/io"

const CollapsableSection = ({ section, isExpanded, onSectionExpand, children, sectionsMap, mt}:{section:string, isExpanded:boolean, onSectionExpand:(key:string) => void ,children:ReactNode, sectionsMap:{[key:string]:string},  mt?:string}) => {

    return (
        <Box pb='3vh' mt={mt} borderBottomColor={'gray.200'} borderBottomWidth={'1px'}> 
            <Flex cursor={'pointer'} alignItems={'center'} justifyContent={'space-between'} onClick={() => onSectionExpand(section)} _hover={{color:'brand.text_blue'}}>
                <Text fontWeight={'semibold'}  fontSize={'.9em'}>{sectionsMap[section]}</Text>
                <IoIosArrowDown  className={isExpanded ? "rotate-icon-up" : "rotate-icon-down"}/>
            </Flex>
            <motion.div initial={false} animate={{height:isExpanded?'auto':0, opacity:isExpanded?1:0 }} exit={{height:isExpanded?0:'auto',  opacity:isExpanded?0:1 }} transition={{duration:.2}} style={{overflow:isExpanded?'visible':'hidden'}}>           
                {children}
            </motion.div>
        </Box>
    )
}

export default CollapsableSection