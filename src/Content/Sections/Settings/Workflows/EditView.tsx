//REACT
import { useState, useEffect, RefObject, useRef } from 'react'
import { useAuth } from '../../../../AuthContext'
import DOMPurify from 'dompurify'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, Tooltip, Input, IconButton, Button } from "@chakra-ui/react"
//COMPONENTS
import LoadingIconButton from '../../../Components/Reusable/LoadingIconButton'
import EditViewComponent from './EditViewsComponent'
import EditText from '../../../Components/Reusable/EditText'
//ICONS
import { FaUnlock, FaLock } from 'react-icons/fa6'
import { IoIosArrowBack } from 'react-icons/io'
//TYPING
import { View, Views } from '../../../Constants/typing'
    
//MAIN FUNCTION
function EditView ({scrollRef}:{scrollRef:RefObject<HTMLDivElement>}) {

    //CONSTANTS
    const auth = useAuth()
    const navigate = useNavigate()
    const location = useLocation().pathname
    const { t } = useTranslation('settings')
    const lastLocationString = location.split('/')[location.split('/').length - 1]
    const view:{type:'private' | 'shared', index:number} | null = lastLocationString === 'edit' ? null : lastLocationString === 'copy' ? {index:parseInt(location.split('/')[location.split('/').length - 2]), type:location.split('/')[location.split('/').length - 3] as 'private' | 'shared'}:{index:parseInt(lastLocationString), type:location.split('/')[location.split('/').length - 2] as 'private' | 'shared'}
    
    //IS ADMIN
    const isAdmin = auth.authData.users?.[auth.authData?.userId || '']?.is_admin

    //BOOLEAN FOR WAIT THE UPLOAD
    const [waitingSend, setWaitingSend] = useState<boolean>(false)
    const initialRender = useRef<boolean>(true)

    //DETERMINE THE EDIT VIEW TYPE
    const viewsAuth = auth.authData.views as Views
    const viewLocation = view ? view.type === 'private' ? 'private_views':'shared_views':'private_views'
    const [viewType, setViewType] = useState<'private' | 'shared'>(view ?view.type:'private')
    
      //SELECTED VIEW
    const currentViewsRef = useRef<View | null>(null)
    const [selectedView, setSelectedView] = useState<View | null>(null)  

    useEffect(() => {
        let selectedViewSelection:View = {
            'name': t('NewView'),
            'columns': [],
            'created_at':'',
            'all_conditions': [],
            'any_conditions': [],
            'order_by': {
              'column': 'local_id',
              'order': 'asc'
            }
          }
        if (lastLocationString !== 'copy' && view !== null) selectedViewSelection = viewsAuth[viewLocation][view.index]
        else if (view !== null) {const originalView = viewsAuth[viewLocation][view.index];const v = { ...originalView, name: originalView.name + t('Copy') };selectedViewSelection = v}
        if (initialRender.current) currentViewsRef.current = selectedViewSelection
        setSelectedView(selectedViewSelection)
        initialRender.current = false
    },[])
    
    //SEND ALL THE CHANGES 
    const sendEditView = async() => {

        const viewsAuthChange = {...auth.authData.views as Views}
        const mapType: { [key in 'shared' | 'private']: 'shared_views' | 'private_views' } = {
            'shared': 'shared_views',
            'private': 'private_views'
        }

        if (view && lastLocationString !== 'copy') {
            if (view.type === viewType && selectedView) {
                if (viewsAuthChange[mapType[viewType]] && viewsAuthChange[mapType[viewType]][view.index]) viewsAuthChange[mapType[viewType]][view.index] = selectedView
            }
            else {
                if (viewsAuthChange[mapType[viewType]] && viewsAuthChange[mapType[viewType]][view.index]) viewsAuthChange[mapType[view.type]].splice(view.index, 1)
                if (viewsAuthChange[mapType[viewType]]  && selectedView) viewsAuthChange[mapType[viewType]].push(selectedView)
            }
        }
        else {
            if (selectedView) viewsAuthChange[mapType[viewType]].push(selectedView)
        }
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/user`, method:'put',setWaiting:setWaitingSend,auth:auth, requestForm:{...viewsAuthChange, shortcuts:auth.authData.shortcuts, users:auth.authData.users, conversation_themes:auth.authData.conversation_themes},toastMessages:{'works':t('CorrectView'), 'failed':t('FailedView')}})
        if (response?.status === 200) {
            auth.setAuthData({views:viewsAuthChange})   
            navigate('/settings/workflows/edit-views')
        }
    }
   
    //CHANGE DOCUMENT TITLE
    useEffect (() => {document.title = `${t('Settings')} - ${t('Views')} - ${selectedView?.name} - ${auth.authData.organizationName} - Matil`}, [])

    //FRONT
    return(
        <Flex height={'100%'} minH={'90vh'} width={'100%'} flexDir={'column'}> 
         {selectedView && <>
            <Box flex='1' overflow={'scroll'} py='2px'> 
                <Flex gap='20px' alignItems={'center'}> 
                    <Tooltip label={'Atrás'}  placement='bottom' hasArrow bg='black'  color='white'  borderRadius='.4rem' fontSize='.75em' p='4px'> 
                        <IconButton aria-label='go-back' size='sm' bg='transparent' border='none' onClick={() => navigate('/settings/workflows/edit-views')} icon={<IoIosArrowBack size='20px'/>}/>
                    </Tooltip>
                    <Box maxW='1000px'> 
                        <EditText nameInput fontSize={'1.5em'} size='md'  value={selectedView?.name || ''} setValue={(value:string) => setSelectedView(prev => ({...prev as View, name:value}))}/>
                    </Box>
                </Flex>
            
                <Text mt='3vh' fontWeight={'medium'} fontSize={'1.1em'}>{t('ViewType')}</Text>
                <Flex mb='3vh' gap='20px' mt='1vh'>
                    <Button leftIcon={<FaLock/>} size='sm' fontWeight={'medium'} variant={viewType === 'private'?'main':'common'}  onClick={() => setViewType('private')}>{t('Private')}</Button>
                    <Button  leftIcon={<FaUnlock/>}  fontWeight={'medium'} isDisabled={!isAdmin} size='sm'variant={viewType === 'shared'?'main':'common'} onClick={() => setViewType('shared')}>{t('Shared')}</Button>
                </Flex>
                <EditViewComponent scrollRef={scrollRef}  viewData={selectedView as View} editViewData={setSelectedView}/>
            </Box>

            <Box width={'100%'} mt='2vh' mb='2vh' height={'1px'} bg='gray.300'/>
            <Flex flexDir = 'row-reverse'>
                <Button variant={'common'} onClick={sendEditView} isDisabled={selectedView?.name === '' || ((view !== null && JSON.stringify(selectedView) === JSON.stringify(currentViewsRef.current) && viewType === view.type) )}>{waitingSend?<LoadingIconButton/>:t('SaveChanges')}</Button>
            </Flex>
            </>}
     </Flex> 
    )
}

export default EditView


 