/*
  CONVERT THE NUMBER OF SECONDS IN A READABLE STRING (HH:MM:SS)
*/

function formatTime(seconds:number) {
    const hours = Math.floor(seconds / 3600)
    seconds %= 3600
    const minutes = Math.floor(seconds / 60)
    seconds %= 60;
    let timeParts = []
    if (hours > 0) timeParts.push(`${hours} h`)
    if (minutes > 0) timeParts.push(`${minutes} min`) 
    if (seconds > 0) timeParts.push(`${seconds} s`)
    
    return timeParts.join(' y ')
}


export default formatTime
