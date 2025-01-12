//REACT
import { useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { BrowserRouter as Router } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSession } from './SessionContext'
import { useAuth0 } from "@auth0/auth0-react"
//FETCH DATA
import axios, { isAxiosError } from 'axios'
//FRONT
import { Flex, Box, ChakraProvider, extendTheme, cssVar, defineStyleConfig } from '@chakra-ui/react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
//CONTENT
import Content from './Content/Content'
//COMPONENTS
import LoadingIcon from './Content/Components/Once/LoadingIcon'
//TYPING
import { userInfo, Organization } from './Content/Constants/typing'
 

//ENVIORMENT VARIABLES
const URL = import.meta.env.VITE_PUBLIC_API_URL
const TOKENS_KEY = import.meta.env.VITE_ENCRIPTION_KEY || 'DEFAULT-KEY'

//SKELETON THEME
const $startColor = cssVar('skeleton-start-color')
const $endColor = cssVar('skeleton-end-color')
const customVariant = {
  [$startColor.variable]: 'colors.transparent',
  [$endColor.variable]: 'colors.gray.200'}
const skeletonTheme = defineStyleConfig({baseStyle: customVariant})

//CUSTOM THEME
const theme = extendTheme({
    breakpoints: {
      sm: '450px',
      md: '700px',
      lg: '960px',
      xl: '1200px'
    },
    colors: {
      brand: {
        black_button:'#222',
        black_button_hover:'RGBA(0, 0, 0, 0.80)',
        text_blue:'rgb(59, 90, 246)',
        blue_hover:'#EBF8FF',
        blue_hover_2:'#DDF1FC',

        gray_1:"#e8e8e8",
        gray_2:"#eeeeee",
        hover_gray:'#F6F6F6',
        hover_gray_white:'#FAFAFA',
        gradient_blue:'linear-gradient(to right, rgba(0, 102, 204, 1),rgba(51, 153, 255, 1))',
        gradient_blue_hover:'linear-gradient(to right, rgba(0, 72, 204, 1),rgba(51, 133, 255, 1))'
       }
     },
    styles: {
      global: {body: {bg: 'white', fontFamily: 'Poppins'}}
    },
    fontWeights: { normal: 400, medium: 500, semibold: 600,bold: 700},
    components: {
      Switch: {
        baseStyle: {
          track: {bg: 'brand.gray_1', _checked: {bg: 'brand.text_blue'},},
          thumb: {bg: 'white'}
        },
      },
      Radio: {
        baseStyle: {
          control:{_checked:{bg:'rgb(59, 90, 246)', _hover:{bg:'rgb(59, 90, 246)'}}}
        }
      },
      Button: { 
          baseStyle: {fontWeight:600, bg:'#f1f1f1', _hover:{bg:'#e8e8e8'}, height:'30px'},
          sizes: {
            xs: {h: '28px', minW: '28px',  fontSize: '.9em', px: '8px'},
            sm: {h: '28px', minW: '28px',  fontSize: '.9em', px: '8px'},
          },
          variants:{
            main:{bg:'#222', _hover:{bg:'blackAlpha.800'}, color:'white',   _disabled: {bg: '#222', color: 'white', pointerEvents: 'none', cursor: 'not-allowed',opacity: 0.6}},
            delete:{fontWeight:500, bg:'red.100', color:'red.600', _hover:{bg:'red.200'}},
            delete_section:{fontWeight:500, color:'red'},
            common:{fontWeight:500, _hover:{color:'rgb(59, 90, 246)'}}
          }
      },
      Skeleton: skeletonTheme,
   
    }
  })
   
