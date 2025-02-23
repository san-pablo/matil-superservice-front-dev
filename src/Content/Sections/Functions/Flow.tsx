//REACT
import { useState, useEffect, useRef, useMemo, Dispatch, SetStateAction, Fragment, ReactElement, RefObject, CSSProperties, memo, MutableRefObject } from 'react'
import { useAuth } from '../../../AuthContext.js'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth0 } from '@auth0/auth0-react'
//FETCH DATA
import fetchData from '../../API/fetchData'
//FRONT
import { Flex, Box, Button, IconButton, Text, Skeleton, chakra, shouldForwardProp, Icon, Switch, Portal, Radio, Tooltip, Image, Avatar } from '@chakra-ui/react'
import { motion, AnimatePresence, isValidMotionProp } from 'framer-motion'
//FLOWS
import ReactFlow, { Controls, Background, useNodesState, useEdgesState, SelectionMode, useReactFlow } from 'reactflow'
import 'reactflow/dist/style.css'
import { FirstNode } from './CustomNodes.js'
import { AddNode } from './CustomNodes.js'
import { FunctionNode } from './CustomNodes.js'
import { CustomEdge } from './CustomNodes.js'
//PYTHON CODE EDITOR
import CodeMirror from "@uiw/react-codemirror"
import { python } from "@codemirror/lang-python"
import { oneDark } from "@codemirror/theme-one-dark"
import { EditorState } from "@codemirror/state"
//COMPONENTS
import EditText from '../../Components/Reusable/EditText.js'
import LoadingIconButton from '../../Components/Reusable/LoadingIconButton.js'
import ActionsButton from '../../Components/Reusable/ActionsButton.js'
import ConfirmBox from '../../Components/Reusable/ConfirmBox.js'
import VariableTypeChanger from '../../Components/Reusable/VariableTypeChanger.js'
import CustomSelect from '../../Components/Reusable/CustomSelect.js'
import ActionsBox from '../../Components/Reusable/ActionsBox.js'
import SectionSelector from '../../Components/Reusable/SectionSelector.js'
import RenderIcon from '../../Components/Reusable/RenderIcon.js'
import RenderSectionPath from '../../Components/Reusable/RenderSectionPath.js'
import '../../Components/styles.css'
//FUNCTIONS
import parseMessageToBold from '../../Functions/parseToBold.js'
import determineBoxStyle from '../../Functions/determineBoxStyle.js'
import useOutsideClick from '../../Functions/clickOutside.js'
import timeStampToDate from '../../Functions/timeStampToString.js'
import timeAgo from '../../Functions/timeAgo.js'
//ICONS
import { FaPlay, FaCircleDot, FaPlus, FaCheck,   } from 'react-icons/fa6'
import { FaCheckCircle, FaTimesCircle  } from 'react-icons/fa'
import { FaEye } from 'react-icons/fa'
import { PiSidebarSimpleBold } from 'react-icons/pi'
import { BsStars } from 'react-icons/bs'
import { RxCross2 } from 'react-icons/rx'
import { IoIosArrowDown } from "react-icons/io"
import { AiOutlineCheckCircle, AiOutlineCalendar } from "react-icons/ai"
import { FiHash, FiType } from "react-icons/fi"
import { TbMathFunction } from "react-icons/tb"
import { TiArrowSortedDown } from 'react-icons/ti'
import { MdOutlineFormatListBulleted, MdDragIndicator } from "react-icons/md"
import { HiTrash } from 'react-icons/hi2'
//TYPING
import { FlowData, Branch, actionTypesDefinition, nodeTypesDefinition, ViewDefinitionType, parameterType, typesMap, VersionData, ConfigProps, FunctionNodeData } from '../../Constants/typing.js'
     
//FLOWS AND NODES DEFINITIONS
const panOnDrag = [1, 2]
 
interface FunctionResultType {
    run_successful:boolean
    result:{outputs:{[key:string]:string}, motherstructure_updates:{[key:string]:string}, errors:{message: string, line: number, timestamp: string, arguments: {name: string, type: string, value: any}[]}[]}
    error_message:string 
    error_line:number
}

interface FlowProps {
    flowId?:string
    sideBarWidth:number
    sectionsPath:string[]
    sectionsPathMap:{[key:string]:{icon:{type:'image' | 'emoji' | 'icon', data:string}, name:string}}
    selectedView?:ViewDefinitionType
}


 
//STYLES OF THE INVARIABLE DATA
const MatildaSVG = memo(() => (
    <svg xmlns="http://www.w3.org/2000/svg" height={'14px'} width={'14px'} viewBox="0 0 300 300" shapeRendering="geometricPrecision" textRendering="geometricPrecision">
    <defs>
<linearGradient id="eTB19c3Dndv5-fill" x1="8.7868" y1="321.2132" x2="325.1695" y2="4.8305" spreadMethod="pad" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 0)"><stop id="eTB19c3Dndv5-fill-0" offset="0%" stop-color="#486cff"/>
<stop id="eTB19c3Dndv5-fill-1" offset="100%" stop-color="#05a6ff"/></linearGradient></defs><line x1="0" y1="0" x2="150" y2="29.8476" fill="none"/>
<line x1="300" y1="0" x2="150" y2="29.8476" fill="none"/><path d="M150,294.56691h-120c-16.5685,0-30-13.4315-30-30L0,23.98642c.00711.00133.01421.00266.02132.00398C0.56762,10.66654,11.54195,0.03246,25,0.03246c1.83337,0,3.62065.19735,5.34175.57197L144.26601,23.27354c1.84126.4321,3.76093.66067,5.73399.66067s3.89273-.22857,5.73399-.66067L268.79261,0.77668C270.7774,0.26958,272.85722,0,275,0c13.80712,0,25,11.19288,25,25c0,.04825-.00014.09646-.00041.14465.00014-.00003.00027-.00005.00041-.00008v239.42234c0,16.5685-13.4315,30-30,30h-120c0-1.83344,0-3.64446.00027-5.43335L150,289.13382l-.00027-.00004C150,290.9226,150,292.73355,150,294.56691ZM90,110L75.85786,135.85786L50,150l25.85786,14.14214L90,190l14.14214-25.85786L130,150l-25.85786-14.14214L90,110Zm120,0l-14.14214,25.85786L170,150l25.85786,14.14214L210,190l14.14214-25.85786L250,150l-25.85786-14.14214L210,110Z" fill="url(#eTB19c3Dndv5-fill)"/> </svg>
))
const CellStyle = ({ column, element }:{column:string, element:any}) => {
     
    //TRANSLATION
    const { t } = useTranslation('settings')
    const t_formats = useTranslation('formats').t
    const auth = useAuth()

    if (column === 'created_at' ||  column === 'updated_at' )  
    return(
        <Tooltip label={timeStampToDate(element as string, t_formats)}  placement='top' hasArrow bg='white' color='black'  borderRadius='.4rem' fontSize='.8em' p='6px'> 
            <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} fontSize={'.8em'}>{timeAgo(element as string, t_formats)}</Text>
        </Tooltip>) 
    else if (column === 'created_by' || column === 'updated_by') {
        const selectedUser = useMemo(() => auth?.authData?.users?.find(user => user.id === element), [element, auth])

        return (
            <Flex fontSize={'.9em'} alignItems={'center'} gap='5px'> 
                {element === 'matilda' ? 
                    <MatildaSVG/>
                :<> 
                {selectedUser?.icon.data ? <RenderIcon icon={selectedUser.icon} size={14}/> :<Avatar h='16px' w='16px' size={'xs'} name={selectedUser?.name || ''}/> }
                </>}
                <Text fontSize={'.9em'} fontWeight={'medium'} whiteSpace={'nowrap'} textOverflow={'ellipsis'} overflow={'hidden'} >{element ? element === 'matilda' ?'Tilda':element === 'no_user' ? t('NoAgent'):selectedUser?.name:t('NoAgent')}</Text>
            </Flex>
            )
        }
    else return ( <Text whiteSpace={'nowrap'} textOverflow={'ellipsis'} fontSize={'.8em'} fontWeight={column === 'title'?'medium':'normal'}  overflow={'hidden'} >{element === ''?'-':element}</Text>)
}

//MOTION BOX
const MotionBox = chakra(motion.div, {shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop)})

