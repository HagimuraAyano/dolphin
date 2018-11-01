/**
 * @description 蝦米音樂API解析
 */

const request = require('util').promisify(require('request'));
const cheerio = require('cheerio');
const { jsonp } = require('../utils');

/**
 * 從xiami獲取資源
 * @param {string} uri 資源鏈接
 * @param {string} proxy 代理服務器地址
 */
async function fetch(uri, proxy) {
    const response = await request({
        method: 'get',
        proxy,
        uri,
        headers: {
            referer: 'http://www.xiami.com/play',
            cookie: '',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36',
        }
    });

    if (response.statusCode !== 200) {
        throw new Error(response.statusText);
    }

    return response.body;
}

/**
 * 產生非0開頭的四位隨機數
 * @return {string}
 */
function randFour() {
    return Math.random().toString().replace(/^0+|\./g, '').slice(0, 4);
}

/**
 * 通過頁面id獲取歌曲id
 * @param {string} pid 頁面的id
 * @param {string} proxy 代理地址
 */
async function getSongId(pid, proxy) {
    const uri = `http://www.xiami.com/song/${pid}`;
    const html = await fetch(uri, proxy);
    return html.match(/var song_id = '(\d+)'/)[1];
}

/**
 * 解碼歌曲的地址; split from xiami's js file: http://g.alicdn.com/music/music-player/1.0.13/??common/global-min.js,pages/index/page/init-min.js(line 858)
 * @param  {string} a the encrypted location
 * @return {string}   decrypted location
 */
function getLocation(a) {
    if (-1 !== a.indexOf("http://")) return a;
    for (var b = Number(a.charAt(0)), c = a.substring(1), d = Math.floor(c.length / b), e = c.length % b, f = new Array, g = 0; e > g; g++) void 0 == f[g] && (f[g] = ""), f[g] = c.substr((d + 1) * g, d + 1);
    for (g = e; b > g; g++) f[g] = c.substr(d * (g - e) + (d + 1) * e, d);
    var h = "";
    for (g = 0; g < f[0].length; g++)
        for (var i = 0; i < f.length; i++) h += f[i].charAt(g);
    h = unescape(h);
    var j = "";
    for (g = 0; g < h.length; g++) j += "^" == h.charAt(g) ? "0" : h.charAt(g);
    return j = j.replace("+", " ")
}

/**
 * 獲取一組歌曲的信息
 * @param {Array} idlist 一組歌曲id
 * @param {string} proxy 代理服務器的地址
 */
async function songs(idlist, proxy) {
    const randStr = randFour();
    const ksTS = `${Date.now()}_${randStr}`;
    const data = await fetch(`http://www.xiami.com/song/playlist/id/${idlist.join(',')}/object_name/default/object_id/0/cat/json?_ksTS=${ksTS}&callback=jsonp${randStr}`, proxy);
    const info = jsonp(data);
    if (!info.status) {
        throw new Error(info.message);
    }
    const { data: { trackList } } = info;
    return trackList.map(track=>{
        track.location = 'http:' + getLocation(track.location);
        return track;
    });
}

/**
 * 通過一組頁面的地址獲取一組歌曲的地址
 * @param {Array} pidList 一組頁面的id
 * @param {string} proxy 代理地址
 */
async function songsByPageId(pidList, proxy) {
    const idList = [];
    for (let i = 0, ln = pidList.length; i < ln; i += 1) {
        idList.push(await getSongId(pidList[i], proxy));
    }
    const info = await songs(idList, proxy);
    return info;
}

/**
 * 通過歌曲id獲取歌曲的信息
 * @param {string} id 歌曲id
 * @param {string} proxy 代理地址
 */
async function song(id, proxy) {
    const [songInfo] = await songs([id], proxy);
    return songInfo;
}

/**
 * 通過歌曲id獲取歌曲音樂文件的鏈接
 * @param {string} id 歌曲id
 * @param {string} proxy 代理地址
 */
async function songUri(id, proxy) {
    const { location } = await song(id, proxy);
    return location;
}

/**
 * 通過頁面地址獲取歌曲信息
 * @param {string} pid 頁面地址
 * @param {string} proxy 代理地址
 */
async function songByPageId(pid, proxy) {
    const [songInfo] = await songsByPageId([pid], proxy);
    return songInfo;
}

/**
 * 通過歌曲id獲取歌詞
 * @param {string} id 歌曲id
 * @param {string} proxy 代理地址
 */
async function lyric(id, proxy) {
    const { lyric: uri } = await song(id, proxy);
    // 2018-11-01 12:25:00, 歌詞鏈接被改成了 img.xiami.net/lyric/54/59154_1534037081_1244.lrc
    const lyric = await fetch(`http:${uri}`, proxy);
    return lyric;
}

/**
 * 獲取專輯信息
 * @param {string} id 專輯地址
 * @param {string} proxy 代理地址
 */
async function album(id, proxy) {
    const html = await fetch(`http://www.xiami.com/album/${id}`, proxy);
    const $ = cheerio.load(html);
    const artist = [$('#album_info table tr').eq(0).find('td').eq(1).text().trim()];
    const image = $('#cover_lightbox img').attr('src');
    const list = $('#track_list .song_name');
    $('h1 span').empty();
    const albumName = $('h1').text().trim();
    const playlist = [];
    list.each(function (idx, item) {
        item = $(item).find('a').eq(0);
        playlist.push({
            title: item.text(),
            pid: item.attr('href').replace('/song/', ''),
            artist,
        })
    });
    return { name: albumName, list: playlist, image };
}

/**
 * 獲取播放列表
 * @param {string} id 播放列表的id
 * @param {string} proxy 代理地址
 */
async function playlist(id, proxy) {
    const html = await fetch(`http://www.xiami.com/collect/${id}`, proxy);
    const $ = cheerio.load(html);
    const list = $('.quote_song_list .song_name');
    $('h2 span').empty();
    const albumName = $('h2').text().trim();
    const playlist = [];
    list.each(function (idx, item) {
        const alist = $(item).find('a');
        const song = { artist: [] };
        alist.each(function (idx, alink) {
            alink = $(alink);
            if (idx) {
                const txt = alink.text().trim();
                if (txt !== 'MV') song.artist.push(txt);
            } else {
                song.title = alink.text().trim();
                song.mid = alink.attr('href').replace('/song/', '');
                song.duration = 0;
            }
        });
        playlist.push(song);
    });
    return { name: albumName, list: playlist };
};

module.exports = {
    songs,
    songsByPageId,
    song,
    songUri,
    songByPageId,
    lyric,
    album,
    playlist
};
