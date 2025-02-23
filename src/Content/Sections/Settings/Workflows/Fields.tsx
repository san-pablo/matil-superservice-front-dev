//REACT
import { useEffect, useState, useMemo, ReactElement } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
import { useAuth0 } from "@auth0/auth0-react"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Flex, Button, Image, Avatar, Icon, Skeleton, Tooltip } from "@chakra-ui/react"
//COMPONENTS
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
import EditText from "../../../Components/Reusable/EditText"
import ConfirmBox from "../../../Components/Reusable/ConfirmBox"
import CustomSelect from "../../../Components/Reusable/CustomSelect"
import Table from "../../../Components/Reusable/Table"
import SectionSelector from "../../../Components/Reusable/SectionSelector"
import VariableTypeChanger from "../../../Components/Reusable/VariableTypeChanger"
import RenderIcon from "../../../Components/Reusable/RenderIcon"
//FUNCTIONS
import parseMessageToBold from "../../../Functions/parseToBold"
import timeStampToDate from "../../../Functions/timeStampToString"
import timeAgo from "../../../Functions/timeAgo"
//ICONS
import { IconType } from "react-icons"
import { FaPlus, FaTicket, FaBuilding, FaHashtag, FaListUl, FaBolt, FaRegSquareCheck } from "react-icons/fa6"
import { IoPeopleSharp } from "react-icons/io5"
 import { IoMdArchive } from "react-icons/io"
 import { PiNumberCircleFiveFill  } from "react-icons/pi"

import { RxCross2 } from "react-icons/rx"
import { RxTextAlignLeft } from "react-icons/rx"
import { FaRegArrowAltCircleDown } from "react-icons/fa" 

//TYPING
import { CDAsType } from "../../../Constants/typing"

//CELL STYLES
const CellStyle = ({column, element, row}:{column:string, element:any, row?:any}) => {

    const auth = useAuth()
    const  { t } = useTranslation('settings')
    const t_formats = useTranslation('formats').t
    
    const fieldsTypesFrontMap:{[key in 'text' | 'boolean' | 'integer' | 'number' | 'select' | 'array']:[string, ReactElement]} = {text:[t('Text'), <RxTextAlignLeft/>] ,number:[t('float'), <FaHashtag/>] ,integer:[t('int'),<PiNumberCircleFiveFill/>] , select:[t('Select'), <FaRegArrowAltCircleDown/>] , array:[t('MultiSelect'), <FaListUl/>] ,boolean:[t('Bool'),<FaRegSquareCheck/>]}
    const structuresMap:{[key:string]:[string, IconType]} = {'conversations':[t('Conversations'), FaTicket], 'contacts':[t('Client'), IoPeopleSharp], 'contact_businesses':[t('Business'), FaBuilding],  }

    if (column === 'structure') {
        return (
        <Flex gap='10px' alignItems={'center'}>
            <Icon  fontSize={'.9em'} color='text_gray' as={structuresMap[element][1]}/>
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{structuresMap[element][0]}</Text>
         </Flex>)
    }
    else if (column === 'type') return (
        <Flex gap='10px' alignItems={'center'}>
            {fieldsTypesFrontMap[getFrontType(element, row.allowed_values)][1]}

            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{fieldsTypesFrontMap[getFrontType(element, row.allowed_values)][0]}</Text>
         </Flex> 
    )
    else if (column === 'created_by') {
        const selectedUser = useMemo(() => auth?.authData?.users?.find(user => user.id === element), [element, auth])

        return (
            <Flex fontSize={'.9em'} alignItems={'center'} gap='5px'> 
                {selectedUser?.icon?.data ? <RenderIcon icon={selectedUser.icon} size={14}/> :<Avatar h='16px' w='16px' size={'xs'} name={selectedUser?.name || ''}/> }

                <Text fontSize={'.9em'} fontWeight={'medium'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} >{element === 'matilda' ?'Matilda':element === 'no_user' ? t('NoAgent'):selectedUser?.name}</Text>
            </Flex>
        )
    }
    else if (column === 'created_at' || column === 'archived_at') {
        return(
        <Tooltip  label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.5rem' fontSize='.8em' p='6px'> 
            <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>)
    }

    else return ( <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>)
}

