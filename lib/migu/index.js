/**
 * @description 咪咕音樂api http://music.migu.cn
 */

const request = require('util').promisify(require('request'));
const cheerio = require('cheerio');

/**
 * migu的通用header
 */
const miguHeader = {
    referer: 'http://www.migu.cn/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36',
};

/**
 * 獲取總頁數以及是否有更多頁
 * @param {object} $ cheerio selector
 * @param {string} currClass 標識當前頁的類名
 * @param {string} pageClass 導航欄的類名
 */
const pagination = function ($, currClass = 'on', pageClass = 'page') {
    /* 翻页计算 */
    const curr = $(`.${pageClass} .${currClass}`).text() || 1;
    let total = 1;
    $(`.${pageClass} a`).each((idx, ele) => {
        const mele = $(ele);
        const klass = mele.attr('class');
        if (!klass || klass === currClass) total = Number(mele.text());
    });
    return { more: curr < total, total };
}

/**
 * 從migu獲取json數據
 * @param {string} uri 資源地址
 * @param {string} proxy 代理地址
 */
async function fetch(uri, proxy) {
    const response = await request({
        method: 'get',
        uri,
        proxy,
        json: true,
        headers: miguHeader,
    });
    if (response.statusCode !== 200) {
        throw new Error(response.statusText);
    }
    return response.body;
}

/**
 * 舊接口，可以批量獲取歌曲信息，decrypted
 * @param {Array} ids 歌曲id數組
 * @param {string} proxy 代理地址
 */
async function songs(ids, proxy) {
    const uri = `http://music.migu.cn/webfront/player/findsong.do?itemid=${ids.join()}&type=song`;
    const { code, msg: songList } = await fetch(uri, proxy);
    if (code !== '000000') {
        throw new Error('cannot get the songlist');
    }
    return songList;
}

/**
 * 獲取單曲的信息，舊接口
 * @param {string} id 歌曲id
 * @param {string} proxy 代理地址
 */
async function songSimple(id, proxy) {
    const [songInfo] = await songs([id], proxy);
    return songInfo;
}

/**
 * 獲取歌曲的信息，decrypted
 * @param {string} id 歌曲的id
 * @param {string} proxy 代理地址
 */
function song(id, proxy) {
    const uri = `http://music.migu.cn/v2/async/audioplayer/playurl/${id}`;
    return fetch(uri, proxy);
}

/**
 * 獲取歌曲的歌詞
 * @param {string} id 歌曲的id
 * @param {string} proxy 代理地址
 */
async function lyric(id, proxy) {
    const songInfo = await song(id, proxy);
    const { dynamicLyric } = songInfo;
    return dynamicLyric;
}

/**
 * 獲取專輯的信息
 * @param {string} id 專輯的id
 * @param {string} proxy 代理地址
 */
async function album(id, proxy) {
    const uri = `http://music.migu.cn/v2/music/album/${id}?_from=migu`;
    const response = await request({
        method: 'get',
        uri,
        headers: miguHeader
    });
    if (response.statusCode !== 200) {
        throw new Error('cannot get the album info');
    }
    
    const $ = cheerio.load(response.body);
    const { more, total } = pagination($);

    const songs = [];
    const title = $('.album-name-text').text().trim();
    $('#js_songlist .songlist-item').each((index, ele)=>{
        const mele = $(ele);
        const artists = [];
        mele.find('.song-singer a').each((idx, el)=> {
            artists.push($(el).text());
        });
        const nameEle = mele.find('.song-name-text a');
        const name = nameEle.text();
        const enable = nameEle.attr('title') !== '咪咕君版权引入中~';
        songs.push({
            enable,
            name,
            id: mele.attr('mid'),
            artist: artists,
            duration: mele.find('.song-time').text(),
        });
    });
    return {
        title,
        songs,
        more,
        total,
    }
}

/**
 * 搜索
 * @param {string} keyword 搜索關鍵字
 * @param {number} page 搜索結果頁數
 * @param {string} type 搜索類型
 * @param {string} proxy 代理地址
 */
