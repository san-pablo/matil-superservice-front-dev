//REACT
import { Dispatch, SetStateAction, useEffect, useRef, useState, Fragment, MutableRefObject } from 'react'
import { useTranslation } from 'react-i18next'
//FECTH DATA
import fetchData from '../../API/fetchData.js'
//FRONT
import { Flex, Icon, Box, Text, Button, Radio, chakra, shouldForwardProp, IconButton, Tooltip, Spinner } from '@chakra-ui/react'
import { motion, AnimatePresence, isValidMotionProp } from 'framer-motion'
import { Handle, Position } from 'reactflow'
//FUNCTIONS
import useOutsideClick from '../../Functions/clickOutside.js'
//ICONS
import { IoSend } from "react-icons/io5"
import { BsFillNodePlusFill, BsThreeDots, BsNodePlusFill } from 'react-icons/bs'
import { IoWarning } from "react-icons/io5"
import { FaCode, FaCodeBranch, FaPlus } from "react-icons/fa6"
import { HiTrash } from 'react-icons/hi2'
import { AiOutlineSubnode } from "react-icons/ai";

//TYPING
import { Branch, FunctionNodeData, actionTypesDefinition, parameterType, nodeTypesDefinition, typesMap } from '../../Constants/typing.js'
import LoadingIconButton from '../../Components/Reusable/LoadingIconButton.js'

//FIRST NODE DATA
interface TriggerNodeType {
  channels:string[]
  functions :{
    channelIds:any[]
    editConfigs:(id:string) => void
  }
}

//FIRST NODE DATA
interface AddNodeType {
  addNewNode:(sourceData:{sourceId:string, sourceType:nodeTypesDefinition, branchIndex?:number}, targetType:nodeTypesDefinition | '', nodeId?:string) => void
}

//BRANCHER NODE DATA
interface FunctionNodeType {
  branches:Branch[]
  data:FunctionNodeData
  functions: {
    index:number
    currentIndex:MutableRefObject<string>
    nodesWithoutConnection:{name:string, id:string}[]
    setShowNodesAction:Dispatch<SetStateAction<null | {nodeId:string, actionType:actionTypesDefinition, actionData:any}>>
    editNode:(nodeId:string | undefined, newData:FunctionNodeData) => void
    addNewNode: any
    editBranch:(nodeId:string | undefined, index:number | undefined, type:'remove' | 'add' | 'remove-branch') => void
    deleteNode:(nodeId:string, resize?:boolean, delete_branch?:boolean, isSource?:boolean,  nodeIndex?:number) => void
    getAvailableNodes?:(sourceData:{sourceId:string, branchIndex?:number}) => {id:string, index:number}[]
  }
}

//CODE BOX
const MiniBox = ({ code }:{code:string}) => {

  const ensureThreeLines = (code: string) => {
    const lines = code.split("\n");
    while (lines.length < 4) {
      lines.push("")
    }
    return lines.join("\n")
  }

  const highlightCode = (code: string) => {
    const tokens = code.split(/(\b(?:def|return|if|else|for|while|import|from|class|print|int|str|float|bool|input)\b|".*?"|'.*?'|\b\d+\b)/g);
    return tokens.map((token, index) => {
      if (/^(def|return|if|else|for|while|import|from|class|print|int|str|float|bool|input)$/.test(token)) {
        return <span key={index} style={{ color: "#c678dd" }}>{token}</span>
      }
      if (/^".*?"$|^'.*?'$/.test(token)) {
        return <span key={index} style={{ color: "#98c379" }}>{token}</span>
      }
      if (/^\d+$/.test(token)) {
        return <span key={index} style={{ color: "#d19a66" }}>{token}</span>
      }
      return token
    })
  }


  return (
    <div style={{backgroundColor: "#282c34", padding: "8px",  borderRadius: ".3rem",  fontFamily: "monospace", color: 'white', fontSize: ".6em", maxWidth: "400px", overflowX: "auto"
    }}>
      <pre>
      <code>{highlightCode(ensureThreeLines(code || ''))}</code>
      </pre>
    </div>
  )
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})
 
