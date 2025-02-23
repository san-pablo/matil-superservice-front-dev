//REACT
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../../AuthContext.js'
import { useTranslation } from 'react-i18next'
//FETCH DATA
import fetchData from '../../API/fetchData.js'
//FRONT
import { NumberInput, NumberInputField, Flex, Box, Text, Icon, chakra, shouldForwardProp, Switch } from '@chakra-ui/react'
import { motion, AnimatePresence, isValidMotionProp } from 'framer-motion'
//COMPONENTS
import EditText from './EditText.js'
import CustomSelect from './CustomSelect.js'
import LoadingIconButton from './LoadingIconButton.js'
import DateRangePicker from './DatePicker'
//FUCNTIONS
import useOutsideClick from '../../Functions/clickOutside.js'
//ICONS
import { FaBuilding } from 'react-icons/fa'
import { IoIosArrowDown } from 'react-icons/io'
//TYPING
import { languagesFlags, ContactBusinessesTable } from '../../Constants/typing.js'
import { useSession } from '../../../SessionContext.js'
import { useAuth0 } from '@auth0/auth0-react'
 
//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//FIND BUSINESS COMPONENT
const FindBusinessComponent = ({value, setValue, auth}:{value:number, setValue:any, auth:any}) => {

    //REFS
    const buttonRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)
    const {  getAccessTokenSilently }= useAuth0()
    const [showSearch, setShowSearch] = useState(false)
    
    const [text, setText] = useState<string>('')
    const [showResults, setShowResults] = useState<boolean>(false)
    const [elementsList, setElementsList] = useState<any>([])
    const [waitingResults, setWaitingResults] = useState<boolean>(false)

    //BOOLEAN TO CONTROL THE VISIBILITY OF THE LIST AND CLOSE ON OUTSIDE CLICK
    useOutsideClick({ref1:buttonRef, ref2:boxRef, onOutsideClick:setShowSearch})

    useEffect(() => {
        if (text === '') {
            setWaitingResults(false);setShowResults(false);return}
        else {
            setWaitingResults(true)
            const timeoutId = setTimeout(async () => {
                const response = await fetchData({endpoint: `${auth.authData.organizationId}/contact_businesses`, getAccessTokenSilently, setValue:setElementsList, auth, params: { page_index: 1, search: text }})
                if (response?.status === 200) {setShowResults(true);setWaitingResults(false)}
                else {setShowResults(false);setWaitingResults(false)}
            }, 500)
            return () => clearTimeout(timeoutId)
        }
    }, [text])


    return (
        <Box position={'relative'}>
            <Flex bg={'transaprent'} cursor={'pointer'} alignItems={'center'} onClick={() => setShowSearch(!showSearch)} ref={buttonRef} height={'37px'} fontSize={'.9em'}  border={showSearch ? "3px solid rgb(77, 144, 254)":"1px solid transparent"} justifyContent={'space-between'} px={showSearch?'5px':'7px'} py={showSearch ? "5px" : "7px"} borderRadius='.5rem' _hover={{border:showSearch?'3px solid rgb(77, 144, 254)':'1px solid #CBD5E0'}}>
                <Text>{value}</Text>
                <IoIosArrowDown className={showSearch ? "rotate-icon-up" : "rotate-icon-down"}/>
            </Flex>
            
            <AnimatePresence> 
                {showSearch && 
                <MotionBox id='custom-portal' initial={{ opacity: 5, marginTop: -5 }} animate={{ opacity: 1, marginTop: 5 }}  exit={{ opacity: 0,marginTop:-5}} transition={{ duration: '0.2', ease: 'easeIn'}}
                    maxH='30vh' overflow={'scroll'} width='140%' gap='10px' ref={boxRef} fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100000} position={'absolute'} right={0} borderRadius={'.3rem'} borderWidth={'1px'} borderColor={'border_color'}>
                    <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Buscar..." style={{border:'none', outline:'none', background:'transparent', padding:'10px'}}/>
                    <Box height={'1px'} width={'100%'} bg='border_color'/>
                    {(showResults && 'page_data' in elementsList) ? <>
                        <Box maxH='30vh'>
                            {elementsList.page_data.length === 0? 
                            <Box p='15px'><Text fontSize={'.9em'} color='text_gray'>{waitingResults?<LoadingIconButton/>:'No hay ninguna coincidencia'}</Text></Box>
                            :<> {elementsList.page_data.map((business:ContactBusinessesTable, index:number) => (
                                <Flex _hover={{bg:'gray.50'}} cursor={'pointer'} alignItems={'center'} onClick={() => {setText('');setValue(business);setShowResults(false)}} key={`user-${index}`} p='10px' gap='10px' >
                                    <Icon boxSize={'12px'} color='gray.700' as={FaBuilding}/>
                                    <Text fontSize={'.9em'}>{business.name}</Text>
                                </Flex>
                            ))}</>}
                        </Box>
                    </>:<Box p='15px'><Text fontSize={'.9em'} color='text_gray'>{waitingResults?<LoadingIconButton/>:'No hay ninguna coincidencia'}</Text></Box>}
                </MotionBox>} 
            </AnimatePresence>
        </Box>
    )
}

