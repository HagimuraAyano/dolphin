/**
 * 將播放列表轉換成.m3u格式
 * @param {Array} list 播放列表數據
 */
module.exports = list => list.reduce((playlist, music) => `${playlist}\n\n#EXTINF:${music.duration || -1}, ${music.artist} - ${music.name}\n${music.uri}`
, '#EXTM3U');