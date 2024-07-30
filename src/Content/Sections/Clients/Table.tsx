/* 
    TABLE FOR SHOW TICKETS DATA
*/

//REACT
import { useState, useMemo, useRef, useEffect, Fragment } from "react"
import { useNavigate } from "react-router-dom"
import { useSession } from "../../../SessionContext"
//FRONT
import { Flex, Box, Text, Icon, Tooltip } from '@chakra-ui/react'
//ICONS
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io'
//FUNCTIONS
import timeAgo from "../../Functions/timeAgo"
import timeStampToDate from "../../Functions/timeStampToString"
import copyToClipboard from "../../Functions/copyTextToClipboard"
//TYPING
import { columnsClientsMap, ContactChannel, languagesFlags, contactDicRegex, logosMap, ClientColumn, ClientData, Channels } from "../../Constants/typing" 
  
//TYPING
interface TableProps{
    data: ClientData[] | undefined
    updateData:any
    maxWidth:string
    filters:{page_index:number, channel_types:Channels[], search?:string, sort_by?:ClientColumn, order?:'asc' | 'desc'}
    currentIndex?:number
}


//GET THE CELL STYLE
const CellStyle = ({ column, element }:{column:ClientColumn, element:any}) => {

if (column === 'created_at' ||  column === 'last_interaction_at' )  
return(
    <Tooltip  label={timeStampToDate(element as string)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='sm' p='6px'> 
        <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{timeAgo(element as string)}</Text>
    </Tooltip>)
else if (column === 'labels') {
        return(<> 
        <Flex minH={'35px'} alignItems={'center'}> 
        {element === ''? <Text>-</Text>:
            <Flex gap='5px' flexWrap={'wrap'}>
                {element.split(',').map((label:string, index:number) => (
                    <Flex bg='gray.200' borderColor={'gray.300'} borderWidth={'1px'} p='4px' borderRadius={'.5rem'} fontSize={'.8em'} key={`client-label-${index}`}>
                        <Text>{label}</Text>
                    </Flex>
                ))}
            </Flex>
        }
        </Flex>
    </>)
}
else if (column === 'language') {
    return(
    <Flex gap='5px' alignItems={'center'}>
        <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][0]:'No detectado'}</Text>
        <Text fontSize={'.8em'}>{typeof element === 'string' && element in languagesFlags ?languagesFlags[element][1]:'🏴󠁥󠁳󠁣󠁴󠁿'}</Text>
        </Flex>)
}   
else if (column === 'is_blocked') return <Text color={element?'red':'black'}>{element?'Bloqueado':'Activo'}</Text>  
else return ( <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'}  fontWeight={column === 'name'?'medium':'normal'}  overflow={'hidden'} >{element === ''?'-':element}</Text>)
}

