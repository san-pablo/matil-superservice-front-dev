
//REACT
import  { useState, useRef, Dispatch, SetStateAction, useEffect, MouseEvent } from 'react'
import { useNavigate } from "react-router-dom"
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, Icon, IconButton, Button, chakra, shouldForwardProp, Portal } from "@chakra-ui/react"
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { motion, AnimatePresence,  isValidMotionProp} from 'framer-motion'
//ICONS
import { BsThreeDots } from "react-icons/bs"
import { FaLockOpen, FaLock, FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaPen, FaClone  } from 'react-icons/fa6'
//FUNCTIONS
import useOutsideClick from '../../../Functions/clickOutside'
//TYPING
import { View, Views } from '../../../Constants/typing'
import showToast from '../../../Components/Reusable/ToastNotification'
import { useAuth0 } from '@auth0/auth0-react'
  
//TYPING
type boxPosition = {right:number, top:string | undefined, bottom:string | undefined, isFirst:boolean,isLast:boolean, box:{type:'private' | 'shared', index:number}} | null
interface ViewItemProps {
    view:View
    index:number
    type: 'private' | 'shared'
    length:number
    settingsBoxPosition:boxPosition
    setSettingsBoxPosition: Dispatch<SetStateAction<boxPosition>>
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//VIEW ITEM
const ViewItem = ({view, index, type, length, settingsBoxPosition, setSettingsBoxPosition }:ViewItemProps) => {

    const navigate = useNavigate()
    const buttonRef = useRef<HTMLButtonElement>(null) 
    const [isHovering, setIsHovering] = useState<boolean>(false)
 
    const calculateBoxPostion = (e:MouseEvent) => {
        e.stopPropagation()
        const buttonRect = buttonRef?.current?.getBoundingClientRect()
        const halfScreenHeight = window.innerHeight / 2
        const newBoxStyle: boxPosition = {
            box:{type, index},
            isFirst:index === 0,
            isLast:index === length - 1,
            top: (buttonRect?.bottom || 0) > halfScreenHeight ? undefined : `${(buttonRect?.bottom || 0) + window.scrollY}px`,
            bottom: (buttonRect?.bottom || 0) > halfScreenHeight ? `${window.innerHeight -(buttonRect?.top || 0) - window.scrollY}px` : undefined,
            right: window.innerWidth - (buttonRef.current?.getBoundingClientRect().right || 0) 
        }
        setSettingsBoxPosition(newBoxStyle)
    }
    return(
        <Flex height={'40px'} onClick={() => navigate(`edit/${type}/${index}`)} alignItems={'center'} width='100%' gap='10px' justifyContent={'space-between'} p='7px' position='relative'  onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} bg={isHovering?'brand.hover_gray':'transparent'}  cursor='pointer' borderBottomWidth={'1px'} borderBottomColor={'gray.300'}>
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{view.name}</Text>
            {(isHovering || (settingsBoxPosition?.box.type === type && settingsBoxPosition?.box.index === index)) && 
                 <IconButton size='xs' bg='transparent' border='none' ref={buttonRef} aria-label='show-settings' icon={<BsThreeDots size='20px'/>}onClick={(e) => calculateBoxPostion(e)}/>
             }
       </Flex>
    )
}

