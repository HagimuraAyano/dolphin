/**
 * @description 呢個模塊用於解析music.qq.com的API
 */

const request = require('util').promisify(require('request'));
const { jsonp } = require('../utils');
const m3u = require('../m3u');

/**
 * 通過uri獲取數據，並將jsonp數據轉化成對象
 * @param {string} uri 請求的地址
 * @param {string} proxy 代理服務器地址
 */
async function fetch(uri, proxy, validCode = [0]) {
    const response = await request({
        uri: `https://c.y.qq.com/${uri}`,
        proxy,
        headers: {
            Referer: 'https://y.qq.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
        }
    });
    if (response.statusCode !== 200) {
        throw new Error(response.statusCode);
    }
    const { code, ...data } = jsonp(response.body);
    if (!validCode.includes(code)) {
        throw new Error('cannot fetch data from qqmusic');
    }
    return data;
}

/**
 * 獲取一組歌曲的信息
 * @param {Array} ids 一組歌曲的id
 * @param {string} proxy 代理服務器的地址
 */
async function getSongsInfo(ids, proxy) {
    const uri = `v8/fcg-bin/fcg_play_single_song.fcg?songmid=${ids.join(',')}&tpl=yqq_song_detail&format=jsonp&callback=getOneSongInfoCallback&jsonpCallback=getOneSongInfoCallback&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`;
    const { data } = await fetch(uri, proxy);
    return data;
}

/**
 * 獲取單曲的播放地址
 * @param {string} id 歌曲的id
 * @param {string} mid 歌曲的media_id
 * @param {string} proxy 代理服務器的地址
 */
async function getSongUri(id, mid, proxy) {
    const m_r_GetRUin = function () {
        let e = (new Date).getUTCMilliseconds();
        let m_r_r_s = Math.round(2147483647 * Math.random()) * e % 1e10;
        return m_r_r_s;
    };
    const guid = m_r_GetRUin();
    const uin = 0;
    const uri = `base/fcgi-bin/fcg_music_express_mobile3.fcg?g_tk=5381&jsonpCallback=MusicJsonCallback&loginUin=${uin}&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0&cid=205361747&callback=MusicJsonCallback&uin=${uin}&songmid=${id}&filename=C400${mid}.m4a&guid=${guid}`;
    const { data: { expiration, items: [{ vkey, filename }] } } = await fetch(uri, proxy);
    return {
        expiration,
        uri: `http://dl.stream.qqmusic.qq.com/${filename}?vkey=${vkey}&guid=${guid}&uin=${uin}`,
    }
}

/**
 * 獲取一組歌曲的信息（包含播放地址）
 * @param {Array} ids 一組歌曲的id
 * @param {string} proxy 代理服務器的地址
 */
async function songs(ids, proxy) {
    const infoList = await getSongsInfo(ids, proxy);
    const songList = [];
    for (let i = 0, ln = infoList.length; i < ln; i += 1) {
        const info = infoList[i];
        const { expiration, uri } = await getSongUri(ids[i], info.file.media_mid, proxy);
        songList.push({ expiration, uri, ...info });
    }
    return songList;
}

/**
 * 獲取歌曲的信息（包含播放地址）
 * @param {string} id 歌曲的id
 * @param {string} proxy 代理服務器的地址
 */
async function song(id, proxy) {
    const [song] = await songs([id], proxy);
    return song;
}

/**
 * 獲取單曲的播放地址
 * @param {string} id 單曲的播放地址
 * @param {string} proxy 代理服務器的地址
 */
async function songUri(id, proxy) {
    const [info] = await getSongsInfo([id], proxy);
    const { uri } = await getSongUri(id, info.file.media_mid, proxy);
    return uri;
}

/**
 * 獲取單曲的歌詞
 * @param {string} id 單曲的id
 * @param {string} proxy 代理服務器的地址 
 */
async function lyric(id, proxy) {
    const uri = `lyric/fcgi-bin/fcg_query_lyric_new.fcg?callback=MusicJsonCallback_lrc&pcachetime=${Date.now()}&songmid=${id}&g_tk=5381&jsonpCallback=MusicJsonCallback_lrc&loginUin=619829631&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`;
    const { lyric = '' } = await fetch(uri, proxy, [0, -1901]);
    return Buffer.from(lyric, 'base64').toString();
}

/**
 * 獲取專輯的信息
 * @param {string} id 專輯的id
 * @param {string} proxy 代理服務器的地址
 */
function album(id, proxy) {
    return fetch(`v8/fcg-bin/fcg_v8_album_info_cp.fcg?albummid=${id}&g_tk=5381&jsonpCallback=albuminfoCallback&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`, proxy);
}

/**
 * 獲取播放列表的信息
 * @param {string} id 播放列表的id
 * @param {string} proxy 代理服務器地址
 */
function playlist(id, proxy) {
    return fetch(`qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?type=1&json=1&utf8=1&onlysong=0&disstid=${id}&format=jsonp&g_tk=5381&jsonpCallback=playlistinfoCallback&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`, proxy);
}

