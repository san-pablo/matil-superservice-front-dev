
//REACT
import  { useState, useEffect, useRef} from 'react'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
import { useAuth0 } from '@auth0/auth0-react'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, Skeleton, chakra, shouldForwardProp, Icon, IconButton, Button } from "@chakra-ui/react"
import Calendar from 'react-calendar'
//ICONS
import { FaMoon, FaPlus } from 'react-icons/fa6'
import { HiTrash } from 'react-icons/hi2'
import { RxCross2 } from 'react-icons/rx'
 
//TYPING
type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
type hourInterval = {end_hour:string, start_hour:string}
type BussinessHoursDays = {[key in DayOfWeek]: hourInterval[]}
type BussinessHoursType = {business_hours:BussinessHoursDays,  holidays: string[]}
 
//MOTION BOX
 
const testBusinessHours: BussinessHoursType = {
    business_hours: {
        monday: [
        { start_hour: "09:00", end_hour: "12:00" },
        { start_hour: "13:00", end_hour: "17:00" }
        ],
        tuesday: [
        { start_hour: "09:00", end_hour: "12:00" },
        { start_hour: "13:00", end_hour: "17:00" }
        ],
        wednesday: [
        { start_hour: "09:00", end_hour: "12:00" },
        { start_hour: "13:00", end_hour: "17:00" }
        ],
        thursday: [
        { start_hour: "09:00", end_hour: "12:00" },
        { start_hour: "13:00", end_hour: "17:00" }
        ],
        friday: [
        { start_hour: "09:00", end_hour: "12:00" },
        { start_hour: "13:00", end_hour: "17:00" }
        ],
        saturday: [
        { start_hour: "10:00", end_hour: "14:00" }
        ],
        sunday: [],
    },
    holidays: ["12/25", "01/01", "07/04"]
  }

