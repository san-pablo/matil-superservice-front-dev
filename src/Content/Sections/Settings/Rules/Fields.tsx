//REACT
import { useEffect, useRef, useState, useMemo, Fragment } from "react"
import { useAuth } from "../../../../AuthContext"
import { useTranslation } from "react-i18next"
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Text, Box, Flex, Button, NumberInput, NumberInputField, Icon, Skeleton } from "@chakra-ui/react"
//COMPONENTS
import LoadingIconButton from "../../../Components/Reusable/LoadingIconButton"
import EditText from "../../../Components/Reusable/EditText"
import ConfirmBox from "../../../Components/Reusable/ConfirmBox"
import CustomSelect from "../../../Components/Reusable/CustomSelect"
import Table from "../../../Components/Reusable/Table"
//FUNCTIONS
import parseMessageToBold from "../../../Functions/parseToBold"
//ICONS
import { FaPlus, FaTicket, FaBuilding } from "react-icons/fa6"
import { IoPeopleSharp } from "react-icons/io5"
import { IconType } from "react-icons"

type variables = 'bool' | 'int' | 'float' | 'str' | 'timestamp'
type fieldConfigType = {name:string, type:variables, default:string}
interface FieldsType {
    motherstructure:'ticket' | 'client' | 'contact_business'
    name:string
    type:variables
    default:string
}
 
function parseBack(dict:{ticket:fieldConfigType[], client:fieldConfigType[], contact_business:fieldConfigType[]}) {
    const result:FieldsType[] = []
    for (const [key, values] of Object.entries(dict)) {
        values.forEach(item => {result.push({motherstructure: key as 'ticket' | 'client' | 'contact_business', name: item.name,type: item.type, default: item.default})})
    }
    return result
}
function parseToBack(dataArray:FieldsType[]) {
    const result:{ticket:fieldConfigType[], client:fieldConfigType[], contact_business:fieldConfigType[]} = {ticket: [], client: [], contact_business: []}
    dataArray.forEach(item => {if (result[item.motherstructure]) result[item.motherstructure].push({name: item.name, type: item.type,default: item.default})})
    return result
}

const CellStyle = ({column, element}:{column:string, element:any}) => {

    const  { t } = useTranslation('settings')
    const structuresMap:{[key:string]:[string, IconType]} = {'ticket':[t('Tickets'), FaTicket],  'client':[t('Client'), IoPeopleSharp], 'contact_business':[t('Business'), FaBuilding],  }

    if (column === 'motherstructure') {
        return (<Flex gap='10px' alignItems={'center'}>
             <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{structuresMap[element][0]}</Text>
             <Icon color='gray.600' as={structuresMap[element][1]}/>
        </Flex>)
    }
    else return <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{element}</Text>
}

