//REACT
import { useState, useRef, RefObject, CSSProperties, ReactElement, useEffect, Fragment, Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../AuthContext'
import { useAuth0 } from '@auth0/auth0-react'
//FUNCTIONS
import fetchData from '../../API/fetchData'
//FRONT
import { Flex, Text, Box, Icon, Portal,  chakra, shouldForwardProp, Avatar, Skeleton } from '@chakra-ui/react'
import { motion, AnimatePresence, isValidMotionProp  } from 'framer-motion'
import '../styles.css'
//COMPONENTS
import EditText from './EditText'
//FUNCTIONS
import determineBoxStyle from '../../Functions/determineBoxStyle'
import useOutsideClick from '../../Functions/clickOutside'
//ICONS
import { RxCross2 } from 'react-icons/rx'
import { FaCheck } from 'react-icons/fa'
 
//TYPING
interface CustomSelectProps  { 
    options: string[]
    selectedItem:  string | string[] | null | undefined  | number
    setSelectedItem: (key: string | string[]) => void
    hide?:boolean
    updateData?: () => void
    onlyOneSelect?:boolean
    labelsMap?: { [key in string]: string } | null
    iconsMap?: { [key in string]: [string, ReactElement | string] | [string, ReactElement | string]} | null
    containerRef?: RefObject<HTMLDivElement>
    isDisabled?:boolean
    disabledOptions?:string[]
    includeNull?:boolean
    fontSize?:string
    alwaysExpanded?:boolean
    markSelect?:boolean
    customImport?: 'business_id' | 'person_id' 
    setCustomSectionsMap?:Dispatch<SetStateAction<{[key:string]:string}>>
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//MAIN FUNCTION
const CustomSelect = ({options, selectedItem, setSelectedItem, onlyOneSelect = true,  updateData=() => {},  labelsMap=null ,iconsMap=null, containerRef, isDisabled = false, disabledOptions, alwaysExpanded = false, includeNull = false, fontSize = '.8em', markSelect = false, customImport = null, setCustomSectionsMap}: CustomSelectProps) => {

    //REFS
    const { t } = useTranslation('settings')
    const auth = useAuth()
    const { getAccessTokenSilently } = useAuth0()
    const buttonRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)

    //BOOLEAN TO CONTROL THE VISIBILITY OF THE LIST AND CLOSE ON OUTSIDE CLICK
    const [showList, setShowList] = useState<boolean>(false)
    useOutsideClick({ref1:buttonRef, ref2:boxRef, containerRef, onOutsideClick:setShowList,})

    //FILTER WITH TEXT LOGIC
    const [filterdOptions, setFilteredOptions] = useState<string[]>(options)
    const [text, setText] = useState<string>('')
    useEffect(() => {
        const filterUserData = async () => {

            let filtered

            if (customImport) {
                if (customImport === 'business_id' || customImport === 'person_id') {
                    const response = await fetchData({endpoint:`${auth.authData.organizationId}/${customImport === 'person_id' ? 'persons':'businesses'}`, getAccessTokenSilently, params:{page_index:1, query:text, sort:[{column:'id', order:'desc'}], filters:{logic:'AND', groups:[] }}, auth})
                    if (response?.status === 200) filtered = response.data.page_data
                }

            }
            else {
                const normalizedText = text.trim().toLowerCase()
                const sanitizedText = normalizedText.replace(/\u200B/g, '')

                filtered = options.filter((option) => {
                    const optionName = iconsMap ? iconsMap[option]?.[0] : labelsMap[option] 
                    const isSelected = (Array.isArray(selectedItem) ? selectedItem.includes(option) : selectedItem === option)
                    return ( (optionName || '').toLowerCase().includes(sanitizedText)) && !isSelected
                    
                })
            }
            setFilteredOptions(filtered)

        }
        filterUserData()
        
    }, [text, selectedItem, labelsMap, iconsMap])

    //SHORTCUTS LOGIC
    const [selectedName, setSelectedName] = useState<string>('')
    const selectedNameRef = useRef<string>(selectedName);
    useEffect(() => {selectedNameRef.current = selectedName}, [selectedName])
    useEffect(() => {
        const handleKeyDown = (event:KeyboardEvent) => {
            if (showList) {
                if (event.code === 'ArrowDown') {
                    event.preventDefault()
                    const currentIndex = filterdOptions.findIndex((item => selectedName === item))
                    if (currentIndex <  filterdOptions.length - 1) setSelectedName(filterdOptions[currentIndex + 1])
                }
                else if (event.code === 'ArrowUp') {
                    event.preventDefault()
                    const currentIndex = filterdOptions.findIndex((item => selectedName === item))
                    if (currentIndex > 0) setSelectedName(filterdOptions[currentIndex - 1])
                }
                else if (event.code === 'Enter') handleSelection(selectedNameRef.current)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => {window.removeEventListener('keydown', handleKeyDown)}
    }, [filterdOptions, selectedName, showList])

  
    //BOX POSITION LOGIC, TO SHOW IT UP OR DOWN OF THE INPUT, DEPENDING ON THE POSITION
    const [boxStyle, setBoxStyle] = useState<CSSProperties>({})
    determineBoxStyle({buttonRef, setBoxStyle, alwaysTop:true, changeVariable:showList})

    //HANDLE ELEMENT SELECT
    const handleSelection = (option: string) => {
        setText('')
         if (onlyOneSelect || typeof(selectedItem) === 'string') {
            setSelectedItem(option)
            setShowList(false) 
        }
        else {
            const selectedArray = Array.isArray(selectedItem) ? selectedItem : [] as string[]
            setSelectedItem([...selectedArray as string[], option] as any)
        }
         setTimeout(() => updateData(), 0)
    }

    const handleDeleteOption = (option:string) => {
        if (onlyOneSelect ) {
            setSelectedItem('')
            setShowList(false)
        }
        else {
            const selectedArray = Array.isArray(selectedItem) ? selectedItem : [] as string[]
            if (selectedArray.includes(option)) setSelectedItem(selectedArray.filter((item) => item !== option) as any) as any
        }
    }
 
    //FRONT
    return(
        <Box ref={buttonRef} w='100%' >
             {!alwaysExpanded && 
             <Flex  h='28px'  gap={'7px'} bg={isDisabled ? 'gray_1': markSelect ? 'hover_gray': 'transparent'} transition={'border-color .2s ease-in-out, box-shadow .2s ease-in-out'} cursor={isDisabled ? 'not-allowed':'pointer'} alignItems={'center'}   onClick={()=>{if (!isDisabled) setShowList(!showList)}}  p={'7px'} borderRadius='.5rem'   _hover={{bg:'gray_1'}}>
                {selectedItem ? 
                    <>
                        {(typeof(selectedItem) === 'string' || typeof(selectedItem) === 'number' ) ? 
                            <>
                            {customImport ? 
                                <GetCustomRow row={selectedItem} selectedOption={selectedName} type={customImport} fontSize={fontSize} onClickAction={() => {}}/>
                                :
                                <> 
                                    {iconsMap && <> {iconsMap?.[selectedItem]?.[1]}</>}
                                    <Text fontSize={fontSize} color={isDisabled ? 'text_gray':'black'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{(selectedItem === null ? t('Any'):(labelsMap && selectedItem !== undefined)?labelsMap[selectedItem]:iconsMap?.[selectedItem]?iconsMap[selectedItem][0]:selectedItem) || '-'}</Text>
                                </>
                            }
                        </>
                            :
                            <> 
                                {selectedItem.map((item, index) => (
                                     <Fragment key={`item-${index}`}>
                                     {customImport ? 
                                         <GetCustomRow row={selectedItem} selectedOption={selectedName} type={customImport} fontSize={fontSize} onClickAction={() => {}}/>
                                         :
                                            
                                        <Flex key={`item-${index}`} fontSize={fontSize} gap='7px' alignItems={'center'} > 
                                            {iconsMap && <> {iconsMap?.[item]?.[1]}</>}
                                            <Text>{iconsMap?iconsMap[item][0]:labelsMap?labelsMap[item]:selectedItem}</Text>
                                        </Flex>
                                        }
                                    </Fragment>
                                ))}
                            </>
                        }
                    </>
                    :
                    <Text>-</Text>
                }
             </Flex>}
                
            <AnimatePresence> 
                {(showList || alwaysExpanded) && 
                    <Portal>
                        <MotionBox display={'flex'} flexDir={'column'}  onClick={(e) => e.stopPropagation()} id='custom-portal'  initial={{ opacity: 0, scale:0.95 }} animate={{ opacity: 1,scale:1 }}  exit={{ opacity: 0, scale:0.95 }} transition={{ duration: '.2', ease: 'easeOut'}}
                        style={{ transformOrigin: (boxStyle.top ? 'top ':'bottom ') + (boxStyle.left ? 'left ':'right ')  }} top={boxStyle.top}  right={boxStyle.right} left={boxStyle.left} minW={'250px'} width={`calc(${boxStyle.width})`} maxH={`${Math.min(window.innerHeight * 0.4, (window.innerHeight  - buttonRef?.current?.getBoundingClientRect()?.bottom || 0))}px`} overflow={'hidden'}  ref={boxRef} boxShadow={'rgba(20, 20, 20, 0.2) 0px 16px 32px 0px'} bg='white' zIndex={100000}   position={'fixed'} borderRadius={'.5rem'} borderWidth={'1px'} borderColor={'border_color'}>
                            
                            <Flex p={alwaysExpanded?'10px':'7px'} alignItems={'center'} flexWrap={'wrap'} columnGap='12px' rowGap='5px' borderBottomWidth={'1px'} borderBottomColor={'border_color'} minH='28px' bg='hover_gray'>
                                 
                                 {selectedItem &&
                                    <>
                                    {(typeof(selectedItem) === 'string' || typeof(selectedItem) === 'number') ?
                                        <>
                                            {customImport ? 
                                                <GetCustomRow row={selectedItem} selectedOption={selectedName} type={customImport} fontSize={fontSize} onClickAction={() => {}}/>
                                                :
                                                <Flex position={'relative'} gap={'5px'} alignItems={'center'} justifyContent={'center'} >
                                                    <Flex fontSize={fontSize} gap='7px' alignItems={'center'} > 
                                                        <Flex alignItems={'center'} color='text_gray'> 
                                                            {iconsMap && <> {iconsMap?.[selectedItem]?.[1]}</>}
                                                        </Flex>
                                                        <Text color={isDisabled ? 'text_gray':'black'}  whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{(selectedItem === null ? t('Any'):(labelsMap && selectedItem !== undefined)?labelsMap[selectedItem]:iconsMap?.[selectedItem]?iconsMap[selectedItem][0]:selectedItem) || '-'}</Text>
                                                    </Flex>
                                                </Flex>
                                            }
                                        </>
                                    :
                                        <>
                                            {selectedItem.map((item, index) => (
                                                <Fragment key={`item-2-${index}`}>
                                                    {customImport ? 
                                                        <GetCustomRow row={selectedItem} selectedOption={selectedName} type={customImport} fontSize={fontSize} onClickAction={() => {}}/>
                                                    :
                                                    <Flex key={`item-${index}`} position={'relative'} gap={'3px'} alignItems={'center'} justifyContent={'center'} >
                                                        <Flex fontSize={fontSize} gap='7px' alignItems={'center'} > 
                                                            <Flex alignItems={'center'} color='text_gray'> 
                                                                {iconsMap && <> {iconsMap?.[item]?.[1]}</>}
                                                            </Flex>
                                                            <Text>{iconsMap?iconsMap[item][0]:labelsMap?labelsMap[item]:selectedItem}</Text>
                                                        </Flex>
                                                        <Icon  color='text_gray' cursor={'pointer'} boxSize={'12px'} as={RxCross2} onClick={() => {handleDeleteOption(item)} }/>
                                                    </Flex>}
                                                </Fragment>
                                            ))}
                                        </>
                                    }
                                    </>
                                }
                                   
                                <Box flex='1' minW={'100px'}> 
                                    <EditText isCustomSelect fontSize={fontSize} focusOnOpen searchInput value={text} setValue={setText}/>
                                </Box>
                            </Flex>

                 
                            <Box flex='1' overflow={'scroll'}> 
                                {includeNull && 
                                <Flex px='10px' fontSize={fontSize}   py='7px' cursor={'pointer'} justifyContent={'space-between'} alignItems={'center'} color={selectedItem === null?'text_blue':'black'} _hover={{bg:selectedItem === null?'border_color':'hover_gray'}}
                                    onClick={(e) => {if (includeNull) {setSelectedItem(null as any);setShowList(false);setTimeout( () => updateData(), 0)} }}>
                                    <Flex gap='10px' alignItems={'center'} > 
                                        <Text >{t('Any')}</Text>
                                    </Flex>
                                    {selectedItem === null && <Icon as={FaCheck}/>}
                                </Flex>}

                                {filterdOptions.length === 0 ? 
                                <Flex fontSize={fontSize} px='10px' py='7px'  alignItems={'center'}>
                                    <Text color={'text_gray'}>{t('NoOptions')}</Text>
                                </Flex>
                                :<> 
                                    {filterdOptions.map((option:string, index:number) => (
                                        <Fragment key={`option-${index}`}>
                                        {customImport ? 
                                        <GetCustomRow row={option} selectedOption={selectedName} type={customImport} fontSize={fontSize} onClickAction={(id:any) => {if (!disabledOptions?.includes(option)) {handleSelection(id);if(setCustomSectionsMap) setCustomSectionsMap(prev => ({...prev, [(option as any).id]:(option as any).name}))} }}/>
                                        :
                                        <Flex fontSize={fontSize}  key={`${selectedItem}-option-${index}`} p='7px' bg={selectedName === option?'hover_gray':'transparent'}  cursor={disabledOptions?.includes(option)?'not-allowed':'pointer'} justifyContent={'space-between'} alignItems={'center'} _hover={{bg:disabledOptions?.includes(option)?'border_color':'hover_gray'}}
                                                onClick={() => {if (!disabledOptions?.includes(option)) {handleSelection(option)}}}>
                                                <Flex gap='7px' alignItems={'center'} > 
                                                    <Flex alignItems={'center'} color='text_gray'> 
                                                        {iconsMap && <> {iconsMap?.[option]?.[1]}</>}
                                                    </Flex>
                                                    <Text>{iconsMap?iconsMap[option][0]:labelsMap?labelsMap[option]:option}</Text>
                                                </Flex>
                                                {selectedItem === option && <Icon as={FaCheck}/>}
                                            </Flex>
                                        }
                                        </Fragment>
                                    ))}
                                </>}
                            </Box>
                        </MotionBox>
                    </Portal>
                }
            </AnimatePresence>
        </Box>
    )
}

export default CustomSelect


 
const GetCustomRow = ({row, type, fontSize, onClickAction, selectedOption}:{type: 'business_id' | 'person_id' , row:any, fontSize:string, onClickAction:any, selectedOption:any}) => {

    const auth = useAuth()
    const { getAccessTokenSilently } = useAuth0()

    let [selectedRow, setSelectedRow] = useState(row)
    const fetchBusinessData = async () => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/${type=== 'person_id' ? 'persons': 'businesses'}`, getAccessTokenSilently, params:{page_index:1, sort:{column:'id', order:'desc'}, filters:{logic:'AND', groups:[{logic: 'AND', conditions:[{col:'id', op:'eq', val:row}]}] }}, auth})
        if (response?.status === 200) setSelectedRow(response.data.page_data[0])
    }
    if (typeof(row) === 'number' || typeof(row) === 'string')  fetchBusinessData()
    
    switch (type) {
        case 'business_id':
        case 'person_id':
            return (<> 
                {(typeof(row) === 'number' || typeof(row) === 'string') ? 
                    <Skeleton isLoaded={typeof(selectedRow) !== 'number' && typeof(row) !== 'string'}> 
                        <Text fontSize={fontSize}>{selectedRow?.name || ''}</Text>
                    </Skeleton>
                :
                    <Flex fontSize={fontSize} onClick={() => onClickAction(selectedRow?.id)}  p='7px' bg={selectedOption === row?.id?'hover_gray':'transparent'}  cursor={'pointer'} gap='5px' alignItems={'center'} _hover={{bg:(typeof(row) === 'number' || typeof(row) === 'string') ? '':'hover_gray'}}>
                        {!(typeof(row) === 'number' || typeof(row) === 'string')  && <Avatar name={selectedRow?.name || ''} size='xs' h='12px' w ='12px'/>}
                        <Text >{selectedRow?.name || ''}</Text>
                    </Flex>
                }
        </>)

    }
}