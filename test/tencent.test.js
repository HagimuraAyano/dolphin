const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const tencent = require('../lib/tencent');

chai.use(chaiAsPromised);

describe('QQ音樂單元測試', function() {
    // 歌曲id
    const songid = '001na78Y17Ly3p';
    // 純音樂id
    const pureid = '002hiU1P41grJz';
    // 一組音樂的id
    const songidList = [songid, pureid];
    // 播放列表信息
    const playlistid = '2372394039';
    const playlistInfo = {
        name: '「miku歌集」甩葱骑士团，参上',
        nick: '枯骨生花'
    }
    // 專輯信息
    const albumid = '001l7OHh0EiF2L';
    const albumInfo = {
        name: 'The Best of 未来 -MIKU-',
        songCount: 13
    }
    const keyword = 'miku';

    this.timeout(5000);
    this.slow(2000);

    describe('#songs()', function () {
        it('获取一组歌曲', async function() {
            const songs = await tencent.songs(songidList);
            songs.length.should.equal(2);
        });
    });

    describe('#song()', function() {
        it('獲取單曲', function() {
            return tencent.song(songid).should.eventually.have.any.keys(['title', 'singer', 'expiration', 'uri']);
        });
    });

    describe('#songUri()', function() {
        it('獲取播放地址', function() {
            return tencent.songUri(songid).should.eventually.to.be.a('string');
        });
    });

    describe('#lyric()', function() {
        it('獲取歌曲的歌詞', async function () {
            return tencent.lyric(songid).should.eventually.to.be.a('string');
        });
        it('獲取純音樂的歌詞', function () {
            return tencent.lyric(pureid).should.eventually.equal('[00:00:00]此歌曲为没有填词的纯音乐，请您欣赏');
        });
    });

    describe('#album()', function() {
        it('獲取專輯信息', async function() {
            const { data: { name, cur_song_num } } = await tencent.album(albumid);
            name.should.equal(albumInfo.name);
            cur_song_num.should.equal(albumInfo.songCount);
        });
    });

    describe('#playlist()', function() {
        it('獲取播放列表信息', async function () {
            const { cdlist: [{ dissname, nick }] } = await tencent.playlist(playlistid);
            dissname.should.equal(playlistInfo.name);
            nick.should.equal(playlistInfo.nick);
        })
    })

    describe('#search()', function() {
        it('搜索單曲', async function() {
            const { data: { keyword: resultKeyword, song } } = await tencent.search(keyword, 'song', 1, 2);
            resultKeyword.should.equal(keyword);
            song.list.length.should.equal(2);
        });
        it('搜索專輯', async function() {
            const { data: { keyword: resultKeyword, album } } = await tencent.search(keyword, 'album', 1, 2);
            resultKeyword.should.equal(keyword);
            album.list.length.should.equal(2);
        });
        it('搜索mv', async function () {
            const { data: { keyword: resultKeyword, mv } } = await tencent.search(keyword, 'mv', 1, 2);
            resultKeyword.should.equal(keyword);
            mv.list.length.should.equal(2);
        });
        it('搜索播放列表', async function() {
            const { data: { list } } = await tencent.search(keyword, 'playlist', 1, 2);
            list.length.should.equal(2);
        });
        it('搜索用戶', async function() {
            const { data: { keyword: resultKeyword, user } } = await tencent.search(keyword, 'user', 1, 2);
            resultKeyword.should.equal(keyword);
            user.list.length.should.equal(2);
        });
        it('搜索歌詞', async function () {
            const { data: { keyword: resultKeyword, lyric } } = await tencent.search(keyword, 'lyric', 1, 2);
            resultKeyword.should.equal(keyword);
            lyric.list.length.should.equal(2);
        });
    });
});