//MAIN FUNCTION
function ViewsList () {
    
    //CONSTANTS
    const navigate = useNavigate()
    const {  getAccessTokenSilently } = useAuth0()
    const auth = useAuth()
    const { t } = useTranslation('settings')
    const isAdmin = auth.authData.users?.[auth.authData?.userId || '']?.is_admin
    useEffect (() => {document.title = `${t('Settings')} - ${t('Views')} - ${auth.authData.organizationName} - Matil`}, [])

    //CURRENT VIEWS
    const [currentPrivateViews, setCurrentPrivateViews] = useState<View[]>('private_views' in (auth.authData.views as Views) ? (auth.authData.views as Views).private_views : [])
    const [currentSharedViews, setCurrentSharedViews] = useState<View[]>('shared_views' in (auth.authData.views as Views) ? (auth.authData.views as Views).shared_views : [])

    //EDIT VIEWS LOGIC
    const [settingsBoxPosition, setSettingsBoxPosition] = useState<boxPosition>(null)
    const boxRef = useRef<HTMLDivElement>(null) 
    useOutsideClick({ref1:boxRef, onOutsideClick:(value:boolean) => {setSettingsBoxPosition(null)}})

    //UPDATE THE VIEWS LIST
    const updateOrder = async (toDelete:boolean, newPrivateViews:View[], newSharedViews:View[]) => {
        if (toDelete) {
            const { box } = settingsBoxPosition || {}
            const { type, index } = box || {}
            const indexToDelete = index as number
            if (indexToDelete !== -1) {
                if (type === 'shared') newSharedViews.splice(indexToDelete, 1)
                else newPrivateViews.splice(indexToDelete, 1)
            }
            else {
                showToast({type:'failed', message:t('DeleteError')})
                return 
            }
        }
        const newViews = {'private_views': newPrivateViews, 'shared_views': newSharedViews}
        const response = await fetchData({endpoint: `${auth.authData.organizationId}/user`, method: 'put', requestForm: {...newViews, shortcuts:auth.authData.shortcuts, users:auth.authData.users, conversation_themes:auth.authData.conversation_themes}, auth,  getAccessTokenSilently, toastMessages: {'works': `${toDelete?t('CorrectDelete'):t('CorrectOrder')}`, 'failed': `${toDelete?t('FailedDelete'):t('FailedOrder')}`}})
        if (response?.status === 200) {
            auth.setAuthData({views: {...auth.authData.views, 'private_views': newPrivateViews, 'shared_views': newSharedViews}})
            setCurrentPrivateViews(newPrivateViews)
            setCurrentSharedViews(newSharedViews)
        }
    }

    //EDIT THE POSITION DRAGGING LOGIC
    const onDragEnd = (result:any, type: 'shared' | 'private') => {
        if (!result.destination) return
        const items = Array.from(type === 'shared'?currentSharedViews:currentPrivateViews)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)
        if (type === 'shared')  {updateOrder(false, currentPrivateViews, items);setCurrentSharedViews(items)}
        else {updateOrder(false, items, currentSharedViews);setCurrentPrivateViews(items)}
    }
    const movePosition = (position: 'top' | 'bottom', type: 'shared' | 'private', index: number) => {
    if (type === 'shared') {
            setCurrentSharedViews(prevItems => {
            const items = [...prevItems]
            const [item] = items.splice(index, 1)
            if (position === 'top') items.unshift(item)
            else items.push(item)
            updateOrder(false, currentPrivateViews, items)
            return items
        })
    } else {
        setCurrentPrivateViews(prevItems => {
        const items = [...prevItems]
        const [item] = items.splice(index, 1)
        if (position === 'top') items.unshift(item)
        else items.push(item)
        updateOrder(false, items, currentSharedViews)
        return items
        })
    }
    }
      
    //FRONT
    return(<>
        <Box height={'100%'} width={'100%'}> 
            <Flex justifyContent={'space-between'} alignItems={'end'}> 
                <Box> 
                    <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('Views')}</Text>
                    <Text color='gray.600' fontSize={'.9em'}>{t('ViewsDes')}</Text>
                </Box>
                <Flex gap='10px'> 
                    <Button variant={'main'} size='sm' leftIcon={<FaPlus/>} onClick={() => navigate('edit')}>{t('CreateView')}</Button>
                </Flex>
            </Flex>
            <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='5vh'/>
            <Flex gap='3vw'>
                <Box flex='1'>
                    <Flex mb='3vh' alignItems={'center'} gap='10px'> 
                        <Icon as={FaLock} boxSize='20px' color='gray.600'/>
                        <Text fontSize={'1.2rem'} fontWeight={'medium'}>{t('PrivateViews')}</Text>
                    </Flex>
                    {currentPrivateViews.length !== 0? <> 
                        <DragDropContext onDragEnd={(result) => onDragEnd(result, 'private')}>
                            <Droppable droppableId="private-views" direction="vertical">
                                {(provided) => (
                                    <Box ref={provided.innerRef} {...provided.droppableProps} >
                                    {currentPrivateViews.map((view, index) => (
                                    <Draggable  key={`draggable-private-view-${index}`} draggableId={`draggable-private-view-${index}`} index={index}>
                                    {(provided, snapshot) => (
                                        <Box boxShadow={snapshot.isDragging?'0 4px 8px rgba(0, 0, 0, 0.3)':'none'}  bg={snapshot.isDragging ? 'brand.hover_gray' : 'transaparent'} ref={provided.innerRef}  {...provided.draggableProps} {...provided.dragHandleProps} > 
                                            <ViewItem view={view} index={index} type='private' settingsBoxPosition={settingsBoxPosition} length={currentPrivateViews.length} setSettingsBoxPosition={setSettingsBoxPosition} />
                                        </Box>
                                        )}
                                    </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    </Box>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </>:
                <Text mt='2vh'>{t('NoPrivateView')}</Text>
            }
            </Box>
            {isAdmin && 
            <Box flex='1'>
                <Flex mb='3vh' alignItems={'center'} gap='10px'> 
                    <Icon as={FaLockOpen} boxSize='20px' color='gray.600'/>
                    <Text fontSize={'1.2rem'} fontWeight={'medium'}>{t('SharedViews')}</Text>
                </Flex> 
                {currentSharedViews.length !== 0? <> 
                    <DragDropContext onDragEnd={(result) => onDragEnd(result, 'shared')}>
                        <Droppable droppableId="shared-views" direction="vertical">
                            {(provided) => (
                                <Box ref={provided.innerRef} {...provided.droppableProps} >
                                {currentSharedViews.map((view, index) => (
                                <Draggable   key={`shared-view-${index}`} draggableId={`draggable-shared-view-${index}`} index={index}>
                                {(provided, snapshot) => (
                                    <Box boxShadow={snapshot.isDragging?'0 4px 8px rgba(0, 0, 0, 0.3)':'none'}  bg={snapshot.isDragging ? 'brand.hover_gray' : 'transaparent'}  ref={provided.innerRef}  {...provided.draggableProps} {...provided.dragHandleProps} > 
                                        <ViewItem view={view} index={index} type='shared' settingsBoxPosition={settingsBoxPosition} length={currentSharedViews.length} setSettingsBoxPosition={setSettingsBoxPosition} />
                                    </Box>
                                    )}
                                </Draggable>
                                ))}
                                {provided.placeholder}
                                </Box>
                            )}
              
                        </Droppable>
                    </DragDropContext>
                    </>:
                <Text>{t('NoSharedView')}</Text>
            }
            </Box>}
             
        </Flex>
        <AnimatePresence> 
        {settingsBoxPosition &&  
        <Portal> 
            <MotionBox ref={boxRef} initial={{ opacity: 0, scale: 0.95 }}  animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}  onClick={() => setSettingsBoxPosition(null)} boxShadow='0 0 10px 1px rgba(0, 0, 0, 0.13)'
                style={{ transformOrigin: settingsBoxPosition.top ? 'top right':'bottom right' }} fontSize={'.9em'} mt={settingsBoxPosition.top ?'5px':''} mb={'5px'} borderRadius={'.5rem'}  right={settingsBoxPosition.right}  top={settingsBoxPosition.top || undefined}  bottom={settingsBoxPosition.bottom ||undefined} position='absolute' bg='white'  zIndex={1000} >
                <Flex px='15px'  onClick={() => navigate(`edit/${settingsBoxPosition.box.type}/${settingsBoxPosition.box.index}`)} py='10px' cursor={'pointer'} gap='10px' alignItems={'center'} _hover={{bg:'brand.hover_gray'}}>
                    <Icon color='gray.600' as={FaPen}/>
                    <Text whiteSpace={'nowrap'}>{t('EditView')}</Text>
                </Flex>
                <Flex  px='15px' py='10px'cursor={'pointer'} onClick={() => navigate(`edit/${settingsBoxPosition.box.type}/${settingsBoxPosition.box.index}/copy`)} gap='10px' alignItems={'center'} _hover={{bg:'brand.hover_gray'}}>
                    <Icon color='gray.600' as={FaClone}/>
                    <Text whiteSpace={'nowrap'}>{t('CloneView')}</Text>
                </Flex>
                <Flex  px='15px' py='10px'cursor={'pointer'} onClick={() => updateOrder(true, currentPrivateViews, currentSharedViews)} gap='10px' alignItems={'center'} _hover={{bg:'brand.hover_gray'}}>
                    <Icon color='gray.600' as={FaTrash}/>
                    <Text whiteSpace={'nowrap'}>{t('DeleteView')}</Text>
                </Flex>
                {!settingsBoxPosition.isFirst && 
                <Flex onClick={() => movePosition('top', settingsBoxPosition.box.type, settingsBoxPosition.box.index)} cursor={'pointer'}  px='15px' py='10px' gap='10px' alignItems={'center'} _hover={{bg:'brand.hover_gray'}}>
                    <Icon color='gray.600' as={FaArrowUp}/>
                    <Text whiteSpace={'nowrap'}>{t('MoveUp')}</Text>
                </Flex>}
                {!settingsBoxPosition.isLast && 
                <Flex onClick={() => movePosition('bottom', settingsBoxPosition.box.type, settingsBoxPosition.box.index)}   cursor={'pointer'}  px='15px' py='10px' gap='10px' alignItems={'center'} _hover={{bg:'brand.hover_gray'}}>
                    <Icon color='gray.600' as={FaArrowDown}/>
                    <Text whiteSpace={'nowrap'}>{t('MoveDown')}</Text>
                </Flex>}
            </MotionBox>
            </Portal>}
            </AnimatePresence>
    </Box> 
 
    </>)
}

export default ViewsList