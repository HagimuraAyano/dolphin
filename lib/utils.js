/**
 * 將jsonp格式的數據解析成json
 * @param {string} str jsonp字符串
 */
function jsonp(str) {
    return eval(str.slice(str.indexOf('('), str.lastIndexOf(')') + 1))
}

module.exports = {
    jsonp
}