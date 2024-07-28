/*
  CONVERT THE NUMBER OF BYTES IN A READABLE STRING
*/

function formatFileSize(bytes:number) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    const roundedSize = (bytes / Math.pow(1024, i)).toLocaleString('es-ES', {minimumFractionDigits: 0,maximumFractionDigits: 2})
    return roundedSize + ' ' + sizes[i]
  }

export default formatFileSize
  