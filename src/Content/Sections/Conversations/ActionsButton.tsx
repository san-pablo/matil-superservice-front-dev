/*
    BUTTON TO MAKE ACTIONS ON THE DIFFERENT TABLES
*/

//REACT
import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../AuthContext'
import { useTranslation } from 'react-i18next'
//FRONT
import { Button, Flex, Text, Icon, chakra, shouldForwardProp, Portal, Box } from '@chakra-ui/react'
import { motion, isValidMotionProp, AnimatePresence } from 'framer-motion'
import '../../Components/styles.css'
//FUNCTIONS
import useOutsideClick from '../../Functions/clickOutside'
//ICONS
import { FaPen, FaFileCsv, FaClone, FaCloudArrowUp } from "react-icons/fa6"
 
import { IoIosArrowDown } from "react-icons/io"

//TYPING
interface Item {
    [key: string]: any
}
interface ButtonProps {
    items: Item[] | undefined | null
    view: any | null
    section: 'contacts' | 'conversations' | 'flows'
}
interface downloadCSVProps {
    items:  Item[] | undefined | null
    view: string
    section: 'contacts' | 'conversations' | 'flows'
}

//FUNCTION FOR DOWNLOAD TO CSV A TABLE
function downloadCSV({items, view, section}:downloadCSVProps) {
    if (!items || items.length === 0) {return}
    const headers = Object.keys(items[0]);
    const csvRows = [headers]
    items.forEach(item => {
        const values = headers.map(header => {
            const escaped = ('' + item[header]).replace(/"/g, '\\"')
            return `"${escaped}"`
        })
        csvRows.push(values)
    })
    const csvString = csvRows.map(e => e.join(",")).join("\n")
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${section}-${view}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//MAIN FUNCTION
const ActionsButton = ({items, view, section}:ButtonProps) =>{
    
    //TRANSLATION
    const { t } = useTranslation('conversations')

    //CONSTANTS
    const auth = useAuth()
     
    //SHOW AND HIDE LIST LOGIC
    const buttonRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)
    const [showList, setShowList] = useState(false)
    useOutsideClick({ref1:buttonRef, ref2:boxRef, onOutsideClick:setShowList})

    //FUNCTIONS
    const handleDownloadCSV = useCallback(() => {
        downloadCSV({ items, view: view ?view.name : 'Tabla', section })
        setShowList(false)
    }, [items, view, section])
  
    //FRONT
    return (<> 

        <Flex flexDir='column' alignItems={'end'}> 
            <Box  ref={buttonRef} > 
                <Button size='sm'    leftIcon={<IoIosArrowDown className={showList ? "rotate-icon-up" : "rotate-icon-down"}/>}variant='common' onClick={() => {setShowList(true)}} >
                    {section === 'conversations'?t('Actions'):t('More')}
                </Button>   
            </Box>      
        </Flex>
        <AnimatePresence> 
        {showList &&  
            <Portal> 
                <MotionBox   ref={boxRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                    style={{ transformOrigin: 'top' }}  minW={buttonRef.current?.getBoundingClientRect().width } right={section === 'conversations'?'2vw':undefined} left={section === 'conversations'?undefined:(buttonRef.current?.getBoundingClientRect().left || 0)} mt='5px'  top={(buttonRef.current?.getBoundingClientRect().bottom ) + 'px'}  position='fixed' bg='white' p='5px'  zIndex={10000000} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='gray.200' borderWidth='1px' borderRadius='.5rem'>
                
                   <Flex fontSize={'.8em'} p='7px' gap='10px'  borderRadius='.5rem'  cursor={'pointer'} onClick={handleDownloadCSV}  alignItems={'center'} _hover={{bg:'brand.gray_2'}}>
                        <Icon color='gray.600' as={FaFileCsv}/>
                        <Text whiteSpace={'nowrap'}>{t('CSV')}</Text>
                    </Flex>
                    {section === 'contacts' &&
                    <Flex fontSize={'.8em'} p='7px' gap='10px'  borderRadius='.5rem'  cursor={'pointer'} onClick={() => {}}  alignItems={'center'} _hover={{bg:'brand.gray_2'}}>
                        <Icon color='gray.600' as={FaCloudArrowUp}/>
                        <Text whiteSpace={'nowrap'}>{t('ImportData')}</Text>
                    </Flex>}
             
                </MotionBox >
            </Portal>}
    </AnimatePresence>

    </>)
}

export default ActionsButton