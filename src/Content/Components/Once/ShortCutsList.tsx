
//REACT
import { Dispatch, SetStateAction } from "react"
import { useTranslation } from "react-i18next"
//FRONT
import { Box, Text, Flex, Checkbox, Button, Icon } from "@chakra-ui/react"
import { IconType } from "react-icons"
import { IoMdArrowDropright, IoMdArrowDropleft, IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io"


const KeyElement = ({keys, description}:{keys:(string | IconType)[], description:string}) => {
    return (
        <Flex alignItems={'center'} gap='15px' fontSize={'.9em'} mt='1vh'>
            <Flex gap='5px'>
                {keys.map((key, index) => (<> 
                    <Flex key={`key-${index}-${description}`} px='5px' borderRadius={'.2rem'} bg='gray.200' borderColor={'gray.300'} justifyContent={'center'} alignItems={'center'} borderWidth={'1px'}>
                        {typeof(key) === 'string' ? <Text>{key}</Text> :<Icon boxSize={'1em'} as={key}/>}
                    </Flex>
                    {index !== keys.length -1 && <Text fontWeight={'medium'}>+</Text>}
                </>))}
            </Flex>
            <Text>{description}</Text>
        </Flex>
    )
}


const ShortCutsList = ({setShowShortcuts}:{setShowShortcuts:Dispatch<SetStateAction<boolean>>}) => {
    
    const { t } = useTranslation('main')

    const downloadPdf = () => {}
    
    return (
      <Flex flexDir='column' justifyContent={'space-between'} maxH={'90vh'}> 
        <Box p='20px'>
          <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('KeyboardShortcutsTitle')}</Text>        
        </Box>
     
        <Box flex='1' borderBottomColor={'gray.200'} borderTopColor={'gray.200'} borderWidth={'1px 0 1px 0'} p='20px' overflowY={'scroll'}> 
          <Flex gap='50px'> 
            <Box>
              <Text fontWeight={'medium'}>{t('navigation.title')}</Text>
              <Text fontSize={'.9em'} fontWeight={'medium'} color='gray.600'>{t('navigation.description')}</Text>        
              <KeyElement keys={['Ctrl', 'Alt', 'v']} description={t('navigation.shortcuts.tickets')} />
              <KeyElement keys={['Ctrl', 'Alt', 'c']} description={t('navigation.shortcuts.clients')} />
              <KeyElement keys={['Ctrl', 'Alt', 'b']} description={t('navigation.shortcuts.contactCompanies')} />
              <KeyElement keys={['Ctrl', 'Alt', 't']} description={t('navigation.shortcuts.statistics')} />
              <KeyElement keys={['Ctrl', 'Alt', 'a']} description={t('navigation.shortcuts.settings')} />
              <KeyElement keys={['Ctrl', 'Alt', 'w']} description={t('navigation.shortcuts.closeTab')} />
              <KeyElement keys={['Ctrl', 'Alt', IoMdArrowDropleft]} description={t('navigation.shortcuts.prevTab')} />
              <KeyElement keys={['Ctrl', 'Alt', IoMdArrowDropright]} description={t('navigation.shortcuts.nextTab')} />
    
              <Text fontWeight={'medium'} fontSize={'.9em'} mt='3vh' color='gray.600'>{t('navigation.lists.description')}</Text>      
              <KeyElement keys={[IoMdArrowDropup, IoMdArrowDropdown]} description={t('navigation.lists.upDown')} />
              <KeyElement keys={[IoMdArrowDropleft, IoMdArrowDropright]} description={t('navigation.lists.leftRight')} />
              <KeyElement keys={['Enter']} description={t('navigation.lists.click')} />
              <KeyElement keys={['Espacio']} description={t('navigation.lists.mark')} />
            </Box>
                    
            <Box>
              <Text fontWeight={'medium'}>{t('tickets.title')}</Text>
              <Text fontWeight={'medium'} fontSize={'.9em'} color='gray.600'>{t('tickets.description')}</Text>        
              <KeyElement keys={['Ctrl', 'Alt', 'r']} description={t('tickets.shortcuts.publicReply')} />
              <KeyElement keys={['Ctrl', 'Alt', 'n']} description={t('tickets.shortcuts.internalNote')} />
              <KeyElement keys={['Ctrl', 'Alt', 'h']} description={t('tickets.shortcuts.toggleClientTab')} />
              <KeyElement keys={['Ctrl', 'Alt', 'u']} description={t('tickets.shortcuts.takeControl')} />
    
              <Text fontWeight={'medium'} fontSize={'.9em'} mt='3vh' color='gray.600'>{t('tickets.saveUpdate.description')}</Text>        
              <KeyElement keys={['Enter']} description={t('tickets.saveUpdate.saveCurrentState')} />
              <KeyElement keys={['Ctrl', 'Alt', 'o']} description={t('tickets.saveUpdate.saveAsOpen')} />
              <KeyElement keys={['Ctrl', 'Alt', 'p']} description={t('tickets.saveUpdate.saveAsPending')} />
              <KeyElement keys={['Ctrl', 'Alt', 's']} description={t('tickets.saveUpdate.saveAsResolved')} />
    
              <Text fontWeight={'medium'} fontSize={'.9em'} mt='3vh' color='gray.600'>{t('tickets.writing.description')}</Text>      
              <KeyElement keys={['Cmd/Ctrl', 'Enter']} description={t('tickets.writing.insertLineBreak')} />
              <KeyElement keys={['Cmd/Ctrl', 'm']} description={t('tickets.writing.insertImage')} />
              <KeyElement keys={['Cmd/Ctrl', 'k']} description={t('tickets.writing.insertLink')} />
              <KeyElement keys={['Cmd/Ctrl', 'b']} description={t('tickets.writing.bold')} />
              <KeyElement keys={['Cmd/Ctrl', 'i']} description={t('tickets.writing.italic')} />
              <KeyElement keys={['Cmd/Ctrl', 'u']} description={t('tickets.writing.underline')} />
              <KeyElement keys={['Cmd/Ctrl', 'Mayus', '5']} description={t('tickets.writing.codeBlock')} />
              <KeyElement keys={['Cmd/Ctrl', 'Mayus', '6']} description={t('tickets.writing.numberedList')} />
              <KeyElement keys={['Cmd/Ctrl', 'Mayus', '7']} description={t('tickets.writing.bulletList')} />
            </Box>
          </Flex>
        </Box>
    
        <Flex p='20px' justifyContent={'space-between'} alignItems={'center'}>  
          <Box>   
            <Flex gap='7px'>
              <Checkbox/>
              <Text fontSize={'.9em'} fontWeight={'medium'}>{t('ActivateShortcuts')}</Text>
            </Flex>
          </Box>
          <Flex gap='15px'> 
            <Button size='sm' variant={'common'} onClick={() => setShowShortcuts(false)}>{t('Cancel')}</Button>
            <Button size='sm' variant={'main'} onClick={downloadPdf}>{t('DownloadAsPdf')}</Button>
          </Flex>
        </Flex>
      </Flex>
    )
    
}

export default ShortCutsList