//MAIN FUNCTION
const Table = ({ data, updateData, maxWidth, filters, currentIndex = -1 }:TableProps ) =>{
     
    //NAVIGATE FUNCTION
    const navigate = useNavigate()
    const session = useSession()

    //CALCULATE DYNAMIC HEIGHT OF TABLE
    const tableBoxRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const [alturaCaja, setAlturaCaja] = useState<number>(0)
    useEffect(() => {
        const actualizarAltura = () => {
            const alturaHeader = headerRef.current ? headerRef.current.getBoundingClientRect().bottom : 100;
            const alturaCalculada = window.innerHeight * 0.97 - alturaHeader
            setAlturaCaja(alturaCalculada)
        }
        actualizarAltura()
        window.addEventListener('resize', actualizarAltura)
        return () => {window.removeEventListener('resize', actualizarAltura)}
    }, [])

    //OBTAIN COLUMNS
    const excludeKeys = ['id', 'contact_business_id', 'phone_number', 'email_address', 'instagram_username', 'webchat_uuid', 'google_business_review_id']
    const columns = useMemo(() => {
        return data?.length
          ? Object.keys(data[0]).filter((key) => !excludeKeys.includes(key))
          : []
      }, [data])
    const totalWidth = useMemo(() => {return columns.reduce((acc, value) => acc + columnsClientsMap[value as ClientColumn][1] + 20, 0) + 20 + 150}, [columns])

    const [selectedIndex, setSelectedIndex] = useState<number>(currentIndex)
    useEffect(() => {setSelectedIndex(currentIndex)},[currentIndex])

    const scrollIntoView = (index: number) => {

        if (tableBoxRef.current) {
          const item = tableBoxRef.current.querySelector(`[data-index="${index}"]`)
          if (item) {
            const itemTop = (item as HTMLElement).offsetTop - tableBoxRef.current.getBoundingClientRect().top
            const itemBottom = itemTop + (item as HTMLElement).offsetHeight
            const containerTop = tableBoxRef.current.scrollTop
            const containerBottom = containerTop + tableBoxRef.current.offsetHeight
        
            console.log(itemTop)
            console.log(itemBottom)

            if (itemTop < containerTop) tableBoxRef.current.scrollTop = itemTop
            else if (itemBottom > containerBottom) tableBoxRef.current.scrollTop = itemBottom - tableBoxRef.current.offsetHeight
        }
      }}

    useEffect(() => {
        const handleKeyDown = (event:KeyboardEvent) => {
            if (event.code === 'ArrowUp') {
                setSelectedIndex(prev => {
                    const newIndex = Math.max(prev - 1, 0);
                    scrollIntoView(newIndex)
                    return newIndex
                  })
            }
            else if (event.code === 'ArrowDown') 
             setSelectedIndex(prev => {
                const newIndex = Math.min(prev + 1, (data?.length || 0) - 1);
                scrollIntoView(newIndex)
                return newIndex
              })
         
            else if (event.code === 'Enter' && data) clickRow(data[selectedIndex]?.id, selectedIndex)
        }
        
        window.addEventListener('keydown', handleKeyDown)

        return () => {window.removeEventListener('keydown', handleKeyDown)}
    }, [selectedIndex, data])

  
    //SORT LOGIC
    const requestSort = (key: string) => {
        const direction = (filters.sort_by === key && filters.order === 'asc') ? 'desc' : 'asc';
        updateData({...filters, sort_by: key as ClientColumn, order: direction as 'asc' | 'desc'})
     }
    const getSortIcon = (header: string) => {
        if (filters.sort_by === header) return filters.order === 'asc' ? <IoMdArrowDropup size='20px' /> : <IoMdArrowDropdown size='20px' />
        return null
    }


    const clickRow = (id:number, index:number) => {
        session.dispatch({type:'UPDATE_CLIENTS_TABLE_SELECTED_ITEM', payload:{index}})
        navigate(`/clients/client/${id}`)
    }

    //FRONT
    return(
    
    <Box maxW={maxWidth} overflow={'scroll'} >
                
    {data === undefined || data.length === 0 ? 
        <Flex borderRadius={'.5rem'}  bg='gray.50' borderColor={'gray.200'} borderWidth={'1px'} p='15px'>    
            <Text fontWeight={'medium'} fontSize={'1.1em'}>No hay clientes disponibles</Text>
        </Flex>:
         <> 
            <Flex ref={headerRef}  borderColor={'gray.300'}  borderTopRadius={'.5rem'} borderWidth={'1px'}minWidth={`${totalWidth}px`}  gap='20px' alignItems={'center'}  color='gray.500' p='10px' fontSize={'.9em'} bg='gray.100' fontWeight={'medium'}> 
                {Object.keys(columnsClientsMap).map((column, index) => (
                <Fragment key={`clients-header-${index}`}> 
                    {(column !== 'id' && column !== 'contact_business_id' && column !== 'email_address' && column !== 'instagram_username' && column !== 'webchat_uuid' && column !== 'phone_number' && column !== 'google_business_review_id') && 
                        <Flex  gap='2px' alignItems={'end'} flex={`${columnsClientsMap[column][1]/10} 0 ${columnsClientsMap[column][1]}px`}> 
                            <Text cursor='pointer' onClick={() => requestSort(column)}>{columnsClientsMap[column][0]}</Text>
                            {getSortIcon(column)}
                        </Flex>
                    }
                </Fragment>))}
            </Flex>
            <Box minWidth={`${totalWidth}px`} overflowX={'hidden'}  overflowY={'scroll'} ref={tableBoxRef} maxH={alturaCaja}> 
                {data.map((row:any, index) => (         
                    <Flex overflow={'hidden'} data-index={index}  alignItems={'center'} position={'relative'}  key={`clients-row-${index}`}  onClick={() => clickRow(row.id, index)} cursor='pointer' borderRadius={index === data.length - 1?'0 0 .5rem .5rem':'0'} borderWidth={'0 1px 1px 1px'} borderColor={'gray.300'} bg={selectedIndex === index ? 'blue.50':index%2 === 1?'#FCFCFC':'white'} gap='20px' fontSize={'.9em'} color='black' p='10px' _hover={{bg:'blue.50'}} > 
                        {selectedIndex === index && <Box position='absolute' left={0} top={0} height={'100%'} width={'2px'} bg='blue.400'/>}

                        {Object.keys(columnsClientsMap).map((column:string, index2:number) => {
                            
                            const cellKey = `clients-cell-${index}-${index2}`;

                            if (column ==='contact') return (
                            <Flex key={cellKey} alignItems={'center'} gap='10px' flex={`15 0 150px`}> 
                                {Object.keys(row).map((channel, index3) => (
                                    <Fragment key={`labels-clients-table-${index}-${index2}-${index3}`}> 
                                        {(Object.keys(contactDicRegex).includes(channel as ContactChannel))  &&  row[channel as ContactChannel] &&  row[channel as ContactChannel] !== '' &&
                                        <Tooltip label={row[channel as ContactChannel]}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='sm' p='6px'> 
                                            <Flex alignItems={'center'}  key={`labels-clients-table-flex-${index}-${index2}-${channel}${index3}`} cursor='pointer' onClick={(e) => {e.stopPropagation();copyToClipboard(row[channel as ContactChannel] || '')}}> 
                                                <Icon boxSize={'16px'} color={'gray.600'} as={logosMap[contactDicRegex[channel as ContactChannel][3]][1]}/>
                                            </Flex>
                                        </Tooltip>}
                                    </Fragment>
                                ))}
                            </Flex>)
                            else if (!row
                                .hasOwnProperty(column)) return null

                            else return (
                            <Fragment key={cellKey}> 
                            {(column !== 'id' && column !== 'contact_business_id' &&  column !== 'google_business_review_id' && column !== 'email_address' && column !== 'instagram_username' && column !== 'webchat_uuid' && column !== 'phone_number') && 
                                <Flex  minW={0}  gap='2px' alignItems={'center'} flex={`${columnsClientsMap[column][1]/10} 0 ${columnsClientsMap[column][1]}px`}> 
                                    <CellStyle column={column as ClientColumn} element={row[column as ClientColumn]} />
                                </Flex>
                                }
                            </Fragment>)
                            })
                        }
                    </Flex>
                ))} 
            </Box>

        </>
    }
    </Box>
        )
}

export default Table
 