//FIRST NODE
export const FirstNode = ({id, data}:{id:string, data:TriggerNodeType}) => {
  
  //TRANSLATION
  const { t } = useTranslation('functions')
  
  return (<> 
    <Box width={'250px'} cursor={'default'} bg="gray.50" borderRadius={'.5rem'} borderColor='blue.100' borderWidth={'2px'} p='15px' >
        <Flex gap='10px' alignItems={'center'}> 
          <Flex justifyContent={'center'} bg='black_button' alignItems={'center'} p='10px' borderRadius={'full'}> 
              <Icon color='white' boxSize={'16px'}as={IoSend} />
           </Flex>
          <Text fontWeight={'medium'}>{t('FirstNode')}</Text>
        </Flex>
        <Box width={'100%'} height={'1px'} mt='20px' mb='20px' bg='border_color'/>
        <Text fontSize={'.8em'} fontWeight={'medium'} color='text_gray'>{t('Configs')}</Text>

        {data.functions.channelIds.map((config, index) =>  {
                  
        return (<> 
       
          <Flex maxW={'220px'}   gap='10px' mt='25px' key={`channel-${index}`} alignItems={'start'}> 
            <Radio isChecked={data.channels.includes(config)} onClick={() => data.functions.editConfigs(config)}/>
            <Box mt='-2px' flex='1' > 
              <Flex gap='5px' alignItems='center'> 
                 <Text minWidth={0} maxW={'calc(100% - 47px)'} fontWeight={'medium'} fontSize={'.8em'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{config.name}</Text>
               </Flex> 
               <Text minWidth={0} maxW={'190px'} fontSize={'.7em'} color='text_gray' whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'}>{config.description}</Text>
            </Box>
          </Flex>

        </>)
      })}
    </Box>
    <Handle position={Position.Right} type='source'style={{visibility:'hidden'}} />
  </>)
}

//NODE TO ADD THE FIRST NODE
export const AddNode = ({data}:{data:AddNodeType}) => {
 
  //TRANSLATION
  const { t } = useTranslation('functions')
 
  return (<>  
      <Box cursor={'default'}  borderStyle="dashed"  textAlign={'center'} bg="RGBA(255, 255, 255, 0.1)" borderRadius={'.5rem'} borderColor='gray.400' borderWidth={'1px'} p='15px' width='250px'>
        <Text fontSize={'.9em'} fontWeight={'medium'} color={'text_gray'}>{t('StartFlow')}</Text>
        <Text fontSize={'.7em'} color={'text_gray'}>{t('StartFlowDes')}</Text>

        <Flex position={'relative'} mt='30px'> 
          <Button size='sm' width={'100%'} leftIcon={<BsFillNodePlusFill/>} borderWidth={'1px'} borderColor={'border_color'} variant={'common'} onClick={() => data.addNewNode({sourceId:'1', sourceType:'add'}, 'function')}>{t('AddFirstNode')}</Button>
           
        </Flex>
      </Box>
      <Handle position={Position.Left} type='target' style={{position:'absolute', top:'30px', visibility:'hidden'}} />
    </>)
}
 
//EXTRACTOR NODE
export const FunctionNode = ({id, data}:{id:string, data:FunctionNodeType}) => {
  
  //CONSTANTS
  const { t } = useTranslation('functions')

  const variablesMap:{[key:string]:[string, string]} = {'boolean': ['bool', 'green'], 'integer': ['int', 'blue'], 'number': ['float', 'purple'], 'string': ['str', 'orange'],  'timestamp': ['timestamp', 'teal'], 'array': ['array', 'red']}

  //BOOLEAN FOR TOGGING THE NODE VISIBILITY
  const [isExpanded, setIsExpanded] = useState<boolean>(true)
 
  //CREATE A VARIABLE OR A PARAMETER
  const [showCreate, setShowCreate] = useState<boolean>(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  useOutsideClick({ref1:buttonRef, ref2:boxRef, onOutsideClick:setShowCreate})

  const EditorComponent = ({type, param, index}:{type:'variable' | 'param', param:{name:string, type:string, [key: string]: string}, index:number}) => {
    return(
         <Box overflow={'hidden'}  pos={'relative'} cursor={'pointer'}   mt={index === 0 ? '0':'.5vh'} boxShadow={'0 0 5px 1px rgba(0, 0, 0, 0.15)'} p='5px' borderRadius={'.3rem'}   key={`variable-${index}`} onClick={() => {data.functions.setShowNodesAction({nodeId:id, actionType:'code', actionData:{type, index, id:data.data.id }}); data.functions.currentIndex.current = id }}>
          <Flex pos={'absolute'} zIndex={0} left={'0'} top={0} bg={type === 'param' ? '#4A5568':'red'} w='3px' h='100%'/>
          <Text ml='3px' fontFamily={'monospace'} fontWeight={'600'}  fontSize={'.8em'}>{param.name} <span style={{fontSize:'.7em',  color:variablesMap[param.type][1]}}>({variablesMap[param.type][0]})</span></Text>
        </Box>
     )
  }

  const CodeComponent = () => {
    const [isHovering, setIsHovering] = useState<boolean>(false)
    return (
      <Box mt='1vh' position={'relative'} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={() => {data.functions.setShowNodesAction({nodeId:id, actionType:'code', actionData:{id:data.data.id }}); data.functions.currentIndex.current = id }} mb='1vh' cursor={'pointer'}>
          <AnimatePresence>
            {isHovering &&
              <MotionBox position={'absolute'} top={'4px'} right={'4px'} initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.8}} transition={{duration:'.1', ease:'easeOut'}}> 
                <Flex justifyContent={'center'} fontWeight={'medium'} alignItems={'center'} fontSize={'.7em'} borderRadius={'.3rem'} bg='white' px='7px' py='1px'>{t('Edit')}</Flex>
              </MotionBox>}

          </AnimatePresence>
 
        <MiniBox code={data.data?.code}/>
      </Box>

    )
  }

  const ConfigComponent = () => {

    const [waitingCreate, setWaitingCreate] = useState<boolean>(false)
    const createNewBlock = async () => {
      setWaitingCreate(true)
      const newIds = await data.functions.addNewNode({sourceId:id, sourceType:'function', branchIndex:data.branches.length}, 'function')
      if (newIds) {
        data.functions.currentIndex.current = newIds.nodeId
        data.functions.setShowNodesAction({nodeId:newIds.nodeId, actionType:'code', actionData:{id:newIds.id }})
      }
      setWaitingCreate(false)
      setShowCreate(false)
    }


    const filteredNodes = data.functions.nodesWithoutConnection.filter(n => Number(n.id.split('-')[0]) === Number(id.split('-')[0]) + 1)

    return (<> 

        {filteredNodes.map((node, index) => (
          <Flex fontSize={'.9em'} key={`node-to-add-${index}`}  _hover={{bg:'gray_2'}} borderRadius={'.5rem'} p='5px' cursor={'pointer'}  alignItems={'center'} gap='10px' onClick={() => {setShowCreate(false); data.functions.addNewNode({sourceId:id, sourceType:'function', branchIndex:data.branches.length},'function', node.id)}}>
            <Icon as={AiOutlineSubnode} />
            <Text whiteSpace={'nowrap'} >{node.name}</Text>
          </Flex>
        ))}
        
        
        <Flex fontSize={'.9em'}  _hover={{bg:'gray_2'}} borderRadius={'.5rem'} p='5px' cursor={'pointer'}  alignItems={'center'} gap='10px' onClick={createNewBlock}>
            <Icon as={FaPlus}/>
            <Text whiteSpace={'nowrap'} >{waitingCreate ? <LoadingIconButton/>:t('AddNewBlock')}</Text>
        </Flex>
        {data.functions.index !== 1 && <Flex fontSize={'.9em'}  _hover={{bg:'red.100'}} borderRadius={'.5rem'} p='5px' cursor={'pointer'}  color='red' alignItems={'center'} gap='10px' onClick={() => {setShowCreate(false);data.functions.deleteNode(id)} }>
            <Icon as={HiTrash}/>
            <Text whiteSpace={'nowrap'} >{t('DeleteBlock')}</Text>
        </Flex>}
      </>)
  }

  const isDisconexed = data.functions.nodesWithoutConnection.some(node => node.id === id)

  return (<>
      <Box cursor={'default'} transition={'border-color .3 ease-in-out'} bg='white'   borderRadius={'.5rem'} borderColor={data.functions.currentIndex.current === id? 'text_blue': isDisconexed? 'red.400':'border_color'} boxShadow={ data.functions.currentIndex.current === id? '0 0 0 1px rgb(59, 90, 246)' : ''} borderStyle={isDisconexed ?'dashed' :''} borderWidth={'2px'} width='250px'>
        
        <Flex position={'relative'} p='15px' alignItems={'center'} color='text_gray' justifyContent={'space-between'}> 
      
          <Flex alignItems={'center'} gap='7px'> 
            <Text fontWeight={'medium'} fontSize={'.8em'}>{data.functions.index}.</Text>
      
              <Text fontSize='.9em'  color={'black'} fontWeight={'medium'}>{data.data?.name}</Text>
              {!data.data.is_compiled && 
              <Tooltip  label={t('NoCompiledWarning')} placement='bottom'  maxW={'180px'} bg='red' color='white'  hasArrow borderRadius='.3rem' fontSize='.6em' p='4px'> 
                <Flex alignItems={'center'}> 
                  <Icon color='red'as={IoWarning} />
                </Flex>
              </Tooltip>}
          </Flex>
        
          <Flex alignItems={'center'} gap='7px'> 
              <Box position={'relative'}> 
                  <IconButton ref={buttonRef}  bg={showCreate ? 'gray_2': 'transparent'}  aria-label='add-parameter' p='0'  color={showCreate ? 'text_blue':'black'} icon={<BsThreeDots size={'13px'}/>} minW={'22px'} h='22px' w='22px' size='xs' variant={'common'} onClick={() => setShowCreate(true)}/>
                    <AnimatePresence> 
                      {showCreate && 
                        <MotionBox initial={{ opacity: 0, scale: 0.95  }} animate={{ opacity: 1, scale: 1 }}  exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: '0.1',  ease: 'easeOut'}}
                        style={{ transformOrigin: 'top left' }} mt='5px'  maxH='40vh' p='7px' overflow={'scroll'} gap='10px' ref={boxRef} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.3rem'} >
                           <ConfigComponent/>
                        </MotionBox>
                      }
                    </AnimatePresence>
                </Box>
           </Flex>
        </Flex>
    
          {isExpanded && 
          <Box p='0 15px 15px 15px' > 
          
            
            {data.data.parameters.map((param, index) => (
              <EditorComponent type={'param'} key={`editor-${index}`} param={param as any} index={index}/>
            ))}
  
           <CodeComponent/>

        
            {(data.data?.variables || []).map((variable, index) => (
              <EditorComponent  type={'variable'}  key={`editor-${index}`} param={variable} index={index}/>
            ))}
   
        </Box>}
      </Box>

      <Handle position={Position.Left} type='target' style={{position:'absolute', top:'30px', visibility:'hidden'}} />
      <Handle  id={`handle-${-1}`} position={Position.Right} type='source' style={{visibility:'hidden', top:'30px', position:'absolute'}} />
      {Array.from({length: 10}, (v, i) => i).map((i) => (<Handle id={`handle-${i}`} key={`handle-${id}-${i}`} position={Position.Right} type='source' style={{position:'absolute', top:'30px', visibility:'hidden'}}/>))}

    </>)
}