//MAIN FUNCTION
const Flow = ({sideBarWidth, flowId, sectionsPath, sectionsPathMap, selectedView}:FlowProps) => {

    //NODES CONSTANTS
    const nodeTypes = useMemo(() => ({
        trigger: FirstNode,
        add: AddNode,
        function: FunctionNode,
    }), [])
    const edgeTypes = useMemo(() => ({custom: CustomEdge}), [])
    const { setViewport, getViewport } = useReactFlow()

    //CONSTANTS
    const { t } = useTranslation('functions')
    const auth = useAuth()
    const location = useLocation().pathname
    const navigate = useNavigate()
    const { getAccessTokenSilently } = useAuth0()
    const [searchParams] = useSearchParams()
    const isExpanded = searchParams.get("v") === "expanded"
    //SHOW THE TEST BOX
    const [showTest, setShowTest] = useState<boolean>(false)
 
    //SHOW NODES EDITOR
    const editorRef = useRef<HTMLDivElement>(null)
    const [showNodesAction, setShowNodesAction] = useState<null | {nodeId:string, actionType:actionTypesDefinition, actionData:any}>(null)
    useOutsideClick({ref1:editorRef, onOutsideClick:() => {setShowNodesAction(null);currentFlowIndexRef.current = ''} })

     //FLOW DATA
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
 
    //FLOW CONDITION VARIABLES
    const [flowConditionsVariables, setFlowConditionVariables] = useState<{name:string, type:string}[]>([])

    //FLOW DATA
    const [waitingInfo, setWaitingInfo] = useState<boolean>(true)
    const [flowData, setFlowData] = useState<FlowData | null>(null)
    const [versionData, setVersionData] = useState<VersionData | null>(null)
    const [selectedVersion, setSelectedVersion] = useState<string>('')

    //FLOW NAME
    const currentFlowIndexRef = useRef<string>('')
    const viewPortRef = useRef<{x:number, y:number, zoom:number} | null>(null)
    const nodesWithoutConnection = useRef<{id:string, name:string}[]>([])

    //FOCUS A NODE ON CLICK
    useEffect(() => {
        const node = nodes.find(nd => nd.id === currentFlowIndexRef.current)
        const borderLeft = sideBarWidth
        const borderRight = window.innerWidth - Math.min(window.innerWidth * 0.6, window.innerWidth - 500)
        const xPosition = (borderRight - borderLeft) / 2 - 125
        if (node) {
            viewPortRef.current = getViewport()
            setViewport({x:xPosition - (Number(currentFlowIndexRef.current.split('-')[0]) * 450) , y: - node.position.y + 50 , zoom:1}, {duration:500})
         }
        else if (viewPortRef.current) {
            setViewport(viewPortRef.current, {duration:500})
            viewPortRef.current = null
        }

        setNodes((nds) =>nds.map((node) => ({...node, data: { ...node.data, functions:{...node.data.functions, currentIndex: currentFlowIndexRef}}})))
    
    
    }, [currentFlowIndexRef.current])
    

    //MATILDA CONFIGS
    const [matildaConfigs, setMatildaConfigs] = useState<ConfigProps[]>([])
 
    
    //SHOW NT SAVED CHANGES WARNING
    const [showNoSaveWarning, setShowNoSaveWarning] = useState<boolean>(false)
    
    //DELETE FLOW
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false) 

    //PARSE NODES STRUCTURE TO SEND TO THE BACK
    const parseDataToBack = (nodes:any) => {

        const flow:{[key:string]:{position:{x:number, y:number },relations:{to_block_id:string, name:string, group:{ logic:'AND' | 'OR', conditions:{var:string, op:string, val:any}[]}}[] }} = {} 
        const blocks = nodes.map((node:any) => {
            const { id, type, data } = node
            if (type === 'trigger' || type === 'add') return null
            
            flow[data.data.id] = {relations:[], position:{x:Number(node.id.split('-')[0]), y:Number(node.id.split('-')[1])}}

            flow[data.data.id].relations = data.branches.map((branch:any) => {
                const foundNode:any = nodes.find((nd:any) => nd.id === branch.next_node_index) || null
                return {name:branch.name, to_block_id: foundNode.data.data.id , group: {...branch.group, name:branch.name} }
            }) 

       
            const { functions, ...blockData } = data

            return {  ...blockData.data }
        }).filter((block:any) => block !== null).filter((block: any) => block.id && flow.hasOwnProperty(block.id))
            
         return { blocks, flow }
    }
    
    //GET NODE FUNCTIONS
    const getNodeFunctions = (type:nodeTypesDefinition, index:number) => {
        switch (type) {
            case 'function': return {index, currentIndex:currentFlowIndexRef,  setShowNodesAction, editNode, editBranch, addNewNode, deleteNode, nodesWithoutConnection:nodesWithoutConnection.current}
            default:{}
        }
    }

    //PARSE NODE DATA FROM BACK TO USE IN THE APP
    const parseNodesFromBack =  (flow: { [key: string]: {position:{x:number, y:number },relations:{to_block_id: string, name: string, group: { logic: 'AND' | 'OR', conditions: { var: string, op: string, val: any }[] } }[]} }, blocks: {id: string, code:string, name: string, variables:any[], parameters: any[], is_compiled: boolean }[]) => {
        
        const nodeIndices = new Map<string, string>()
        const uniqueVariableConditions = new Map<string, { name: string; type: string }>()
    
        // Organizar nodos en columnas
        blocks.forEach(block => {
            (block?.variables || []).forEach((variable:any) => {
                if (!uniqueVariableConditions.has(variable.name)) uniqueVariableConditions.set(variable.name, { name: variable.name, type: variable.type }); 
            });
            (block?.parameters || []).forEach((parameter:any) => {
                if (!uniqueVariableConditions.has(parameter.name)) uniqueVariableConditions.set(parameter.name, { name: parameter.name, type: parameter.type })
            })
        })
    
        blocks.map((block) => {nodeIndices.set(block.id, `${flow[block.id]?.position?.x || 0 }-${flow[block.id]?.position?.y || 0 }`)})
       
        // Crear nodos con sus posiciones y ramas
        const finalNodes = blocks.map(block => {
            const { id, name, parameters, is_compiled, code, variables } = block

            if (flow[id]) {
                const level = flow[id]?.position?.x || 0
                const indexInLevel = flow[id]?.position?.y || 0
                const x = (level) * 350
                const y = indexInLevel * 350
                const branches = (flow?.[id]?.relations || []).map((connection) => ({ name: connection.name, next_node_index: nodeIndices.get(connection.to_block_id),  group: connection.group}))
                const node = { id: `${level}-${indexInLevel}`, position: { x, y }, type: 'function', data: {branches, data: { id, name, variables:variables || [], parameters, is_compiled, code },functions: getNodeFunctions('function', (level ) + indexInLevel + 1)}}
                return node
            }
            else return null
        }).filter(Boolean)
    
        let firstEdges: any[] = []
    
        Object.entries(flow || {}).forEach(([sourceId, connections]) => {
            (connections?.relations || []).forEach((connection, index) => {
                const targetId = connection.to_block_id
                firstEdges.push({id: `${nodeIndices.get(sourceId)}->${nodeIndices.get(targetId)}(${index})`, data:{name:connection.name || t('NoName'), setShowNodesAction:setShowNodesAction}, sourceHandle: `handle-${index}`, type: 'custom', source: nodeIndices.get(sourceId),target: nodeIndices.get(targetId)})                
            })
        })
    
        setFlowConditionVariables(Array.from(uniqueVariableConditions.values()))
        setEdges(firstEdges)
    
        return finalNodes
    }
    
    //RESIZE NDOES
    const resizeNodes = (nds: any[], edgs:any[]) => {

        const nodesByColumn: { [key: number]: any[] } = {}
    
        const connectedNodes = new Set()
        edgs.forEach(edge => {connectedNodes.add(edge.target)})
        const disconexedNodes = nds.filter(nd => {return nd.id !== '0-0' && !connectedNodes.has(nd.id)}).map(nd => {return {id:nd.id, name:nd?.data?.data?.name || ''}})

        nodesWithoutConnection.current = disconexedNodes

        // Agrupar nodos por columna
        nds.forEach((node) => {
            const [columnIndex] = node.id.split('-').map(Number);
            if (!nodesByColumn[columnIndex]) nodesByColumn[columnIndex] = [];
            nodesByColumn[columnIndex].push(node)
        })
    
        let updatedNodes = nds.map((node) => ({...node, position: { ...node.position, y: 0 }}))
    
        // Reposicionar cada columna
        Object.keys(nodesByColumn).forEach((col) => {
            const columnIndex = Number(col);
            let currentY = 0
    
            // Ordenar nodos por fila
            nodesByColumn[columnIndex].sort((a, b) => Number(a.id.split('-')[1]) - Number(b.id.split('-')[1]));
    
            nodesByColumn[columnIndex].forEach((node, index) => {
                const nodeHeight = node.height || 100; // Asignar altura si no está definida
                const newPosition = { x: columnIndex * 350, y: currentY };
    
                currentY += nodeHeight + 30;
    
                updatedNodes = updatedNodes.map((n) => n.id === node.id ? { ...n, position: newPosition, data:{...n.data, functions:{ ...n.data.functions, nodesWithoutConnection:disconexedNodes}} }: n)
            })
        })
    
        return updatedNodes
    }
    
    const isInitialRender = useRef<boolean>(true)
    const prevHeights = useRef<{ [key: string]: number }>({})

    //RESIZE NODES ON EDITING ONE
    useEffect(() => {
        if (nodes.length > 0 && nodes[0].height) {
            if (isInitialRender.current) {
                const nodesWithHeightChange = nodes.filter((node) => {
                    const prevHeight = prevHeights.current[node.id]
                    const currentHeight = node.height
                    if (prevHeight !== currentHeight) {
                        prevHeights.current[node.id] = currentHeight
                        return true
                    }
                    return false
                })
    
                if (nodesWithHeightChange.length > 0) setNodes((prevNodes) => resizeNodes(prevNodes, edges))
                
            } 
            else isInitialRender.current = false
        }
    }, [nodes])

    //ADD AND DELETE NEW NODES FUNCTIONS
    const addNewNode = async (sourceData:{sourceId:string, sourceType:nodeTypesDefinition, branchIndex?:number}, targetType:nodeTypesDefinition | '', nodeId?:string) => {
    
 
        let responseBlock:any
        if (!nodeId) responseBlock = await fetchData({endpoint:`${auth.authData.organizationId}/functions/${flowId}/versions/${selectedVersion}/blocks`, method:'post', auth, requestForm:{name:t('NewBlock'), parameters:[]},getAccessTokenSilently })

        if (responseBlock?.status == 200 || nodeId) {

            const getNewNodeId = (id:string, nds:{id:string, type:nodeTypesDefinition, position:{x:number, y:number}, data:any}[]) => {
                const newNodeX = parseInt(id.split('-')[0]) + 1
                const previousColumnNodes = nds.filter((node) => node.id.startsWith(`${newNodeX - 1}-`))
                const restrictedRows = new Set(previousColumnNodes.map((node) => parseInt(node.id.split('-')[1]) - 1))  

                const matchingNodes = nds.filter(node => node.id.startsWith(`${newNodeX}-`))

                if (matchingNodes.length > 0) {
                    const occupiedRows = new Set(matchingNodes.map((node) => parseInt(node.id.split('-')[1])))
                    let firstAvailableRow = 0
                    while (occupiedRows.has(firstAvailableRow)) {firstAvailableRow++}
                    return `${newNodeX}-${firstAvailableRow}`
                } 
                else {
                    let firstAvailableRow = 0
                    while (restrictedRows.has(firstAvailableRow)) {firstAvailableRow++}
                    return `${newNodeX}-${firstAvailableRow}`
                } 
            }

            const getNewNodeObject = (id:string, type:nodeTypesDefinition, nds:any) => {

                const [colIndex, rowIndex] = id.split('-').map(Number)
                const x = colIndex * 350
                const nodesInSameColumn = nds.filter((node:any) => parseInt(node.id.split('-')[0]) === colIndex)
            
                let y = 0

                if (nodesInSameColumn.length < rowIndex) y = (rowIndex - nodesInSameColumn.length) * 380
                else {
                    for (const node of nodesInSameColumn) {
                        const nodeRowIndex = parseInt(node.id.split('-')[1])
                        if (nodeRowIndex < rowIndex) y += node.height + 30
                        else break
                    }
                }
            
                const position = { x, y }
                
                let newNodeObjectData = {}
                if (type === 'function') newNodeObjectData = {id ,branches:[], data:{id:responseBlock.data.block_id, name:t('NewBlock'), description:'', code:'', parameters:[], variables:[], is_compiled:false}, functions:getNodeFunctions('function', nds.length + 1) }
                return {id, position, data: newNodeObjectData, type:targetType}
            }
        
            let newNodeId:string
            setNodes((nds) => 
                {
                    newNodeId = nodeId?nodeId:getNewNodeId(sourceData.sourceId, nds as {id:string, type:nodeTypesDefinition, position:{x:number, y:number}, data:any}[])
                    
                    const nodeToUpdate = nds.find(node => node.id === sourceData.sourceId)
                    if (nodeToUpdate) {
                
                        if (nodeToUpdate.data && Array.isArray(nodeToUpdate.data.branches)) {

                            let updatedBranches
                            if (sourceData.branchIndex === nodeToUpdate.data.branches.length) {
                                updatedBranches = [...nodeToUpdate.data.branches, {name:t('NoName'), next_node_index:newNodeId, group:{logic:'AND', conditions:[]}}]
                            }
                            else {
                                updatedBranches = nodeToUpdate.data.branches.map((branch:any, index:number) => {
                                    if (index === sourceData.branchIndex) return {...branch, next_node_index:  newNodeId }
                                    return branch
                                })
                            }
                            
                            nodeToUpdate.data = {...nodeToUpdate.data, branches: updatedBranches}
                        }
    
                        const updatedNodes = nds.map((node) => node.id === nodeToUpdate.id ? nodeToUpdate : node)
                        
                        let updatedEdges
                        setEdges((edges) => {
                                updatedEdges = [...edges,  {id:`${sourceData.sourceId}->${nodeId?nodeId:newNodeId}(${sourceData?.branchIndex})`,sourceHandle:`handle-${sourceData.branchIndex}`, data:{name:t('NoName'), setShowNodesAction}, type:'custom', source:sourceData.sourceId, target:nodeId?nodeId:newNodeId}]
                                return updatedEdges
                            }
                        )


                        if (nodeId) return resizeNodes(updatedNodes, updatedEdges)
                        else return resizeNodes([...updatedNodes, getNewNodeObject(newNodeId, targetType as nodeTypesDefinition, nds)], updatedEdges)
                    }
                    
                })

         
            return {id:responseBlock?.data?.block_id, nodeId:newNodeId}

        }

        return null
    }

    //DELETE A NODE OR A BRANCH (THE LOGIC IS REUSED TO RESIZE NODES WHEN HIDING OR EXPANDING A NODE)
    const [deleteNodeId, setDeleteNodeId] = useState<{id:string, name:string}>(null) 
    const deleteNode = async (sourceId:string) => {

 
        let nodeToEdit:string
        setNodes((nds) => nds.map((node) => {
            if (node.id !== sourceId) return node
            else {
                nodeToEdit = node.data.data.id
                return node
            }
        }))

        const responseBlock = await fetchData({endpoint:`${auth.authData.organizationId}/functions/${flowId}/versions/${selectedVersion}/blocks/${nodeToEdit}`, method:'delete', auth,getAccessTokenSilently })

        setNodes((nds) => 
            {   
                let newEdges:any[] = []
                setEdges((edg) => {
                    newEdges = edg.filter(({ source, target }) => source !== sourceId && target !== sourceId)
                    return newEdges
                })
                let updatedNodes = nds.filter((node) => node.id !== sourceId)
                return resizeNodes(updatedNodes, newEdges)
            }
    )}

    //ADD OR DELETE BRANCHES
    const editBranch = (nodeId:string | undefined, index:number | undefined, type:'remove'| 'add' | 'edit', newBranch?:Branch, nodeToMerge?:{branchIndex:number, nodeId:string}) => {
        setNodes((nds) => nds.map((node) => {
            
            if (node.id !== nodeId) return node

            let updatedBranches
            if (type === 'remove') {

                setEdges((edges) => {
                    const filteredEdges = edges.filter((edge) => {
                        const edgeSource = edge.source
                        return edgeSource !== nodeId || edge.sourceHandle !== `handle-${index}`
                    })

                    let updatedEdges
                    if (type === 'remove') {
                        updatedEdges = filteredEdges.map((edge) => {
                            const edgeSource = edge.id.split('->')[0];
                            const edgeHandleIndex = edge.sourceHandle?parseInt(edge.sourceHandle.split('-')[1], 10):-1
                                if (edgeSource === nodeId && edgeHandleIndex > (index as number)) {
                                const newHandle = `handle-${edgeHandleIndex - 1}`
                                return {...edge,id: `${nodeId}->${newHandle}`, sourceHandle: newHandle}
                            }
                            return edge
                        })
                    }
                    else updatedEdges = filteredEdges
                
                    return updatedEdges
                })
                
                updatedBranches = node.data.branches.filter((_:any, idx:number) => idx !== index)
            
            }
            else if (type === 'add') {
                updatedBranches = [...node.data.branches, { name: t('NoName'), group:{logic:'AND',conditions: []}, next_node_index: nodeToMerge.nodeId }]
                setEdges((eds) => {return [...eds, {id:`${nodeId}->${nodeToMerge.nodeId}(${nodeToMerge.branchIndex})`, data:{name:t('NoName'), setShowNodesAction}, sourceHandle:`handle-${nodeToMerge.branchIndex}`, type:'custom', source:nodeId, target:nodeToMerge.nodeId}]})
            }
            else if (type === 'edit') {
                updatedBranches = node.data.branches.map((branch: any, idx: number) => {
                  if (idx === index) return newBranch
                  return branch
                })
                setEdges((edges) => {
                    const updatedEdges = edges.map((edg) => {
                        if (edg.source === nodeId && Number(edg.sourceHandle.split('-')[1]) === index) {
                            return {...edg, data:{...edg.data, name:newBranch.name}}
                        }
                        else return edg
                    })
                    return updatedEdges
                })
            }
            return {...node, data: {...node.data, branches: updatedBranches}}  
        })
      )
     }

    //EDIT NODE SIMPLE DATA
    const editNode = async (nodeId:string | undefined, newData:any ) => {

         isInitialRender.current = true

        let nodeToEdit:string
        const firstThreeLines = (newData.code || '').split('\n').slice(0, 3).join('\n')
        
        setNodes((nds) => nds.map((node) => {
            if (node.id === nodeId) nodeToEdit = node.data.data.id
            return node
        }))

        const response = await fetchData({endpoint:`${auth.authData.organizationId}/functions/${flowId}/versions/${selectedVersion}/blocks/${nodeToEdit}`, method:'put', requestForm:newData, auth, getAccessTokenSilently} )

        setNodes((nds) => nds.map((node) => {
            if (node.id !== nodeId) return node
            else {
                nodeToEdit = node.data.data.id
                return {...node, data: {...node.data, data:{...newData, code: firstThreeLines, is_compiled:response.data.is_compiled}} }
            }
        }))
 


     }

    //FETCH INITIAL DATA
    useEffect(() => {
        const fetchInitialData = async () => {
 
 
            //RERTRIEVE FLOWS
            setWaitingInfo(true)
 
            const responseFlows = await fetchData({endpoint:`${auth.authData.organizationId}/functions/${flowId}`, auth, getAccessTokenSilently })
            if (responseFlows?.status === 200) {
                setFlowData(responseFlows.data)
                if (responseFlows.data.versions.length > 0 ) {
                    setSelectedVersion(responseFlows.data.versions[responseFlows.data.versions.length - 1].id)
                }
            }
        }
        fetchInitialData()
    }, [location])

    useEffect(() => {

         const fetchVersionData = async() => {
            const configsData = await fetchData({endpoint:`${auth.authData.organizationId}/settings/matilda_configurations`, setValue:setMatildaConfigs, auth, getAccessTokenSilently})
            const responseVersions = await fetchData({endpoint:`${auth.authData.organizationId}/functions/${flowId}/versions/${selectedVersion}`, auth, getAccessTokenSilently })
            if (responseVersions?.status === 200) {
                setVersionData(responseVersions.data)
                const firstFlow = Object.keys(responseVersions.data.flow).length === 0 ? {[responseVersions.data.blocks[0].id]:{position:{x:0, y:0}} } : responseVersions.data.flow
                const frontNodes = parseNodesFromBack(firstFlow, responseVersions.data.blocks)
                setNodes(frontNodes)
                setWaitingInfo(false)
            }
        
            
        }
        if (selectedVersion) fetchVersionData()
    },[selectedVersion])

    const [waitingSave, setWaitingSave] = useState<boolean>(false)

    //SAVE CHANGES
    const saveChanges = async () => {
         setWaitingSave(true)
        const responseFlow = await fetchData({endpoint:`${auth.authData.organizationId}/functions/${flowId}`, auth, method:'put', requestForm:flowData, getAccessTokenSilently })
        const parsedNodes = parseDataToBack(nodes)
        const responseVersions = await fetchData({endpoint:`${auth.authData.organizationId}/functions/${flowId}/versions/${selectedVersion}`, auth, method:'put', requestForm:{...versionData, blocks:parsedNodes.blocks, flow:parsedNodes.flow }, getAccessTokenSilently })
        setWaitingSave(false)
    }

    //CHANGE FLOW VERSIONS
    const VersionSelector = () => {

        const versionButtonRef = useRef<HTMLDivElement>(null)
        const versionBoxRef = useRef<HTMLDivElement>(null)
        const [showVersions, setShowVersions] = useState<boolean>(false)
        useOutsideClick({ref1:versionButtonRef, ref2:versionBoxRef, onOutsideClick:() => setShowVersions(false)})
      
         return (
            <Box position={'relative'} ml='10px'> 
                <Flex gap='10px' cursor={'pointer'} ref={versionButtonRef} alignItems={'center'} borderRadius={'.5rem'} color={showVersions ? 'text_blue':'black'} bg={showVersions ? 'gray_1':'gray_2' } _hover={{color:'text_blue', background:'gray_2'}} px='12px' h='28px' fontSize={'.9em'} onClick={() => {setShowVersions(prev => !prev)}}>
                    <Flex gap='5px' alignItems={'center'}>
                         <Text whiteSpace={'nowrap'} fontWeight={'medium'}>{flowData.versions.find(ver => ver.id === selectedVersion)?.name}</Text>
                    </Flex>
                    <Icon  as={TiArrowSortedDown}/>
                </Flex>
    

                <AnimatePresence> 
                    {showVersions && 
                    <MotionBox initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}    exit={{ opacity: 0, scale: 0.95 }}  transition={{ duration: '.1', ease: 'easeOut'}}
                    maxH='40vh'p='8px'  style={{ transformOrigin: 'top left' }}  mt='5px' right={0} overflow={'scroll'} top='100%' gap='10px' ref={versionBoxRef} fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.1)'} bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.5rem'} borderWidth={'1px'} borderColor={'border_color'}>
                        {flowData.versions.map((ver, index) => (
                                <Flex justifyContent={'space-between'} key={`status-${index}`} color={selectedVersion === ver.id ? 'text_blue':'black'} px='7px' py='5px'  borderRadius={'.5rem'} cursor={'pointer'} gap='15px' alignItems={'center'} _hover={{bg:'gray_2'}} onClick={() => {setShowVersions(false); setSelectedVersion(ver.id)}}>
                                    <Flex flex='1' alignItems={'center'} gap='5px'>
                                         <Text whiteSpace={'nowrap'}>{ver.name}</Text>
                                    </Flex>
                                    {selectedVersion === ver.id  && <Icon as={FaCheck}/>}
                                </Flex>
                        ))}                                           
                    </MotionBox>}   
                </AnimatePresence>                 
            </Box>  
        )
    }

    //CUSTOM BOX FOR EDITING NODES
    const NodesEditBox = () => {

        const node = nodes.find(node => node.id === showNodesAction?.nodeId)
        const scrollRef = useRef<HTMLDivElement>(null)
 
        switch (showNodesAction?.actionType) {


            case 'condition':
                {
                const firstRender = useRef<boolean>(true)
                const [branchesData, setBranchesData] = useState<Branch[]>(node?.data.branches)

            
                let operationTypesDict:{[key:string]:{name:string, type:'boolean' | 'integer' | 'number' | 'string' | 'array' | 'timestamp', is_custom?:boolean}} = {}
                flowConditionsVariables.map((param:any, index:number) => {operationTypesDict[param.name] = {name:param.name, type:param.type, is_custom:true}})
      
                const EditBranch = ({index}:{ index:number}) => {

                    const [branch, setBranch] = useState<Branch>(branchesData[index])
                    useEffect(() => {editBranch(node.id, index, 'edit', branch)},[branch])

                    const boxRef = useRef<HTMLDivElement>(null)
                    
                    const [isFocused, setIsFocused] = useState(false)
                    useOutsideClick({ref1:boxRef, onOutsideClick:() => setIsFocused(false)})
                    useEffect(() => {
                        if (showNodesAction.actionData.index === index && boxRef.current && firstRender.current) {
                            setIsFocused(true)
                            firstRender.current = false
                        }
                    }, [showNodesAction.actionData.index])
                
                    return (
                        <Box ref={boxRef} gap='15px' mt='2vh'p='15px' borderRadius={'.5rem'} transition={'box-shadow .2s ease-in-out, border-color .2s ease-in-out'} boxShadow={isFocused ? '0 0 0 1px rgb(59, 90, 246)' : ''} borderColor={isFocused ? 'text_blue':'border_color'} borderWidth={'1px'}> 
                            <Flex gap='15px' justifyContent={'space-between'}> 
                                <Flex flex='1' gap='15px' alignItems={'center'}> 
                                    <Icon boxSize={'17px'} cursor={ 'grab'} color='text_gray'  as={MdDragIndicator}/>
                                    <EditText  focusOnOpen={showNodesAction.actionData.index === index} placeholder={t('name')} value={branch?.name} setValue={(value) => setBranch(prev => ({...prev, name:value}))} className={'description-textarea-functions-2'}/>
                                </Flex>
                                <IconButton variant={'delete'} size='xs' aria-label='delete-branch' onClick={() => {setBranchesData(prevData => prevData.filter((_, idx) => idx !== index));;editBranch(node.id, index, 'remove')}} icon={<HiTrash/>}/>
                            </Flex>

                            <Flex mt='2vh' gap='15px'> 

                                <Flex pos='relative' px='7px' w='fit-content' alignItems={'center'} h='24px' justifySelf={'center'} borderColor={'border_color'} borderWidth={'1px'} borderRadius={'.3rem'}>
                                    <Text fontSize={'.9em'}>{t('If')}</Text>
                                </Flex>
                            
                                <Box gap='20px'> 
                                    {branch.group.conditions.map((condition, conIndex) => (
                                    <Fragment key={`condition-${conIndex}`}>
                                        <Box  mt={conIndex !== 0 ? '1vh':'0'} mb='1vh'>
                                            <EditFunctionStructure typesMap={typesMap} data={condition} setData={(newCondition) => setBranch(prev => ({...prev, group:{...prev.group, conditions:prev.group.conditions.map((con, idx) =>  {if (idx === conIndex) return newCondition;return con})}}) )} operationTypesDict={operationTypesDict} deleteFunc={() => setBranch(prev => ({...prev, group: { ...prev.group, conditions: prev.group.conditions.filter((_, idx) => idx !== conIndex)}}))} scrollRef={scrollRef}/>
                                        </Box>
                                        {branch.group.conditions.length - 1 !== conIndex &&
                                            <Button variant={'common'}  size='sm' onClick={() => setBranch( prev => ({...prev, group: {...prev.group, logic:prev.group.logic === 'AND'?'OR':'AND'}} ))}>
                                                {t(branch.group.logic)}
                                            </Button>
                                        }
                                    </Fragment>))}
                                    <Button leftIcon={<FaPlus/>} variant={'common'} px='0' size='xs' _hover={{bg:'transparent', color:'text_blue'}} bg='transparent' onClick={() =>  setBranch(prev => ({...prev,group:{...prev.group, conditions:[...prev.group.conditions, { var: Object.keys(operationTypesDict)?.[0] || '', op: 'eq', val: null }] }})) }>{t('AddCondition')}</Button>
                                </Box>
                            </Flex>
                        </Box>
                    )

                }
                
                const MemoizedEditBranch = useMemo(() => {return branchesData.map((_, index) => (<EditBranch key={index} index={index} />))}, [branchesData])
                
                
                return (
                    <Box ref={scrollRef} overflow={'scroll'}  p='1vw'>
                        <Flex gap='10px' alignItems={'center'}> 
                             <Box> 
                                <Text fontSize={'1em'} fontWeight={'medium'}>{t('EditConditions', {name: node.data.data.name})}</Text>
                                <Text mt='.5vh' fontSize={'.7em'} mb='3vh' color={'text_gray'}>{t('EditConditionsDes')}</Text>
                            </Box>
                        </Flex>
                                                
                        {MemoizedEditBranch}
                     </Box>                    
                )
            }

            case 'code':

 
                const boxRef = useRef<HTMLDivElement>(null)
                const [nodeData, setNodeData] = useState<FunctionNodeData | null>(null)
                const codeRef = useRef<string>('')

                const [selectedDataSection, setSelectedDataSection] = useState<'parameters' | 'variables'>('parameters')

                const [waitingSaveCode, setWaitingSaveCode] = useState<boolean>(false)

                const saveCode = async () => {
                    setWaitingSaveCode(true)
                    setNodeData(prev => ({...prev, code:codeRef.current}))
                    await editNode(node.id, {...nodeData, code:codeRef.current}) 
                    setWaitingSaveCode(false)
                }

                 useEffect(() => {
                    const fetchCode = async () => {
                        const response = await fetchData({endpoint:`${auth.authData.organizationId}/functions/${flowId}/versions/${selectedVersion}/blocks/${showNodesAction.actionData.id}`, auth, getAccessTokenSilently} )
                        if (response?.status === 200) setNodeData(response.data)
                     }
                    fetchCode()
                  },[])
                    
                //EXPANDED LOGIC
                const [expandedParameters, setExpandedParameters] = useState<number[]>([])
                const [expandedVariables, setExpandedVariables] = useState<number[]>([])
                const toggleExpanded = (type:'variables' | 'parameters', index:number) => {
                    if (type === 'variables') {
                        setExpandedVariables((prevSections) => {
                            if (prevSections.includes(index)) return prevSections.filter((s) => s !== index)
                            else return [...prevSections, index]
                        })
                    }
                    else{
                        setExpandedParameters((prevSections) => {
                            if (prevSections.includes(index)) return prevSections.filter((s) => s !== index)
                            else return [...prevSections, index]
                        })
                    }
                }

                //UPDATE NODE PARAMETERS AND VARIABLES
                const updateDataList = (type: 'parameters' | 'variables', action: 'add' | 'edit' | 'delete',index?: number,newData?: any) => {
                    setNodeData(prev => {
                      if (!prev) return prev
                      const updatedList = prev[type] ? [...prev[type]] : []
                      switch (action) {
                        case 'add':
                          updatedList.push(type==='parameters' ? {confirm: false, description:'', name: '', required: false, type: 'boolean', enum:[]}:{name:'', type:'boolean'})
                          break
                        case 'edit':
                          if (index !== undefined) updatedList[index] = newData;
                          break
                        case 'delete':
                          if (index !== undefined) updatedList.splice(index, 1);
                          break
                        default:
                          return prev
                      }
                  
                      return { ...prev, [type]: updatedList }
                    })
                }
                  
                //WIDTH LOGIC
                const containerWidth = Math.min(window.innerWidth * 0.6, window.innerWidth - 275 - 240)
                const [clientBoxWidth, setClientBoxWidth] = useState(containerWidth / 2)
                const sendBoxWidth = `calc(100vw - 55px - 280px - ${clientBoxWidth}px)`
                
                return (
                <Flex flex='1'  width={'100%'} height={'100vh'} top={0} left={0} bg='white' >

                    <MotionBox  initial={{ width: sendBoxWidth  }} animate={{ width: sendBoxWidth}} exit={{ width: sendBoxWidth }} transition={{ duration: '.2' }}  
                        width={sendBoxWidth} overflowY={'hidden'}  borderRightWidth={'1px'} borderRightColor='border_color' >
                        <Box ref={scrollRef} overflow={'scroll'} >
                            <Flex w ='100%' gap='1vw' px='1vw' h='50px' justifyContent={'space-between'} alignItems={'center'}> 
                                <Flex gap='10px' alignItems={'center'}> 
                                    <Skeleton isLoaded={nodeData !== null} style={{display:'flex', alignItems:'center'}}> 
                                        <EditText fontSize='.9em'  placeholder={t('name')} value={nodeData?.name} setValue={(value) => setNodeData(prev => ({...prev, name:value}) )} className={'description-textarea-functions'}/>
                                    </Skeleton>
                                </Flex>
                                
                                <Flex gap='10px'>
                                    {!showNodesAction?.nodeId.startsWith('0') &&  <Button size='xs' variant={'delete'} leftIcon={<HiTrash/>} onClick={() => setDeleteNodeId({id:showNodesAction?.nodeId, name:nodeData.name})}>{t('Delete')}</Button>}
                                    <Button size='xs' variant={'main'} onClick={saveCode}>{waitingSaveCode ? <LoadingIconButton/>: t('SaveChanges')}</Button>
                                    <IconButton  aria-label="open-tab" variant={'common'} bg='transparent' size='sm' icon={<PiSidebarSimpleBold transform="rotate(180deg)" size={'18px'}/>}  h='28px' w='28px'  onClick={() => {if (clientBoxWidth === 0) setClientBoxWidth(containerWidth / 2);else setClientBoxWidth(0)}}/>
                                </Flex>
                            </Flex>

                            <Skeleton   isLoaded={nodeData !== null} > 
                            {nodeData && <CodeBox code={nodeData?.code || ''} codeRef={codeRef}/>}
                            </Skeleton>
                        </Box>  
                    </MotionBox>

                    <MotionBox display={'flex'} flexDir={'column'} h='100vh' width={clientBoxWidth + 'px'}  whiteSpace={'nowrap'} initial={{ width: clientBoxWidth + 'px' }} animate={{ width: clientBoxWidth + 'px' }} exit={{ width: clientBoxWidth + 'px' }} transition={{ duration: '.2'}}> 
                        <Flex h='50px'  borderBottomColor={'border_color'} borderBottomWidth={'1px'} px='1vw' >
                            <SectionSelector notSection selectedSection={selectedDataSection} sections={['parameters', 'variables']} onChange={(value) => setSelectedDataSection(value)} sectionsMap={{'parameters':[t('Inputs'), <></>], 'variables':[t('Outputs'),  <></>]}}/>
                        </Flex>
                        <Box h='calc(100vh - 50px)' overflow={'scroll'} p='1vw'> 

                            {selectedDataSection === 'parameters' ?
                            <>
                                {nodeData ? <>

                                    {nodeData.parameters.length === 0 ?<Text fontSize={'.8em'} mt='2vh' color='text_gray'>{t('NoInputs')}</Text>
                                    :<>
                                    {nodeData.parameters.map((param, index) =>(
                                        <ParameterSection key={`param-${index}`} data={param} index={index} expandedParameters={expandedParameters} toggleExpanded={toggleExpanded} updateDataList={updateDataList}/>
                                    ))}
                                    </>
                                    }
                                    <Button  mt='2vh'  leftIcon={<FaPlus/>} variant={'common'} px='0' size='xs' _hover={{bg:'transparent', color:'text_blue'}} bg='transparent' onClick={() => updateDataList('parameters', 'add')}>{t('AddInput')}</Button>
                                </>
                                :<> 
                                    {Array.from({ length: 4 }).map((_, index) => (
                                        <Skeleton mt={index==0?'0':'1vh'} borderRadius={'.5rem'} height="200px" width="100%" />
                                    ))}
                                </> }    
                            </> 
                            :

                            <>
                            {nodeData ? <>

                                {(nodeData?.variables || [])?.length === 0 ?<Text mt='2vh' fontSize={'.8em'} color='text_gray'>{t('NoOutputs')}</Text>
                                :<>
                                {(nodeData?.variables || []).map((variable, index) =>(
                                    <VariableSection key={`param-${index}`} data={variable} index={index} expandedVariables={expandedVariables} toggleExpanded={toggleExpanded} updateDataList={updateDataList}/>
                                ))}
                                </>
                                }
                                    <Button mt='2vh' leftIcon={<FaPlus/>} variant={'common'} px='0' size='xs' _hover={{bg:'transparent', color:'text_blue'}} bg='transparent' onClick={() => updateDataList('variables', 'add')}>{t('AddOutput')}</Button>
                                </>
                                :<> 
                                    {Array.from({ length: 4 }).map((_, index) => (
                                        <Skeleton mt={index==0?'0':'1vh'} borderRadius={'.5rem'} height="200px" width="100%" />
                                    ))}
                                </> }    
                            </> 
                            }
                        </Box>
                    </MotionBox>
                 </Flex>
                )

            case 'flow':

                //GENERATE AI DESCRIPTION
                const [waitingAIGeneration, setWaitingAIGeneration] = useState<boolean>(false)
                const AIGeneration = async() => {
                    const response = await fetchData({endpoint: `${auth.authData.organizationId}/settings/matilda_configurations/generate_sources_description`, getAccessTokenSilently,  method: 'post', setWaiting: setWaitingAIGeneration, auth})
                    if (response?.status === 200 ) setFlowData(prev => ({...prev as FlowData, description:response.data.sources_description}))
                }

                //DELETE A CONFIG
                const [deleteConfig, setDeleteConfig] = useState<ConfigProps | null>(null)
                const deleteConfigFunc = async () => {
                    await fetchData({endpoint:`${auth.authData.organizationId}/settings/matilda_configurations/${deleteConfig.id}/functions/${flowId}`,  method:'delete', getAccessTokenSilently, auth})
                    setFlowData(prev => ({...prev,   matilda_configurations_ids: prev.matilda_configurations_ids.filter(id => id !== deleteConfig.id) }))
                    setDeleteConfig(null)
                }

                //ADD A CONFIG
                const [showEditConfigs, setShowEditConfigs]= useState<boolean>(false)

                const AddConfigBox = () => {
                    const addConfig = (id:string) => {
                             setShowEditConfigs(false)
                            setFlowData(prev => ({...prev, matilda_configurations_ids:[...prev.matilda_configurations_ids, id]}))
                            fetchData({endpoint:`${auth.authData.organizationId}/settings/matilda_configurations/${id}/functions/${flowId}`, method:'post', getAccessTokenSilently, auth})
                        }
                
                        return (
                        <Flex flexDir={'column'} h='100%'> 
                            <Text mb='2vh' fontWeight={'medium'}>{t('AddNewConfig')}</Text>
                            <Box flex='1' py='10px' overflow={'scroll'}> 
                                {matildaConfigs.filter(con => !flowData.matilda_configurations_ids.includes(con.id)).map((con, index) => (
                                    <Box mt={index === 0?'0':'1vh'} cursor={'pointer'} _hover={{shadow:'md'}} transition={'box-shadow .2s ease-in-out'} onClick={() => addConfig(con.id)} key={`config-${index}`} borderColor={'border_color'} p='10px' borderRadius={'.5rem'} borderWidth={'1px'}>
                                        <Text fontWeight={'medium'} fontSize={'.9em'}>{con.name}</Text>
                                        <Text  sx={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'}} color='text_gray' fontSize={'.7em'}>{con.description}</Text>
                                    </Box>
                                ))}
                            </Box>
                        </Flex>)
                    }

                const memoizedAddConfig = useMemo(() => (<> 
                    <Portal>
                        <Flex id='custom-portal' position='fixed' justifyContent='center' top={0} left={0}zIndex={1000} width='100vw' height='100vh' onMouseDown={() => setShowEditConfigs(false)} > 
                            <MotionBox w='400px' initial={{opacity:0, y:15}} maxH={'60vh'} p='15px' h={'fit-content'} mt='20vh'  bg='white'   animate={{opacity:1, y:0}} exit={{opacity:0, y:15}}  transition={{ duration: '.2'}}  onMouseDown={(e) => e.stopPropagation()}  borderRadius={'.5rem'} boxShadow={'rgba(20, 20, 20, 0.2) 0px 16px 32px 0px'}> 
                                <AddConfigBox/>
                            </MotionBox>    
                        </Flex>
                    </Portal>
                </>), [showEditConfigs])
            
                return (<>
                    {showEditConfigs && memoizedAddConfig}

                    <ActionsBox title={t('DeleteConfig', {name:deleteConfig?.name})} showBox={deleteConfig}  setShowBox={() => setDeleteConfig(null)} des={t('DeleteConfigDes')} type='delete' buttonTitle={t('DeleteConfigButton')} actionFunction={deleteConfigFunc}/>
              
                    <Box ref={scrollRef} overflow={'scroll'}  p='1vw'>
 
                        <Flex gap='10px'>
                            <Flex gap='10px' alignItems={'center'}> 
                                 <EditText  placeholder={t('name')} value={flowData?.name} setValue={(value) => setFlowData(prev => ({...prev, name:value})) } className={'title-textarea-collections'}/>
                            </Flex>
                             {memoizedVersionSelector}
                        </Flex>
                        <Text mt='2vh' fontSize={'.8em'} mb='3vh' color={'text_gray'}>{t('EditFunctionDescription')}</Text>

                        <Flex  mb='1vh'  alignItems={'center'} justifyContent={'space-between'}> 
                            <Text fontSize={'.9em'} fontWeight={'medium'}>{t('Description')}</Text>
                            <Button color='white' onClick={AIGeneration} leftIcon={<BsStars/>} size='xs' opacity={0.8} bgGradient={"linear(to-r, rgba(0, 102, 204), rgba(102, 51, 255))"} _hover={{opacity:0.9}}>{waitingAIGeneration ? <LoadingIconButton/>:t('AiGenerate')}</Button>
                        </Flex>
                        <EditText hideInput={false} isTextArea maxLength={2000} placeholder={`${t('Description')}...`} value={flowData?.description} setValue={(value) => setFlowData((prev) => ({...prev, description:value}))}/>
                    
                        <Text mt='3vh' mb='1vh'  fontWeight={'medium'} fontSize={'.9em'}>{t('Configs')}</Text>
                        {flowData?.matilda_configurations_ids?.length === 0 ? <Text color='text_gray' mt='1vh' fontSize={'.8em'}>{t('NoConfigs')}</Text>
                        :<> 
                            {(flowData?.matilda_configurations_ids || []).map((config, index) => {
                                const foundConfig = matildaConfigs.find(con => con.id === config)
                                return (
                                    <Box mt={index === 0?'0':'1vh'} cursor={'pointer'} key={`config-${index}`} borderColor={'border_color'} p='10px' borderRadius={'.5rem'} borderWidth={'1px'}>
                                        <Flex justifyContent={'space-between'}>
                                            <Text fontWeight={'medium'} fontSize={'.9em'}>{foundConfig.name}</Text>
                                            <IconButton variant={'delete'} size={'xs'} aria-label='delete-config' onClick={() => setDeleteConfig(foundConfig)}  icon={<HiTrash size={'14px'}/>}/>
                                        </Flex>
                                        <Text mt='.5vh' sx={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'}} color='text_gray' fontSize={'.7em'}>{foundConfig?.description || t('NoDescription')}</Text>
                                    </Box>
                                )
                            })}
                        </>}
                        <Button size='xs' leftIcon={<FaPlus/>}  variant={'common'} mt='2vh' onClick={() => setShowEditConfigs(true)}>{t('AddConfig')}</Button>

                        <Text mt='3vh'  fontWeight={'medium'} fontSize={'.9em'}>{t('Data')}</Text>
                        <Box mt='1vh'>
                            {['created_at', 'updated_at', 'created_by', 'updated_by'].map((showKey, index) => (
                                <Flex mt='2vh' key={`article-data-${index}`}>
                                    <Text flex='1' fontWeight={'medium'} fontSize={'.8em'} color='text_gray'>{t(showKey)}</Text>
                                    <Box flex='1' maxW={'50%'}> 
                                        <CellStyle column={showKey} element={(flowData as any)?.[showKey]}/>
                                    </Box>
                                </Flex>
                        
                            ))}
                        </Box>
                    </Box>  
                </>)
        
            default: return <></>
        
        }
    }


    //MAKE A FLOW FOR PRODUCTION
    const [waitingPublish, setWitingPublish] = useState<boolean>(false)
    const makePublic = async () => {
        const response = await fetchData({endpoint:`${auth.authData.organizationId}/functions/${flowData.id}/versions/${versionData.id}/deploy`, method:'post', getAccessTokenSilently, auth, setWaiting:setWitingPublish})
        if (response?.status === 200) setVersionData(prev => ({...prev, is_production:true}))
    } 

    //TEST BOX
    const [showTestFlow, setShowTestFlow] = useState<boolean>(false)
    const TestFunction = () => {

        //FUNCTION TESTED
        const [functionResult, setFunctionResult] = useState<FunctionResultType | null>(null)

        const TestParameters = () => {

            //WAITNG FUNCTION EXECUTION AND RESPONSE
            const [waitingTest, setWaitingTest] = useState<boolean>(false)

            //SELCETED ARGS
            const [selectedArgs, setSelectedArgs] = useState<parameterType[]>(nodes[0]?.data.data.parameters || [])

            //EDIT FUNCTION ARGS
            const editSelectedArgs = (value:any, index:number) => {
                setSelectedArgs(prev => {
                    const updatedArgs = [...prev]
                    updatedArgs[index] = {...updatedArgs[index]}
                    return updatedArgs
                }) 
            }

            //SEND A FUNCTION TO TEST
            const testFunction = async () => {
                const requestDict = selectedArgs.reduce((acc: Record<string, any>, curr) => {
                     return acc  
                }, {} as Record<string, any>)
            
                const response = await fetchData({endpoint:`${auth.authData.organizationId}/functions/${flowData.id}/versions/${versionData.id}/blocks/${nodes[0]?.data.data.id}/run`, method:'post', getAccessTokenSilently, setWaiting:setWaitingTest, setValue:setFunctionResult,  auth, requestForm:requestDict})
             }

            return(<>
                <Box p='15px'> 
                    <Text fontWeight={'medium'} fontSize={'1.2em'}>{t('SelectFunctionArgs')}</Text>
                    <Text color='text_gray' fontSize={'.8em'}>{t('SelectFunctionArgsDes')}</Text>
                    <Box width={'100%'} mt='1vh' mb='2vh' height={'1px'} bg='border_color'/>
                    {selectedArgs.map((arg, index) => (
                    <Fragment key={`arg-${index}`}>
                        <Text fontWeight={'medium'} mt='1vh' fontSize={'.9em'} mb='.5vh'>{arg.name}</Text>
                        <Box flex='2'>
                            <VariableTypeChanger customType inputType={arg.type} value={''} setValue={(value) => editSelectedArgs(value, index)}/>
                        </Box>
                    </Fragment>))}
             
                    <Button size='sm'  mt='3vh'  w={'100%'} variant={'main'} onClick={testFunction}>{waitingTest?<LoadingIconButton/>:t('Test')}</Button>
                    <Button size='sm'  mt='1vh'   w={'100%'}  variant={'common'} onClick={() => setShowTestFlow(false)}>{t('Cancel')}</Button>
                </Box>
            </>)
        }

        const memoizedFunctionResult = useMemo(() => (<> 
            {functionResult && 
                <ConfirmBox upPosition setShowBox={setShowTestFlow} > 
                    <Box p='15px'> 
                        <Text fontSize={'1.2em'}   fontWeight={'medium'}>{t('FunctionResult')}</Text>
                        <Box height={'1px'} width={'100%'} bg='border_color' mt='1vh' mb='1vh'/>
                        {functionResult.run_successful ? <>
                            <Flex gap='10px' alignItems={'center'} mb='1vh'> 
                                <Icon as={FaCheckCircle} color={'green'}/>
                                <Text fontWeight={'medium'}>{t('RunSuccessefully')}</Text>
                            </Flex>
                            <Text fontWeight={'medium'}>{t('OutputsReturned')}</Text>
                            <Text>{JSON.stringify(functionResult.result)}</Text>
                        
                        </>:<> 
                        <Flex gap='10px' alignItems={'center'} mb='1vh'> 
                            <Icon as={FaTimesCircle} color={'red'}/>
                            <Text>{t('RunError')}</Text>
                        </Flex>
                        <Text color='red' fontSize={'.8em'}>{functionResult.error_message}</Text>
                        <Text fontSize={'.8em'} mt='.5vh' color='red'>[{t('ErrorLine', {line:functionResult.error_line})}]</Text>
                        </>}
                    </Box>
                
                    <Flex p='20px' mt='2vh' gap='15px' flexDir={'row-reverse'} bg='gray.50' borderTopWidth={'1px'} borderTopColor={'border_color'}>
                        <Button size='sm' variant={'common'} onClick={() => setShowTestFlow(false)}>{t('Accept')}</Button>
                    </Flex>
                </ConfirmBox>
                }
            </>), [functionResult])
            
        const memoizedTest = useMemo(() => (
            <ConfirmBox  setShowBox={setShowTestFlow}> 
                <TestParameters/>
            </ConfirmBox>
                
        ), [functionResult])
            
        return (<>{functionResult ? memoizedFunctionResult:memoizedTest}</>)
    }


    //DELETE BOX
    const DeleteBox = () => {
        const [ waitingDelete, setWaitingDelete] = useState<boolean>(false)

        const handleDeleteFunctions= async() => {
            const response = await fetchData({endpoint:`${auth.authData.organizationId}/functions/${flowData.id}`, getAccessTokenSilently, setWaiting:setWaitingDelete, method:'delete', auth, toastMessages:{'works':t('CorrectDeletedFunctions'), 'failed':t('FailedDeletedFunctions')}})
            if (response?.status == 200) {
                navigate('/functions')   
             }
        }
    
        return (<> 
            <Flex flexDir={'column'} alignItems={'center'} p='15px' maxW={'350px'}> 
         
                <Text mt='1vh'textAlign={'center'} fontWeight={'medium'} fontSize={'1.1em'}>{parseMessageToBold(t('DeleteFunctionAnswer', {name:flowData?.name}))}</Text>
                <Text   fontSize={'.8em'} mt='2vh' color='text_gray'>{t('DeleteFunctionWarning')}</Text>
                <Button mt='3vh' size='sm' w='100%' variant={'delete'}onClick={handleDeleteFunctions}>{waitingDelete?<LoadingIconButton/>:t('Delete')}</Button>
                <Button mt='1vh' size='sm'  w='100%'  variant={'common'} onClick={() => setShowConfirmDelete(false)}>{t('Cancel')}</Button>
            </Flex>            
            </>)
    }

    //MEMOIZED NODE EDITOR
    const memoizedNodesEditor = useMemo(() => (<NodesEditBox/>), [showNodesAction])

    //MEMOIZED TEST FUNCTION
    const memoizedTestFunction = useMemo(() => (<>{showTestFlow && <TestFunction/>}</>), [showTestFlow])

    //BOX FOR CONFIRMING THE DELETION OF A FUNCTION
    const memoizedDeleteBox = useMemo(() => (
        <ConfirmBox setShowBox={setShowConfirmDelete}> 
            <DeleteBox/>
        </ConfirmBox>
    ), [showConfirmDelete])

 
    const memoizedActionsButton = useMemo(() => (<ActionsButton copyAction={() => {}} deleteAction={() => setShowConfirmDelete(true)} />), [])
    const memoizedVersionSelector = useMemo(() => (<VersionSelector />), [flowData, selectedVersion])


    //FRONT
    return (<>
        {memoizedTestFunction}
        <ActionsBox title={t('DeleteBlockName', {name:deleteNodeId?.name || ''})} showBox={deleteNodeId}  setShowBox={() => setDeleteNodeId(null)} des={t('DeleteBlockDes')} type='delete' buttonTitle={t('DeleteBlock')} actionFunction={() => deleteNode(deleteNodeId.id)}/>

        {showConfirmDelete && memoizedDeleteBox} 
         <AnimatePresence>
            {(showNodesAction) && 
                <MotionBox ref={editorRef} overflowY={'scroll'} initial={{ right: -45  + 'px', opacity: showNodesAction? 1:0, width: showNodesAction.actionType === 'code' ? Math.min(window.innerWidth * 0.6, window.innerWidth - 500) : '500px'}} animate={{ right: 0,  opacity: showNodesAction?1:0, width:showNodesAction.actionType === 'code' ? Math.min(window.innerWidth * 0.6, window.innerWidth - 500):'500px' }} exit={{ right:-45 ,  opacity: showNodesAction?0:1, width:showNodesAction.actionType === 'code' ? Math.min(window.innerWidth * 0.6, window.innerWidth - 500):'500px' }} transition={{ duration: '.3', ease: 'easeOut'}} 
                bg='white' top={0} minHeight="100vh" maxHeight="100vh" boxShadow={"-4px 0 6px -2px rgba(0, 0, 0, 0.1)"} borderLeftColor={'border_color'} borderLeftWidth={'1px'} right={0} pointerEvents={showNodesAction?'auto':'none'} height={'100vh'}   position='absolute' zIndex={100} overflow={'hidden'} >
                    {memoizedNodesEditor}
                </MotionBox>}
        </AnimatePresence>

        <Flex height={'100vh'} justifyContent={'center'} alignItems={'center'} width={'100%'} flexDir={'column'} bg='clear_white' backdropFilter='blur(1px)' >

            {waitingInfo ? <LoadingIconButton/> :
            <> 

                <Flex  bg='clear_white' flexDir='column' height={'100vh'} width={'100%'} position={'absolute'} right={0} overflowY={'hidden'}  transition={'width ease-in-out .2s'}>
                    <Flex px='1vw' gap='2vw' height={'60px'} alignItems={'center'}  width={'100%'} justifyContent={'space-between'}  borderBottomWidth={'1px'} borderBottomColor={'border_color'}>
                        
                        <Flex alignItems={'center'} flex='1'>
                            {isExpanded &&<RenderSectionPath sectionsPath={sectionsPath} sectionsPathMap={sectionsPathMap} selectedView={selectedView}/>}
                            <Skeleton isLoaded={flowData !== null && !waitingInfo} style={{flex:1, fontSize:'.8em'}}> 
                                <EditText placeholder={t('Name') + '...'} value={flowData?.name} setValue={(value:string) => setFlowData(prev => ({...prev, name:value}) )} className="title-textarea"/>
                            </Skeleton>
                        </Flex>

                        <Flex gap='10px' > 
                        
                            {memoizedActionsButton}
                            <Button variant={'common'} size='sm' leftIcon={<FaEye/>} onClick={() => setShowNodesAction({nodeId:'', actionType:'flow', actionData:flowData})}>{t('SeeData')}</Button>

                            <Button variant={'common'} size='sm' leftIcon={<FaPlay/>} onClick={() => setShowTestFlow(true)}>{t('TestFlow')}</Button>
                            <Skeleton isLoaded={flowData !== null && !waitingInfo}> 
                                <Button  variant='common' size={'sm'} onClick={() =>makePublic()} leftIcon={<FaCircleDot color={versionData?.is_production?'#68D391':'#ECC94B'}/>}>{waitingPublish ? <LoadingIconButton/>: flowData ? versionData?.is_production?t('IsLive'):t('NotIsLive'):t('IsLive')}</Button>
                            </Skeleton>
                            <Button variant={'main'} size='sm' onClick={saveChanges}>{waitingSave? <LoadingIconButton/>:t('SaveChanges')}</Button>
                        </Flex>
                    </Flex>
                
                    <Box flex='1' w={'100%'} overflow={'scroll'}>
                        <ReactFlow nodesDraggable={false} panOnScroll  panOnDrag={panOnDrag} selectionMode={SelectionMode.Partial} defaultViewport={{ x: 100, y: 200, zoom: 1 }}   nodes={nodes} nodeTypes={nodeTypes}  edgeTypes={edgeTypes} onNodesChange={onNodesChange} edges={edges} onEdgesChange={onEdgesChange}>
                            <Controls showFitView={false} showInteractive={false} position='bottom-right'>
                            </Controls>
                            <Background  gap={12} size={1} />
                        </ReactFlow>
                    </Box>
                </Flex>
            </>}
        </Flex>
    </>)
}

export default Flow
 
interface EditStructureProps {
    data:{var:string, op:string, val:any} 
    setData:(newData:{var:string, op:string, val:any}  ) => void
    operationTypesDict:{[key:string]:{name:string, type:'boolean' | 'integer' | 'number' | 'string' | 'array' | 'timestamp', is_custom?:boolean}}
    typesMap:{[key:string]:string[]}
    scrollRef:RefObject<HTMLDivElement>
    deleteFunc?:() => void
    customOptions?:{[key:string | number]:string}
}


//PARAMETER SECTION
const ParameterSection = ({data, index, expandedParameters, updateDataList, toggleExpanded}:{data:parameterType, index:number, expandedParameters:number[], updateDataList:any, toggleExpanded:(type:'variables' | 'parameters', index:number) => void}) => {
          
    //CONSTANTS
    const { t } = useTranslation('functions')
    const variablesMap:{[key:string]:[string, ReactElement]} = {'boolean':[t('bool'), <AiOutlineCheckCircle/>], 'integer':[t('int'), <FiHash/>], 'number':[t('float'), <TbMathFunction/>], 'string':[t('str'), <FiType/>], 'timestamp':[t('timestamp'), <AiOutlineCalendar/>], 'array':[t('array'), <MdOutlineFormatListBulleted/>]}

    //IS HOVERING
    const [isHovering, setIsHovering] = useState<boolean>(false)
   
    //DATA
    const [param, setParam] = useState<parameterType>(data)
    const [text, setText] = useState<string>('')
    useEffect(() => {updateDataList('parameters', 'edit', index, param) },[param])

    //EDIT ENUM
    const editList = (action: 'delete' | 'add', enumIndex?: number, newValue?: string) => {
        let updatedEnum = param.enum
        if (action === 'delete' && index !== undefined) updatedEnum.splice(enumIndex, 1)
        else if (action === 'add' && newValue) {
            updatedEnum.push(newValue)
            setText('')
        }
        updateDataList('parameters', 'edit', index, {...param, enum:updatedEnum})
    }
    
    return (
        <Box mt={index!== 0 ?'1vh' : '0'} p='10px' borderRadius={'.5rem'} borderColor={'border_color'} borderWidth='1px' onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}> 
            <Flex alignItems={'center'} gap='10px'> 
                <EditText  placeholder={t('name')} value={param?.name} setValue={(value)  => setParam(prev =>({...prev, name:value}))} className={'description-textarea-functions-2'}/>
            
                <IconButton onClick={() => updateDataList('parameters', 'delete', index)} size='xs' opacity={isHovering ? 1:0} transition={'opacity .2s ease-in-out'}  variant={'delete'} icon={<HiTrash size={'14px'}/>} aria-label='delete-param'/>
                <IoIosArrowDown cursor={'pointer'}  className={expandedParameters.includes(index) ? "rotate-icon-up" : "rotate-icon-down"} onClick={() => toggleExpanded('parameters', index)}/>
            </Flex>    

            <div className={`expandable-container ${expandedParameters.includes(index)  ? 'expanded' : 'collapsed'}`} style={{ overflow: expandedParameters.includes(index)  ? 'visible' : 'hidden',   transition: expandedParameters.includes(index)  ?'max-height .2s ease-in-out, opacity 0.2s ease-in-out': 'max-height .2s ease-out, opacity 0.2s ease-out'}}>      

                <Box mt='1vh'> 
                <EditText hideInput={false} isTextArea maxLength={2000} placeholder={`${t('Description')}...`} value={param?.description} setValue={(value)  => setParam(prev =>({...prev, description:value}))} />
                </Box>

                <Flex  mt='2vh' flexWrap={'wrap'} gap='10px'>
                    {Object.keys(variablesMap).map((selType, selIndex) => (
                        <Flex key={`var-${selIndex}`}  transition={'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out,box-shadow 0.2s ease-in-out'} onClick={()  => setParam(prev =>({...prev, type:selType}))} p='7px' borderRadius={'.5rem'} gap='10px' cursor={'pointer'} alignItems={'center'} color={param?.type === selType ? 'text_blue':'black'} boxShadow={ param?.type  === selType  ? '0 0 0 1px rgb(59, 90, 246)' : ''} _hover={{bg:'hover_gray'}} border={param?.type  === selType  ? '1px solid rgb(59, 90, 246)': '1px solid #E2E8F0'}>
                            {variablesMap[selType][1]}
                            <Text fontSize={'.8em'}>{variablesMap[selType][0]}</Text>
                        </Flex>
                    ))}
                </Flex>
                
                <Text fontSize={'.9em'}   mt='3vh' fontWeight={'medium'}>{t('AllowedValues')}</Text>
                <Flex flexWrap="wrap" gap='5px' mt='.5vh' alignItems="center" >
                    {(!param?.enum || param?.enum?.length === 0)?<Text fontSize={'.75em'}>{t('NoValues')}</Text>:
                    param.enum.map((variable, enumIndex) => (
                        <Flex key={`value-${enumIndex}`} borderRadius=".4rem" p='5px' fontSize={'.75em'} alignItems={'center'}  bg='gray_1'  shadow={'sm'} gap='5px'>
                            <Text>{t(variable)}</Text>
                            <Icon as={RxCross2} onClick={() => editList('delete', enumIndex)} cursor={'pointer'} />
                        </Flex>
                    ))}
                </Flex>  
                <Flex gap='10px' alignItems={'end'} mt='2vh'> 
                    <EditText value={text} setValue={setText} hideInput={false}/>   
                    <Button variant={'common'} leftIcon={<FaPlus/>} size='xs' onClick={() =>editList('add', null, text ) }>{t('Add')}</Button>
                </Flex>
                <Flex mt='3vh' gap='10px'alignItems={'center'}>
                    <Switch isChecked={param.confirm} onChange={(e) => setParam(prev =>({...prev, confirm:e.target.checked}))}/>
                    <Text fontSize={'.9em'} fontWeight={'medium'}>{t('AskConfirmation')}</Text>  
                </Flex>  
            </div>

    </Box>)
}

