import { useState, useRef, useMemo,  Dispatch, SetStateAction, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { useAuth } from "../../../AuthContext"
import { useTranslation } from "react-i18next"
//FETCH DATA
import fetchData from "../../API/fetchData"
//FRONT
import { Flex, Box, IconButton, Text, Icon, Button, Skeleton } from "@chakra-ui/react"
//COMPONENTS
import ConfirmBox from "./ConfirmBox"
import LoadingIconButton from "./LoadingIconButton"
import EditText from "./EditText"
import IconsPicker from "./IconsPicker"
import FilterManager from "./ManageFilters"
import CustomSelect from "./CustomSelect"
import SectionPathRender from "./SectionPath"
import RenderIcon from "./RenderIcon"
//FUNCTIONS
import useEnterListener from "../../Functions/clickEnter"
import parseMessageToBold from "../../Functions/parseToBold"
//ICONS
import { FaPlus, FaArrowUp } from "react-icons/fa6"
import { RxCross2 } from "react-icons/rx"
//TYPE
import { sectionsType , ViewDefinitionType, sectionPathType} from "../../Constants/typing"

function countConditions(view: ViewDefinitionType): number {
    let count = 0
    for (const group of view.filters.groups) count += group.conditions.length
    return count
}

const AddView = ({showBox, setShowBox, sectionPath , onSelectAction}:{ showBox:boolean, setShowBox:Dispatch<SetStateAction<boolean>>, sectionPath:sectionPathType, onSelectAction:any}) => {

    //CONSTANTS
    const { t } = useTranslation('main')
    const viewType = sectionPath[0].id
    const auth = useAuth()
    const { getAccessTokenSilently } = useAuth0()

    //CREATE A NEW VIEW
    const [createNew, setCreateNew] = useState<boolean>(false)


  
    const AddViewBox = () => {

     
        //FECTHED VIEWS
        const [fetchedViews, setFetchedViews] = useState<ViewDefinitionType[] | null>(null)

        //FILTER VIEWS DATA
        const [text, setText] = useState<string>('')

        useEffect(() => {
            const fetchViewsData = async() => {
               const response = await fetchData({endpoint:`${auth.authData.organizationId}/views`, auth, setValue:setFetchedViews, getAccessTokenSilently, params:{type:viewType}})

               if (response?.status !== 200) setFetchedViews(auth.authData.views)
           }    
           fetchViewsData()
       }, [text])

      

        return (
            <> 
            {createNew &&memoizedCreateBox }
            <Flex  flexDir={'column'}   > 
                <Box pt='20px' px='20px'> 
                <Flex mb='1vh' justifyContent={'space-between'}> 
                    <SectionPathRender pathList={sectionPath} type='view'/>
                    <Button size={'xs'} variant={'main'} onClick={() => setCreateNew(true)} leftIcon={<FaPlus/>}>{t('CreateNewView')}</Button>
                </Flex>
                <Text mt='1vh' fontWeight={'medium'} color='text_gray' fontSize={'.9em'}>{t('ViewsCount', {count:fetchedViews?.length || 0})}</Text>
                </Box>
                <Flex px='20px' pb='20px' flex='1' mt='2vh' overflow={'scroll'} flexWrap={'wrap'} gap='10px'>

                    {fetchedViews ? <> 
                        {fetchedViews.map((view, index) => (
                            <Box onClick={() => onSelectAction({type:'view', view_id:view.id})} w='200px'borderWidth={'1px'} borderColor={'gray_1'}  transition={'box-shadow 0.3s ease-in-out'} key={`select-content-${index}`} _hover={{shadow:'lg'}} cursor={'pointer'} bg='white' p='10px' borderRadius={'.7rem'}>
                                <Flex fontSize={'.9em'}  alignItems={'center'} gap='5px'>
                                    <RenderIcon size={16} icon={view.icon}/>
                                    <Text  fontWeight={'medium'}>{view.name}</Text>
                                </Flex>
                                <Text mt='1vh' color='text_gray' fontSize={'.9em'}>{t('ViewsRules', {count: countConditions(view)})}</Text>

                            </Box>
                        ))}
                        </>
                    :
                        [1,2,3].map((num) => (
                        <Skeleton style={{borderRadius:'.5rem', width:'200px', height:'60px'}}>
                               <Flex fontSize={'.9em'}  alignItems={'center'} gap='5px'>
                                    <RenderIcon size={16} icon={{type:'emoji', data:'😅'}}/>
                                    <Text  fontWeight={'medium'}>{'wd'}</Text>
                                </Flex>
                                <Text mt='1vh' color='text_gray'  fontSize={'.9em'}>{'owdiue'}</Text>
                        </Skeleton>))
                    }
                </Flex>
            </Flex>
            </>
        )
    }

    //MEMOIZED BOX
    const memoizedBox = useMemo(() => (
        <ConfirmBox maxW='662px' setShowBox={setShowBox}> 
            <AddViewBox/>
        </ConfirmBox>
    ), [showBox])

    const memoizedCreateBox = useMemo(() => (
        <ConfirmBox setShowBox={setCreateNew} upPosition isCustomPortal={false}> 
            <EditViewBox  section={viewType} setShowView={setCreateNew} viewId={'-1'} onEditView={(view:ViewDefinitionType) => onSelectAction({type:'view', view_id:view.id})}/>
        </ConfirmBox>
    ), [createNew])


    return (<>
    {showBox && memoizedBox}
    {createNew && memoizedCreateBox}
    </>)
}

export default AddView

//EDIT A VIEW OR ADDING A NEW ONE
export const EditViewBox = ({section,  viewId, setShowView, onEditView}:{section:string, viewId:string | null, setShowView:Dispatch<SetStateAction<boolean>>, onEditView?:(view:ViewDefinitionType) => void}) => {

    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('conversations')
    const {getAccessTokenSilently} = useAuth0()
    const scrollRef = useRef<HTMLDivElement>(null)

    const viewColumns:{[key:string]:string} = {local_id:t('local_id'),  user_id: t('user_id') , title: t('title'), theme_id:  t('theme'),  team_id:t('Team'), created_at: t('created_at'),updated_at: t('updated_at') , solved_at: t('solved_at'), channel_type: t('channel_type'), tags:t('tags'), closed_at: t('closed_at') ,unseen_changes: t('unseen_changes'), call_duration: t('call_duration'), created_by:t('created_by')}

    //CREATE VIEW 
    const [waitignCreate, setWaitingCreate] = useState<boolean>(false)

    //DELETE A VIEW
    const [showDeleteView, setShowDeleteView] = useState<boolean>(false)

    //SELECTED VIEW
    const selectedView = auth.authData.views?.find((view) => view.id === viewId) 
    const [viewToEdit, setViewToEdit] = useState<ViewDefinitionType>(viewId === '-1' ? {id:'', name:'', model:section as sectionsType, icon:{type:'emoji', data:'🚀'}, sort:[{column:'local_id', order:'desc'}], filters:{logic:'AND', groups:[]}} : selectedView as ViewDefinitionType)

    //CREATE OR EDIT A VIEW
    const createNewView = async () => {

        setWaitingCreate(true)
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/conversations/views${viewId === '-1' ? '':`/${viewToEdit.id}`}`,  method:viewId === '-1' ? 'post':'put', getAccessTokenSilently, requestForm:viewToEdit, auth})
        if (response?.status === 200) {
            const currentViews = auth.authData.views

            if (viewId === '-1') auth.setAuthData({views:[...currentViews, {...viewToEdit, id:response.data.id}]})
            else {
                const updatedViews = currentViews.map(view =>view.id === viewId ? viewToEdit : view)
                auth.setAuthData({ views: updatedViews })
            }
            onEditView(viewId === '-1' ? {...viewToEdit, id:response.data.id} :viewToEdit)
           
        }
        setWaitingCreate(false)
        setShowView(false)
    }
  
    //ACTION ON ENTER
    useEnterListener({onClickEnter:createNewView, actionDisabled:(viewId !== '-1'  && JSON.stringify(selectedView) === JSON.stringify(viewToEdit)) || viewToEdit.name === ''})

    //DELETE A VIEW
    const DeleteViewComponent = () => {
        const [waitingDelete, setWaitingDelete] = useState<boolean>(false)

        const deleteView= async() => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/conversations/views/${selectedView?.id}`, method:'delete', auth:auth, setWaiting:setWaitingDelete, getAccessTokenSilently,  toastMessages:{'works':t('CorrectDeletedView'), 'failed':t('FailedDeletedView')}})
            if (response?.status === 200) {
                 
            }
            setShowDeleteView(false)
        }
        return(<> 
            <Box p='15px'>
                <Text fontSize={'1.2em'}>{parseMessageToBold(t('DeleteViewQuestion', {name:selectedView?.name}))}</Text>
                <Text fontSize={'.8em'} mt='2vh' color='text_gray'>{t('DeleteViewWarning')}</Text>
     
                <Flex  mt='3vh' gap='15px' flexDir={'row-reverse'} >
                    <Button  size='sm' variant={'delete'} onClick={deleteView}>{waitingDelete?<LoadingIconButton/>:t('DeleteView')}</Button>
                    <Button  size='sm' variant={'common'} onClick={()=> setShowDeleteView(false)}>{t('Cancel')}</Button>
                </Flex> 
            </Box> 
            </>)
    }
    const memoizedAddThemeBox = useMemo(() => (
        <ConfirmBox setShowBox={() => setShowDeleteView(false)}> 
            <DeleteViewComponent/>
        </ConfirmBox>
    ), [showDeleteView])


    const addSort = () => {
        const remainingOptions = Object.keys(viewColumns).filter(col => !viewToEdit.sort.some(s => s.column === col));
        if (remainingOptions.length > 0) {
            setViewToEdit((prev) => ({...prev, sort: [...prev.sort, { column: remainingOptions[0], order: 'asc' }]  }))
        }
    }

     return (<> 

        {showDeleteView && memoizedAddThemeBox}

        <Flex flexDir={'column'} p='15px' ref={scrollRef} maxH={'80vh'}>  
            <Text fontWeight={'medium'} fontSize={'1.2em'}>{viewId === '-1' ?t('CreateView'):t('EditView')}</Text>
            <Text mt='1vh' mb='2vh' color='text_gray' fontSize={'.8em'}>{t('CreateViewWarning')}</Text>

            <Box flex='1' overflow={'scroll'}> 
                <Flex mt='1vh' alignItems={'center'} gap='10px'> 
                    <IconsPicker selectedEmoji={viewToEdit?.icon} excludedSections={['upload']} onSelectEmoji={(value) => setViewToEdit(prev => ({...prev, icon:value}))}/>
                    <Box maxW='350px' > 
                        <EditText focusOnOpen placeholder={t('Name')} hideInput={false} value={viewToEdit?.name} setValue={(value:string) => setViewToEdit(prev => ({...prev, name:value}))}/>
                    </Box>
                </Flex>

            
                <Text mt='3vh' fontSize={'.9em'} color='black' fontWeight={'medium'}>{t('Filters')}</Text>
                <Text  mb='1vh' color='text_gray' fontSize={'.8em'}>{t('FiltersDes')}</Text>
                <FilterManager excludedColumns={['local_id', 'contact_id']} filters={viewToEdit.filters} setFilters={(filters) => setViewToEdit(prev => ({...prev, filters}))} excludedFields={['contacts', 'contact_businesses']} scrollRef={scrollRef}/>
            

                <Text mt='3vh' fontSize={'.9em'} color='black' fontWeight={'medium'}>{t('OrderBy')}</Text>
                <Text  mb='1vh' color='text_gray' fontSize={'.8em'}>{t('SortDes')}</Text>

                {viewToEdit.sort.map((sort, index) => {
                    const selectedColumns = viewToEdit.sort.map((s) => s.column)
                    const availableOptions = Object.keys(viewColumns).filter((col) => !selectedColumns.includes(col) || col === sort.column);
                
                    return(
                    <Flex mt='.5vh' gap='10px' alignItems={'end'}> 
                        <Box w={'250px'}> 
                            <CustomSelect markSelect selectedItem={sort.column} onlyOneSelect  setSelectedItem={(value) => setViewToEdit((prev) => ({...prev,sort: prev.sort.map((s, i) =>i === index ? { ...s, column: value as string } : s)}))} options={availableOptions} labelsMap={viewColumns}/>
                        </Box>
                        <Button  fontSize={'.8em'} bg='hover_gray' size='sm' px='10px'  variant={'common'} onClick={() =>setViewToEdit((prev) => ({...prev, sort: prev.sort.map((s, i) =>i === index ? { ...s, order: s.order === "asc" ? "desc" : "asc" }: s)}))} rightIcon={<FaArrowUp size={'11px'} style={{transform: `rotate(${sort.order !== 'asc' ? '180deg' : '0deg'})`,transition: 'transform 0.3s ease'}} />}>{sort.order === 'asc'? t('Asc'):t('Desc')}</Button>
                        <IconButton onClick={() => setViewToEdit((prev) => ({...prev, sort: prev.sort.filter((_, i) => i !== index) }))}aria-label="delete-sort" bg='transparent' _hover={{bg:'transparent'}} variant={'delete'} size='sm' icon={<RxCross2 size='14px'/>}/>
                    </Flex>
                )})}
                <Flex mt='1vh' alignItems={'center'}  onClick={addSort} gap='5px'  cursor={'pointer'} color={'text_blue'} >
                    <Icon boxSize={'13px'} as={FaPlus}/>
                    <Text fontSize={'.8em'} fontWeight={'medium'}>{t('AddSort')}</Text>
                </Flex>

            </Box>
            
            <Flex mt='5vh' justifyContent={'space-between'} flexDir={viewId === '-1' ? 'row-reverse':'row'}> 
                {viewId !== '-1' && <Button  size='xs'variant={'delete'} onClick={() => setShowDeleteView(true)}>{t('DeleteView')}</Button>}
                <Flex   gap='15px' flexDir={'row-reverse'}>
                    <Button  size='xs'variant={'main'} disabled={(viewId !== '-1'  && JSON.stringify(selectedView) === JSON.stringify(viewToEdit)) || viewToEdit.name === ''} onClick={createNewView}>{waitignCreate? <LoadingIconButton/>:viewId === '-1' ?t('CreateView'):t('EditView')}</Button>
                    <Button  size='xs'variant={'common'} onClick={() => setShowView(false)}>{t('Cancel')}</Button>
                </Flex>
            </Flex>
        </Flex>  
 
    </>)
}
