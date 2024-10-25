//REACT
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
//FRONT
import { Button } from '@chakra-ui/react'
//ICONS
import { FaInstagram } from "react-icons/fa"
  
//MAIN FUNCTION
const InstagramButton = () => {
  
    const { t } = useTranslation('settings')
    const navigate = useNavigate()
    const handleAuth = async () => {
      try {
        window.open('https://www.facebook.com/v20.0/dialog/oauth?client_id=1955281408238790&display=page&redirect_uri=https://app.matil.ai/settings/channels/instagram/success_auth&response_type=token&scope=pages_messaging,pages_manage_metadata,instagram_basic,instagram_manage_messages,instagram_content_publish,business_management,instagram_manage_comments,instagram_manage_insights,pages_show_list,pages_read_engagement', '_blank')
        localStorage.setItem('currentSettingsSection', 'channels/instagram/success_auth')
        navigate('/settings/channels/instagram/success_auth')
      } catch (error) {
        console.error('Error initiating Instagram auth', error)
      }
    }

  return (<>
    <Button onClick={handleAuth} size='lg' leftIcon={<FaInstagram/>} bg={'linear-gradient(to right, #833ab4,#fd1d1d,#fcb045)'} _hover={{bg:'linear-gradient(to right, #833ab4,#fd1d1d,#fcb045)'}} opacity={0.8} color='#fff'>
      {t('RegisterWithInstagram')}
    </Button>
    </>)
}

export default InstagramButton
