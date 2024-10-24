/*
    CONVERT TIMESTAMP TO TIME AGO STRING
*/

function timeAgo(timestamp: string | undefined, t: (key: string, options?: any) => string) {
    const UTCDate = new Date();
    const now = new Date(UTCDate.getTime() + UTCDate.getTimezoneOffset() * 60000)
  
    const past = timestamp !== undefined ? new Date(timestamp) : new Date()
    const diff = now.getTime() - past.getTime()
  
    const seconds = diff / 1000
    const minutes = seconds / 60
    const hours = minutes / 60
    const days = hours / 24
    const weeks = days / 7
    const months = days / 30
  
    if (seconds < 60) {
      return t('timeAgo.lessThanMinute')
    } else if (minutes < 60) {
      const min = Math.floor(minutes)
      return t('timeAgo.minutesAgo', { count: min })
    } else if (hours < 24) {
      const hr = Math.floor(hours);
      return t('timeAgo.hoursAgo', { count: hr })
    } else if (days < 7) {
      const day = Math.floor(days);
      return t('timeAgo.daysAgo', { count: day })
    } else if (weeks < 4) {
      const wk = Math.floor(weeks);
      return t('timeAgo.weeksAgo', { count: wk })
    } else if (months < 12) {
      const mth = Math.floor(months)
      return t('timeAgo.monthsAgo', { count: mth })
    } else {
      return t('timeAgo.moreThanYear')
    }
  }
  
  export default timeAgo
  