/**
 * @description 咪咕音樂api http://music.migu.cn
 */

const cheerio = require('cheerio');
const { request } = require('../utils');
const { m3u } = require('../utils');

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
function fetch(uri, proxy) {
    return request({
        uri,
        proxy,
        headers: miguHeader,
    });
}

/**
 * 從 migu 獲取JSON格式的數據
 * @param {string} uri 資源鏈接
 * @param {string} proxy 代理地址
 */
async function fetchJSON(uri, proxy) {
    const { returnCode, msg, ...data } = JSON.parse(await fetch(uri, proxy));
    if (returnCode !== '000000') {
        throw new Error(msg);
    }
    return data;
}

/**
 * 獲取歌曲的信息
 * @param {string} id 歌曲的id
 * @param {string} proxy 代理地址
 */
function song(id, proxy) {
    const uri = `http://music.migu.cn/v3/api/music/audioPlayer/getPlayInfo?copyrightId=${id}`;
    return fetchJSON(uri, proxy);
}

/**
 * 獲取歌曲的信息
 * @param {string} id 歌曲的id
 * @param {string} proxy 代理地址
 */
async function songUri(id, proxy) {
    const { walkmanInfo: { playUrl } } = await song(id, proxy);
    return playUrl;
}

/**
 * 通過歌曲id獲取歌曲音樂文件的鏈接
 * @param {string} id 歌曲的id
 * @param {string} proxy 代理地址
 */
async function lyric(id, proxy) {
    const uri = `http://music.migu.cn/v3/api/music/audioPlayer/getLyric?copyrightId=${id}`;
    const { lyric } = await fetchJSON(uri, proxy);
    return lyric;
}

/**
 * 獲取專輯的信息
 * @param {string} id 專輯的id
 * @param {string} proxy 代理地址
 */
async function album(id, proxy) {
    const uri = `http://music.migu.cn/v3/music/album/${id}`;
    const body = await request({
        proxy,
        uri,
        headers: miguHeader
    });
    
    const $ = cheerio.load(body);
    const { more, total } = pagination($);
    const songs = [];
    const title = $('h1.title').text().trim();
    $('#J_PageSonglist .songlist-body .row').each((index, ele)=>{
        const mele = $(ele);
        const artists = [];
        mele.find('.song-singers a').each((idx, el)=> {
            artists.push($(el).text());
        });
        const nameEle = mele.find('.song-name-txt');
        const name = nameEle.text();
        const enable = nameEle.attr('href') !== 'javascript:void(0);';
        songs.push({
            enable,
            name,
            id: mele.attr('data-cid'),
            artist: artists,
            duration: mele.find('.song-duration span').text().trim(),
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
async function search(keyword, page = 1, type = 'song', proxy) {
    const uri = `http://music.migu.cn/v3/search?type=${type}&keyword=${encodeURIComponent(keyword)}&page=${page}`;
    
    const body = await request({
        method: 'get',
        uri,
        proxy,
        headers: miguHeader
    });

    const $ = cheerio.load(body);
    const resultList = [];
    const { more, total } = pagination($);

    $('#js_songlist .songlist-item').each((idx, ele) => {
        const mele = $(ele);
        let song = mele.find('.song-name-text a');
        /* id：详情的id，type：id的类型，name：结果名字，auth：词曲歌手之类的，img：歌手或者是专辑的图像 */
        const result = {
            id: mele.attr('data-cid'),
            name: song.attr('title'),
            auth: mele.find('.song-singer').text().replace(/\s/g, ''),
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
    const uri = `http://music.migu.cn/v3/music/playlist/${id}?page=${page}`;
    const body = await request({
        uri,
        proxy,
        headers: miguHeader,
    });

    const $ = cheerio.load(body);
    const songs = [];
    const { more, total } = pagination($);
    $('#J_PageSonglist .songlist-body .row').each((idx, ele)=>{
        const mele = $(ele);
        const artist = [];
        mele.find('.song-singers a').each((idx, ele)=>{
            artist.push($(ele).text());
        });
        const albumEle = mele.find('.song-belongs a');
        const nameEle = mele.find('.song-name-txt');
        const name = nameEle.text();
        const enable = nameEle.attr('href') !== 'javascript:void(0);';

        const item = {
            enable,
            id: mele.attr('data-cid'),
            name,
            artist,
            album: {
                title: albumEle.text(),
                id: albumEle.attr('href').replace(/\/.*\//, ''),
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
    const uri = `http://music.migu.cn/v3/music/artist/${id}?page=${page}&type=song`;
    const body = await fetch(uri);
    const $ = cheerio.load(body);
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
            id: mele.attr('data-cid'),
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
    const uri = `http://music.migu.cn/v3/music/artist/${id}?type=album&page=${page}`;
    const body = await request({
        uri,
        headers: miguHeader,
        proxy,
    });
    const $ = cheerio.load(body);
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

/**
 * 生成m3u格式的播放列表
 * @param  {string} listId 播放列表id
 * @param  {string} base   提供資源路徑轉換服務的路徑
 * @param  {string} proxy  代理服務器地址
 */
async function m3ulist(listId, base, proxy) {
    let raw = [];
    let page = 1;
    while(true) {
        const { songs, more } = (await playlist(listId, page, proxy));
        raw = raw.concat(songs);
        page += 1;
        if (!more) break;
    }
	const list = raw.filter(song => song.enable).map(song => ({
	  duration: -1,
	  artist: song.artist.join(),
	  name: song.name,
	  uri: `${base}/${song.id}`,
	}));
	return m3u(list);
}

module.exports = {
    song, 
    songUri,
    lyric,
    album,
    playlist,
    search,
    artistSong,
    artistAlbum,
    m3u: m3ulist,
};