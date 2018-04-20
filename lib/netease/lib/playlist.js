const cheerio = require('cheerio');
const request = require('util').promisify(require('request'));
const k8c = require('./k8c');
k8c.ceQ8I = function(bkX7Q, J8B) {
    var bkZ7S = bvB0x(bkX7Q, bwA0x(J8B));
    var Cy8q = new String(bwJ0x(bkZ7S));
    var wW6Q = [];
    var bkY7R = Cy8q.length / 2;
    var be9V = 0;
    for (var i = 0; i < bkY7R; i++) {
        wW6Q.push("%");
        wW6Q.push(Cy8q.charAt(be9V++));
        wW6Q.push(Cy8q.charAt(be9V++))
    }
    return wW6Q.join("")
};



const parseList = (html)=> {
    let $ = cheerio.load(html);
    let albumName = $('h2').text().trim();
    let cacheContainer = $('#song-list-pre-cache');
    let dataContainer = cacheContainer.find('textarea').eq(0);
    
    let listKey = cacheContainer.attr('data-key');
    let simple = cacheContainer.attr('data-simple') === '1';
    let pvnamed = cacheContainer.attr('data-pvnamed') === '1';
    
    if(!(listKey && simple && pvnamed)) {
       throw new Error('不存在');
    }

    let key, autoId;

    let img = $('#m-playlist .j-img');
    if(img.length) {
       key = img.attr('data-key');
    }
    let minfo = $('#m-playlist .m-info');
    if(minfo.length 
       && minfo.attr('id').indexOf("auto-id-") == 0) {
       autoId = minfo.attr('id').slice(8, 12);
    }

    let data = dataContainer.val();

    let playList = JSON.parse(decodeURIComponent(k8c(data, "param=" + autoId + key)));
    // 如果歌曲有版权，咁st就系0，否则就系-200
    playList = playList.filter(song=>song.pv.st===0);

    return {name: albumName, list: playList};
}

/**
 * get the playlist
 * @param  {String} id    playlist id
 * @param  {String} proxy proxy
 * @return {Array}        the playlist
 */
const getList = async (id, proxy)=> {
    const response = await request({
        method: 'get',
        uri: 'http://music.163.com/playlist?id='+id,
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
     return parseList(response.body);
}


module.exports = getList;