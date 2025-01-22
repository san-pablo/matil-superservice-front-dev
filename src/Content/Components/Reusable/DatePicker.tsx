//REACT
import { useState, useRef, CSSProperties } from "react"
import { useTranslation } from "react-i18next"
 //FRONT
import { Box, Input, InputGroup, InputRightElement, Icon, Portal, chakra, shouldForwardProp, Flex, IconButton, Text } from "@chakra-ui/react"
import "../styles.css"
//COMPONENTS
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { motion, isValidMotionProp, AnimatePresence } from 'framer-motion'
//FUNCTIONS
import useOutsideClick from "../../Functions/clickOutside"
import determineBoxStyle from "../../Functions/determineBoxStyle"
//ICONS
import { FaCalendar } from "react-icons/fa6"
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io"

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//MAIN FUNCTION
const DateRangePicker = ({ dateRangeString, onDateChange }: { dateRangeString: string; onDateChange: (dateRangeStr: string) => void }) => {

    //CONSTANTS
    const { i18n } = useTranslation()
    const { t } = useTranslation('settings')
    const t_formats = useTranslation('formats').t
 
    //REFERENCE DAY
    const [activeStartDate, setActiveStartDate] = useState(new Date())
    const handleNextMonth = () => {
      const nextMonth = new Date(activeStartDate.getFullYear(), activeStartDate.getMonth() + 1, 1)
      setActiveStartDate(nextMonth)
    }
    const handlePreviousMonth = () => {
      const prevMonth = new Date(activeStartDate.getFullYear(), activeStartDate.getMonth() - 1, 1)
      setActiveStartDate(prevMonth)
    }

    //PARSE DATE RANGES
    const parseDateRangeString = (dateRangeStr: string) => {
      const [startStr, endStr] = dateRangeStr.split(" to ")
      const startDate = startStr ? new Date(startStr) : null
      const endDate = endStr ? new Date(endStr) :  null
      return [startDate, endDate]
    }
    const formatDateRangeString = (start: Date | null, end: Date | null): string => {
      const startStr = start ? start.toISOString().split("T")[0] : ""
      const endStr = end ? end.toISOString().split("T")[0] : ""
      return `${startStr} to ${endStr}`
    }

    const handleCalendarChange = (value: Date | [Date | null, Date | null] | null) => {
        if (Array.isArray(value) && value[0] && value[1]) {
            const [newStart, newEnd] = value as [Date, Date]  // Cast value to type [Date, Date]
            setDateRange([newStart, newEnd])
            onDateChange(formatDateRangeString(newStart, newEnd))
        }
    }

    // DATE RANGE
    const initialDateRange = parseDateRangeString(dateRangeString)
    const [dateRange, setDateRange] = useState([initialDateRange[0], initialDateRange[1]])

    //OPEN CALENDAR
    const endButtonRef = useRef<HTMLDivElement>(null)
    const endBoxRef = useRef<HTMLDivElement>(null)
    const [endCalendarOpen, setEndCalendarOpen] = useState<boolean>(false)
    const [endBoxStyle, setEndBoxStyle] = useState<CSSProperties>({})
    determineBoxStyle({buttonRef:endButtonRef, setBoxStyle:setEndBoxStyle, boxPosition:'right', changeVariable:endCalendarOpen})
    useOutsideClick({ref1:endButtonRef, ref2:endBoxRef, onOutsideClick:setEndCalendarOpen})
 
    return (
      <Box display="flex" gap="4">
        <AnimatePresence> 
          {endCalendarOpen && 
            <Portal> 
                <MotionBox id="custom-portal"  ref={endBoxRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '0.1', ease: 'easeOut'}}
                    style={{ transformOrigin: endBoxStyle.top ? 'top right':'bottom right' }} mt='10px' mb='10px' bg='white' boxShadow={'0 0 10px 1px rgba(0, 0, 0, 0.15)'} borderRadius={'.5rem'} zIndex={100000000} overflow={'scroll'} left={endBoxStyle.left  || undefined} right={endBoxStyle.right  || undefined} top={endBoxStyle.top || undefined}  bottom={endBoxStyle.bottom ||undefined} position='fixed' >
                        <Flex alignItems={'center'} p='10px' justifyContent={'space-between'}>
                            <IconButton isRound onClick={handlePreviousMonth} variant={'common'} size={'sm'} bg='transparent'  aria-label="month-back" icon={<IoIosArrowBack/>}/>
                            <Text>{t_formats(`months.${activeStartDate.getMonth()}`)} {activeStartDate.getFullYear()}</Text>
                            <IconButton isRound onClick={handleNextMonth}  variant={'common'} size={'sm'} bg='transparent'aria-label="month-forward" icon={<IoIosArrowForward/>}/>
                        </Flex>
                    <Calendar onChange={handleCalendarChange}   showNavigation={false}  allowPartialRange goToRangeStartOnSelect={false} activeStartDate={activeStartDate} locale={i18n.language} className={'react-calendar-2'} selectRange/>
                </MotionBox>
            </Portal>
            }
          </AnimatePresence>
          <InputGroup position={'relative'} width={'300px'}>
              <Box ref={endButtonRef}  onClick={() => setEndCalendarOpen(true)}> 
                  <Input fontSize={'1em'} userSelect="none" height={'37px'}  placeholder={t('EndDate')} value={`${dateRange[0] ? dateRange[0].toLocaleDateString() : ""} - ${dateRange[1] ? dateRange[1].toLocaleDateString() : ""}`} readOnly cursor="pointer" px='7px' _focus={{ px:'6px', borderColor: "brand.text_blue", borderWidth: "2px" }}/>
              </Box>
              <InputRightElement pointerEvents="none" right={'9px'} mt='-2px' position={'absolute'}  >
                  <Icon as={FaCalendar} color={"gray.600"} />
              </InputRightElement>
        </InputGroup>
      </Box>
    )
}

export default DateRangePicker
 