//VARIABLE SECTION
const VariableSection = ({data, index, expandedVariables, updateDataList, toggleExpanded}:{data:{name:string, type:string}, index:number, expandedVariables:number[], updateDataList:any, toggleExpanded:(type:'variables' | 'parameters', index:number) => void}) => {
   
    //CONSTANTS
    const { t } = useTranslation('functions')
    const variablesMap:{[key:string]:[string, ReactElement]} = {'boolean':[t('bool'), <AiOutlineCheckCircle/>], 'integer':[t('int'), <FiHash/>], 'number':[t('float'), <TbMathFunction/>], 'string':[t('str'), <FiType/>], 'timestamp':[t('timestamp'), <AiOutlineCalendar/>], 'array':[t('array'), <MdOutlineFormatListBulleted/>]}

    //IS HOVERING
    const [isHovering, setIsHovering] = useState<boolean>(false)

    //DATA
    const [variable, setVariable] = useState<{name:string, type:string}>(data)
    useEffect(() => {updateDataList('variables', 'edit', index, variable) },[variable])
 
    return (
        <Box p='10px' borderRadius={'.5rem'} borderColor={'border_color'} borderWidth='1px'onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}> 
            <Flex alignItems={'center'} gap='10px'> 
                <EditText  placeholder={t('name')} value={variable?.name}  setValue={(value)  => setVariable(prev =>({...prev, name:value}))}  className={'description-textarea-functions-2'}/>
                <IconButton onClick={() => updateDataList('variables', 'delete', index)} size='xs' opacity={isHovering ? 1:0} transition={'opacity .2s ease-in-out'}  variant={'delete'} icon={<HiTrash size={'14px'}/>} aria-label='delete-param'/>
                <IoIosArrowDown  cursor={'pointer'}className={expandedVariables.includes(index) ? "rotate-icon-up" : "rotate-icon-down"}  onClick={() => toggleExpanded('variables', index)}/>
            </Flex>  
            <div className={`expandable-container ${expandedVariables.includes(index)  ? 'expanded' : 'collapsed'}`} style={{ overflow: expandedVariables.includes(index)  ? 'visible' : 'hidden',   transition: expandedVariables.includes(index)  ?'max-height .2s ease-in-out, opacity 0.2s ease-in-out': 'max-height .2s ease-out, opacity 0.2s ease-out'}}>      

                <Text fontSize={'.9em'}  mt='3vh' fontWeight={'medium'}>{t('Type')}</Text>
                <Flex  mt='2vh' flexWrap={'wrap'} gap='10px'>
                    {Object.keys(variablesMap).map((selType, selIndex) => (
                        <Flex key={`var-${selIndex}`}  transition={'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out,box-shadow 0.2s ease-in-out'} onClick={() => setVariable(prev =>({...prev, type:selType})) } p='7px' borderRadius={'.5rem'} gap='10px' cursor={'pointer'} alignItems={'center'} color={variable?.type === selType ? 'text_blue':'black'} boxShadow={ variable?.type  === selType  ? '0 0 0 1px rgb(59, 90, 246)' : ''} _hover={{bg:'hover_gray'}} border={variable?.type  === selType  ? '1px solid rgb(59, 90, 246)': '1px solid #E2E8F0'}>
                            {variablesMap[selType][1]}
                            <Text fontSize={'.8em'}>{variablesMap[selType][0]}</Text>
                        </Flex>
                    ))}
                </Flex>
            </div>
        </Box>)
    }

