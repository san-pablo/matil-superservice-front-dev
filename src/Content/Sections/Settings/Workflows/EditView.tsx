//REACT
import  { useState, useEffect, RefObject } from 'react'
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
//ICONS
import {  FaUnlock, FaLock  } from 'react-icons/fa6'
import { IoIosArrowBack} from 'react-icons/io'
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

    //DETERMINE THE EDIT VIEW TYPE
    const viewsAuth = auth.authData.views as Views
    const viewLocation = view ? view.type === 'private' ? 'private_views':'shared_views':'private_views'
    const [viewType, setViewType] = useState<'private' | 'shared'>(view ?view.type:'private')
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

      //SELECTED VIEW
    const [selectedView, setSelectedView] = useState<View>(selectedViewSelection)  

    //SEND ALL THE CHANGES 
    const sendEditView = async() => {

        const viewsAuthChange = {...auth.authData.views as Views}
        const mapType: { [key in 'shared' | 'private']: 'shared_views' | 'private_views' } = {
            'shared': 'shared_views',
            'private': 'private_views'
        }

        if (view && lastLocationString !== 'copy') {
            if (view.type === viewType){
                if (viewsAuthChange[mapType[viewType]] && viewsAuthChange[mapType[viewType]][view.index]) viewsAuthChange[mapType[viewType]][view.index] = selectedView
            }
            else {
                console.log(viewsAuthChange[mapType[view.type]])
                console.log(viewsAuthChange[mapType[view.type]].splice(view.index, 1))
                if (viewsAuthChange[mapType[viewType]] && viewsAuthChange[mapType[viewType]][view.index]) viewsAuthChange[mapType[view.type]].splice(view.index, 1)
                if (viewsAuthChange[mapType[viewType]]) viewsAuthChange[mapType[viewType]].push(selectedView)
            }
        }
        else {
            viewsAuthChange[mapType[viewType]].push(selectedView)
        }
        const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/user`, method:'put',setWaiting:setWaitingSend,auth:auth, requestForm:{...viewsAuthChange, shortcuts:auth.authData.shortcuts, users:auth.authData.users, tickets_subjects:auth.authData.ticket_subjects},toastMessages:{'works':t('CorrectView'), 'failed':t('FailedView')}})
        if (response?.status === 200) {
            auth.setAuthData({views:viewsAuthChange})   
            navigate('/settings/user/edit-views')
        }
    }
   
    //CHANGE DOCUMENT TITLE
    useEffect (() => {document.title = `${t('Settings')} - ${t('Views')} - ${selectedView.name} - ${auth.authData.organizationName} - Matil`}, [])
          
    return(
    <Flex height={'100%'} minH={'90vh'} width={'100%'} flexDir={'column'}> 
        <Box flex='1' overflow={'scroll'} py='2px'> 
            <Flex gap='20px' alignItems={'center'}> 
                <Tooltip label={'Atrás'}  placement='bottom' hasArrow bg='black'  color='white'  borderRadius='.4rem' fontSize='.75em' p='4px'> 
                    <IconButton aria-label='go-back' size='sm' bg='transparent' border='none' onClick={() => navigate('/settings/user/edit-views')} icon={<IoIosArrowBack size='20px'/>}/>
                </Tooltip>
                <Input maxW='700px' maxLength={100}  borderColor={'transparent'} _hover={{ border:'1px solid #CBD5E0'}} px='13px' _focus={{ px:'12px', borderColor: "rgb(77, 144, 254)", borderWidth: "2px" }} fontSize={'1.4em'} fontWeight={'medium'}  borderRadius='.5rem' value={selectedView.name} onChange={(e) => {setSelectedView({...selectedView,name:DOMPurify.sanitize(e.target.value)})}}/>
            </Flex>
        
            <Text mt='3vh' fontWeight={'medium'} fontSize={'1.1em'}>{t('ViewType')}</Text>
            <Flex mb='3vh' gap='20px' mt='1vh'>
                <Button leftIcon={<FaLock/>} size='sm' bg={viewType === 'private'?'brand.black_button':'none'} color={viewType === 'private'?'white':'black'} _hover={{bg:viewType === 'private'?'brand.black_button_hover':'brand.gray_1'}}  onClick={() => setViewType('private')}>{t('Private')}</Button>
                <Button  leftIcon={<FaUnlock/>} isDisabled={!isAdmin} size='sm' bg={viewType !== 'private'?'brand.black_button':'none'} color={viewType !== 'private'?'white':'black'} _hover={{bg:viewType !== 'private'?'brand.black_button_hover':'brand.gray_1'}}  onClick={() => setViewType('shared')}>{t('Shared')}</Button>
            </Flex>
            <EditViewComponent scrollRef={scrollRef}  viewData={selectedView} editViewData={setSelectedView}/>
        </Box>

        <Box width={'100%'} mt='2vh' mb='2vh' height={'1px'} bg='gray.300'/>
        <Flex flexDir = 'row-reverse'>
            <Button variant={'common'} onClick={sendEditView} isDisabled={selectedView.name === '' || ((view !== null && JSON.stringify(selectedView) === JSON.stringify(viewsAuth[viewLocation][view.index]) && viewType === view.type) )}>{waitingSend?<LoadingIconButton/>:t('SaveChanges')}</Button>
        </Flex>
    
    </Flex> 
    )
}

export default EditView


 