//MAIN FUNCTION
const App: React.FC = () => { 

    const { user, loginWithRedirect, isAuthenticated, logout, isLoading, getAccessTokenSilently } = useAuth0()

    //AUTH DATA
    const session = useSession()
    const { setAuthData, signOut } = useAuth()

    //USER CONFIGURATIONS AND WAIT BOOLEAN
    const [waitingInfo, setWaitingInfo] = useState<boolean>(true)
    const currentOrganizationName = localStorage.getItem('currentOrganization')
    const [userInfo, setUserInfo] = useState<userInfo>({name:'',surname:'', organizations:[]})

    //FUNCTION TO FETCH INITIAL USER DATA
    const fetchInitialData = async ( accessToken:string,  email:string ) => {

        const fetchInitialOrgData = async (user:{id:string, name:string, surname:string, organizations:Organization[]}, accessToken:string) => {
          let organization
          if (currentOrganizationName) {organization = user.organizations.find((org: Organization) =>  org.id === parseInt(currentOrganizationName))}
          if (!organization) {organization = user.organizations[0]}
          if (organization) {
             const responseChannels = await axios.get(URL + `${organization.id}/admin/settings/channels`, {headers: {'Authorization': `Bearer ${accessToken}`}})
            session.dispatch({type:'ADD_CHANNELS', payload:responseChannels?.data})
            setAuthData({ organizationData:{calls_status:organization.calls_status || 'out', avatar_image_url:organization.avatar_image_url || '', is_admin:organization.is_admin, alias:organization.alias || '', groups:organization.groups},
            organizationId: organization.id, userId:user.id, organizationName:organization.name ,email:email, accessToken:accessToken})
            localStorage.setItem('currentOrganization', String(organization.id))
            try{
              const responseOrg = await axios.get(URL + `${organization.id}/user`, {headers: {'Authorization': `Bearer ${accessToken}`}})
              const responseThemes = await axios.get(URL + `${organization.id}/admin/settings/themes`, {headers: {'Authorization': `Bearer ${accessToken}`}})
              const responseAtributtes = await  axios.get(URL + `${organization.id}/admin/settings/custom_attributes`, {headers: {'Authorization': `Bearer ${accessToken}`}})


               const viewsToAdd = {
                number_of_conversations_in_bin:responseOrg.data.number_of_conversations_in_bin, 
                private_views:responseOrg.data.private_views, 
                number_of_conversations_per_private_view:responseOrg.data.number_of_conversations_per_private_view,
                shared_views:responseOrg.data.shared_views, 
                number_of_conversations_per_shared_view:responseOrg.data.number_of_conversations_per_shared_view
              }

              setAuthData({views: viewsToAdd, users:responseOrg.data.users, shortcuts:responseOrg.data.shortcuts, customAttributes:responseAtributtes.data, conversation_themes:responseThemes.data.map((theme:{name:string, description:string}) => theme.name),  active_integrations:[]})
            }
            catch (error){console.log(error)}
          }
          
          else setAuthData({ organizationId: null, email:email, userId:user.id, accessToken:accessToken, views:{'private_views':[], 'shared_views':[]}, users:null, shortcuts:[], conversation_themes:[]})
 
          setUserInfo({name:user.name, surname:user.surname, organizations:user.organizations})
          setWaitingInfo(false)
        }

        try {
          const response = await axios.get(URL + `user`, {headers: {'Authorization': `Bearer ${accessToken}`}})
          setAuthData({userData:{name: response.data.name, surname: response.data.surname, email_address: response.data.email_address, password: '', language:response.data.language, shortcuts_activated:true}})
          fetchInitialOrgData(response.data, accessToken)
          
        } 
        catch (error) {
          if (isAxiosError(error) && error.response && error.response.status === 403){
            try {
                const accessToken = await getAccessTokenSilently({authorizationParams: {audience: `https://api.matil/v2/`, scope: "read:current_user"}})
                setAuthData({accessToken:accessToken})

                const new_response = await axios.get(URL + `user`, {headers: {'Authorization': `Bearer ${accessToken}`}})
                setAuthData({userData:{name: new_response.data.name, surname: new_response.data.surname, email_address: new_response.data.email_address, password: '', language:new_response.data.language, shortcuts_activated:true}})
                fetchInitialOrgData(new_response.data, accessToken)
            }
            catch (error) {
                  signOut()
                  setWaitingInfo(false)
            }
          }
        }
      }
      
    //INITIAL REQUEST TO CLIENT DATA IF MAIL IS STORED IN LOCALSOTRAGE, ELSE WILL SEND YOU TO LOGIN
    useEffect(() => {
      //logout({ logoutParams: { returnTo: window.location.origin } })
      const getInitialData = async () => {
        setWaitingInfo(true)
        const storedMail = user?.email

        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: 'https://api.matil.ai/',
            scope: "read:current_user"
          },
        })
        if (storedMail && accessToken) {
          if (storedMail !== null && accessToken !== null) fetchInitialData(accessToken, storedMail)
        }
        else setWaitingInfo(false)
      }

      if (!isLoading) {
        if (isAuthenticated) getInitialData()
        else loginWithRedirect()
      }
    }, [isAuthenticated, isLoading])
      

    //APP CONTENT
    return (  
      <ChakraProvider theme={theme}>
        {(isLoading || waitingInfo) ?   
          <Flex height={'100vh'}  width={'100vw'} justifyContent={'center'} alignItems={'center'}> 
              <LoadingIcon/>
          </Flex>:
          <>
            {isAuthenticated && 
              <Router> 
                <Box fontSize={'.9em'}> 
                  <Content userInfo={userInfo} />
                  <ToastContainer />
                </Box>
              </Router> 
           }
          </>}         
      </ChakraProvider>
    ) 
 
}

export default App

