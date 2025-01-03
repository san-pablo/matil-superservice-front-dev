/*
    BUTTON TO MAKE ACTIONS ON THE DIFFERENT TABLES
*/

//REACT
import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../AuthContext'
import { useTranslation } from 'react-i18next'
//FRONT
import { Button, Flex, Text, Icon, chakra, shouldForwardProp, Portal } from '@chakra-ui/react'
import { motion, isValidMotionProp, AnimatePresence } from 'framer-motion'
import '../../Components/styles.css'
//FUNCTIONS
import useOutsideClick from '../../Functions/clickOutside'
//ICONS
import { FaPen, FaFileCsv, FaClone } from "react-icons/fa6"
import { IoIosArrowDown } from "react-icons/io"
//TYPING
import { ViewType } from '../../Constants/typing'
 
//TYPING
interface Item {
    [key: string]: any
}
interface ButtonProps {
    items: Item[] | undefined | null
    view: ViewType | null
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
    const navigate = useNavigate()
    const auth = useAuth()
    const isAdmin = auth.authData.users?.[auth.authData?.userId || '']?.is_admin

    //SHOW AND HIDE LIST LOGIC
    const buttonRef = useRef<HTMLButtonElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)
    const [showList, setShowList] = useState(false)
    useOutsideClick({ref1:buttonRef, ref2:boxRef, onOutsideClick:setShowList})

    //FUNCTIONS
    const handleDownloadCSV = useCallback(() => {
        downloadCSV({ items, view: view ?view.name : 'Tabla', section })
        setShowList(false)
    }, [items, view, section])
    const handleEditView = useCallback(() => {
        if (section === 'conversations' && view) navigate(`/settings/workflows/edit-views/edit/${view.type}/${view.index}`)
    }, [navigate, section, view])
    const handleCloneView = useCallback(() => {
        if (section === 'conversations' && view) navigate(`/settings/workflows/edit-views/edit/${view.type}/${view.index}/copy`)
    }, [navigate, section, view])

    //FRONT
    return (
        <Flex position={'relative'} flexDir='column' alignItems={'end'}>  
            <Button size='sm'   ref={buttonRef} leftIcon={<IoIosArrowDown className={showList ? "rotate-icon-up" : "rotate-icon-down"}/>}variant='common' onClick={() => {setShowList(!showList)}} >
                {t('Actions')}
            </Button>
            <AnimatePresence> 
                
                {showList && 
                <Portal>
                    <MotionBox  id="custom-portal"  ref={boxRef} initial={{ opacity: 0, scale: 0.95, }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                        style={{ transformOrigin: 'top right' }} p='8px' top={buttonRef.current?.getBoundingClientRect().bottom} right={'1vw'} overflow={'hidden'}  fontSize={'.8em'} marginTop={'5px'}  position='fixed' bg='white' zIndex={1000} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.15)' borderColor='gray.200' borderWidth='1px' borderRadius='.5rem'>
                        <Flex onClick={handleDownloadCSV}  cursor={'pointer'}  px='15px' py='10px' gap='10px' borderRadius={'.5rem'}  alignItems={'center'} _hover={{bg:'brand.gray_2'}}>
                            <Icon  color='gray.600' as={FaFileCsv}/>
                            <Text whiteSpace={'nowrap'}>{t('CSV')}</Text>
                        </Flex>
                
                        {(section === 'conversations' && view?.type !== 'deleted' && !(!isAdmin && view?.type === 'shared')) &&<>
                        <Flex onClick={handleEditView} px='15px' py='10px' cursor={'pointer'} gap='10px'  borderRadius={'.5rem'}  alignItems={'center'} _hover={{bg:'brand.gray_2'}}>
                            <Icon color='gray.600'  as={FaPen}/>
                            <Text whiteSpace={'nowrap'}>{t('EditView')}</Text>
                        </Flex>
                        <Flex  onClick={handleCloneView} px='15px' py='10px'cursor={'pointer'} gap='10px' alignItems={'center'}  borderRadius={'.5rem'}  _hover={{bg:'brand.gray_2'}}>
                            <Icon color='gray.600' as={FaClone}/>
                            <Text whiteSpace={'nowrap'}>{t('CloneView')}</Text>
                        </Flex></> }
                   </MotionBox >
                   </Portal>
                }
         
            </AnimatePresence>
        </Flex>
    )
}

export default ActionsButton