const getFrontType = (backType:'boolean' | 'integer' | 'number' | 'string' | 'array', alloweValues:string[]) => {
    if (backType === 'string')
    {
        if (alloweValues.length === 0) return 'text'
        else if (alloweValues.length > 0) return 'select'
    } 
    else return backType
}

//MAN FUNCTION
const Fields = () => {

    //CONSTANTS
    const { t } = useTranslation('settings')
    const { getAccessTokenSilently } = useAuth0()
    const auth = useAuth()
    const columnsFieldsMap:{[key:string]:[string, number]} = {'name':[t('Name'), 200],  'structure':[t('Structure'), 150], 'type':[t('Format'), 100], 'created_at':[t('created_at'), 150], 'archived_at':[t('archived_at'), 150], 'created_by':[t('created_by'), 150], 'allowed_values':[t('AllowedValues'), 350], 'description':[t('description'), 350]  }

    //SECTION TO SEEE BETWEEN ACTIVE AND ARCHIVED FIELDS
    const [currentSection, setCurrentSection] = useState<'active' | 'archived'>('active')

    //CREATE NEW FIELD OR EDITING ONE
    const [editField, setEditField] = useState<CDAsType | null>(null)
 
    //ARCHIVE FIELD INDEX
    const [fieldToArchive, setFieldToArchive] = useState<CDAsType | null>(null)

    //FIELDS DATA
    const [fieldsData, setFieldsData] = useState<CDAsType[] | null>(null)

    //FETCH FIELDS
    useEffect(() => {        
        document.title = `${t('Settings')} - ${t('Fields')} - ${auth.authData.organizationId} - Matil`
        const fetchInitialData = async() => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/settings/cdas`, setValue:setFieldsData, getAccessTokenSilently, auth})
         }
        fetchInitialData()
    }, [])
   

    //CREATE AND EDIT FIELDS COMPONENT
    const EditFieldBox = () => {


        //MAP FIELDS TYPE LOGIC
        const fieldsTypesFrontMap:{[key in 'text' | 'boolean' | 'integer' | 'number' | 'select' | 'array']:[string, ReactElement]} = {text:[t('Text'), <RxTextAlignLeft/>] ,number:[t('float'), <FaHashtag/>] ,integer:[t('int'),<PiNumberCircleFiveFill/>] , select:[t('Select'), <FaRegArrowAltCircleDown/>] , array:[t('MultiSelect'), <FaListUl/>] ,boolean:[t('Bool'),<FaRegSquareCheck/>]}
        const filedsBackMap = {'text':'string', 'boolean':'boolean', 'integer':'integer', 'number':'number', 'select':'string', 'array':'array'}
        const [frontType, setFronType] = useState<'text' | 'number' | 'integer' | 'select' | 'array' | 'boolean'>(getFrontType(editField.type, editField.allowed_values))
       
        //FIND THE FIELD TO EDIT
        const foundFieldIndex = fieldsData?.findIndex(item => item.id === editField?.id)

        //NEW FIELD DATA
        const [newFieldData, setNewFieldData] = useState<CDAsType>(editField as CDAsType)
    
        //BOOLEAN FOR WAITING THE EDIT
        const [waitingEdit, setWaitingEdit] = useState<boolean>(false)

        //ALLOWED VALUE
        const [allowedValue, setAllowedValue] = useState<any>('')

        //EDIT FIELDS
        const handleEditFields = async() => {
            const newField:CDAsType = {...newFieldData, type:filedsBackMap[frontType] as any}
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/settings/cdas${foundFieldIndex === -1 ?'':`/${editField?.id}`}`, method:foundFieldIndex === -1 ? 'post':'put', getAccessTokenSilently, setWaiting:setWaitingEdit, requestForm:newField, auth, toastMessages:{'works':foundFieldIndex === -1 ?t('CorrectCreatedFields'):t('CorrectUpdatedFields'), 'failed':foundFieldIndex === -1 ?t('FailedCreatedFields'):t('FailedUpdatedFields')}})
            if (response?.status === 200) {
                let newFields:CDAsType[] = []
                if (foundFieldIndex === -1 ) newFields = [...fieldsData as CDAsType[], {...newField, id:response.data.id}]
                else { newFields = (fieldsData as CDAsType[]).map((item, index) => index === foundFieldIndex? newField : item)}
                setFieldsData(newFields)
            }
            setEditField(null)
        }

        const handleRemoveValue = (index:number) => {
            setNewFieldData((prev) => {
              const updatedValues = prev.allowed_values.filter((_, i) => i !== index);
              return { ...prev, allowed_values: updatedValues };
            })
        }
          

        //FRONT
        return(<> 
            <Box p='15px'> 
                <Text fontSize={'1.2em'} fontWeight={'medium'}>{foundFieldIndex === -1?t('CreateField'):t('EditField')}</Text>

                <Text mt='2vh' mb='.5vh' fontSize={'.8em'} fontWeight={'medium'}>{t('Name')}</Text>
                <Box maxW='300px'> 
                    <EditText  maxLength={100} placeholder={`${t('Name')}...`} hideInput={false} value={newFieldData.name} setValue={(value) => setNewFieldData((prev) => ({...prev, name:value}))}/>
                </Box>
                
                <Text  mb='.5vh'  mt='2vh' fontSize={'.8em'}  fontWeight={'medium'}>{t('Description')}</Text>
                <EditText  isTextArea maxLength={500} placeholder={`${t('Description')}...`} hideInput={false} value={newFieldData.description} setValue={(value) => setNewFieldData((prev) => ({...prev, description:value}))}/>
               

                <Text mt='2vh' fontSize={'.8em'} mb='.5vh'  fontWeight={'medium'}>{t('Structure')}</Text>
                <SectionSelector selectedSection={newFieldData.structure} size="xs" sections={['conversations', 'persons', 'businesses']} onChange={(section) => setNewFieldData((prev) => ({...prev, structure:section}))} sectionsMap={{'conversations':[t('Conversations'), <FaTicket/>], 'persons':[t('Contacts'), <IoPeopleSharp/>], 'businesses':[t('Businesses'), <FaBuilding/>]}}/>

                <Text mt='2vh' fontSize={'.8em'} mb='.5vh' fontWeight={'medium'}>{t('Type')}</Text>
                <Box maxW='300px'> 
                    <CustomSelect hide={false} selectedItem={frontType} setSelectedItem={(value) => {setAllowedValue('');setNewFieldData((prev) => ({...prev, allowed_values:[]}));setFronType(value as any)}} options={Object.keys(fieldsTypesFrontMap)} iconsMap={fieldsTypesFrontMap}/>
                </Box>

                {(frontType === 'select'  || frontType === 'array') &&  <>
                    <Text mt='2vh' fontSize={'.8em'} mb='.5vh' fontWeight={'medium'}>{t('AllowedValues')}</Text>
                    <Flex alignItems={'center'} gap='15px'> 
                        <Box w='300px'> 
                            <VariableTypeChanger inputType={'string'} customType value={allowedValue} setValue={(value) => setAllowedValue(value)}   />
                        </Box>
                        <Button isDisabled={allowedValue === ''} variant={'common'} leftIcon={<FaPlus/>} size='xs' onClick={() => {setNewFieldData((prev) => ({...prev, allowed_values:[...prev.allowed_values, allowedValue]}));setAllowedValue('') } }>{t('Add')}</Button>
                    </Flex>
                    <Flex flexWrap={'wrap'} gap='10px' mt='1vh'> 
                        {!newFieldData.allowed_values || newFieldData.allowed_values?.length === 0 ? <Text fontSize={'.8em'} color='text_gray'>{t('Any')}</Text>
                        :<> 
                        {(newFieldData?.allowed_values || []).map((value, index) => (
                            <AlowedValueComponent  key={`value-${index}`} value={value} deleteValue={() => handleRemoveValue(index)}/>
                        ))}
                        </>}
                    </Flex>
                </>
                }

             
                <Flex  mt='3vh' gap='15px' flexDir={'row-reverse'} >
                    <Button isDisabled={newFieldData.name === '' || (frontType === 'select' && newFieldData.allowed_values.length === 0) || (frontType === 'array' && newFieldData.allowed_values.length === 0) ||  (foundFieldIndex !== -1 && (JSON.stringify(editField) === JSON.stringify(newFieldData)) )} size='sm' variant={'main'} onClick={handleEditFields}>{waitingEdit?<LoadingIconButton/>:foundFieldIndex === -1 ?t('CreateField'):t('SaveChanges')}</Button>
                    <Button  size='sm'variant={'common'} onClick={() => setEditField(null)}>{t('Cancel')}</Button>
                </Flex>
            </Box>
      </>)
    }   

    //ARCHIVE A FIELD BOX
    const ArchiveFiledBox = () => {

        //NEW ARCHIVED INDEX
        const foundFieldIndex = fieldsData?.findIndex(item => item.id === fieldToArchive?.id) 

        //BOOLEAN FOR WAITIGN THE ARCHIVE
        const [waitingArchive, setWaitingArchive] = useState<boolean>(false)

        //ARCHIVE FIELD
        const handleDeleteFields= async() => {
             const response = await fetchData({endpoint:`${auth.authData.organizationId}/settings/cdas/${fieldToArchive?.id}`, method:'delete', setWaiting:setWaitingArchive, getAccessTokenSilently,auth, toastMessages:{'works':t('CorrectDeletedFields'), 'failed':t('FailedDeletedFields')}})
            if (response?.status === 200) {
                const newFields = (fieldsData as CDAsType[]).map((item, index) => index === foundFieldIndex? {...fieldToArchive as CDAsType, is_archived:true, archived_at:String(new Date())} : item)
                setFieldsData(newFields)
                setFieldToArchive(null)
            }
        }

        //FRONT
        return (
            <Box p='15px'> 
                <Text width={'400px'} fontWeight={'medium'} fontSize={'1.2em'}>{parseMessageToBold(t('DeleteAllFields', {name:fieldToArchive?.name }))}</Text>
                <Text mt='2vh' color={'text_gray'} fontSize={'.8em'}>{t('ArchiveFieldWarning')}</Text>

        
                <Flex mt='3vh' gap='15px' flexDir={'row-reverse'} >
                    <Button size='sm' variant={'delete'} onClick={handleDeleteFields}>{waitingArchive?<LoadingIconButton/>:t('Archive')}</Button>
                    <Button size='sm' variant={'common'} onClick={()=> setFieldToArchive(null)}>{t('Cancel')}</Button>
                </Flex>
            </Box>
        )
    }

    //RECOVER AN ARCHIVED FIELD
    const recoverField = async (row:CDAsType) => {

        //NEW ACTIVE FIELD INDEX
        const foundFieldIndex = fieldsData?.findIndex(item => item.id === row.id) || 0
        
        //ACTIVE FIELD
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/settings/cdas/${fieldsData?.[foundFieldIndex].id}/restore`,method:'post', getAccessTokenSilently, auth})
        if (response?.status === 200) {
            const newFields = (fieldsData as CDAsType[]).map((item, index) => index === foundFieldIndex? {...fieldsData?.[foundFieldIndex as number] as CDAsType, is_archived:false} : item)
            setFieldsData(newFields)
            setCurrentSection('active')
        }
    } 

    //MEMOIZED CREATE AND EDIT FIELDS COMPONENT
    const memoizedEditFieldBox = useMemo(() => (
        <ConfirmBox setShowBox={() => setEditField(null)}> 
            <EditFieldBox  />
        </ConfirmBox>
    ), [editField])

    //MEMOIZED ARCHIVE A FIELD BOX
    const memoizedArchiveBox = useMemo(() => (
        <ConfirmBox setShowBox={(b:boolean) => setFieldToArchive(null)}> 
             <ArchiveFiledBox/>
        </ConfirmBox>
    ), [fieldToArchive])

    //SHOW ARCHIVED OR ACTIVE FIELDS
    const dataToWork = fieldsData?.filter(item => currentSection === 'archived' ? item.is_archived === true: item.is_archived === false) || []
    
    return(<>
        {fieldToArchive && memoizedArchiveBox}
        {editField && memoizedEditFieldBox}
    
        <Box height={'100%'} width={'100%'} p='2vw' > 
    
            <Box w='100%'> 
                <Flex justifyContent={'space-between'} alignItems={'start'}> 
                    <Box> 
                        <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('Fields')}</Text>
                        <Text color='text_gray' fontSize={'.8em'}>{t('FieldsDes')}</Text>
                    </Box>
                    <Button size='sm' variant={'main'} leftIcon={<FaPlus/>} onClick={() => setEditField({id:'-1', name:'', description:'', type:'boolean', structure:'conversations', created_by:auth.authData.userId as string, allowed_values:[], created_at:String(new Date()), archived_at:String(new Date()), is_archived:false})}>{t('CreateField')}</Button>
                </Flex>
                    <Box h='40px' w='100%' > 
                <SectionSelector notSection selectedSection={currentSection} sections={['active', 'archived']} sectionsMap={{'active':[t('activefields'), <FaBolt/>], 'archived':[t('archivedfields'), <IoMdArchive/>]}}  onChange={(section) => setCurrentSection(section)}/>
                    <Box bg='border_color' h='1px' w='100%'/>
                </Box>
            </Box>
 
        
            <Flex  mt='2vh'justifyContent={'space-between'} alignItems={'end'}>
                <Skeleton isLoaded={fieldsData !== null}> 
                    <Text fontWeight={'medium'} color='text_gray'>{t('FieldsCount', {count:dataToWork?.length})}</Text>
                </Skeleton>
            </Flex>

            <Skeleton isLoaded={fieldsData !== null}> 
                <Table data={dataToWork} CellStyle={CellStyle} noDataMessage={currentSection === 'active'?t('NoFields'):t('NoArchivedFields')} excludedKeys={['id', 'is_archived', 'allowed_values', currentSection === 'active' ? 'archived_at':'created_at']}  columnsMap={columnsFieldsMap} onClickRow={(row:any, index:number) => {if (currentSection === 'active') setEditField(row)}} />
            </Skeleton>
        </Box>
    </>)
}

export default Fields

const AlowedValueComponent = ({value, deleteValue}:{value:any,  deleteValue:() => void}) => {

    const [isHovering, setIsHovering] = useState<boolean>(false)

    return (<>  
        <Flex position={'relative'} alignItems={'center'} justifyContent={'center'} bg='gray_2' py='5px' px='12px' borderRadius={'.3rem'} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <Text fontSize={'.7em'}>{value}</Text>
            {isHovering && 
                <Flex alignItems={'center'} cursor={'pointer'} justifyContent={'center'} bg={'gray_2'} backdropFilter="blur(1px)"  px='3px' position={'absolute'} right={'4px'} > 
                    <Icon color='red' boxSize={'12px'} as={RxCross2} onClick={(e) => {deleteValue()}}/>
                </Flex>}
        </Flex>
        </>)
}