const Fields = () => {

    //CONSTANTS
    const { t } = useTranslation('settings')
    const auth = useAuth()
    const structuresMap:{[key in 'ticket' | 'client' | 'contact_business']:string} = {'ticket':t('Tickets'), 'client':t('Clients'), 'contact_business':t('Contact_business')}
    const variablesMap:{[key in variables]:string} = {'bool':t('bool'), 'int':t('int'), 'float':t('float'), 'str':t('str'), 'timestamp':t('timestamp')}
    const columnsFieldsMap:{[key:string]:[string, number]} = {'name':[t('Name'), 250],  'motherstructure':[t('Structure'), 200], 'type': [t('Type'), 200], 'default':[t('Default'), 300]}

    //CREATE NEW FIELD OR EDITING ONE
    const [editFieldData, setEditFieldData] = useState<{data:FieldsType, index:number} | null>(null)

    //DELETE FIELD
    const [selectedElements, setSelectedElements] = useState<number[]>([])
    const [waitingDelete, setWaitingDelete] = useState<boolean>(false)
    const [fieldToDelete, setFieldToDelete] = useState<FieldsType | null>(null)

    //TICKETS DATA
    const [fieldsData, setFieldsData] = useState<FieldsType[] | null>(null)

    //FILTER FIELDS DATA
    const [text, setText]  =useState<string>('')
    const [filteredFieldsData, setFilteredFieldsData] = useState<FieldsType[]>([])
    useEffect(() => {
        const filterUserData = () => {
            if (fieldsData) {
                const filtered = fieldsData.filter(user => user.name.toLowerCase().includes(text.toLowerCase()))
                setFilteredFieldsData(filtered)
            }
        }
        filterUserData()
    }, [text, fieldsData])
       
    //FETCH NEW DATA WHEN THE VIEW CHANGE
    useEffect(() => {        
        document.title = `${t('Settings')} - ${t('Fields')} - ${auth.authData.organizationId} - Matil`
        const fetchInitialData = async() => {
            const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/custom_attributes`, auth})
            if (response?.status === 200 ) setFieldsData(parseBack(response.data))
            
        }
        fetchInitialData()
    }, [])
   

    //EDIT FIELDS
    const handleEditFields = async(fieldData:{data:FieldsType, index:number}) => {
        
        let newFields:FieldsType[] = []
        if (fieldData.index === -1 ) newFields = [...fieldsData as FieldsType[], fieldData.data]
        else { newFields = (fieldsData as FieldsType[]).map((item, index) => index === fieldData.index ? fieldData.data : item)}
        
        const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/custom_attributes`, method:'put', requestForm:parseToBack(newFields), auth, toastMessages:{'works':fieldData.index === -1 ?t('CorrectCreatedFields'):t('CorrectUpdatedFields'), 'failed':fieldData.index === -1 ?t('FailedCreatedFields'):t('FailedUpdatedFields')}})
        if (response?.status === 200) {
            setFieldsData(newFields)
            setEditFieldData(null)
        }
    }

    const handleDeleteFields= async() => {
        setWaitingDelete(true)
        const newFields = fieldsData?.filter((field) => fieldToDelete?.name !== field.name) || []
        const response = await fetchData({endpoint:`superservice/${auth.authData.organizationId}/admin/settings/custom_attributes`, method:'put', setWaiting:setWaitingDelete, requestForm:parseToBack(newFields), auth, toastMessages:{'works':t('CorrectDeletedFields'), 'failed':t('FailedDeletedFields')}})
        if (response?.status === 200) {
            setFieldsData(newFields)
            setFieldToDelete(null)
        }
        setSelectedElements([])
    }

    const EditFieldBox = ({fieldData}:{fieldData:{data:FieldsType, index:number}}) => {

        //MAPPING DICTS
        const boolDict = {"True":t('true'), "False":t('false')}
        const datesMap = {'{today}':t('today'), '{yesterday}':t('yesterday'), '{start_of_week}':t('start_of_week'),'{start_of_month}':t('start_of_month')}

        //NEW FIELD DATA
        const [newFieldData, setNewFieldData] = useState<FieldsType>(fieldData.data)
    
        //BOOLEAN FOR WAITIGN THE EDIT
        const [waitingEdit, setWaitingEdit] = useState<boolean>(false)

        //FRONT
        return(<> 
            <Box p='20px'> 
            <Text  mb='.5vh' fontWeight={'medium'}>{t('Name')}</Text>
            <EditText  maxLength={100} placeholder={`${t('Name')}...`} hideInput={false} value={newFieldData.name} setValue={(value) => setNewFieldData((prev) => ({...prev, name:value}))}/>
            <Text mt='3vh' mb='.5vh' fontWeight={'medium'}>{t('Structure')}</Text>

            <Flex gap='20px' mt='.5vh' >
                <Button leftIcon={<FaTicket/>} bg={newFieldData.motherstructure === 'ticket'?'blackAlpha.800':'gray.200'} color={newFieldData.motherstructure === 'ticket'?'white':'black'} size='xs' _hover={{bg:newFieldData.motherstructure === 'ticket'?'blackAlpha.800':'gray.300'}}  onClick={() => setNewFieldData((prev) => ({...prev, motherstructure:'ticket'}))}>{t('Tickets')}</Button>
                <Button leftIcon={<IoPeopleSharp/>} bg={newFieldData.motherstructure === 'client'?'blackAlpha.800':'gray.200'} color={newFieldData.motherstructure === 'client'?'white':'black'} size='xs' _hover={{bg:newFieldData.motherstructure === 'client'?'blackAlpha.800':'gray.300'}} onClick={() => setNewFieldData((prev) => ({...prev, motherstructure:'client'}))}>{t('Clients')}</Button>
                <Button leftIcon={<FaBuilding/>} bg={newFieldData.motherstructure === 'contact_business'?'blackAlpha.800':'gray.200'} color={newFieldData.motherstructure === 'contact_business'?'white':'black'} size='xs' _hover={{bg:newFieldData.motherstructure === 'contact_business'?'blackAlpha.800':'gray.300'}} onClick={() => setNewFieldData((prev) => ({...prev, motherstructure:'contact_business'}))} >{t('Businesses')}</Button>           
            </Flex> 

            <Text mt='3vh' mb='.5vh' fontWeight={'medium'}>{t('Type')}</Text>
            <CustomSelect hide={false} selectedItem={newFieldData.type} setSelectedItem={(value) => setNewFieldData((prev) => ({...prev, type:value as variables, default:''}))} options={Object.keys(variablesMap)} labelsMap={variablesMap}/>
            
            <Text mt='3vh' mb='.5vh' fontWeight={'medium'}>{t('Default')}</Text>
            {(() => {switch(newFieldData.type) {
                case 'bool':
                    return <CustomSelect hide={false} selectedItem={newFieldData.default} setSelectedItem={(value) => setNewFieldData((prev) => ({...prev, default:value}))}  options={Object.keys(boolDict)} labelsMap={boolDict}/>
                case 'int':
                case 'float': return (
                    <NumberInput value={newFieldData.default} onChange={(value) => setNewFieldData((prev) => ({...prev, default:String(value)}))} min={1} max={1000000} clampValueOnBlur={false} >
                        <NumberInputField borderRadius='.5rem'  fontSize={'.9em'} height={'37px'}  borderColor={'gray.300'} _hover={{ border:'1px solid #CBD5E0'}} _focus={{ px:'11px', borderColor: "rgb(77, 144, 254)", borderWidth: "2px" }} px='12px' />
                    </NumberInput>)              
                case 'str':
                        return <EditText value={newFieldData.default} setValue={(value) => setNewFieldData((prev) => ({...prev, default:value}))} hideInput={false} />
                case 'timestamp':
                    return <CustomSelect hide={false} selectedItem={newFieldData.default}  setSelectedItem={(value) => setNewFieldData((prev) => ({...prev, default:value}))}  options={Object.keys(datesMap)} labelsMap={datesMap}/>
            }})()}

         </Box>
        <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
            <Button isDisabled={newFieldData.name === '' || (fieldData.index !== -1 && (JSON.stringify(fieldData.data) === JSON.stringify(newFieldData)) )} size='sm' color='white' bg='blackAlpha.800' _hover={{bg:'blackAlpha.900'}} onClick={() => handleEditFields({data:newFieldData, index: fieldData.index})}>{waitingEdit?<LoadingIconButton/>:fieldData.index === -1 ?t('CreateField'):t('SaveChanges')}</Button>
            <Button  size='sm' _hover={{color:'blue.400'}} onClick={() => setEditFieldData(null)}>{t('Cancel')}</Button>
        </Flex>
      </>)
    }   

    const memoizedDeleteBox = useMemo(() => (
        <ConfirmBox setShowBox={(b:boolean) => setFieldToDelete(null)} isSectionWithoutHeader={true}> 
            <Box p='20px'> 
                <Text width={'400px'}>{parseMessageToBold(t('DeleteAllFields', {name:fieldToDelete?.name, structure:structuresMap[fieldToDelete?.motherstructure || 'ticket'].toLowerCase()}))}</Text>
            </Box>
            
            <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'gray.200'}>
                <Button  size='sm' color='red.600' bg='red.100' _hover={{bg:'red.200'}} onClick={handleDeleteFields}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                <Button  size='sm' _hover={{color:'blue.400'}}  onClick={()=> setFieldToDelete(null)}>{t('Cancel')}</Button>
            </Flex>
            </ConfirmBox>
    ), [fieldToDelete])

   
    const memoizedEditFieldBox = useMemo(() => (
        <ConfirmBox setShowBox={() => setEditFieldData(null)} isSectionWithoutHeader={true}> 
            <EditFieldBox fieldData={editFieldData as {data:FieldsType, index:number}} />
        </ConfirmBox>
    ), [editFieldData])


   return(<>
    {fieldToDelete && memoizedDeleteBox}
    {editFieldData && memoizedEditFieldBox}
 
    <Box height={'100%'} width={'100%'} overflow={'scroll'}> 

        <Flex justifyContent={'space-between'} alignItems={'end'}> 
            <Box> 
                <Text fontSize={'1.4em'} fontWeight={'medium'}>{t('Fields')}</Text>
                <Text color='gray.600' fontSize={'.9em'}>{t('FieldsDes')}</Text>
            </Box>
             
        </Flex>
        <Box width='100%' bg='gray.300' height='1px' mt='2vh' mb='3vh'/>
        
        <Box width={'350px'}> 
            <EditText value={text} setValue={setText} searchInput={true}/>
        </Box>
        
        <Flex  mt='2vh'justifyContent={'space-between'} alignItems={'end'}>
            <Skeleton isLoaded={fieldsData !== null}> 
                <Text  fontWeight={'medium'} fontSize={'1.2em'}>{t('FieldsCount', {count:fieldsData?.length})}</Text>
            </Skeleton>
            <Button size='sm' leftIcon={<FaPlus/>} onClick={() => setEditFieldData({index:-1, data:{ motherstructure:'ticket', name:'', type:'bool', default:'True'}})}>{t('CreateField')}</Button>
        </Flex>

        <Skeleton  isLoaded={fieldsData !== null}> 
            <Table data={filteredFieldsData} CellStyle={CellStyle} noDataMessage={t('NoFields')}  columnsMap={columnsFieldsMap} onClickRow={(row:any, index:number) => setEditFieldData({index, data:row})} deletableFunction={(row,index) => setFieldToDelete(row)}/>
        </Skeleton>
    </Box>
    </>)
}

export default Fields