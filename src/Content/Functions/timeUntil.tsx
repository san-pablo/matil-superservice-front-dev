/*
    CONVERT TIMESTAMP TO TIME UNTIL STRING
*/

function timeUntil(timestamp: string | undefined): string {

    const UTCDate = new Date()
    const now = new Date(UTCDate.getTime() + UTCDate.getTimezoneOffset() * 60000)
  
    const past = timestamp !== undefined ? new Date(timestamp):new Date()
    const diff = past.getTime() - now.getTime() 


    const seconds = diff / 1000
    const minutes = seconds / 60
    const hours = minutes / 60
    const days = hours / 24
    const weeks = days / 7
    const months = days / 30
  
    if (seconds < 60) {
      const sec = Math.floor(seconds);
      return `en ${sec} ${sec === 1 ? 'segundo' : 'segundos'}`}
    else if (minutes < 60) {
      const min = Math.floor(minutes);
      return `en ${min} ${min === 1 ? 'minuto' : 'minutos'}`
    } else if (hours < 24) {
      const hr = Math.floor(hours);
      return `en ${hr} ${hr === 1 ? 'hora' : 'horas'}`
    } else if (days < 7) {
      const day = Math.floor(days);
      return `en ${day} ${day === 1 ? 'día' : 'días'}`
    } else if (weeks < 4) {
      const wk = Math.floor(weeks);
      return `en ${wk} ${wk === 1 ? 'semana' : 'semanas'}`
    } else if (months < 12) {
      const mth = Math.floor(months);
      return `en ${mth} ${mth === 1 ? 'mes' : 'meses'}`
    } else {
      return 'en más de un año'
    }
  }
  
  export default timeUntil
  
  