async function search(keyword, page = 1, type = 'music', proxy) {
    const uri = `http://www.migu.cn/search.html?pn=${page}&content=${encodeURIComponent(keyword)}&type=${type}`;
    const response = await request({
        method: 'get',
        uri,
        proxy,
        headers: miguHeader
    });
    if (response.statusCode !== 200) {
        throw new Error(response.statusText);
    }
    const $ = cheerio.load(response.body);
    const resultList = [];
    const { more, total } = pagination($, 'current', 'pagination');
    $('.list li').each((idx, ele) => {
        const mele = $(ele);
        let resultType = mele.find('.type').text();
        let id;
        /* 專輯和音樂的id構成唔同 */
        if (resultType === '[ 音乐 ]') {
            id = mele.find('a').attr('href').match(/detail\/200000000(.*?).html/)[1];
            resultType = 'music';
        } else {
            id = mele.find('a').attr('href').match(/detail\/(.*?).html/)[1];
            resultType = 'album';
        }
        /* id：详情的id，type：id的类型，name：结果名字，auth：词曲歌手之类的，img：歌手或者是专辑的图像 */
        const result = {
            id,
            type: resultType,
            name: mele.find('.search-title-text').text(),
            auth: mele.find('.search-auth').text(),
            img: mele.find('.face').attr('src'),
        }
        resultList.push(result);
    });

    return { list: resultList, more, total };
}

/**
 * 獲取播放列表
 * @param {string} id 歌單id
 * @param {string} page 歌單結果頁數
 * @param {string} proxy 代理地址
 */
async function playlist(id, page=1, proxy) {
    // ${id} = ${listId}/${creatorId}
    const uri = `http://music.migu.cn/v2/music/songlist/${id}?_from=migu&page=${page}`;
    const response = await request({
        method: 'get',
        uri,
        proxy,
        headers: miguHeader,
    });
    if (response.statusCode !== 200) {
        throw new Error(response.statusText);
    }
    const $ = cheerio.load(response.body);
    const songs = [];
    const { more, total } = pagination($);
    $('#js_songlist .songlist-item').each((idx, ele)=>{
        const mele = $(ele);
        const artist = [];
        mele.find('.song-singer a').each((idx, ele)=>{
            artist.push($(ele).text());
        });
        const albumEle = mele.find('.album-jump');
        const nameEle = mele.find('.song-name-text a');
        const name = nameEle.text();
        const enable = nameEle.attr('title') !== '咪咕君版权引入中~';

        const item = {
            enable,
            id: mele.attr('mid'),
            name,
            artist,
            album: {
                title: albumEle.text(),
                id: albumEle.attr('data-id')
            }
        }
        songs.push(item);
    });
    return { songs, more, total };
}

/**
 * 獲取歌手名下的所有歌曲
 * @param {string} id 歌手id
 * @param {number} page 結果頁數
 * @param {string} proxy 代理地址
 */
async function artistSong(id, page=1, proxy) {
    const uri = `http://music.migu.cn/v2/music/artist/${id}?tab=song&_from=migu&page=${page}`;
    const response = await request({
        uri,
        headers: miguHeader,
        proxy
    });
    if (response.statusCode !== 200) {
        throw new Error(response.statusText);
    }
    const $ = cheerio.load(response.body);
    const list = [];
    const { more, total } = pagination($);
    $('#js_songlist .songlist-item').each((idx, ele) => {
        const mele = $(ele);
        const artist = [];
        mele.find('.song-singer a').each((idx, ele) => {
            artist.push($(ele).text());
        });
        const albumEle = mele.find('.album-jump');
        const nameEle = mele.find('.song-name-text a');
        const name = nameEle.text();
        const enable = nameEle.attr('title') !== '咪咕君版权引入中~';

        const item = {
            enable,
            id: mele.attr('mid'),
            name,
            artist,
            album: {
                title: albumEle.text(),
                id: albumEle.attr('data-id')
            }
        }
        list.push(item);
    });
    return { list, more, total };
}

/**
 * 獲取歌手名下的所有專輯
 * @param {string} id 歌手id
 * @param {number} page 結果頁數
 * @param {string} proxy 代理地址
 */
async function artistAlbum(id, page=1, proxy) {
    const uri = `http://music.migu.cn/v2/music/artist/${id}?tab=album&_from=migu&page=${page}`;
    const response = await request({
        uri,
        headers: miguHeader,
        proxy,
    });
    if (response.statusCode !== 200) {
        throw new Error(response.statusText);
    }
    const $ = cheerio.load(response.body);
    const { total, more } = pagination($);
    const list = [];
    $('#artist-album-cont li').each((idx, ele) => {
        const mele = $(ele);
        list.push({
            name: mele.find('.album-name .album-jump').text(),
            id: mele.find('.play-btn').attr('data-id'),
            time: mele.find('.album-time').text(),
            img: mele.find('img').attr('data-original'),
        })
    });
    return { total, list, more };
}

module.exports = {
    songs,
    song,
    songSimple,
    lyric,
    album,
    playlist,
    search,
    artistSong,
    artistAlbum,
};