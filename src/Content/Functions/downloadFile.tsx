/* 
    DOWNLOAD A FILE
*/


function downloadFile(url:string) {
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.download = ''
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default downloadFile
