/*
    CONVERT TIMESTAMP TO STRING DATE FORMAT (SPAIN)
*/

const timeStampToDate = (timestampString: string, t: (key: string, options?: any) => string) => { 
 
    const dateObj = new Date(timestampString)
    
     const localDateObj = new Date(dateObj.getTime())
    
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
  