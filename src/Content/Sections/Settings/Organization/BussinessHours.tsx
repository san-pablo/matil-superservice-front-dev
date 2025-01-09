
//REACT
import  { useState, useEffect, useRef, Dispatch, SetStateAction, Fragment } from 'react'
import { useAuth } from '../../../../AuthContext'
import { useTranslation } from 'react-i18next'
import { useAuth0 } from '@auth0/auth0-react'
//FETCH DATA
import fetchData from "../../../API/fetchData"
//FRONT
import { Flex, Text, Box, Skeleton, Button, chakra, shouldForwardProp, Icon } from "@chakra-ui/react"
import { motion, AnimatePresence, isValidMotionProp  } from 'framer-motion'
//COMPONENTS
import SaveChanges from '../../../Components/Reusable/SaveChanges'
//ICONS
import { FaPlus } from 'react-icons/fa6'
import { HiTrash } from 'react-icons/hi2'

 
//TYPING
type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
type hourInterval = {end_hour:string, start_hour:string}
type BussinessHoursDays = {[key in DayOfWeek]: hourInterval[]}
type BussinessHoursType = BussinessHoursDays & {holidays: string[]}
interface OrganizationData  {
    description:string
    name: string
    business_hours:BussinessHoursType
    timestamp_created: string
    is_active: boolean
    current_active_users:number
    max_users: number
    processed_conversations_this_month:number
    max_conversations_per_month: number
    data_storage_capacity: number
    data_storage_used: number
    file_storage_capacity: number
    file_storage_used: number
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//MAIN FUNCTION
function BusinessHours () {

    //CONSTANTS
    const auth = useAuth()
    const { t } = useTranslation('settings')
    const {  getAccessTokenSilently } = useAuth0()

    //BOOLEAN FOR WAIT THE INFO
    const [waitingInfo, setWaitingInfo] = useState<boolean>(true)
 
    //ORGANIZATION DATA
    const orgDataRef = useRef<OrganizationData | null>(null)
    const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null)
 
    const [selectedIntervals, setSelectedIntervals] = useState<{ [key: string]: [number, number][] } | null>(null)
     
    useEffect(() => {
        if (selectedIntervals) {
        const updatedHours = Object.keys(selectedIntervals || {}).reduce((acc:any, day) => {
            acc[day] = selectedIntervals[day].map(interval => ({
                end_hour: convertMinutesToTime(interval[1]),
                start_hour: convertMinutesToTime(interval[0]),
             }));
            return acc;
        }, {} as BussinessHoursType)

        setOrganizationData(prevHours => ({...prevHours as OrganizationData, business_hours: {...updatedHours, holidays:prevHours?.business_hours.holidays}}))
    }
    }, [selectedIntervals])

    //FETCH NEW DATA WHEN THE VIEEW CHANGE
    useEffect(() => {
        const fetchInitialData = async () => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/organization`, setRef:orgDataRef, setValue:setOrganizationData, setWaiting:setWaitingInfo, getAccessTokenSilently, auth})
            if (response?.status === 200) {
                setSelectedIntervals(Object.keys(response.data?.business_hours || {}).reduce((acc, day) => {
                    if (day !== 'holidays') acc[day] = response.data?.business_hours[day as DayOfWeek].map((interval:any) => [parseTimeToMinutes(interval.start_hour), parseTimeToMinutes(interval.end_hour)])
                    return acc
                }, {} as { [key: string]: [number, number][] }))
            }
         }
        document.title = `${t('Settings')} - ${t('Data')} - ${auth.authData.organizationName} - Matil`
        fetchInitialData()
    }, [])

    //SAVE CHANGES
    const saveChanges = async() => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/admin/settings/organization`, method:'put', requestForm:organizationData as OrganizationData, auth, getAccessTokenSilently, toastMessages:{works:t('CorrectUpdatedContext'), failed:t('FailedUpdatedContext')}})
        if (response?.status === 200) orgDataRef.current = organizationData
    }
    const onDiscardFunc = () => {
        setSelectedIntervals(Object.keys(orgDataRef.current?.business_hours || {}).reduce((acc, day) => {
            if (day !== 'holidays') (acc[day] as any) = orgDataRef.current?.business_hours [day as DayOfWeek].map((interval:any) => [parseTimeToMinutes(interval.start_hour), parseTimeToMinutes(interval.end_hour)])
            return acc
        }, {} as { [key: string]: [number, number][] }))
    }
 
    return(
    <Box  p='2vw'>
        <SaveChanges data={organizationData} setData={setOrganizationData} dataRef={orgDataRef} onSaveFunc={saveChanges} onDiscardFunc={onDiscardFunc}/>
        <Box>
            <Flex alignItems={'end'} justifyContent={'space-between'}> 
                <Skeleton isLoaded={!waitingInfo}> 
                    <Text fontSize={'1.5em'} fontWeight={'medium'}>{t('Hours')}</Text>
                    <Text color='gray.600' fontSize={'.9em'}>{t('HoursDes')}</Text>
                </Skeleton>
            </Flex>
            <Box width='100%' bg='gray.300' height='1px' mt='2vh'/>
        </Box>
        <Box flex='1' maxW={'1000px'}  overflow={'scroll'} pt='3vh'>
            {(organizationData && selectedIntervals) && <HoursSlider selectedIntervals={selectedIntervals} setSelectedIntervals={setSelectedIntervals} setHours={setOrganizationData}/>}
        </Box>
        
 
    </Box>)
}

