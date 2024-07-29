
//REACT
import { Dispatch, SetStateAction } from "react"
//FRONT
import { Box, Text, Flex, Checkbox, Button, Icon } from "@chakra-ui/react"
import { IconType } from "react-icons"
import { IoMdArrowDropright, IoMdArrowDropleft, IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io"


const KeyElement = ({keys, description}:{keys:(string | IconType)[], description:string}) => {


    return (
        <Flex alignItems={'center'} gap='15px' fontSize={'.9em'} mt='1vh'>
            <Flex gap='5px'>
                {keys.map((key, index) => (<> 
                    <Flex key={`key-${index}-${description}`} px='5px' borderRadius={'.2rem'} bg='gray.200' borderColor={'gray.300'} justifyContent={'center'} alignItems={'center'} borderWidth={'1px'}>
                        {typeof(key) === 'string' ? <Text>{key}</Text> :<Icon boxSize={'1em'} as={key}/>}
                    </Flex>
                    {index !== keys.length -1 && <Text fontWeight={'medium'}>+</Text>}
                </>))}
            </Flex>
            <Text>{description}</Text>
        </Flex>
    )
}


const ShortCutsList = ({setShowShowShortcuts}:{setShowShowShortcuts:Dispatch<SetStateAction<boolean>>}) => {
    
    const downloadPdf = () => {

    }

    return (
    <Flex flexDir='column' justifyContent={'space-between'} maxH={'90vh'}> 
        <Box p='20px'>
            <Text fontSize={'1.2em'} fontWeight={'medium'}>Atajos del teclado</Text>        
        </Box>
 
        <Box flex='1' borderBottomColor={'gray.200'} borderTopColor={'gray.200'}  borderWidth={'1px 0 1px 0'}  p='20px' overflowY={'scroll'}> 
            <Flex gap='50px'> 
                <Box>
                    <Text fontWeight={'medium'}>Navegación</Text>
                    <Text fontSize={'.9em'} fontWeight={'medium'} color='gray.600' >Se usan en cualquier lugar</Text>        
                    <KeyElement keys={['Ctrl', 'Alt', 'v']} description="Acceder a tickets"/>
                    <KeyElement keys={['Ctrl', 'Alt', 'c']} description="Acceder a clientes"/>
                    <KeyElement keys={['Ctrl', 'Alt', 'b']} description="Acceder a empresas de contacto"/>
                    <KeyElement keys={['Ctrl', 'Alt', 't']} description="Acceder a estadísticas"/>
                    <KeyElement keys={['Ctrl', 'Alt', 'a']} description="Acceder a ajustes"/>
                    <KeyElement keys={['Ctrl', 'Alt', 'w']} description="Cerrar pestaña actual"/>
                    <KeyElement keys={['Ctrl', 'Alt', IoMdArrowDropleft]} description="Ir a la anterior pestaña"/>
                    <KeyElement keys={['Ctrl', 'Alt', IoMdArrowDropright]} description="Ir a la próxima pestaña"/>

                    <Text  fontWeight={'medium'} fontSize={'.9em'} mt='3vh' color='gray.600' >Se usan en las listas (vistas, resultados, etc.)</Text>      
                    <KeyElement keys={[IoMdArrowDropup, IoMdArrowDropdown]} description="Subir o bajar"/>
                    <KeyElement keys={[IoMdArrowDropleft, IoMdArrowDropright]} description="Desplazarse a la izquierda o a la derecha"/>
                    <KeyElement keys={['Enter']} description="Clicar en el elemento seleccionado"/>
                    <KeyElement keys={['Espacio']} description="Marcar el elemento actual"/>
                </Box>
                
                <Box>
                    <Text  fontWeight={'medium'}>Tickets</Text>
                    <Text fontWeight={'medium'} fontSize={'.9em'} color='gray.600' >Se usan al estar dentro de un ticket</Text>        
                    <KeyElement keys={['Ctrl', 'Alt', 'r']} description="Abrir respuesta pública"/>
                    <KeyElement keys={['Ctrl', 'Alt', 'n']} description="Abrir nota interna"/>
                    <KeyElement keys={['Ctrl', 'Alt', 'h']} description="Ocultar o mostrar pestaña de cliente"/>
                   
                    <Text  fontWeight={'medium'} fontSize={'.9em'} mt='3vh' color='gray.600' >Se usan al guardar o actualizar un ticket</Text>        
                    <KeyElement keys={['Ctrl', 'Alt', 'u']} description="Guardar con el estado actual"/>
                    <KeyElement keys={['Ctrl', 'Alt', 'o']} description="Guardar como abierto"/>
                    <KeyElement keys={['Ctrl', 'Alt', 'p']} description="Guardar como pendiente"/>
                    <KeyElement keys={['Ctrl', 'Alt', 's']} description="Guardar como resuelto"/>

                    <Text  fontWeight={'medium'} fontSize={'.9em'} mt='3vh' color='gray.600' >Se usan al escribir</Text>        
                    <KeyElement keys={['Cmd/Ctrl', 'm']} description="Insertar imagen"/>
                    <KeyElement keys={['Cmd/Ctrl', 'k']} description="Insertar link"/>
                    <KeyElement keys={['Cmd/Ctrl', 'b']} description="Insertar negrita"/>
                    <KeyElement keys={['Cmd/Ctrl', 'i']} description="Insertar cursiva"/>
                    <KeyElement keys={['Cmd/Ctrl', 'u']} description="Insertar subrayado"/>
                    <KeyElement keys={['Cmd/Ctrl', 'Mayus', '5']} description="Insertar bloque de código"/>
                    <KeyElement keys={['Cmd/Ctrl', 'Mayus', '6']} description="Insertar lista numerada"/>
                    <KeyElement keys={['Cmd/Ctrl', 'Mayus', '7']} description="Insertar lista de viñetas"/>
                    
                </Box>
            </Flex>
        </Box>

         
        <Flex p='20px' justifyContent={'space-between'} alignItems={'center'}>  
            <Box>   
                <Flex gap='7px'>
                    <Checkbox/>
                    <Text fontSize={'.9em'} fontWeight={'medium'}>Activar atajos del teclado</Text>
                </Flex>
            </Box>
            <Flex gap='15px'> 
                 <Button  size='sm' onClick={()=>setShowShowShortcuts(false)}>Cancelar</Button>
                 <Button  size='sm' bg='brand.gradient_blue' color={'white'} _hover={{bg:'brand.gradient_blue_hover'}} onClick={downloadPdf}>Descargar como PDF</Button>
            </Flex>
        </Flex>
    </Flex>)
}

export default ShortCutsList