//MAIN FUNCTION
function BusinessHours () {

    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('settings')
    const t_formats = useTranslation('formats').t
    const { i18n } = useTranslation()
    const { getAccessTokenSilently } = useAuth0()

 
    //ORGANIZATION DATA
    const businessHoursRef = useRef<BussinessHoursType | null>(null)
    const [businessHours, setBusinessHours] = useState<BussinessHoursType | null>(testBusinessHours)
 
      
    //FETCH NEW DATA WHEN THE VIEEW CHANGE
    useEffect(() => {
        const fetchInitialData = async () => {
            //const response = await fetchData({endpoint:`${auth.authData.organizationId}/settings/organization`,  setWaiting:setWaitingInfo, getAccessTokenSilently, auth})
         
         }
        document.title = `${t('Settings')} - ${t('Data')} - ${auth.authData.organizationName} - Matil`
        fetchInitialData()
    }, [])

    //SAVE CHANGES
    const saveChanges = async() => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/settings/organization`, method:'put', requestForm:businessHours, auth, getAccessTokenSilently, toastMessages:{works:t('CorrectUpdatedContext'), failed:t('FailedUpdatedContext')}})
        if (response?.status === 200) businessHoursRef.current = businessHours
    }
    

   //DELETE AN INTERVAL
    const MonthCalendarComponent = ({monthDates, index}:{monthDates:any, index:number}) => {
        const formatDate = (date: Date) => {return `${String(index + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`}
        const handleCalendarChange = (value: Date) => {
            setBusinessHours(prev => {
                if (prev.holidays.includes(formatDate(value))) return ({...prev, holidays: prev.holidays.filter((day, i) => day !== formatDate(value))})
                else return ({...prev, holidays: [...prev.holidays, formatDate(value)]})
            })

        }
        return (
            <>
                <Flex gap='15px' mb='1vh' alignItems={'center'}> 
                    <Box h='1px' w='100%' bg='border_color'/>
                    <Text color='text_gray' fontSize={'.8em'} fontWeight={'semibold'}>{t_formats(`months.${index}`).charAt(0).toUpperCase() + t_formats(`months.${index}`).slice(1)}</Text>
                    <Box h='1px' w='100%' bg='border_color'/>
                </Flex>
                <Calendar onClickDay={handleCalendarChange}  activeStartDate={monthDates} showNavigation={false} goToRangeStartOnSelect={false} locale={i18n.language} 
                   tileClassName={({ date }) => {
                    const formattedDate = formatDate(date)
                    if (businessHours.holidays.includes(formattedDate)) return 'selected-day'
                    return ''
                  }}
              />
            </>
        )

    }

    //DAY ITEM
    const DayItem = ({day, index}:{day:string, index:number}) => {

        const [isHovering, setIsHovering] = useState<boolean>(false)
        return (
            <Flex pos={'relative'} onMouseEnter={() => setIsHovering(true)}  onMouseLeave={() => setIsHovering(false)} h='24px' mt='.5vh' justifyContent={'space-between'} w='110px' cursor={'pointer'} _hover={{bg:'gray_1'}}  borderRadius={'.5rem'} bg='gray_2' alignItems={'center'} p='5px'  >
                <Text whiteSpace={'nowrap'} fontSize={'.8em'} fontWeight={'medium'} color={'text_gray'}>{day.split('/')[1] + ' ' + t('Of') + ' ' + t_formats(`months.${parseInt(day.split('/')[0]) - 1}`)}</Text>
                <Flex opacity={isHovering ? 1:0} transition={'opacity .2s ease-in-out'} alignItems={'center'} justifyContent={'center'}bg={'gray_1'} backdropFilter="blur(1px)"  px='5px' position={'absolute'} right={'0px'} > 
                    <Icon boxSize={'14px'} color='text_gray' as={RxCross2} onClick={() => setBusinessHours(prev => ({...prev,holidays: prev.holidays.filter((_, i) => i !== index)})) }/>
                </Flex>
            </Flex>
        )
    }
    const months = Array.from({ length: 12 }, (_, i) => new Date(2025, i, 1))

    return(
    <Flex p='2vw' h='90vh' w='calc(70vw - 200px)' overflow={'hidden'} flexDir={'column'} flex='1'>
 
        <Box>
            <Text fontSize={'1.2em'} fontWeight={'medium'}>{t('Hours')}</Text>
            <Text color='text_gray' fontSize={'.8em'}>{t('HoursDes')}</Text>       
            <Box width='100%' bg='border_color' height='1px' mt='2vh'/>
        </Box>
    
        <Flex flex='1' h='0' justifyContent={'space-between'}  gap='1vw'  mt='2vh'>
            <Flex flexDir={'column'}  flex='3' p='1vw' borderWidth={'1px'} borderRadius={'.5rem'} borderColor={'border_gray'} >
                <Text fontWeight={'medium'}>{t('NormalDaysHours')}</Text>
                {businessHours && <HoursSelector currentHours={businessHours.business_hours} setCurrentHours={(hours) => setBusinessHours((prev:any) => ({...prev, business_hours:hours}))}/>}
            </Flex>
            <Flex  flex='4'px='1vw'   borderWidth={'1px'} borderRadius={'.5rem'}   borderColor={'border_gray'}>
                <Box    pt='1vw' flex='1'> 
                    <Text fontWeight={'medium'}>{t('Holidays')}</Text>
                    <Box mt='2.5vh'>
                        {businessHours.holidays.map((day, index) => (
                            <DayItem key={`date-${index}`} day={day} index={index}/>
                        ))}
                    </Box>
                </Box>
                <Flex pt='1vw'  alignItems={'center'} flexDir={'column'}  flex='2'  px='1vw' overflow={'scroll'} > 
                    <Box maxW={'250px'}> 
                        {months.map((monthDate, index) => {
                            return (
                            <Box key={index} p="10px" >
                                <MonthCalendarComponent monthDates={monthDate} index={index} />
                            </Box>
                        )})}
                    </Box>
                </Flex>
            </Flex>
        </Flex> 
    </Flex>)
}

export default BusinessHours


 
//SELECT BUSINESS HOURS
const HoursSelector = ({currentHours, setCurrentHours}:{currentHours:BussinessHoursDays, setCurrentHours:(business_hours:BussinessHoursDays) => void}) => {

    //CONSTANTS
    const { t } = useTranslation('settings')
 
    const updateBusinessHours = (day: DayOfWeek,  action: "update" | "add" | "delete",  index?: number,  newInterval?: hourInterval ) => {
        const updatedHours = { ...currentHours }
        switch (action) {
          case "update":
            if (index !== undefined && newInterval) updatedHours[day][index] = newInterval
            break
          case "add":
            if (newInterval) updatedHours[day] = [...updatedHours[day], newInterval];
            break;
          case "delete":
            if (index !== undefined) updatedHours[day] = updatedHours[day].filter((_, i) => i !== index);
            
            break
        }
      
        setCurrentHours(updatedHours)
      }

    const [hoverDay, setHoverDay] = useState<DayOfWeek | null>(null)
      
    return (
    <Box userSelect={'none'} mt='2vh' overflow={'scroll'}> 
        {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as DayOfWeek[]).map((day, index) => {            
            return (
            <Flex key={`day-${index}`}  justifyContent={'space-between'} w='100%'  position={'relative'} mt={index !== 0 ?'2vh':''}> 
        
                <Flex  flex='1' gap='10px' onMouseEnter={() => setHoverDay(day)} onMouseLeave={() => setHoverDay(null)}> 
                    <Text mt='3px' fontWeight={'medium'} color='text_gray'  fontSize={'.9em'}>{t(`WeekDay${index + 1}`)}</Text>
                    <Button mt='3px' size='xs' h='18px' p='6px' opacity={hoverDay === day ? 1:0} fontSize={'.7em'} onClick={() => updateBusinessHours(day, 'add', null, {start_hour:'08:00', end_hour:'20:00'})}  transition={'opacity .2s ease-in-out'}variant={'common'} leftIcon={<FaPlus/>}>{t('Add')}</Button>
                </Flex>
                {(currentHours as any)[day].length === 0 ? 

                    <Flex flexDirection={'row-reverse'} mr='calc(24px + .5vh)'> 
                        <Flex h='24px' w='calc(160px + .5vh)' gap='7px' onClick={() => updateBusinessHours(day, 'add', null, {start_hour:'08:00', end_hour:'20:00'})}  cursor={'pointer'} _hover={{bg:'gray_1'}}  borderRadius={'.5rem'} bg='gray_2' alignItems={'center'} p='5px'>
                            <Icon as={FaMoon}/>
                            <Text fontSize={'.8em'} fontWeight={'medium'} color={'text_gray'}>{t('Closed')}</Text>
                        </Flex>
                    </Flex>
                    :
                    <Flex key={`hour-${day}-${index}`} flexDirection={'row-reverse'} mt='.5vh' fontSize={'.9em'} gap='.5vh' alignItems={'center'}>
                        <Flex flexDir={'column'}> 
                            {(currentHours as any)[day].map((hour:any, index:number) => (<> 
                                <DayHours day={day} key={`hour-${day}-${index}`} index={index} hour={hour} updateBusinessHours={updateBusinessHours}/>   
                            </>))}
                        </Flex>
                      </Flex>
                    }
                    
            </Flex>)
        })}
    </Box>)

}


const DayHours = ({day, hour, index, updateBusinessHours}:{day:DayOfWeek, hour:{end_hour:string, start_hour:string}, index:number, updateBusinessHours:any}) => {
   
    const { t } = useTranslation('settings')

    const inputRef1 = useRef<HTMLInputElement>(null)
    const inputRef2 = useRef<HTMLInputElement>(null)

    const [currentHour, setCurrentHour] = useState<{start_hour:string, end_hour:string}>(hour)
    useEffect(() => {
        updateBusinessHours(day, "update", index, currentHour) 
    },[currentHour])

    const [isHovering, setIsHovering] = useState<boolean>(false)

    return (

    <Flex gap='.5vh' mt={index === 0 ? '0':'.5vh'} flexDir={'row-reverse'}  onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} >
    
        <IconButton opacity={isHovering ? 1:0} transition={'opacity .2s ease-in-out'} aria-label='delete' icon={<HiTrash size={'14px'}/>} bg='transparent' size='xs' variant={'delete'} onClick={() => updateBusinessHours(day, 'delete', index)}/>

        <Flex h='24px' justifyContent={'space-between'} w='80px' cursor={'pointer'} _hover={{bg:'gray_1'}}  borderRadius={'.5rem'} bg='gray_2' alignItems={'center'} p='5px'  onClick={() => inputRef1.current?.focus()}>
            <Text fontSize={'.8em'} fontWeight={'medium'} color={'text_gray'}>{t('To')}</Text>
             <input  lang='fr' ref={inputRef1} type='time' value={currentHour.end_hour} style={{background:'transparent', outline:'none', padding:'0', fontSize:'.9em', fontWeight:500}} 
             onChange={(e) => setCurrentHour(prev => ({ ...prev, end_hour: e.target.value}))}/>
        </Flex>   
        <Flex h='24px' justifyContent={'space-between'}  w='80px' cursor={'pointer'}  _hover={{bg:'gray_1'}} borderRadius={'.5rem'} bg='gray_2' alignItems={'center'} p='5px'    onClick={() => inputRef2.current?.focus()}>
            <Text fontSize={'.8em'}fontWeight={'medium'} color={'text_gray'}>{t('FromHour')}</Text>
            <input  lang='fr'   ref={inputRef2} type='time' value={currentHour.start_hour} style={{background:'transparent',  outline:'none', padding:'0', fontSize:'.9em', fontWeight:500}}
             onChange={(e) => setCurrentHour(prev => ({ ...prev, start_hour: e.target.value}))}/>
        </Flex>
    </Flex>
    )
}  