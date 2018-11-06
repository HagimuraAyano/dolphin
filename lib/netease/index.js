/**
 * @description 這是一個用於從 http://music.163.com 請求數據的模塊
 */
const enc = require('./lib/enc');
const { m3u, request } = require('../utils');

/* 可以通過music.163.com的請求頭文件 */
const neteaseHeader = {
	Accept: '*/*',
	'Accept-Encoding': 'gzip, deflate',
	'Accept-Language': 'zh-CN,zh;q=0.8',
	Connection: 'keep-alive',
	Host: 'music.163.com',
	Origin: 'http://music.163.com',
	Referer: 'http://music.163.com/'
};


/**
 * 加密方式獲取
 * @param  {string} bl    需要加密提交的信息
 * @param  {string} uri   請求的鏈接
 * @param  {string} proxy 代理服務器
 * @return {object}       請求的結果
 */
async function encFetch(uri, bl, proxy) {
	const { params, encSecKey } = enc(bl);
	return fetch(uri, proxy, 'post', {
		params: encodeURI(params),
		encSecKey,
	});
}


/**
 * 非加密方式提交
 * @param {string} uri 請求的地址
 * @param {string} proxy 代理服務器地址
 * @param {string} method 請求的方法
 * @param {object} form 表單信息
 */
async function fetch(uri, proxy, method = 'get', form) {
	const { code, ...data } = await request({
		uri: `http://music.163.com/${uri}`,
		proxy,
		method,
		form,
		headers: neteaseHeader,
		gzip: true,
		json: true
	});

	if (code !== 200) {
		throw new Error('cannot fetch data');
	}

	return data;
}


/**
 * 獲取一組歌曲信息
 * @param  {array}  sids  歌曲id
 * @param  {string} proxy 代理服務器地址
 * @return {array}        歌曲信息
 */
async function encSongs(sids, proxy) {
	const bl = {
		br: 320000,
		csrf_token: '',
		ids: JSON.stringify(sids),
	};
	const uri = 'weapi/song/enhance/player/url?csrf_token=';
	const songs = await encFetch(uri, bl, proxy);
	return songs.data;
}


/**
 * 獲取單曲的信息
 * @param  {string} sid   歌曲id
 * @param  {string} proxy 代理服務器的地址
 * @return {object}       {id: number, url: string, br, size, md5, code, expi, type: 'mp3', gain, fee, uf, payed, flag, canExtend: boolean}
 */
async function encSong(sid, proxy) {
	let songList = await encSongs([sid], proxy);
	return songList[0];
}


/**
 * 獲取單曲的地址
 * @param  {string} sid   獲取單曲的播放地址
 * @param  {string} proxy 代理服務器的地址
 * @return {object}       {id: number, url: string, br, size, md5, code, expi, type: 'mp3', gain, fee, uf, payed, flag, canExtend: boolean}
 */
async function encSongUri(sid, proxy) {
	let song = await encSong(sid, proxy);
	return song.url;
}


/**
 * 獲取歌詞
 * @param  {string} sid   歌曲id
 * @param  {string} proxy 代理服務器地址
 * @return {object}       {nolyric: boolean, sgc: boolean, sfy: boolean, qfy: boolean, code: number}
 */
function encLyric(sid, proxy) {
	const bl = {
		lv: -1,
		tv: -1,
		csrf_token: '',
		id: sid
	};
	const uri = 'weapi/song/lyric?csrf_token=';
	return encFetch(uri, bl, proxy);
}


/**
 * 獲取搜索信息
 * @param  {string} keyword 搜索關鍵字
 * @param  {number} type    搜索類型, {1: song, 100: album, 1000: playlist, 1002: user}
 * @param  {number} offset  搜索結果偏移量
 * @param  {number} limit   返回的搜索結果數量 
 * @return {array}          搜索結果 {songs, songCount}, {artists, artistCount}, {playlists, playlistCount}, {userprofiles, userprofileCount}
 */
async function search(keyword, type = 1, offset = 0, limit = 30, proxy) {
	const { result } = await fetch('api/search/get/', proxy, 'post', {
		s: encodeURIComponent(keyword),
		limit,
		sub: false,
		type: type,
		offset,
	});
	return result;
}


/**
 * 獲取搜索信息
 * @param  {string} keyword 搜索關鍵字
 * @param  {number} type    搜索類型, {1: song, 100: album, 1000: playlist, 1002: user}
 * @param  {number} offset  搜索結果偏移量
 * @param  {number} limit   返回的搜索結果數量 
 * @return {array}          搜索結果 {songs, songCount}, {artists, artistCount}, {playlists, playlistCount}, {userprofiles, userprofileCount}
 */
async function encSearch(keyword, type = 1, offset = 0, limit = 30, proxy) {
	let bl = {
		csrf_token: '',
		hlposttag: '</span>',
		hlpretag: '<span class="s-fc7">',
		limit,
		offset,
		s: keyword,
		total: 'true',
		type,
	};
	let uri = 'weapi/cloudsearch/get/web?csrf_token=';
	const { result } = await encFetch(uri, bl, proxy);
	return result;
}


/**
 * 獲取播放列表
 * @param  {string} id    播放列表的id
 * @param  {string} proxy 代理服務器地址
 * @return {object}       列表信息
 */
async function encPlaylist(id, proxy) {
	const uri = `api/playlist/detail?id=${id}`;
	const bl = {
		id,
		n: 100000,
		csrf_token: ""
	};
	const { result } = await encFetch(uri, bl, proxy);
	return result;
}
/**
 * 獲取專輯信息
 * @param  {string} id    專輯id
 * @param  {string} proxy 代理服務器地址
 * @return {object}       { songs, album }
 */
async function encAlbum(id, proxy) {
	const bl = {
		csrf_token: '',
	};
	const uri = `weapi/v1/album/${id}`;
	const playlist = await encFetch(uri, bl, proxy);
	playlist.songs = playlist.songs.filter(song => song.privilege.st === 0);
	return playlist;
}
/**
 * 獲取專輯信息
 * @param  {string} id    專輯id
 * @param  {string} proxy 代理服務器地址
 * @return {object}       專輯信息
 */
async function album(id, proxy) {
	const { album } = await fetch(`api/album/${id}/`, proxy);
	return album;
}


/**
 * 獲取藝術家名下的專輯
 * @param  {string} id     藝術家id
 * @param  {number} offset 專輯結果偏移量
 * @param  {number} limit  返回的專輯數量
 * @param  {string} proxy  代理服務器地址
 * @return {object}        { artist, hotAlbums, more: boolean}
 */
function artistAlbum(id, offset = 0, limit = 5, proxy) {
	return fetch(`api/artist/albums/${id}?offset=${offset}&limit=${limit}`, proxy);
}

/**
 * 生成m3u格式的播放列表
 * @param  {string} listId 播放列表id
 * @param  {string} base   提供資源路徑轉換服務的路徑
 * @param  {string} proxy  代理服務器地址
 */
async function m3ulist(listId, base, proxy) {
	const raw = (await encPlaylist(listId, proxy)).tracks;
	const list = raw.map(song => ({
	  duration: song.duration / 1000,
	  artist: song.artists.map(artist => artist.name).join(','),
	  name: song.name,
	  uri: `${base}/${song.id}`,
	}));
	return m3u(list);
}

module.exports = {
	songs: encSongs,
	song: encSong,
	songUri: encSongUri,
	lyric: encLyric,
	playlist: encPlaylist,
	album,
	encAlbum,
	htmlAlbum: require('./lib/album'),
	artistAlbum,
	encSearch,
	search,
	m3u: m3ulist,
};