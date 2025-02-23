//REACT
import { useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { BrowserRouter as Router, useNavigate } from 'react-router-dom'
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
const VERSION = import.meta.env.VITE_VERSION

//SKELETON THEME
const $startColor = cssVar('skeleton-start-color')
const $endColor = cssVar('skeleton-end-color')
const customVariant = {
  [$startColor.variable]: 'colors.transparent',
  [$endColor.variable]: 'colors.border_color'}
const skeletonTheme = defineStyleConfig({baseStyle: {...customVariant, borderRadius:'.5rem'}})

//CUSTOM THEME
const theme = extendTheme({
    breakpoints: {
      sm: '450px',
      md: '700px',
      lg: '960px',
      xl: '1200px'
    },
    config: {
      initialColorMode: "light",
      useSystemColorMode: true, 
    },

    semanticTokens: {
      colors: {
  
          white: {
            _light: "#FFFFFF",
            _dark: "#1A202C",
          },
          clear_white: {
            _light: "#FBFBFB",
            _dark: "#2D3748",
          },
          black: {
            _light: "#000000",
            _dark: "#FFFFFF",
          },
          
          text_gray: {
            _light: "#4A5568",
            _dark: "#CBD5E0",
          },
          black_button: {
            _light: "#222",
            _dark: "#A0AEC0",
          },
          black_button_hover: {
            _light: "RGBA(0, 0, 0, 0.80)",
            _dark: "RGBA(255, 255, 255, 0.50)",
          },
          text_blue: {
            _light: "rgb(59, 90, 246)",
            _dark: "rgb(144, 202, 249)",
          },
          gray_1: {
            _light: "#e8e8e8",
            _dark: "#4A5568",
          },
          gray_2: {
            _light: "#efefef",
            _dark: "#2D3748",
          },
          hover_gray: {
            _light: "#F5F5F5",
            _dark: "#1A202C",
          },
          border_color: {
            _light: "#E2E8F0",
            _dark: "#E2E8F0",
        },
      
      }
    },
     styles: {
      global: (props:any) => ({
        body: {
          bg: props.colorMode === "dark" ? "black" : "white",
          color: props.colorMode === "dark" ? "white" : "black",
          fontFamily: 'Poppins'
        }
      })
    },
    fontWeights: { normal: 400, medium: 500, semibold: 600, bold: 700},
    fontSizes: { xxs: '.7em', xs: '.8em', sm: '.9em', section: '1.2em', title:'1.4em'},

    components: {
      Switch: {
        baseStyle: {
          track: {bg: 'gray_1', _checked: {bg: 'text_blue'},},
          thumb: {bg: 'white'}
        },
      },
      Radio: {
        baseStyle: {
          control:{_checked:{bg:'rgb(59, 90, 246)', _hover:{bg:'rgb(59, 90, 246)'}}}
        },
      
      },
      Button: { 
          baseStyle: {fontWeight:600, bg:'#f1f1f1', _hover:{bg:'#e8e8e8'}, height:'30px'},
          sizes: {
            xs: {h: '24px', minW: '24px', borderRadius:'.5rem',  fontSize: '.8em', px: '10px'},
            sm: {h: '28px', minW: '28px', borderRadius:'.5rem',  fontSize: '1em', px: '12px'},
          },
          variants:{
            main:{bg:'black_button', _hover:{bg:'black_button_hover'}, color:'white',   _disabled: {bg: 'black_button', color: 'white', pointerEvents: 'none', cursor: 'not-allowed',opacity: 0.6}},
            delete:{fontWeight:500, bg:'red.100', color:'red.600', _hover:{bg:'red.200'}},
            delete_section:{fontWeight:500, color:'red'},
            common:{fontWeight:500,  bg:'gray_2', _hover:{color:'rgb(59, 90, 246)'}}
          }
      },
      Skeleton: skeletonTheme,
   
    }
  })
   
 
//MAIN FUNCTION
const App: React.FC = () => { 

    const { user, loginWithRedirect, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()


    //AUTH DATA
    const navigate = useNavigate()
    const session = useSession()
    const { setAuthData, signOut } = useAuth()

    //USER CONFIGURATIONS AND WAIT BOOLEAN
    const [waitingInfo, setWaitingInfo] = useState<boolean>(true)
    const currentOrganizationName = localStorage.getItem('currentOrganization')
    const [userInfo, setUserInfo] = useState<userInfo>({name:'',surname:'', organizations:[]})

    //FUNCTION TO FETCH INITIAL USER DATA
    const fetchInitialData = async ( accessToken:string,  email:string ) => {

        //FETCH ORGANIZATION DATA
        const fetchInitialOrgData = async (user:{id:string, name:string, surname:string, organizations:Organization[]}, accessToken:string) => {
          let organization


          if (currentOrganizationName) {organization = user.organizations.find((org: Organization) =>  org.id === parseInt(currentOrganizationName))}
          if (!organization && user.organizations.length > 0) {organization = user.organizations[0]}
          if (organization) {
            //const responseChannels = await axios.get(URL + `${organization.id}/settings/channels`, {headers: {'Authorization': `Bearer ${accessToken}`}})
            //session.dispatch({type:'ADD_CHANNELS', payload:responseChannels?.data})
            
            setAuthData({ organizationId: organization.id, userId:user.id, organizationName:organization.name ,email:email,accessToken })
            localStorage.setItem('currentOrganization', String(organization.id))

            try{
              const responseOrg = await axios.get(URL + `${organization.id}/user_access`, {headers: {'Authorization': `Bearer ${accessToken}`}})
              console.log(responseOrg.data)

               setAuthData({...responseOrg.data})
            }
            catch (error){console.log(error)}
          }
          
          else {
            setAuthData({ organizationId: null, email:email, userId:user.id, teams:[], users:null, themes:[], accessToken})
          }
 
          setUserInfo({name:user.name, surname:user.surname, organizations:user.organizations})
          setWaitingInfo(false)
        }

        //FETCH USER DATA
        try {
          const response = await axios.get(URL + `user`, {headers: {'Authorization': `Bearer ${accessToken}`}})
 
          setAuthData({userData:{...response.data}})
          fetchInitialOrgData(response.data, accessToken)
        } 
        catch (error) {
          if (isAxiosError(error) && error.response && error.response.status === 403){
            try {
                const accessToken = await getAccessTokenSilently({authorizationParams: {audience: `https://api.matil/v2/`, scope: "read:current_user"}})
                const new_response = await axios.get(URL + `user`, {headers: {'Authorization': `Bearer ${accessToken}`}})
 
                setAuthData({userData:{...new_response.data}})

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
        localStorage.clear()
        navigate('/')

        //GET CREDENTIALS
        const storedMail = user?.email
        const accessToken = await getAccessTokenSilently({authorizationParams: { audience: 'https://api.matil.ai/', scope: "read:current_user"}})
  
         
        if (storedMail && accessToken) if (storedMail !== null && accessToken !== null) fetchInitialData(accessToken, storedMail)
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
          <Flex height={'100vh'} bg='clear_white'  width={'100vw'} justifyContent={'center'} alignItems={'center'}> 
              <LoadingIcon/>
          </Flex>:
          <>
            {(isAuthenticated) && 
        
                <Box color='black'bg='clear_white'  > 
                  <Content />
                  <ToastContainer />
                </Box>
            }
          </>}         
      </ChakraProvider>
    ) 
 
}

export default App