//SHOWING THE VALUE TYPE DEPENDING ON THE VATIABLE TO EDIT IN MOTHERSTRUCTURE
const VariableTypeChanger = ({inputType, value, setValue, operation, customType, min, max, disabled,  fontSize = '.8em'}:{inputType:string, value:any, setValue:(value:any) => void, operation?:string, customType?:boolean, min?:number, max?:number, disabled?:boolean,  fontSize?:string}) => {


    //USEFUL CONSTANTS
    const auth = useAuth()
    const session = useSession()
    const { t } = useTranslation('settings')
    const t_con = useTranslation('conversations').t
    const {  getAccessTokenSilently } = useAuth0()

    const [groups, setGroups] = useState<{[key:number]:string}>([])
    useEffect(() => {        
        const fetchInitialData = async() => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/settings/groups`,  getAccessTokenSilently,auth})
            let currentGroupsDict: { [key: number]: string } = {}
            response?.data?.forEach((group: any) => {currentGroupsDict[group.id as number] = group.name})
            if (response?.status === 200 ) setGroups(currentGroupsDict)
        }
        if (!customType) fetchInitialData()
    }, [])
   
     if (operation === 'exists') return <></>

    if (customType) {

         switch(inputType) {
                case 'int':
                case 'integer': 
                    {  
                        return (
                        <NumberInput value={value? value:''} w='100%'onChange={(valueString) => setValue(parseInt(valueString))} pattern={'(?:0|[1-9]\d*)'} min={0} max={1000000}  >
                            <NumberInputField borderRadius='.5rem'  fontSize={fontSize} height={'32px'}  borderColor={'border_color'} _hover={{ border:'1px solid #CBD5E0'}} _focus={{  boxShadow:'0 0 0 2px rgb(59, 90, 246)', border: '1px solid rgb(59, 90, 246)'}} px='7px' />
                        </NumberInput>)
                   }   
                case 'number': 
                case 'float':
                    return (
                        <NumberInput value={value? value:''} w='100%' onBlur={() => {if (typeof(value) === 'string') setValue(Number(value))}}  onChange={(valueString) => {
                            const parsedValue = Number(valueString)
                            if (valueString.endsWith('.')) setValue(valueString)
                            else if (!isNaN(parsedValue)) setValue(parsedValue)
                            else setValue('')
                          }}  pattern="^[+\-]?(?:\d+)(?:\.\d*)?$|^[+\-]?(?:\d*)(?:\.\d+)$">
                    <NumberInputField borderRadius='.5rem' placeholder={'-'} fontSize={fontSize}height={'32px'}  borderColor={'border_color'} _hover={{ border:'1px solid #CBD5E0'}} _focus={{  boxShadow:'0 0 0 2px rgb(59, 90, 246)', border: '1px solid rgb(59, 90, 246)'}} px='7px' />
                        </NumberInput>)
            case 'bool': 
            case 'boolean': 
                return  <Switch isChecked={value}  onChange={(e) => setValue(e.target.checked)} />

            case 'str': 
            case 'string':
            case 'list':
            case 'array':

                return <EditText fontSize={fontSize} placeholder='-' isDisabled={disabled}  value={value} setValue={(value) => setValue(value) } hideInput={false} />
            case 'timestamp':

                const datesMap =  {'Today':t('Today'), 'Yesterday':t('Yesterday'), 'Past 1 week':t('1Week'), 'Past 1 month':t('1Month'), 'Past 3 months':t('3Month'), 'Past 6 months':t('6Month'), 'Past 1 year':t('1Year')}
                return <CustomSelect fontSize={fontSize} hide={false} selectedItem={value}  setSelectedItem={(value) => setValue(value)}  options={Object.keys(datesMap)} labelsMap={datesMap}/>
        
            default:
                return <></>
        }
    }

    else {
        switch(inputType) {
        case 'user_id':
            {
                let usersDict:{[key:string]:string} = {}
                if (auth.authData.users) Object.keys(auth.authData?.users).map((key:any) => {if (auth?.authData?.users) usersDict[key] = auth?.authData?.users[key].name})
                usersDict['no_user'] = t('NoAgent')
                usersDict['matilda'] = 'Matilda'
                return (<CustomSelect hide={false} selectedItem={value} setSelectedItem={(value) => setValue(value) }  options={Object.keys(usersDict).map(key => key)} labelsMap={usersDict} />)
            }
        case 'group_id':
            return (<CustomSelect fontSize={fontSize} hide={false} selectedItem={value} setSelectedItem={(value) => setValue(value) }  options={Object.keys(groups).map(key => key)} labelsMap={groups} />)
        case 'channel_type':
            return (<CustomSelect fontSize={fontSize} hide={false} selectedItem={value} setSelectedItem={(value) => setValue(value) }  options={['email', 'whatsapp', 'instagram', 'webchat', 'google_business', 'phone']} labelsMap={{'email':t('email'), 'whatsapp':t('whatsapp'), 'instagram':t('instagram'), 'webchat':t('webchat'), 'google_business':t('google_business'), 'phone':t('phone')}} />)
        case 'channel_id':
            {
                const channels = session.sessionData.additionalData.channels
                const channelsDict = {}
                channels?.map((cha:any) => (channelsDict as any)[cha.id] = cha.name)
                return (<CustomSelect hide={false} selectedItem={value} setSelectedItem={(value) => setValue(value) }  options={Object.keys(channelsDict)} labelsMap={channelsDict} />)
            }
        case 'title':
        case 'tags':
        case 'name':
        case 'notes':
        case 'labels':
        case 'domain':
            return <EditText fontSize={fontSize} value={value} setValue={(value) => setValue(value) } hideInput={false} />
        case 'theme_id':
            let themesDict:{[key:string]:[string, string]} = {}
            auth.authData?.themes.map((theme:any) => {themesDict[theme.id] = [theme.name, theme.emoji]})
            return (<CustomSelect fontSize={fontSize} hide={false} selectedItem={value} setSelectedItem={(value) => setValue(value) }  options={Object.keys(themesDict)} iconsMap={themesDict} />)
        case 'team_id':
            let teamsDict:{[key:string]:[string, string]} = {}
            auth.authData?.teams.map((team:any) => {themesDict[team.id] = [team.name, team.emoji]})
            return (<CustomSelect fontSize={fontSize} hide={false} selectedItem={value} setSelectedItem={(value) => setValue(value) }  options={Object.keys(teamsDict)} iconsMap={teamsDict} />)
        case 'status':
            const statusMapDic = {'new':t_con('new'), 'open':t_con('open'), solved:t_con('solved'), 'pending':t_con('pending'), 'closed':t_con('closed')}
            return (<CustomSelect fontSize={fontSize} hide={false} selectedItem={value} setSelectedItem={(value) => setValue(value) }  options={Object.keys(statusMapDic)} labelsMap={statusMapDic} />)
        case 'is_matilda_engaged':
        case 'unseen_changes':
        case 'is_csat_offered':
        case 'is_transferred':
        case 'is_csat_opened':
        case 'is_nps_opened':

            return  <Switch isChecked={value}  onChange={(e) => setValue(e.target.checked)} />
        case 'contact_business_id': return <FindBusinessComponent value={value} setValue={setValue} auth={auth}/>
        case 'language': {
            let languagesMap:any = {}
            for (const key in languagesFlags) {
                if (languagesFlags.hasOwnProperty(key)) {
                    const values = languagesFlags[key]
                    languagesMap[key] = values[0]
                }
            }
            return <CustomSelect fontSize={fontSize} labelsMap={languagesMap} selectedItem={value}  setSelectedItem={(value) => setValue(value)} options={Object.keys(languagesMap)} hide={false} />
        }
        case 'created_at':
        case 'updated_at':
        case 'solved_at':
        case 'closed_at':
        case 'deletion_date':

            const datesMap =  {'Today':t('Today'), 'Yesterday':t('Yesterday'), 'Past 1 week':t('1Week'), 'Past 1 month':t('1Month'), 'Past 3 months':t('3Month'), 'Past 6 months':t('6Month'), 'Past 1 year':t('1Year')}
            return <CustomSelect fontSize={fontSize} hide={false} selectedItem={value}  setSelectedItem={(value) => setValue(value)}  options={Object.keys(datesMap)} labelsMap={datesMap}/>

        case 'rating': 
        case 'hours_since_created': 
        case 'hours_since_updated': 
        case 'id': 
        case 'local_id': 

            return (
                <NumberInput value={value? value:''} w='100%'onChange={(valueString) => setValue(parseInt(valueString))} pattern={'(?:0|[1-9]\d*)'} min={0} max={1000000}  >
                    <NumberInputField borderRadius='.5rem' placeholder={'-'} fontSize={fontSize}height={'32px'}  borderColor={'border_color'} _hover={{ border:'1px solid #CBD5E0'}} _focus={{  boxShadow:'0 0 0 2px rgb(59, 90, 246)', border: '1px solid rgb(59, 90, 246)'}} px='7px' />
                </NumberInput>)
        default: 
            return null
            }
    }

} 

export default VariableTypeChanger