export default BusinessHours


//SELECT BUSINESS HOURS
const HoursSlider = ({selectedIntervals, setSelectedIntervals, setHours}:{selectedIntervals:{ [key: string]: [number, number][] }, setSelectedIntervals:Dispatch<SetStateAction<{ [key: string]: [number, number][] } | null>>, setHours:Dispatch<SetStateAction<OrganizationData | null>>}) => {

    //CONSTANTS
    const { t } = useTranslation('settings')

    //CHANGE INTERVALS VALUES
    const handleSliderChange = (day: string, selectedIndex: number, value: [number, number]) => {
        setSelectedIntervals(prevIntervals => {
            const newIntervals = { ...prevIntervals }
            const newDayIntervals = [...newIntervals[day]]
            newDayIntervals[selectedIndex] = value
            newIntervals[day] = newDayIntervals
            if (isOverlapping(newDayIntervals.filter((_, i) => i !== selectedIndex), value)) return prevIntervals
           
            return newIntervals
        })
    }

    //ADD NEW INTERVAL
    const addNewInterval = (day: string, pos:'right' | 'left' | null) => {
        setSelectedIntervals(prevIntervals => {
            const newIntervals = { ...prevIntervals }
            const currentIntervals = newIntervals[day] || []
            const lastInterval = currentIntervals[currentIntervals.length - 1]
            
            let newStart = lastInterval ? lastInterval[1]  + 60 : 0
            let newEnd = lastInterval ? lastInterval[0]: 1439

 
            if (pos === 'left') {
                newStart = 0
                newEnd = lastInterval[0] - 60
            }
            else if (pos === 'right') newEnd = 1439

            else if (currentIntervals.length !== 0) {
                newStart = currentIntervals[0][1] + 60
                newEnd = currentIntervals[1][0] - 60
            }

            const newInterval: [number, number] = [newStart, newEnd]
              if (!isOverlapping(currentIntervals, newInterval)) {
                newIntervals[day] = [...currentIntervals, newInterval].sort((a, b) => a[0] - b[0])
                const updatedIntervals = newIntervals[day].map(interval => ({start_hour: convertMinutesToTime(interval[0]), end_hour: convertMinutesToTime(interval[1])}))
                setHours(prevHours => ({...prevHours as OrganizationData,business_hours: {...(prevHours as OrganizationData).business_hours, [day]: updatedIntervals}}))
            }
            return newIntervals
        })
    }

    //DELETE INTERVAL
    const deleteInterval = (day: string, index: number) => {
        setSelectedIntervals(prevIntervals => {
            const newIntervals = { ...prevIntervals }
            const currentIntervals = newIntervals[day] || []
            currentIntervals.splice(index, 1)
            newIntervals[day] = [...currentIntervals]
            const updatedIntervals = newIntervals[day].map(interval => ({start_hour: convertMinutesToTime(interval[0]), end_hour: convertMinutesToTime(interval[1])}))
            setHours(prevHours => ({...prevHours as OrganizationData,business_hours: {...(prevHours as OrganizationData).business_hours, [day]: updatedIntervals}}))            
            return newIntervals
        })
    }
    
    //DELETE AN INTERVAL

    return (<> 
    {selectedIntervals && <Box  px='2vw'> 
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, index) => {            
                return (
                <Box key={`day-${index}`} position={'relative'}> 
                    <Text fontWeight={'semibold'} mt='2vh'>{t(`WeekDay${index + 1}`)}</Text>
                    <IntervalComponent day={day} intervals={selectedIntervals[day]} handleSliderChange={handleSliderChange} addInterval={addNewInterval} deleteInterval={deleteInterval}/>
                </Box>)
            })}
        </Box>
        }
    </>)

}

 
const IntervalComponent = ({day, intervals, handleSliderChange, addInterval, deleteInterval}:{day:string, intervals:[number, number][],handleSliderChange:any, addInterval:any, deleteInterval:any}) => {
        
    //SLIDER REF
    const sliderRef = useRef<HTMLDivElement>(null)
    const [isInitialized, setIsInitialized] = useState(false);
    useEffect(() => {if (sliderRef.current) setIsInitialized(true)}, [sliderRef.current])

     //HOVER LOGIC
    const [hoveredSide, setHoveredSide] = useState<{left:number, type:'delete' | 'add', index?:number, pos?:'left' | 'right' | null}| null>(null)    
  
    //GET THE ABSOLUTE LEFT POSITION
    const getLeftPosition = (value:number) => {
        const sliderWidth = sliderRef.current?.getBoundingClientRect().width || 0
        return (value * sliderWidth) / 1440
    }
    
    //SHOW ACTINOS ON HOVERING
    const handleHover = (e: React.MouseEvent<HTMLDivElement>) => {
        const sliderWidth = sliderRef.current?.getBoundingClientRect().width || 0
        const sliderLeft = sliderRef.current?.getBoundingClientRect().left || 0
        const mouseX = e.clientX - sliderLeft
        let hoveredSide:{left:number, type:'delete' | 'add', index?:number, pos?:'left' | 'right' | null}| null = null
        if (intervals.length === 0) hoveredSide = {type: 'add', left: sliderWidth/ 2, index:0}
        else {
            const sortedIntervals = [...intervals].sort((a, b) => a[0] - b[0])

            if (sortedIntervals.length < 3) {
            // Verificar si hay espacio antes del primer intervalo para añadir un nuevo intervalo
            const firstIntervalStartPosition = (sortedIntervals[0][0] * sliderWidth) / 1440
            if (mouseX < firstIntervalStartPosition && firstIntervalStartPosition >= 120) {
                hoveredSide = {
                    type: 'add',
                    left: firstIntervalStartPosition / 2,
                    pos: 'left',
                }
            }

            // Verificar espacios entre intervalos consecutivos
            for (let i = 0; i < sortedIntervals.length - 1; i++) {
                const currentEndPosition = (sortedIntervals[i][1] * sliderWidth) / 1440
                const nextStartPosition = (sortedIntervals[i + 1][0] * sliderWidth) / 1440
                const spaceInMinutes = sortedIntervals[i + 1][0] - sortedIntervals[i][1];

                if (currentEndPosition < mouseX && mouseX < nextStartPosition && spaceInMinutes >= 120) {
                    hoveredSide = {
                        type: 'add',
                        left: currentEndPosition + (nextStartPosition - currentEndPosition) / 2,
                        pos: null,
                        index: i,
                    }
                }
            }

            // Verificar si hay espacio después del último intervalo
            const lastIntervalEndPosition = (sortedIntervals[sortedIntervals.length - 1][1] * sliderWidth) / 1440;
            const lastIntervalEndMinutes = sortedIntervals[sortedIntervals.length - 1][1];
            if (mouseX > lastIntervalEndPosition && 1440 - lastIntervalEndMinutes >= 120) {
                hoveredSide = {
                    type: 'add',
                    left: sliderWidth - (sliderWidth - lastIntervalEndPosition) / 2,
                    pos: 'right',
                }
            }
        }

            // Si el cursor está dentro de un intervalo, mostrar la opción de eliminar
            sortedIntervals.forEach((interval, index) => {
                const intervalStartPosition = (interval[0] * sliderWidth) / 1440
                const intervalEndPosition = (interval[1] * sliderWidth) / 1440

                if (intervalStartPosition < mouseX && mouseX < intervalEndPosition) {
                    hoveredSide = {
                        type: 'delete',
                        left: intervalStartPosition + (intervalEndPosition - intervalStartPosition) / 2,
                        index,
                    }
                }
            })
        }
    
        setHoveredSide(hoveredSide)
    }

    //DRAG AND DROP LOGIC
    const [dragging, setDragging] = useState<{ index: number, side: 'start' | 'end' } | null>(null)
    const handleMouseDown = (index: number, side: 'start' | 'end') => {setDragging({ index, side })}
    const roundToNearest15 = (value: number) => {return Math.min(1439, Math.round(value / 15) * 15)}
    // Manejar arrastre
    const handleMouseMove = (e: MouseEvent) => {
        if (!dragging || !sliderRef.current) return
        const sliderWidth = sliderRef.current.clientWidth
        const rect = sliderRef.current.getBoundingClientRect()
        const offsetX = e.clientX - rect.left
        const minutes = roundToNearest15(Math.max(0, Math.min(1439, Math.round((offsetX / sliderWidth) * 1439))))
        const newIntervals = [...intervals[dragging.index]]
        const [start, end] = newIntervals

        handleSliderChange(day, dragging.index, dragging.side === 'start'? [Math.min(minutes, end - 15), end] : [start, Math.max(minutes, start + 15)])
    }
    const handleMouseUp = () => {setDragging(null)}
    useEffect(() => {
        if (dragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        } else {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [dragging])

    return (<> 
    <Box ref={sliderRef}  w={'100%'} height={'30px'} py='10px' onMouseEnter={(e) => handleHover(e)} onMouseLeave={() => {setHoveredSide(null)}}> 

       <AnimatePresence> 
            {(hoveredSide && !dragging) && 
                <MotionBox initial={{ opacity: 0, marginBottom:10}} animate={{ opacity: 1, marginBottom: 0}}  exit={{ opacity: 0,marginBottom:10}} transition={{ duration: '.2', ease: 'easeOut'}} display='flex' alignItems={'center'} justifyContent={'center'}
                bottom={'-60%'} onClick={() => {if (hoveredSide.type === 'delete') deleteInterval(day, hoveredSide.index);else addInterval(day, hoveredSide.pos);setHoveredSide(null)}} cursor={'pointer'} left={hoveredSide.left} width={'30px'} height={'30px'} overflow={'scroll'} gap='10px'fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.3rem'}>
                    <Icon boxSize={'20px'} as={hoveredSide.type === 'delete'?HiTrash:FaPlus} color={hoveredSide.type === 'delete'?'red':'brand.text_blue'}/>
                </MotionBox>
            }
        </AnimatePresence> 

        <Box position='relative' mt='10px' width={'100%'} bg='brand.gray_1' height={'7px'} borderRadius={'.5rem'}>
            {intervals.map((interval, index) => (
                <Fragment key={`interval-${index}`}> 
                    <Box position="absolute" bg="brand.text_blue" height="7px"  zIndex={10} borderRadius=".5rem" left={getLeftPosition(interval[0])} width={getLeftPosition(interval[1]) - getLeftPosition(interval[0])}/>

                    <Box ml='-10px' position='absolute' mt='-35px' zIndex={11}   left={getLeftPosition(interval[0])}> 
                        <Flex opacity={((dragging?.index === index && dragging.side === 'start') || interval[0] > 120)?1:0} display={'inline-flex'} bg='white' p='3px' ml='-25%'  boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'}  borderRadius={'.3rem'} fontWeight={'semibold'}>
                            <Text fontSize={'.9em'}> {convertMinutesToTime(interval[0])} </Text>
                        </Flex>
                        <Box onMouseDown={() => handleMouseDown(index, 'start')} cursor='pointer'  mt='5px'   borderRadius={'full'}  boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} top={'-6px'} bg='white' height={'20px'} width={'20px'}  />
                    </Box>
                    <Box position='absolute' ml='-10px' mt='-35px'zIndex={11}  left={getLeftPosition(interval[1])}> 
                        <Flex opacity={((dragging?.index === index && dragging.side === 'end') || interval[1] > 120) ?1:0}  ml='-25%' display={'inline-flex'} bg='white' p='3px'  boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'}  borderRadius={'.3rem'} fontWeight={'semibold'}>
                            <Text fontSize={'.9em'}> {convertMinutesToTime(interval[1])} </Text>
                        </Flex>
                        <Box onMouseDown={() => handleMouseDown(index, 'end')} mt='5px'cursor='pointer' borderRadius={'full'}  boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} top={'-6px'} bg='white' height={'20px'} width={'20px'}   />
                    </Box>                
                </Fragment>
            ))}
        </Box>
  
    </Box>
    </>)
}

const parseTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
}
const convertMinutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60).toString().padStart(2, '0')
    const mins = (minutes % 60).toString().padStart(2, '0')
    return `${hours}:${mins}`
}

const isOverlapping = (intervals: [number, number][], newInterval: [number, number]) => {return intervals.some(([start, end]) => !(newInterval[1] <= start || newInterval[0] >= end))}
