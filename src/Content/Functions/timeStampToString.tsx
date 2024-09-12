/*
    CONVERT TIMESTAMP TO STRING DATE FORMAT (SPAIN)
*/

const timeStampToDate = (timestampString: string, t: (key: string, options?: any) => string) => { 
    const dateObj = new Date(timestampString)
    
    const offset = dateObj.getTimezoneOffset() * 60000
    const localDateObj = new Date(dateObj.getTime() + offset + (3600000 * 4))
    
    const day = localDateObj.getDate()
    const month = t(`months.${localDateObj.getMonth()}`)
    const year = localDateObj.getFullYear()
    
    const hours = localDateObj.getHours()
    const minutes = localDateObj.getMinutes()
  
    const formattedTime = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0')
    
    const formattedDate = t('dateFormat', { day, month, year, time: formattedTime })
    return formattedDate
  }
  
  export default timeStampToDate
  