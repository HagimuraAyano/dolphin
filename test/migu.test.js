const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const migu = require('../lib/migu');

chai.use(chaiAsPromised);
chai.should();

describe('migu音樂單元測試', function() {
    //song -- 驗傷
    const songid = '6005750YPNB';
    const retry = 10;
    // album -- 衛蘭
    const album = {
        id: '1107491815',
        songCount: 7,
        total: 1,
        more: false
    };
    // playlist -- 从组合单飞后，他们各自辉煌
    const playlist = {
        id: '133565163',
        songCount: 30,
        total: 1,
        more: false
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
        it('獲取單曲信息', function () {
            return migu.song(songid).should.eventually.have.any.keys(['songId', 'copyrightId', 'walkmanInfo']);
        });
    });

    describe('#songUri()', function() {
        this.retries(retry);
        it('獲取單曲鏈接', function() {
            return migu.songUri(songid).should.eventually.to.be.a('string');
        });
    })

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

    describe('#m3u()', function() {
        this.retries(retry);
        it('獲取播放列表信息', function() {
            return migu.m3u('http://127.0.0.1', playlist.id).should.eventually.to.be.a('string');
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