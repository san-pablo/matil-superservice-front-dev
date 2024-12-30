//REACT
import { useState, useEffect, RefObject, useRef } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, Button, Icon } from "@chakra-ui/react"
//COMPONENTS
import SaveChanges from '../../../Components/Reusable/SaveChanges'
import EditViewComponent from './EditViewsComponent'
import EditText from '../../../Components/Reusable/EditText'
import LoadingIconButton from '../../../Components/Reusable/LoadingIconButton'
//ICONS
import { FaUnlock, FaLock, FaPlus } from 'react-icons/fa6'
import { IoIosArrowForward } from 'react-icons/io'

//TYPING
import { View, Views } from '../../../Constants/typing'
import { useAuth0 } from '@auth0/auth0-react'
    
//MAIN FUNCTION
function EditView ({scrollRef}:{scrollRef:RefObject<HTMLDivElement>}) {

    //CONSTANTS
    const auth = useAuth()
    const {  getAccessTokenSilently } =  useAuth0()
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
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/user`, method:'put',setWaiting:setWaitingSend,auth,  getAccessTokenSilently, requestForm:{...viewsAuthChange, shortcuts:auth.authData.shortcuts, users:auth.authData.users, conversation_themes:auth.authData.conversation_themes},toastMessages:{'works':t('CorrectView'), 'failed':t('FailedView')}})
        if (response?.status === 200) {
            auth.setAuthData({views:viewsAuthChange})   
            navigate('/settings/workflows/edit-views')
        }
    }

    //CHANGE DOCUMENT TITLE
    useEffect (() => {document.title = `${t('Settings')} - ${t('Views')} - ${selectedView?.name} - ${auth.authData.organizationName} - Matil`}, [])

    //FRONT
    return(<> 
        <SaveChanges data={selectedView} disabled={!(view && lastLocationString !== 'copy')} setData={setSelectedView}  dataRef={currentViewsRef} onSaveFunc={sendEditView}/>


        <Flex alignItems={'end'} justifyContent={'space-between'}>
            <Flex fontWeight={'medium'} fontSize={'1.4em'} gap='10px' alignItems={'center'}> 
                <Text onClick={() => navigate('/settings/workflows/edit-views')}  color='brand.text_blue' cursor={'pointer'}>{t('Views')}</Text>
                <Icon as={IoIosArrowForward}/>
                <Text>{selectedView?.name}</Text>
            </Flex>
            {!(view && lastLocationString !== 'copy') && <Button variant={'main'} onClick={sendEditView} size={'sm'} leftIcon={<FaPlus/>}>{waitingSend ? <LoadingIconButton/>: t('Create')}</Button>}

        </Flex>
        <Box width='100%' bg='gray.300' height='1px' mt='2vh'/>
        
        <Flex flex='1' overflow={'scroll'} width={'100%'} pt='3vh' flexDir={'column'}> 
            {selectedView && <>
                <Text fontWeight={'medium'} fontSize={'1.1em'}>{t('Name')}</Text>
                <Box maxW='350px' mt='.5vh'> 
                    <EditText hideInput={false}  value={selectedView?.name || ''} setValue={(value:string) => setSelectedView(prev => ({...prev as View, name:value}))}/>
                </Box>

                <Text mt='3vh' fontWeight={'medium'} fontSize={'1.1em'}>{t('ViewType')}</Text>
                <Flex mb='3vh' gap='20px' mt='1vh'>
                    <Button leftIcon={<FaLock/>} size='sm' fontWeight={'medium'} variant={viewType === 'private'?'main':'common'}  onClick={() => setViewType('private')}>{t('Private')}</Button>
                    <Button  leftIcon={<FaUnlock/>}  fontWeight={'medium'} isDisabled={!isAdmin} size='sm'variant={viewType === 'shared'?'main':'common'} onClick={() => setViewType('shared')}>{t('Shared')}</Button>
                </Flex>
                <EditViewComponent scrollRef={scrollRef}  viewData={selectedView as View} editViewData={setSelectedView}/>
            </>}
     </Flex> 
     </>)
}

export default EditView


 