//MAIN FUNCTION
const EditFunctionStructure = ({data, setData, operationTypesDict, typesMap, scrollRef, deleteFunc, customOptions}:EditStructureProps) => {

 
    //TRANSLATION
    const { t } = useTranslation('settings')
    const operationLabelsMap = {'between':t('between'), 'lt':t('lt'), 'gt':t('gt'), 'starts_with':t('starts_with'), 'ends_with':t('ends_with'), 'set':t('set'), 'add':t('add'), 'substract':t('substract'), 'concatenate':t('concatenate'), 'append':t('append'), 'remove':t('remove'), 'eq':t('eq'), 'exists':t('exists'), 'neq':t('neq'), 'leq':t('leq'), 'geq':t('geq'), 'in':t('in'), 'nin':t('nin'), 'contains':t('contains'), 'ncontains':t('ncontains')}
    const datesMap =  {'Today':t('Today'), 'Yesterday':t('Yesterday'), 'Past 1 week':t('1Week'), 'Past 1 month':t('1Month'), 'Past 3 months':t('3Month'), 'Past 6 months':t('6Month'), 'Past 1 year':t('1Year')}

    let labelsMap:{[key:string | number]:string} = {}

    if (customOptions) labelsMap = customOptions
    else Object.keys(operationTypesDict).map(label => {labelsMap[label] = operationTypesDict[label].name} )
    
    //IS HOVERING
    const [isHovering, setIsHovering] = useState<boolean>(false)

    //BOOLEAN TO CONTROL THE VISIBILITY OF THE LIST AND CLOSE ON OUTSIDE CLICK
    const buttonRef = useRef<HTMLDivElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)
    const [showList, setShowList] = useState<boolean>(false)
    useOutsideClick({ref1:buttonRef, ref2:boxRef, containerRef:scrollRef, onOutsideClick:setShowList})

    //BOX POSITION LOGIC, TO SHOW IT UP OR DOWN OF THE INPUT, DEPENDING ON THE POSITION
    const [boxStyle, setBoxStyle] = useState<CSSProperties>({})
    determineBoxStyle({buttonRef, setBoxStyle, changeVariable:showList})

 
   return(
        <>
            <Flex display={'inline-flex'} h='28px' position={'relative'} ref={buttonRef} p='7px' borderRadius={'.5rem'} bg='gray_2' cursor={'pointer'} alignItems={'center'} justifyContent={'space-between'} _hover={{color:'text_blue'}} onClick={()=> setShowList(true)} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
              <Text fontWeight={'medium'} fontSize={'.8em'}>{operationTypesDict?.[data?.var]?.name} {(operationLabelsMap as any)[data.op as string]?.toLocaleLowerCase()} {operationTypesDict?.[data?.var]?.type === 'boolean'? data?.val ?  t('True'): t('False'): operationTypesDict?.[data?.var]?.type === 'timestamp' ? (datesMap as any)?.[data?.val] || '': data?.val}</Text>
                
                {isHovering && 
                    <Flex alignItems={'center'} justifyContent={'center'} bg={'gray_2'} backdropFilter="blur(1px)"  px='5px' position={'absolute'} right={'0px'} > 
                        <Icon boxSize={'16px'} as={RxCross2} onClick={(e) => {e.stopPropagation(); if (deleteFunc) deleteFunc()}}/>
                    </Flex>}
            </Flex>
            <AnimatePresence> 
                {showList && 
                    <Portal>
                        <MotionBox  initial={{ opacity: 0, marginTop:-10, marginBottom:-10 }} animate={{ opacity: 1, marginTop: 0,marginBottom:0 }}  exit={{ opacity: 0,marginTop:-10,marginBottom:-10}} transition={{ duration: '.2', ease: 'easeOut'}}
                        top={boxStyle.top} id='custom-portal' bottom={boxStyle.bottom} transform={`translateY(${boxStyle.top ? '28px' : '-28px'})`} marginTop='10px' marginBottom='10px' left={boxStyle.left}  right={boxStyle.right}  width={boxStyle.width} minW={'300px'} maxW={'500px'} maxH='40vh' overflow={'scroll'} gap='10px' ref={boxRef} fontSize={'.9em'} boxShadow={'0px 0px 10px rgba(0, 0, 0, 0.2)'} bg='white' zIndex={100000}   position={'absolute'} borderRadius={'.5rem'} >
                            <Box p='15px' alignItems={'center'} gap='10px' >
                                <Box mb='2vh' flex='1'> 
                                    <CustomSelect onlyOneSelect markSelect options={Object.keys(labelsMap)} selectedItem={data.var as any} labelsMap={labelsMap} setSelectedItem={(value) => setData({...data, var:value as string})}/>
                                </Box>
                                {(( typesMap?.[operationTypesDict[data.var]?.type] || [])).map((op, opIndex) => (
                                    <Box mt='1vh' key={`operation-${opIndex}`}>
                                        <Flex mb='.5vh'   gap='10px' alignItems={'center'}>
                                            <Radio isChecked={data.op === op}  onClick={() => setData({...data, 'op':op})}/>
                                            <Text fontWeight={'medium'} color='text_gray' fontSize={'.9em'}>{(operationLabelsMap as any)[op as string]}</Text>
                                        </Flex>
                                        {data.op === op && 
                                        <Box ml='30px'>
                                            <VariableTypeChanger customType={operationTypesDict[data.var].is_custom} inputType={operationTypesDict[data.var].is_custom ? operationTypesDict[data.var].type : data.var as string} value={data.val} setValue={(value) => setData({...data, 'val':value})} operation={data.op}/>
                                        </Box>}
                                    </Box>
                                ))}
                            </Box>
                            <Flex py='10px' justifyContent={'center'} borderTopColor={'border_color'} borderTopWidth={'1px'}>
                                <Text cursor={'pointer'} _hover={{color:'rgb(59, 90, 246, 0.9)'}} onClick={() => setShowList(false)} fontWeight={'medium'} color='text_blue'>{t('Ready')}</Text>
                            </Flex>
                        </MotionBox>
                    </Portal>}
            </AnimatePresence> 
        </>)
}

