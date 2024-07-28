/* 
  MAKE A CUSTOM COMPONENT TO UPLOAD IMAGES
*/

//REACT
import { useState, useEffect } from 'react'
//FRONT
import { Flex, Text, Box, Image, IconButton } from '@chakra-ui/react'
//ICONS
import { RxCross2 } from 'react-icons/rx'


interface ImageUploadProps {
  id: number
  initialImage: string | undefined
  onImageUpdate: (file: File | null) => void;
}
//MAIN FUNCTION
const ImageUpload = ({ id, initialImage, onImageUpdate }:ImageUploadProps) => {

  //IMAGES VARIABLES
  const [image, setImage] = useState<File | undefined | string>(initialImage)
  const [imagePreview, setImagePreview] = useState<string | undefined>(initialImage)

  //ERROR MESSAGE
  const [error, setError] = useState<string | null>(null)

  //SET THE IMAGE
  useEffect(() => {
    if (initialImage) setImagePreview(initialImage)
  }, [initialImage])

  //RECEIVE THE IMAGE, STORE IT AND DETERMINE THE SIZE
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif']
        if (!validTypes.includes(file.type)) {
            setError('Solo se permiten archivos JPEG, PNG o GIF.')
            setImage(undefined)
            setImagePreview(undefined)
            return
        }
        const maxSize = 100 * 1024
        if (file.size > maxSize) {
            setError('El archivo debe de pesar menos de 100 KB.')
            setImage(undefined)
            setImagePreview(undefined)
            return
        }
        setImage(file)
        setImagePreview(URL.createObjectURL(file))
        setError(null)
        onImageUpdate(file)
        }
    }

    //REMOVE IMAGE
    const handleRemoveImage = () => {
        setImage(undefined)
        setImagePreview(undefined)
        onImageUpdate(null)
      }

    //SHOW FILE SELECTORS ON CLICK THE BOX
    const handleContainerClick = () => {
      if (image) {
        handleRemoveImage()
      } else {
        const fileInput = document.getElementById(`image-upload-${id}`) as HTMLInputElement
        if (fileInput) fileInput.click()
      }
    }

    //FRONT
    return (<> 
    <input type="file" accept="image/jpeg, image/png, image/gif" onChange={handleImageChange} style={{display:'none'}} id={`image-upload-${id}`} />
        <Flex onClick={handleContainerClick} width="100%" alignItems="center" justifyContent="space-between" height="100px" borderRadius=".5em" borderColor="gray.300" borderWidth="1px" bg="gray.50" cursor="pointer" position="relative" p='20px'>
          {!image && <Text textAlign={'center'} fontSize={'.9em'} color='blue.500'>Arrastre los archivos aquí o haga click para cargarlos</Text>}
          {image && (
            <>
              <Flex gap={'20px'}>
                <Image src={imagePreview || ''} alt="Preview" boxSize="50px" objectFit="cover"  />
                <Box>
                    <Text fontSize=".9em" fontWeight={'medium'} color='gray.600'>{typeof(image) === 'string' ?'MATIL.png':image.name}</Text>
                    <Text fontSize=".8em" color='gray.600'>{((typeof(image) === 'string' ?2200:image.size) / 1024).toLocaleString('es-ES', {minimumFractionDigits:0 ,maximumFractionDigits:2})} KB</Text>
                </Box>
              </Flex>

              <IconButton aria-label="Remove image" icon={<RxCross2  size='20px'/>} size="sm" border='none' bg='transparent' onClick={handleRemoveImage} />
            </>
          )}
        </Flex>
 
      {error && <Text color="red.500" fontSize=".9em"> {error}</Text>}

        </>
    )
  }

  export default ImageUpload
