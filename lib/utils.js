const { promisify } = require('util');
const requestAsync = promisify(require('request'));

/**
 * 將jsonp格式的數據解析成json
 * @param {string} str jsonp字符串
 */
function jsonp(str) {
    return eval(str.slice(str.indexOf('('), str.lastIndexOf(')') + 1))
}

/**
 * 將播放列表轉換成.m3u格式
 * @param {Array} list 播放列表數據
 */
function m3u(list = []) {
    return list.reduce((playlist, music) => `${playlist}\n\n#EXTINF:${music.duration || -1}, ${music.artist} - ${music.name}\n${music.uri}`
        , '#EXTM3U');
}

/**
 * 對 request 的包裝
 * @param {object} options 請求的參數
 * @param {number} retry 重試的次數
 * @param {array} acceptCode 判定成功的響應碼列表
 */
async function request(options, retry = 1, acceptCode = [200]) {
    let response;

    if (!options.uri && !options.url) {
        throw Error('data uri require');
    }
    /* 重試獲取 */
    while(retry) {
        response = await requestAsync(options);
        retry -= 1;
        if (acceptCode.includes(response.statusCode)) {
            break;
        }
    }
    /* 拋出獲取錯誤 */
    if (retry < 0) {
        throw new Error(response.statusMessage);
    }


    /* 沒有出錯, 直接返回結果 */
    return response.body;   
}

module.exports = {
    jsonp,
    m3u,
    request,
};
