//REACT
import { useTranslation } from "react-i18next"
import { useState, useMemo, useRef, useEffect, Fragment, Dispatch, SetStateAction, useCallback, ReactElement } from "react"
import { useLocation } from "react-router-dom"
//FRONT
import { motion, isValidMotionProp } from 'framer-motion'
import { Flex, Box, Text, IconButton, Skeleton, Icon , chakra, shouldForwardProp } from '@chakra-ui/react'
import { FixedSizeList as List } from 'react-window'
import '../styles.css'
//COMPONENTS
import CustomCheckbox from "./CheckBox"
//ICONS
 import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io'
import { HiTrash } from "react-icons/hi2" 
import { FaMagnifyingGlass } from "react-icons/fa6"
 
//TYPING
interface TableProps{
    data: any[] | null | undefined
    CellStyle:React.FC<{  column: string, element: any }>
    noDataMessage:string 
    columnsMap:{[key:string]:[string, number]}
    requestSort?:(column: string) => void
    getSortIcon?:(column: string) => boolean | null
    excludedKeys?:string[]
    onClickRow?:(value:any, index:number) => void
    onlyOneSelect?:boolean
    selectedElements?:number[]
    setSelectedElements?:Dispatch<SetStateAction<number[]>>
    onSelectAllElements?:() =>void
    currentIndex?:number
    deletableFunction?:(value:any, index:number) => void
    height?:number 
    showAccRow?:boolean
    accMessage?:string
    accColumn?:string
    waitingInfo?:boolean
    onFinishScroll?:any
    numberOfItems?:any
    deletableIcon?:ReactElement
}
    

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})
 
