//REACT
import { useEffect, useState, useMemo } from "react"
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
//FUNCTIONS
import parseMessageToBold from "../../../Functions/parseToBold"
import timeStampToDate from "../../../Functions/timeStampToString"
import timeAgo from "../../../Functions/timeAgo"
//ICONS
import { IconType } from "react-icons"
import { FaPlus, FaTicket, FaBuilding, FaListUl, FaBolt, FaArrowRotateRight } from "react-icons/fa6"
import { IoPeopleSharp, IoText } from "react-icons/io5"
import { TbNumber123, TbDecimal } from "react-icons/tb"
import { IoIosSwitch, IoMdArchive } from "react-icons/io"
import { RxCross2 } from "react-icons/rx"
import { TbArrowBigDownFilled } from "react-icons/tb";

//TYPING
import { CDAsType } from "../../../Constants/typing"

//CELL STYLES
const CellStyle = ({column, element}:{column:string, element:any}) => {

    const auth = useAuth()
    const  { t } = useTranslation('settings')
    const t_formats = useTranslation('formats').t

    const structuresMap:{[key:string]:[string, IconType]} = {'conversations':[t('Conversations'), FaTicket], 'contacts':[t('Client'), IoPeopleSharp], 'contact_businesses':[t('Business'), FaBuilding],  }
    const variablesMap:{[key:string]:[string, IconType]} = {'boolean':[t('bool'), IoIosSwitch], 'integer':[t('int'), TbNumber123], 'number':[t('float'), TbDecimal], 'string':[t('str'), IoText], 'array':[t('array'), FaListUl]}

    if (column === 'structure') {
        return (
        <Flex gap='10px' alignItems={'center'}>
             <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{structuresMap[element][0]}</Text>
             <Icon  fontSize={'.9em'} color='gray.600' as={structuresMap[element][1]}/>
        </Flex>)
    }
    else if (column === 'type') return (
        <Flex gap='10px' alignItems={'center'}>
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{variablesMap[element][0]}</Text>
            <Icon fontSize={'.9em'} color='gray.600' as={variablesMap[element][1]}/>
        </Flex> 
    )
    else if (column === 'created_by') {
        const selectedUser = auth?.authData?.users?.[element as string | number]

        return (
            <Flex fontSize={'.9em'} alignItems={'center'} gap='5px'> 
                {selectedUser?.profile_picture ? <Image src={selectedUser?.profile_picture } h='14px' w='14px' alt={selectedUser.name} /> :
                <Avatar h='16px' w='16px' size={'xs'} name={selectedUser?.name}/> }
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
    else if (column === 'allowed_values') {
         return (
            <Flex minH={'35px'} alignItems={'center'}> 
                {!element || element?.length === 0? <Text fontSize={'.9em'} >{t('Any')}</Text>:
                    <Flex gap='5px' flexWrap={'wrap'}>
                        {element.map((label:string, index:number) => (
                            <Flex  bg='brand.gray_2' borderColor={'gray.300'} borderWidth={'1px'} p='4px' borderRadius={'1rem'} fontSize={'.8em'} key={`client-label-${index}`}>
                                <Text>{label}</Text>
                            </Flex>
                        ))}
                    </Flex>
                }
            </Flex>
        )
    }


    else return ( <Text fontSize={'.9em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>)
}

//MAN FUNCTION
const Fields = () => {

    //CONSTANTS
    const { t } = useTranslation('settings')
    const { getAccessTokenSilently } = useAuth0()
    const auth = useAuth()
    const variablesMap:{[key:string]:[string, IconType]} = {'boolean':[t('bool'), IoIosSwitch], 'integer':[t('int'), TbNumber123], 'number':[t('float'), TbDecimal], 'string':[t('str'), IoText], 'array':[t('array'), FaListUl]}
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
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/cdas`, setValue:setFieldsData, getAccessTokenSilently, auth})
            if (response?.status === 200 ) auth.setAuthData({customAttributes:response.data})
        }
        fetchInitialData()
    }, [])
   

    //CREATE AND EDIT FIELDS COMPONENT
    const EditFieldBox = () => {

        //NEW FIELD INDEX
        console.log(editField)
        console.log(fieldsData)

        const foundFieldIndex = fieldsData?.findIndex(item => item.uuid === editField?.uuid)

        console.log(foundFieldIndex)
        //NEW FIELD DATA
        const [newFieldData, setNewFieldData] = useState<CDAsType>(editField as CDAsType)
    
        //BOOLEAN FOR WAITING THE EDIT
        const [waitingEdit, setWaitingEdit] = useState<boolean>(false)

        //ALLOWED VALUE
        const [allowedValue, setAllowedValue] = useState<any>('')

        //EDIT FIELDS
        const handleEditFields = async() => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/cdas${foundFieldIndex === -1 ?'':`/${editField?.uuid}`}`, method:foundFieldIndex === -1 ? 'post':'put', getAccessTokenSilently, setWaiting:setWaitingEdit, requestForm:newFieldData, auth, toastMessages:{'works':foundFieldIndex === -1 ?t('CorrectCreatedFields'):t('CorrectUpdatedFields'), 'failed':foundFieldIndex === -1 ?t('FailedCreatedFields'):t('FailedUpdatedFields')}})
            if (response?.status === 200) {
                let newFields:CDAsType[] = []
                if (foundFieldIndex === -1 ) newFields = [...fieldsData as CDAsType[], {...newFieldData, uuid:response.data.uuid}]
                else { newFields = (fieldsData as CDAsType[]).map((item, index) => index === foundFieldIndex? newFieldData : item)}
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
                <SectionSelector selectedSection={newFieldData.structure} size="xs" sections={['conversations', 'contacts', 'contact_businesses']} onChange={(section) => setNewFieldData((prev) => ({...prev, structure:section}))} sectionsMap={{'conversations':[t('Conversations'), <FaTicket/>], 'contacts':[t('Contacts'), <IoPeopleSharp/>], 'contact_businesses':[t('Businesses'), <FaBuilding/>]}}/>

                <Text mt='2vh' fontSize={'.8em'} mb='.5vh' fontWeight={'medium'}>{t('Type')}</Text>
                <Box maxW='300px'> 
                    <CustomSelect hide={false} selectedItem={newFieldData.type} setSelectedItem={(value) => {setAllowedValue('');setNewFieldData((prev) => ({...prev, type:value as any, allowed_values:[]}))}} options={Object.keys(variablesMap)} iconsMap={variablesMap}/>
                </Box>

                <Text mt='2vh' fontSize={'.8em'} mb='.5vh' fontWeight={'medium'}>{t('AllowedValues')}</Text>
                {newFieldData.type !== 'boolean' &&  <Flex alignItems={'center'} gap='15px'> 
                    <Box w='300px'> 
                        <VariableTypeChanger inputType={newFieldData.type} customType value={allowedValue} setValue={(value) => setAllowedValue(value)}   />
                    </Box>
                    <Button isDisabled={allowedValue === ''} variant={'common'} leftIcon={<FaPlus/>} size='xs' onClick={() => {setNewFieldData((prev) => ({...prev, allowed_values:[...prev.allowed_values, allowedValue]}));setAllowedValue('') } }>{t('Add')}</Button>
                </Flex>}

                <Flex flexWrap={'wrap'} gap='10px' mt='1vh'> 
                    {!newFieldData.allowed_values || newFieldData.allowed_values?.length === 0 ? <Text fontSize={'.8em'} color='gray.600'>{t('Any')}</Text>
                    :<> 
                    {(newFieldData?.allowed_values || []).map((value, index) => (
                        <AlowedValueComponent  key={`value-${index}`} value={value} deleteValue={() => handleRemoveValue(index)}/>
                    ))}
                    </>}
                </Flex>
                <Flex  mt='3vh' gap='15px' flexDir={'row-reverse'} >
                    <Button isDisabled={newFieldData.name === '' || (foundFieldIndex !== -1 && (JSON.stringify(editField) === JSON.stringify(newFieldData)) )} size='sm' variant={'main'} onClick={handleEditFields}>{waitingEdit?<LoadingIconButton/>:foundFieldIndex === -1 ?t('CreateField'):t('SaveChanges')}</Button>
                    <Button  size='sm'variant={'common'} onClick={() => setEditField(null)}>{t('Cancel')}</Button>
                </Flex>
            </Box>
      </>)
    }   

    //ARCHIVE A FIELD BOX
    const ArchiveFiledBox = () => {

        //NEW ARCHIVED INDEX
        const foundFieldIndex = fieldsData?.findIndex(item => item.uuid === fieldToArchive?.uuid) 

        //BOOLEAN FOR WAITIGN THE ARCHIVE
        const [waitingArchive, setWaitingArchive] = useState<boolean>(false)

        //ARCHIVE FIELD
        const handleDeleteFields= async() => {
             const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/cdas/${fieldToArchive?.uuid}`, method:'delete', setWaiting:setWaitingArchive, getAccessTokenSilently,auth, toastMessages:{'works':t('CorrectDeletedFields'), 'failed':t('FailedDeletedFields')}})
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
                <Text mt='2vh' color={'gray.600'} fontSize={'.8em'}>{'ArchiveFieldWarning'}</Text>

        
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
        const foundFieldIndex = fieldsData?.findIndex(item => item.uuid === row.uuid) || 0
        
        //ACTIVE FIELD
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/cdas/${fieldsData?.[foundFieldIndex].uuid}/restore`,method:'post', getAccessTokenSilently, auth})
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
    
        <Box height={'100%'} width={'100%'} px='2vw' pt='2vh' > 
    
            <Flex justifyContent={'space-between'} alignItems={'start'}> 
                <Box w='100%'> 
                    <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('Fields')}</Text>
                    <Text color='gray.600' fontSize={'.8em'}>{t('FieldsDes')}</Text>
                    <Box h='40px' w='100%' > 
                        <SectionSelector notSection selectedSection={currentSection} sections={['active', 'archived']} sectionsMap={{'active':[t('activefields'), <FaBolt/>], 'archived':[t('archivedfields'), <IoMdArchive/>]}}  onChange={(section) => setCurrentSection(section)}/>
                        <Box bg='gray.200' h='1px' w='100%'/>
                    </Box>
                </Box>
                <Button size='sm' variant={'main'} leftIcon={<FaPlus/>} onClick={() => setEditField({uuid:'-1', name:'', description:'', type:'boolean', structure:'conversations', created_by:auth.authData.userId as string, allowed_values:[], created_at:'', archived_at:'', is_archived:false})}>{t('CreateField')}</Button>
            </Flex>
        
            <Flex  mt='2vh'justifyContent={'space-between'} alignItems={'end'}>
                <Skeleton isLoaded={fieldsData !== null}> 
                    <Text fontWeight={'medium'} color='gray.600'>{t('FieldsCount', {count:dataToWork?.length})}</Text>
                </Skeleton>
            </Flex>

            <Skeleton isLoaded={fieldsData !== null}> 
                <Table data={dataToWork} CellStyle={CellStyle} noDataMessage={currentSection === 'active'?t('NoFields'):t('NoArchivedFields')} excludedKeys={['uuid', 'is_archived', currentSection === 'active' ? 'archived_at':'created_at']}  columnsMap={columnsFieldsMap} onClickRow={(row:any, index:number) => {if (currentSection === 'active') setEditField(row)}} deletableIcon={currentSection === 'archived'? <FaArrowRotateRight size='20px' />:<TbArrowBigDownFilled size='18px'  color='red'/>} deletableFunction={(row,index) => {if (currentSection === 'archived') recoverField(row);else setFieldToArchive(row)}}/>
            </Skeleton>
        </Box>
    </>)
}

export default Fields

const AlowedValueComponent = ({value, deleteValue}:{value:any,  deleteValue:() => void}) => {

    const [isHovering, setIsHovering] = useState<boolean>(false)

    return (<>  
        <Flex position={'relative'} alignItems={'center'} justifyContent={'center'} bg='brand.gray_2' py='5px' px='12px' borderRadius={'.3rem'} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <Text fontSize={'.7em'}>{value}</Text>
            {isHovering && 
                <Flex alignItems={'center'} cursor={'pointer'} justifyContent={'center'} bg={'brand.gray_2'} backdropFilter="blur(1px)"  px='3px' position={'absolute'} right={'4px'} > 
                    <Icon color='red' boxSize={'12px'} as={RxCross2} onClick={(e) => {deleteValue()}}/>
                </Flex>}
        </Flex>
        </>)
}
