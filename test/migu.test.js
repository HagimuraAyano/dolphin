const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const migu = require('../lib/migu');

chai.use(chaiAsPromised);
chai.should();

describe('migu音樂單元測試', function() {
    //song -- 不欠我什么
    const songid = '1107491166';
    const retry = 10;
    // album -- 衛蘭
    const album = {
        id: '1107491815',
        songCount: 7,
        total: 1,
        more: false
    };
    // playlist
    const playlist = {
        id: '133565163/04be02dd-171e-427f-8627-4b0321915cab',
        songCount: 30,
        total: 2,
        more: true
    };
    // search
    const search = {
        keyword: '衛蘭',
        count: 11,
        total: 8,
        more: true, 
    };
    // artist -- 衛蘭
    const artist = {
        id: 1177,
    };

    this.timeout(6000);
    this.slow(2000);

    describe('#song()', function () {
        this.retries(retry);
        it('獲取單曲信息', async function () {
            return migu.song(songid).should.eventually.have.any.keys(['musicName', 'dynamicLyric', 'albumName']);
        });
    });

    describe('#lyric()', function () {
        this.retries(retry);
        it('獲取單曲的歌詞', function() {
            return migu.lyric(songid).should.eventually.to.be.a('string');
        });
    });

    describe('#album()', function() {
        this.retries(retry);
        it('獲取專輯信息', function() {
            return migu.album(album.id).should.eventually.satisfy(function (al) {
                return al.songs.length === album.songCount && al.total === album.total && al.more === album.more;
            })
        });
    });

    describe('#playlist()', function() {
        this.retries(retry);
        it('獲取播放列表信息', function() {
            return migu.playlist(playlist.id).should.eventually.satisfy(function(pl) {
                return pl.songs.length === playlist.songCount && pl.total === playlist.total && pl.more === playlist.more;
            });
        });
    });

    describe('#search()', function () {
        this.retries(retry);
        it('搜索', function() {
            return migu.search(search.keyword).should.eventually.satisfy(function (s) {
                return s.list.length > 0;
            });
        });
    });

    describe('#artistSong()', function() {
        this.retries(retry);
        it('藝術家名下的歌曲', function() {
            return migu.artistSong(artist.id).should.eventually.satisfy(function(songs) {
                return songs.list.length > 0;
            });
        });
    });
    
    describe('#artistAlbum()', function() {
        this.retries(retry);
        it('獲取藝術家名下的所有專輯', function() {
            return migu.artistAlbum(artist.id).should.eventually.satisfy(function(albums) {
                return albums.list.length > 0;
            });
        });
    });
});