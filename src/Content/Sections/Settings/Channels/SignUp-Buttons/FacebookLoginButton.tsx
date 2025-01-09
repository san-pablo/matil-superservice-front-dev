//REACT
import { useEffect, useState } from 'react'
import { useAuth } from '../../../../../AuthContext'
//FETCH DATA
import fetchData from '../../../../API/fetchData'
//FRONT
import { Button } from '@chakra-ui/react'
//COMPONENTS
import LoadingIconButton from '../../../../Components/Reusable/LoadingIconButton'
//ICONS
import { FaFacebookSquare } from "react-icons/fa"
import { useAuth0 } from '@auth0/auth0-react'
import { useTranslation } from 'react-i18next'

//TYPING
declare global {
  interface Window {
    FB: any
    fbAsyncInit: () => void
  }
}
  
//MAIN FUNCTINO
const FacebookLoginButton = ({ name, loadDataFunc }: { name: string, loadDataFunc:(data:any) => void }) => {
  
  const [waitingInfo, setWaitingInfo] = useState<boolean>(false)
  const handleSendNewChannel = async (data: any) => {
      setWaitingInfo(true)
      await loadDataFunc(data)
      setWaitingInfo(false)
  }

  useEffect(() => {
      (function (d, s, id) {
        let js, fjs = d.getElementsByTagName(s)[0] as HTMLScriptElement
        if (d.getElementById(id)) return
        js = d.createElement(s) as HTMLScriptElement
        js.id = id
        js.src = "https://connect.facebook.net/en_US/sdk.js"
        js.async = true; js.defer = true; js.crossOrigin = "anonymous"
        fjs.parentNode?.insertBefore(js, fjs)
      }(document, 'script', 'facebook-jssdk'))
  
      // Initialize the SDK
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: '1955281408238790',
          autoLogAppEvents: true,
          xfbml: true,
          version: 'v19.0'
        })
      }
    }, [])
  
  const launchWhatsAppSignup = () => {
      window.FB.login((response: any) => {
        if (response.authResponse) {
          handleSendNewChannel({code: response.authResponse.code})
        }
      }, {
        scope: 'email,public_profile',
        config_id: '1734685470603881',
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          feature: 'whatsapp_embedded_signup',
          sessionInfoVersion: 2
        }
      })
    }
  return (
    <Button isDisabled={name === ''} onClick={launchWhatsAppSignup} size='md' w='100%' bg='#1877f2' leftIcon={<FaFacebookSquare/>} _hover={{bg:'#0F6AE0'}} color='#fff'>
      {waitingInfo?<LoadingIconButton/>:'Registrarse con Facebook'}
    </Button>
  )
}

export default FacebookLoginButton