const CodeBox = ({code, codeRef}:{code:string, codeRef:MutableRefObject<string>}) => {
    const [codeToEdit, setCodeToEdit] = useState<string>(code)
    useEffect(() => {codeRef.current = codeToEdit},[codeToEdit])
    return (
        <CodeMirror value={codeToEdit} style={{fontSize:'.8em'}} height={`${window.innerHeight - 50}px`} extensions={[python(),EditorState.tabSize.of(4)]} onChange={(value) => setCodeToEdit(value) } theme={oneDark}/>
    )
}


 
{/*
function areArraysDifferent(arr1:any[], arr2:any) {
    const cleanObject = (obj: any) => {
        const { position, height, width, id, type, data, ...rest } = obj
            const { functions, ...dataWithoutFunctions } = data
        return {id, type, data: dataWithoutFunctions}
    }
    if (arr1.length !== arr2.length) return true
    for (let i = 0; i < arr1.length; i++) {
      if (JSON.stringify(cleanObject(arr1[i])) !== JSON.stringify(cleanObject(arr2[i]))) return true
    }
    return false
  }
  
const ErrorBox = ({error, onClickError}:{error:ErrorsType, onClickError:(args:{id:string, args:any}) => void}) => {

    const { t } = useTranslation('settings')
    const [expandDescription, setExpandDescription] = useState<boolean>(true)
    
    return (
    <Box  px='1vw' _hover={{bg:'gray_2'}} cursor={'ponter'}   w='100%'  onClick={() => onClickError({id:error.id, args:error.arguments})}>
        <Flex pt='10px' cursor={'pointer'} onClick={() => setExpandDescription(!expandDescription) } justifyContent={'space-between'} alignItems={'center'}>
            <Flex fontSize={'.8em'} alignItems={'center'} gap='10px'> 
                <Text >{error.occurred_at}</Text>
                <Text   color='red'>Error: {t('Line')} {error.line}</Text>
             </Flex>
         </Flex>
        <Box py='10px'> 
            <Text whiteSpace={'wrap'}fontSize={'.8em'} color={'text_gray'}>{error.description}</Text>
        </Box>
        <Box h='1px' w='100%' bg='border_color' />
        
    </Box>)
}

const LogBox = ({log}:{log:LogsType}) => {

    const { t, i18n } = useTranslation('settings')
    const [expandDescription, setExpandDescription] = useState<boolean>(false)
    
    return (
        <Box  px='1vw' _hover={{bg:'gray_2'}}     w='100%' >
            <Box pt='10px'  cursor={'pointer'}  onClick={() => setExpandDescription(!expandDescription) }> 
                <Flex justifyContent={'space-between'} alignItems={'center'}>
                    <Flex fontSize={'.8em'} alignItems={'center'} gap='10px'> 
                        <Text >{log.occurred_at}</Text>
                        <Text   color={log.successful ?'green':'red'}>{log.successful ? t('RunSuccessful'):'Error'}</Text>
                    </Flex>
                    <IoIosArrowDown  className={expandDescription ? "rotate-icon-up" : "rotate-icon-down"}/>

                </Flex>
                <Text mt='5px' whiteSpace={'wrap'}fontSize={'.8em'}><span style={{fontWeight:500}}>{t('ExecutionTime')}:</span> {parseNumber(i18n, log.execution_time_ms)} ms, <span style={{fontWeight:500}}>{t('MemoryUsage')}:</span> {parseNumber(i18n, log.memory_usage_kb)} KB</Text>
            </Box>
            <Box py='7px'> 
                 <div className={`expandable-container ${expandDescription ? 'expanded' : 'collapsed'}`} style={{ overflow: expandDescription ? 'visible' : 'hidden',   transition: expandDescription ?'max-height .2s ease-in-out, opacity 0.2s ease-in-out': 'max-height .2s ease-out, opacity 0.2s ease-out'}}>      
                    <Text mt='3px' whiteSpace={'wrap'}fontSize={'.7em'} color='text_gray'><span style={{fontWeight:600}}> {t('ArgumentsLog')}:</span> {JSON.stringify(log.arguments)}</Text>
                    <Text mt='10px' whiteSpace={'wrap'}fontSize={'.7em'} color='text_gray'><span style={{fontWeight:600}}> {t('Result')}:</span> {JSON.stringify(log.result)}</Text>
                </div>
            </Box>
            <Box h='1px' w='100%' bg='border_color' />
            
        </Box>

  )
}

*/}



 