/*
    CONVERT TIMESTAMP TO STRING DATE FORMAT (SPAIN)
*/

const timeStampToDate = (timestampString: string) => { 
    const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    
    // Crear un objeto de fecha con el timestamp
    const dateObj = new Date(timestampString)
    
    // Obtener el offset de la zona horaria de España (Europe/Madrid)
    const offset = dateObj.getTimezoneOffset() * 60000
    const localDateObj = new Date(dateObj.getTime() + offset + (3600000 * 4)) 
    
    // Obtener día, mes y año
    const day = localDateObj.getDate()
    const month = months[localDateObj.getMonth()]
    const year = localDateObj.getFullYear()
    
    // Obtener la hora y los minutos
    const hours = localDateObj.getHours()
    const minutes = localDateObj.getMinutes()

    // Formatear la hora con dos dígitos
    const formattedTime = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0')
    
    const formattedDate = `${day} de ${month} de ${year} a las ${formattedTime}`
    return formattedDate
}

export default timeStampToDate
