const cheerio = require('cheerio');
const request = require('util').promisify(require('request'));

const parseAlbum = (html)=> {
    let $ = cheerio.load(html);
    let albumName = $('h2').text().trim();
    let cacheContainer = $('#song-list-pre-cache');
    let dataContainer = cacheContainer.find('textarea').eq(0);

    let playList = JSON.parse(dataContainer.val());
    // 如果歌曲有版权，咁st就系0，否则就系-200
    playList = playList.filter(song=>song.privilege.st===0);
    return {name: albumName, songs: playList};
}

/**
 * get the album
 * @param  {String} id    album id
 * @param  {String} proxy proxy
 * @return {Array}        the album
 */
const getAlbum = async (id, proxy)=> {
     let response = await request({
        method: 'get',
        uri: 'http://music.163.com/album?id='+id,
        headers: {
            Host: 'music.163.com',
            Referer: 'http://music.163.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
        },
        proxy: proxy
     });
    if (response.statusCode !== 200) {
        throw new Error(response.statusText);
    }
     return parseAlbum(response.body);
}


module.exports = getAlbum;