/**
 * 搜索
 * @param {string} keyword 搜索關鍵字
 * @param {string} type 搜索的類型 [song, album, mv, playlist, user, lyric]
 * @param {number} page 搜索結果的頁編碼
 * @param {number} limit 返回的搜索結果的條數
 * @param {string} proxy 代理服務器地址
 */
function search(keyword, type = 'song', page = 1, limit = 30, proxy) {
    let uri;
    if (type === 'song') {
        uri = `soso/fcgi-bin/client_search_cp?new_json=1&remoteplace=txt.yqq.song&searchid=61083879621301006&t=0&aggr=1&cr=1&catZhida=1&lossless=0&flag_qc=0&p=${page}&n=${limit}&w=${keyword}&g_tk=5381&jsonpCallback=MusicJsonCallback09651469446071137&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`;
    } else if (type === 'album') {
        uri = `soso/fcgi-bin/client_search_cp?ct=24&qqmusic_ver=1298&remoteplace=txt.yqq.album&searchid=75989361760033898&aggr=0&catZhida=1&lossless=0&sem=10&t=8&p=${page}&n=${limit}&w=${keyword}&g_tk=5381&jsonpCallback=MusicJsonCallback9366869110523681&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`;
    } else if (type === 'mv') {
        uri = `soso/fcgi-bin/client_search_cp?ct=24&qqmusic_ver=1298&remoteplace=txt.yqq.mv&searchid=130593252384011937&aggr=0&catZhida=1&lossless=0&sem=1&t=12&p=${page}&n=${limit}&w=${keyword}&g_tk=5381&jsonpCallback=MusicJsonCallback8561533338276364&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`;
    } else if (type === 'playlist') {
        uri = `soso/fcgi-bin/client_music_search_songlist?remoteplace=txt.yqq.playlist&searchid=111637044856205400&flag_qc=0&page_no=${page}&num_per_page=${limit}&query=${keyword}&g_tk=5381&jsonpCallback=MusicJsonCallback044777072606260626&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`;
    } else if (type === 'user') {
        uri = `soso/fcgi-bin/client_search_user?ct=24&qqmusic_ver=1298&p=${page}&n=${limit}&searchid=243068107880337063&remoteplace=txt.yqq.user&w=${keyword}&g_tk=5381&jsonpCallback=MusicJsonCallback6586665178957696&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`;
    } else if (type === 'lyric') {
        uri = `soso/fcgi-bin/client_search_cp?ct=24&qqmusic_ver=1298&remoteplace=txt.yqq.lyric&searchid=99182189453817313&aggr=0&catZhida=1&lossless=0&sem=1&t=7&p=${page}&n=${limit}&w=${keyword}&g_tk=5381&jsonpCallback=MusicJsonCallback9605251350605784&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`;
    } else {
        throw new Error('unsupported search type');
    }
    return fetch(uri, proxy);
}

/**
 * 判斷歌曲資源是否可用
 * @param {object} e 歌曲信息
 */
function playable(e) {
    "undefined" != typeof e.type && 0 == e.type || "undefined" != typeof e["switch"] && 0 != e["switch"] || (e["switch"] = 403), e["switch"] || (e["switch"] = 403);
    var n = e["switch"].toString(2).split("");
    n.pop(), n.reverse();
    var o = ["play_lq", "play_hq", "play_sq", "down_lq", "down_hq", "down_sq", "soso", "fav", "share", "bgm", "ring", "sing", "radio", "try", "give"];
    e.action = {};
    for (var a = 0; a < o.length; a++)
        e.action[o[a]] = parseInt(n[a], 10) || 0;
    e.pay = e.pay || {},
        e.preview = e.preview || {},
        e.action.play = 0,
        (e.action.play_lq || e.action.play_hq || e.action.play_sq) && (e.action.play = 1),
        e.tryPlay = 0,
        e.action["try"] && e.preview.trysize > 0 && (e.tryPlay = 1),
        e.disabled = 0,
        e.action.play || e.pay.payplay || e.pay.paydownload || e.tryPlay || (e.disabled = 1);
    return !e.disabled;
}

/**
 * 生成m3u格式的播放列表
 * @param  {string} listId 播放列表id
 * @param  {string} base   提供資源路徑轉換服務的路徑
 * @param  {string} proxy  代理服務器地址
 */
async function m3ulist(listId, base, proxy) {
    const { /* dissname: name, */ songlist: raw } = (await playlist(listId, proxy)).cdlist[0];
    const list = raw.filter(playable).map(song => ({
        duration: song.interval,
        artist: song.singer.map(singer => singer.name).join(),
        name: song.songname,
        uri: `${base}/${song.songmid}`,
    }));
    return m3u(list);
}

module.exports = {
    songs,
    song,
    songUri,
    lyric,
    search,
    album,
    playlist,
    m3u: m3ulist,
};