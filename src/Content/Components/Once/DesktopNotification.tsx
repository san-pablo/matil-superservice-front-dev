/* 
    SHOW A NOTIFICATION IN THE NAVIGATOR
*/

//DELETE PARSE CHARACTERS FROM THE NOTIFICATION
const parseMessageFromBold = (message:string) => {
  const parts = message.split(/(\/{[^/]+}\/)/g)
  return parts.map((part, index) => {
    if (part.startsWith('/{') && part.endsWith('}/')) return part.slice(2, -2)
    return part
  }).join('')
}

//MAIN FUNCTION
const showNotification = (title:string, options:any) => {
    if (Notification.permission === 'granted') {
      new Notification(parseMessageFromBold(title), options)
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(parseMessageFromBold(title), options)
        }
      })
    }
  }
  
export default showNotification