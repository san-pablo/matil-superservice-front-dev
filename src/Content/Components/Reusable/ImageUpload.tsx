//REACT
import { useState, useEffect } from 'react'
//FRONT
import { Flex, Text, Box, Image, IconButton } from '@chakra-ui/react'
//ICONS
import { RxCross2 } from 'react-icons/rx'
import { useTranslation } from 'react-i18next'

interface ImageUploadProps {
  id: number | string
  initialImage: string | undefined
  onImageUpdate: (file: File | null) => void
  maxImageSize?:number
}

//MAIN FUNCTION
const ImageUpload = ({ id, initialImage, onImageUpdate, maxImageSize = 100}:ImageUploadProps) => {

  //CONSTANTS
  const { t } = useTranslation('settings')

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
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']
        if (!validTypes.includes(file.type)) {
            setError(t('FormatError'))
            setImage(undefined)
            setImagePreview(undefined)
            return
        }
        const maxSize = maxImageSize * 1024
        if (file.size > maxSize) {
            setError(t('SizeError', {maxSize:`${maxImageSize}KB`}))
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
        <input type="file" accept="image/jpeg, image/png, image/gif, image/svg+xml" onChange={handleImageChange} style={{display:'none'}} id={`image-upload-${id}`} />
        <Flex onClick={handleContainerClick} width="100%" alignItems="center" justifyContent="space-between" height="100px" borderRadius=".5em"   bg='gray_2' borderColor={'border_color'} borderWidth={'1px'} cursor="pointer" position="relative" p='20px'>
          {!image && <Text textAlign={'center'} fontSize={'.9em'} color='text_blue'>{t('DragImage')}</Text>}
          {image && (
            <>
              <Flex gap={'20px'}>
                <Image src={imagePreview || ''} alt="Preview" boxSize="50px" objectFit="cover"  />
                <Box>
                    <Text fontSize=".9em" fontWeight={'medium'} color='text_gray'>{typeof(image) === 'string' ?'MATIL.png':image.name}</Text>
                    <Text fontSize=".8em" color='text_gray'>{((typeof(image) === 'string' ?2200:image.size) / 1024).toLocaleString('es-ES', {minimumFractionDigits:0 ,maximumFractionDigits:2})} KB</Text>
                </Box>
              </Flex>
              <IconButton aria-label="Remove image" icon={<RxCross2  size='20px'/>} variant={'common'} size="sm" border='none' bg='transparent' onClick={handleRemoveImage} />
            </>
          )}
        </Flex>
      {error && <Text color="red.500" fontSize=".9em"> {error}</Text>}
      </>)
  }

  export default ImageUpload