//MAIN FUNCTION
const Table = ({ data, CellStyle, noDataMessage, requestSort, getSortIcon,  columnsMap, excludedKeys = [], onClickRow, selectedElements, onlyOneSelect = false, setSelectedElements, onSelectAllElements, currentIndex = -1, deletableIcon, deletableFunction, height, showAccRow, accMessage, accColumn, waitingInfo, onFinishScroll, numberOfItems }:TableProps ) =>{

    //CALCULATE DYNAMIC HEIGHT OF TABLE
    const { i18n } = useTranslation('settings')
    const tableBoxRef = useRef<HTMLDivElement>(null)
    const location = useLocation().pathname as string
    const headerRef = useRef<HTMLDivElement>(null)
    const dateRef = useRef<any>()
    const [selectedIndex, setSelectedIndex] = useState<number>(currentIndex)
    useEffect(()=>{setSelectedIndex(currentIndex)} ,[currentIndex])
    const [boxHeight, setBoxHeight] = useState<number>(1000)
    useEffect(() => {
        const updateHeight = () => {
            if (headerRef.current) {
                const alturaCalculada =  ((window.innerHeight - headerRef.current?.getBoundingClientRect().top ) - window.innerWidth * 0.02 - 45)
                setBoxHeight(alturaCalculada)
            }
        } 
        updateHeight()
        window.addEventListener('resize', updateHeight)
        return () => {window.removeEventListener('resize', updateHeight)}
    }, [selectedElements, headerRef.current])

    //CALCULATE INTERNAL SORTING
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({key: '', direction: null})

    //SCROLL ON CHANGING TO AN ELEMENT OUT OF THE SCROLL VIEW
    const scrollIntoView = (index: number) => {
        if (tableBoxRef.current) {
            const item = tableBoxRef.current.querySelector(`[data-index="${index}"]`)
            if (item) {
                const container = tableBoxRef.current
                const itemTop = (item as HTMLElement).offsetTop - container.getBoundingClientRect().top + container.scrollTop
                const itemBottom = itemTop + (item as HTMLElement).offsetHeight
                const containerTop = container.scrollTop
                const containerBottom = containerTop + container.offsetHeight
                if (itemTop < containerTop) container.scrollTop = itemTop
                else if (itemBottom > containerBottom) container.scrollTop = Math.min(itemBottom - container.offsetHeight, container.scrollHeight - container.offsetHeight)
            }
        }
    }

    useEffect(() =>{dateRef.current = data},[data])
   
    //SHORTCUTS
    useEffect(() => {
        const handleKeyDown = (event:KeyboardEvent) => {
            if (event.code === 'ArrowUp') {
                event.preventDefault()
                setSelectedIndex(prev => {
                    const newIndex = Math.max(prev - 1, 0)
                    scrollIntoView(newIndex)
                    return newIndex
                  })
            }
            else if (event.code === 'ArrowDown') {
                event.preventDefault()
                setSelectedIndex(prev => {
                    const newIndex = Math.min(prev + 1, (data?.length || 0) - 1);
                    scrollIntoView(newIndex)
                    return newIndex
                })
            }
            else if (event.code === 'Space' && data && 0 <= selectedIndex && selectedIndex   <= data.length - 1 && selectedElements && isNaN(parseInt((location as string)?.split('/')?.at(-1) || ''))) {
                event.preventDefault()
                handleCheckboxChange(selectedIndex, !selectedElements.includes(selectedIndex))
            }
            else if (event.code === 'Enter' && data && onClickRow) onClickRow(data[selectedIndex], selectedIndex)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => {window.removeEventListener('keydown', handleKeyDown)}
    }, [selectedIndex, selectedElements, data, location])


    //OBTAIN COLUMNS
    const columns = useMemo(() => {

        let columnsToWork:any
        if (!data) columnsToWork =  columnsMap
        else {
            if (data.length > 0) columnsToWork = data[0]
            else return []
        }

        const keys = Object.keys(columnsToWork).filter((key) => ![...excludedKeys].includes(key))
        const orderedColumns = keys
          .filter(key => key in columnsMap)
          .sort((a, b) => Object.keys(columnsMap).indexOf(a) - Object.keys(columnsMap).indexOf(b))
        const otherColumns = keys.filter(key => !(key in columnsMap))
        return [...orderedColumns, ...otherColumns]
      }, [data])

    const totalWidth = useMemo(() => {
        return columns.reduce((acc, value) => {
            const columnWidth = columnsMap?.[value]?.[1] || 180
          return acc + columnWidth + 20
        }, 0) + 20 + (selectedElements ? 58 : 0) + (deletableFunction ? 100 : 0)
      }, [columns])
      
    //HANDLE SCROLL
    const [waitingNewItems, setWaitingNewItems] = useState<boolean>(false)
    const handleScroll = async () => {
        if (!tableBoxRef.current) return

        const { scrollTop, scrollHeight, clientHeight } = tableBoxRef.current;
        if (numberOfItems && onFinishScroll && scrollTop + clientHeight >= scrollHeight - 10 && (dateRef.current?.length || 0)%25 < numberOfItems%25 - 1) {
            setWaitingNewItems(true)
            await onFinishScroll()
            setWaitingNewItems(false)

        }
      }
    
    useEffect(() => {
    const table = tableBoxRef.current
    if (table) table.addEventListener("scroll", handleScroll)
    
    return () => {
        if (table) {
        table.removeEventListener("scroll", handleScroll)
        }
    };
    }, [waitingInfo])

      const renderSkeletons = () => {
        return Array(5).fill(0).map((_, index) => (
            <Flex key={`skeleton-row-${index}`} height="45px" gap="20px" minWidth={`${totalWidth}px`} borderWidth="0 0px 1px 0px" alignItems="center" p="10px" borderColor="gray.200" bg={'transparent'}>
            {selectedElements && (
                <Flex>
                <Skeleton height="20px" width="20px" borderRadius="4px" />
                </Flex>
            )}
            {columns.map((column, colIndex) => (
                <Flex key={`skeleton-cell-${index}-${colIndex}`} minW={0} alignItems="center" flex={`${(columnsMap?.[column]?.[1] || 180) / 10} 0 ${columnsMap?.[column]?.[1] || 180 }px`}>
                <Skeleton height="16px" width="70%" />
                </Flex>
            ))}
            {deletableFunction && (
                <Flex width="60px">
                <Skeleton height="20px" width="20px" borderRadius="4px" />
                </Flex>
            )}
            </Flex>
          ));
      }

    //CHECKBOXES LOGIC
    const handleCheckboxChange = useCallback((element:number, isChecked:boolean) => {
        if (selectedElements && setSelectedElements) {
            if (isChecked) {
                if (onlyOneSelect) setSelectedElements([element])
                else setSelectedElements(prevElements=> [...prevElements, element])
            }
            else setSelectedElements(prevElements => prevElements.filter(el => el !== element))
        }
    }, [selectedElements, setSelectedElements, onlyOneSelect])
    
    //SORT LOGIC FOR TABLES THAT HAVE ALL THE AVAILABLE DATA
    const requestInternalSort = (column: string) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig.key === column && sortConfig.direction === 'asc') direction = 'desc'
        if (requestSort) requestSort(column)
        else setSortConfig({ key: column, direction })

     }
    const getInternalSortIcon = (column: string) => {
        if (getSortIcon) return getSortIcon(column)
        if (sortConfig.key === column) {
            if (sortConfig.direction === 'asc') return true
            else if (sortConfig.direction === 'desc') return false
        }
        else return null    
    }

    //SORTED DATA
    const sortedData = useMemo(() => {
        if (sortConfig.key && data) {
          return [...data].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0
          })
        }
        return data
    }, [data, sortConfig])

    const dataToWork = (requestSort)? data : sortedData

    //FRONT
    return(
        <>  
       
        <Box  ref={headerRef}  width={'100%'}  overflowX={'scroll'}>    

            {(data && dataToWork && !waitingInfo) ?  
                <>
                    {data.length === 0  ?
                    <Flex alignItems={'center'} justifyContent={'center'}  h={height?height:boxHeight}   color='gray.600' flexDir={'column'}> 
                        <Icon boxSize={'30px'} as={FaMagnifyingGlass}/>
                        <Text mt='1vh' fontSize={'1em'} fontWeight={'medium'} >{noDataMessage}</Text>
                    </Flex>
                    :        
                    <motion.div initial={{ opacity: 0 }}  animate={{ opacity: 1 }} transition={{ duration: 0.1, ease: "easeOut" }} style={{ minWidth: `${totalWidth}px`  }}> 
                        <Box pl={selectedElements ? '2vw':''}> 
                            <Flex  position={'sticky'} minWidth={`${totalWidth}px`}  borderBottomWidth={'1px'} gap='20px' alignItems={'center'}  color='gray.600' px='10px' h='45px' fontSize={'.9em'} > 
                             
                                {columns.filter(column => column !== 'id').map((column) => (
                                    <Fragment key={`header-${column}`}>
                                        {column in data[0] &&
                                        <Flex minW={0}  alignItems={'center'} flex={`${(columnsMap?.[column]?.[1] || 180)/10} 0 ${(columnsMap?.[column]?.[1] || 180)}px`}> 
                                            <Text fontWeight={'medium'} color='gray.600' cursor='pointer' onClick={() => requestInternalSort(column)}>{columnsMap?.[column]?.[0] || column}</Text>
                                            {getInternalSortIcon(column) === null ? null : getInternalSortIcon(column) ? <IoMdArrowDropup size='20px' /> : <IoMdArrowDropdown size='20px' />}
                                        </Flex>}
                                    </Fragment>
                                ))}
                                {deletableFunction && <Flex width={'60px'}/>}
                            </Flex>
                        </Box>
                       
                        <Box  position={'relative'} minWidth={`${totalWidth}px`} ref={tableBoxRef} overflowY={'scroll'} transition="max-height ease-in .15s" maxH={height?height:boxHeight}> 
                          
                            <List height={height?height:boxHeight} style={{overflow:'auto', padding:selectedElements ?'0 0 0 2vw':''}} itemCount={data?.length || 0} itemSize={50} width={Math.max(totalWidth, tableBoxRef.current?.getBoundingClientRect().width || 0) - window.innerWidth * 0.02}> 
                                {({ index, style }) => (
                                    <RowComponent key={`row-${index}`} row={dataToWork[index]} index={index} selectedIndex={selectedIndex} deletableIcon={deletableIcon} selectedElements={selectedElements} handleCheckboxChange={handleCheckboxChange} columnsMap={columnsMap} columns={columns} deletableFunction={deletableFunction} CellStyle={CellStyle} totalWidth={totalWidth} onClickRow={onClickRow} excludedKeys={excludedKeys}/>
                                )} 
                            </List>
                            {waitingNewItems && renderSkeletons()}
                            {showAccRow && 
                            <Flex height={'45px'}zIndex={1000} fontSize={'.9em'}  bottom={0} bg='brand.gray_2' gap='20px'minWidth={`${totalWidth}px`}  borderRadius={'0 0 .5rem .5rem'} borderWidth={'0 1px 1px 1px'}  fontWeight={'medium'} alignItems={'center'} color='black' p='10px'>
                                <Text flex={`${(columnsMap?.[accColumn || '']?.[1] || 180) / 10} 0 ${(columnsMap?.[accColumn || '']?.[1] || 180)}px`}>{accMessage}</Text>
                                {columns.filter(column => column !== accColumn).map((column: string, index: number) => {
                                    const sum = dataToWork.reduce((acc: number, row: any) => {
                                        const value = row[column]
                                        return typeof value === 'number' ? acc + value : acc;
                                    }, 0)
                                    return (
                                        <Flex key={`sum-${index}`} minW={0} alignItems={'center'} flex={`${(columnsMap?.[column]?.[1] || 180) / 10} 0 ${(columnsMap?.[column]?.[1] || 180)}px`}>
                                            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>
                                                {sum.toLocaleString(`${i18n.language}-${i18n.language.toLocaleUpperCase()}`, {minimumFractionDigits:0, maximumFractionDigits:2})}
                                            </Text>
                                        </Flex>
                                    )
                                })}
                            </Flex>}

                        </Box>
           
                    </motion.div>
                }
                </>
            :
            <Box minWidth={`${totalWidth}px`}>

                <Box px={selectedElements ? '2vw':''}> 

                    <Flex position="sticky" minWidth={`${totalWidth}px`} borderBottomWidth="1px" gap="20px" alignItems="center" color="gray.600" p="10px" fontSize=".9em">
                    {selectedElements && (<Box><Skeleton height="20px" width="20px" borderRadius="4px" /></Box>)}
                    
                    {columns.filter((column) => column !== "id").map((column) => (
                        <Flex key={`skeleton-header-${column}`} minW={0} alignItems="center" flex={`${(columnsMap?.[column]?.[1] || 180) / 10} 0 ${columnsMap?.[column]?.[1] || 180}px`}>
                        <Skeleton height="20px" width="80%" />
                        </Flex>
                    ))}
                    {deletableFunction && <Flex width="60px" />}
                    </Flex>
                            
                </Box>
                <Box px={selectedElements ? '2vw':''} position="relative" minWidth={`${totalWidth}px`} overflowX="hidden" overflowY="scroll" maxH={height || boxHeight} >
                {Array.from({ length: 20 }).map((_, rowIndex) => (
                    <Flex key={`skeleton-row-${rowIndex}`} height="45px" gap="20px" minWidth={`${totalWidth}px`} borderWidth="0 0px 1px 0px" alignItems="center" p="10px" borderColor="gray.200" bg={'transparent'}>
                    {selectedElements && (
                        <Flex>
                        <Skeleton height="20px" width="20px" borderRadius="4px" />
                        </Flex>
                    )}
                    {columns.map((column, colIndex) => (
                        <Flex key={`skeleton-cell-${rowIndex}-${colIndex}`} minW={0} alignItems="center" flex={`${(columnsMap?.[column]?.[1] || 180) / 10} 0 ${columnsMap?.[column]?.[1] || 180 }px`}>
                        <Skeleton height="16px" width="70%" />
                        </Flex>
                    ))}
                    {deletableFunction && (
                        <Flex width="60px">
                        <Skeleton height="20px" width="20px" borderRadius="4px" />
                        </Flex>
                    )}
                    </Flex>
                ))}
                </Box>
            </Box>
        
            }
            
        </Box>
    
    </> )
}

