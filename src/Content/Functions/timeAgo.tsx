/*
    CONVERT TIMESTAMP TO TIME AGO STRING
*/

function timeAgo(timestamp:string | undefined) {
  const UTCDate = new Date()
  const now = new Date(UTCDate.getTime() + UTCDate.getTimezoneOffset() * 60000)

  const past = timestamp !== undefined ? new Date(timestamp):new Date()
  const diff = now.getTime() - past.getTime()

  const seconds = diff / 1000
  const minutes = seconds / 60
  const hours = minutes / 60
  const days = hours / 24
  const weeks = days / 7
  const months = days / 30

  if (seconds < 60) {
      return 'Hace menos de un minuto'
  } else if (minutes < 60) {
      const min = Math.floor(minutes)
      return `Hace ${min} ${min === 1 ? 'minuto' : 'minutos'}`
  } else if (hours < 24) {
      const hr = Math.floor(hours);
      return `Hace ${hr} ${hr === 1 ? 'hora' : 'horas'}`
  } else if (days < 7) {
      const day = Math.floor(days);
      return `Hace ${day} ${day === 1 ? 'día' : 'días'}`
  } else if (weeks < 4) {
      const wk = Math.floor(weeks);
      return `Hace ${wk} ${wk === 1 ? 'semana' : 'semanas'}`
  } else if (months < 12) {
      const mth = Math.floor(months);
      return `Hace ${mth} ${mth === 1 ? 'mes' : 'meses'}`
  } else {
      return 'Hace más de un año'
  }
}

export default timeAgo