//CUSTOM EDGE
export const CustomEdge = ({id,sourceX, sourceY, targetX, targetY, data}: any) => {
  
  //IS HOVERING VARIABLE
  const [isHovered, setIsHovered] = useState(false);
  const edgeRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    if (isHovered && edgeRef.current) {
      edgeRef.current.parentNode?.appendChild(edgeRef.current)
    }
  }, [isHovered])


  //STYLE
  const style = { stroke: isHovered ? 'rgba(59, 90, 246)' : '#A0AEC0', strokeWidth: 3, zIndex:isHovered ? 10000:1 , transition:'all .2s ease-in-out' }

  //X POSITION OF THE MIDDLE
  const midX = sourceX  - 3 + Math.abs(targetX - sourceX - 5) / 2

  //RADIUS OF THE CURVE
  const curveOffset = 10
  
   //NODES POSITION RELATIVE TO X AXIS
  const isNextNodeBefore = sourceX > targetX 

  //NODES POSITION RELATIVE TO Y AXIS AND THEIR CONFIG
  const isNextNodeDown = sourceY > targetY
  const edgesSeparator = 20
  const edgesTopMargin = -100

  // Calcular las coordenadas del final de la línea
  const arrowSize = 10;
  const arrowX1 = targetX - 5
  const arrowY1 = targetY + arrowSize/2 + 1
  const arrowX2 = targetX - 5
  const arrowY2 = targetY - arrowSize/2

  const path = 
  (Math.abs(sourceY - targetY) < 20) ?
  `M${sourceX - 5},${sourceY + 0.4} H${targetX}`
  :
  isNextNodeBefore ? 
  `
    M${sourceX - 5},${sourceY + 0.4} 
    H${(sourceX + edgesSeparator) - curveOffset} 
    Q${sourceX + edgesSeparator},${sourceY} ${sourceX + edgesSeparator},${sourceY -  curveOffset} 
    V${edgesTopMargin + curveOffset} 
    Q${sourceX + edgesSeparator},${edgesTopMargin} ${(sourceX + edgesSeparator) - curveOffset},${edgesTopMargin} 
    H${(targetX - edgesSeparator) + curveOffset}
    Q${targetX - edgesSeparator},${edgesTopMargin} ${(targetX - edgesSeparator)},${edgesTopMargin + curveOffset} 
    V${targetY - curveOffset} 
    Q${targetX - edgesSeparator},${targetY} ${(targetX - edgesSeparator + curveOffset)},${targetY} 
    H${targetX}
  `
  :
  `
    M${sourceX - 5},${sourceY + 0.4} 
    H${(Math.abs(sourceY - targetY) < 20 ?midX - curveOffset:sourceX )} 
    Q${Math.abs(sourceY - targetY) < 20 ?midX:sourceX + curveOffset},${sourceY} ${Math.abs(sourceY - targetY) < 20 ?midX:sourceX + curveOffset},${sourceY + (isNextNodeDown?-1:1) *  curveOffset} 
    V${(sourceY > targetY ? curveOffset : targetY  ) + (isNextNodeDown?1:-1) * curveOffset} 
    Q${Math.abs(sourceY - targetY) < 20 ?midX:sourceX + curveOffset},${targetY} ${(Math.abs(sourceY - targetY) < 20 ?midX:sourceX + curveOffset) + curveOffset},${targetY} 
    H${targetX}
  `
  return (
  <>
   <g onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} style={{cursor:'pointer', transition: 'all 0.2s ease-in-out' }} onClick={() => data.setShowNodesAction({nodeId:id.split('->')[0], actionType:'condition', actionData:{index:Number(id.split('(')[1].split(')')[0]) }})}>
    <polygon points={`${targetX + 4},${targetY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`} fill={isHovered ? 'rgba(59, 90, 246)' : '#A0AEC0'}   strokeWidth="3"strokeLinejoin="round" strokeLinecap="round" />  
    <path ref={edgeRef} id={id} style={style} className="react-flow__edge-path" d={path} />
    (<>
        <text style={{background:'white', fontWeight:500, padding:'20px'}} x={Math.abs(sourceY - targetY) < 20 ?midX:midX + curveOffset/2} y={sourceY < targetY ? targetY - 8 : sourceY - 9}  textAnchor="middle"alignmentBaseline="middle" fontSize="9"fill={isHovered ? 'rgba(59, 90, 246)':"#A0AEC0"}>
          {data.name.length > 10 ? data.name.substring(0, 10) + "..." : data.name} 
        </text>
    </>)
    </g>
  </>)
}

 