export default Table
 
//ROW STYLES
const RowComponent = ({row, index, selectedIndex, selectedElements, handleCheckboxChange, columnsMap, columns, deletableFunction, deletableIcon, CellStyle, totalWidth, onClickRow, excludedKeys}:{row:any, index:number,selectedIndex:number, selectedElements:any, handleCheckboxChange:any, columnsMap:any, columns:string[], deletableFunction:any, deletableIcon:ReactElement | undefined, CellStyle:any, totalWidth:number, onClickRow:any, excludedKeys:string[]}) => {
    const [isHovering, setIsHovering] = useState<boolean>(false)
    const rowRef = useRef<HTMLDivElement>(null)

    return (<>
      <Flex height={'45px'} ref={rowRef}   px='10px' data-index={index}  borderRadius={'.5rem'} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} position={'relative'}  gap='20px' minWidth={`${totalWidth}px`}  cursor={onClickRow?'pointer':'normal'} onClick={() => {if (onClickRow) onClickRow(row, index)}} key={`row-${index}`}   bg={((selectedElements || []).includes(index) || selectedIndex === index)?'white':'transparent'} alignItems={'center'}  fontSize={'.9em'} color='black'   _hover={{bg:((selectedElements || []).includes(index) || selectedIndex === index)?'white':'brand.hover_gray_white'}} 
        borderWidth={'1px'}  borderColor={selectedIndex === index ? 'gray.200':'transparent'} transition={'box-shadow .2s ease-in-out, border-color .2s ease-in-out, background-color .2s ease-in-out'}    boxShadow={selectedIndex === index ? '0 0 3px 0px rgba(0, 0, 0, 0.1)':''} 
      > 
             
            {(selectedElements ) &&
            
                <MotionBox initial={false} animate={{opacity:(selectedElements && isHovering || (selectedElements && selectedElements.includes(index)))?1:0}} exit={{opacity:(selectedElements && isHovering || (selectedElements && selectedElements.includes(index)))?0:1}} position='absolute' top={0} w='24px' left={'-23px'} mt='2px' alignItems={'center'} h='100%' onClick={(e) => e.stopPropagation()} transition={{ duration: '.2' }} zIndex={10}> 
                     <CustomCheckbox id={`checkbox-${index}`}  onChange={() => handleCheckboxChange(index, !selectedElements.includes(index))} isChecked={selectedElements.includes(index)} />
                </MotionBox>
            }

            {columns.map((column:string, index2:number) => (
                <Fragment key={`header-${index}-${index2}`}>
                    {(!(excludedKeys.includes(column)) && column in row) && 
                        <Flex minW={0}  alignItems={'center'}  flex={`${(columnsMap?.[column]?.[1] || 180)/10} 0 ${(columnsMap?.[column]?.[1] || 180)}px`}> 
                            {(columnsMap?.[column] !== undefined) ?
                            <CellStyle column={column} element={row[column]}/>
                            :
                            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{String(row[column])}</Text>
                            }
                    </Flex>}
                </Fragment>))}
            {deletableFunction && 
            <Flex width={'60px'}  onClick={(e) => e.stopPropagation()}>
                <IconButton size={'sm'} bg='transparent' variant={deletableIcon?'common':'delete'}  icon={deletableIcon? deletableIcon: <HiTrash size={'20px'}/>} aria-label="delete-row" onClick={() => deletableFunction(row, index)}/>
            </Flex>
        }
    </Flex>
    <Box bg={'gray.200'} h='1px' w='100%'/>
    </>
    )
}
