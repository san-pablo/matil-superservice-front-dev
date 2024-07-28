/*
    CONVERT A DATE TO ISO STRING "YYYY-MM-DD"
*/

function convertToISO(date:Date) {
    if (!(date instanceof Date)) date = new Date(date)
    const year = date.getFullYear()
    const month = ('0' + (date.getMonth() + 1)).slice(-2)
    const day = ('0' + date.getDate()).slice(-2)
    return `${year}-${month}-${day}`
}

export default convertToISO