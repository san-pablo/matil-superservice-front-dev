const parseNumber = (i18n:any, num:string | number, toFloat = false) => {

    const floatNumber:number = typeof(num) === 'string'? parseFloat(num): num

    if (toFloat) return floatNumber
    else return (floatNumber).toLocaleString(`${i18n.language}-${i18n.language.toLocaleUpperCase()}`, {minimumFractionDigits:0,maximumFractionDigits:2})
}

export default parseNumber