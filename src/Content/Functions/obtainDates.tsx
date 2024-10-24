/*
  GET THE CURRENT DATE, AND THE FIRST OF THIS YEAR TO APPLY FILTERS (IF THE DISTANCE IS LESS THAN ONE MONTH), THE PAST DAY WILL BE ONE MONTH AGO
*/

function obtainDates() {
  const formatDate = (date: Date) => {return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`}

  const UTCDate = new Date()
  const currentDate = new Date(UTCDate.getTime() + UTCDate.getTimezoneOffset() * 60000)

  // Set startDate to the first day of the current month
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

  // The end date will be the current date + 1 day (tomorrow)
  const tomorrow = new Date(currentDate.getTime() + (1000 * 60 * 60 * 24))
  const endDate = tomorrow

  // Format dates to ISO format for consistency
  const isoStartDate = formatDate(startDate)
  const isoEndDate = formatDate(endDate)

  return { startDate: isoStartDate, endDate: isoEndDate }
}

export default obtainDates
