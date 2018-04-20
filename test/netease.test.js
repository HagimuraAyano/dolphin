const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const netease = require('../lib/netease/');
chai.use(chaiAsPromised);
chai.should();

describe('網易雲音樂單元測試', function() {
    // 麗春院
    const pureid = '94680';
    // 誰明浪子心
    const songid = '158655';
    const playListId = '702799455';
    // 誰明浪子心
    const albumId = '15941';
    // 王傑
    const artistId = '5358';
    const keyword = 'miku';

    this.timeout(5000);
    this.slow(1000);

    describe('#songs()', function () {
        it('獲取一組歌曲的信息', function () {
            return netease.songs([pureid, songid]).should.eventually.be.a.instanceof(Array);
        });
    });
    describe('#song()', function () {
        it('獲取一首歌的信息', function () {
            return netease.song(songid).should.eventually.have.all.keys(['br', 'canExtend', 'code', 'expi', 'fee', 'flag', 'gain', 'id', 'md5', 'payed', 'size', 'type', 'uf', 'url']);
        });
    });
    describe('#songUri()', function () {
        it('獲取歌曲的uri', function () {
            return netease.songUri(songid).should.eventually.be.a('string');
        });
    });
    describe('#lyric()', function () {
        it('获取纯音乐的歌词', function () {
            return netease.lyric(pureid).should.eventually.have.all.keys(['nolyric', 'qfy', 'sfy', 'sgc']);
        });
        it('獲取歌曲的歌詞', function () {
            return netease.lyric(songid).should.eventually.have.all.keys(['qfy', 'sfy', 'sgc', 'lrc', 'tlyric']);
        })
    });
    describe('#playlist()', function() {
        it('獲取播放列表', function() {
            return netease.playlist(playListId).should.eventually.have.all.keys(['subscribers','subscribed','creator','artists','tracks','adType','trackNumberUpdateTime','status','ordered','tags','subscribedCount','cloudTrackCount','coverImgUrl','userId','coverImgId','createTime','updateTime','description','privacy','newImported','specialType','anonimous','trackUpdateTime','trackCount','commentThreadId','totalDuration','highQuality','playCount','name','id','shareCount','coverImgId_str','commentCount'])
        });
    });
    describe('#htmlList()', function () {
        it('獲取播放列表', function () {
            return netease.htmlList(playListId).should.eventually.have.all.keys(['name', 'list']);
        });
    });
    describe('#album()', function () {
        it('獲取專輯信息', function() {
            return netease.album(albumId).should.eventually.have.all.keys(["songs", "paid", "onSale", "alias", "status", "artists", "copyrightId", "artist", "picId", "publishTime", "company", "commentThreadId", "picUrl", "briefDesc", "description", "subType", "tags", "blurPicUrl", "companyId", "pic", "name", "id", "type", "size", "picId_str", "info"]);
        });
    });
    describe('#encAlbum()', function () {
        it('獲取專輯信息', function () {
            return netease.encAlbum(albumId).should.eventually.have.all.keys(["songs", "album"]);
        });
    });
    describe('#htmlAlbum()', function () {
        it('獲取專輯信息', function () {
            return netease.htmlAlbum(albumId).should.eventually.have.all.keys(["songs", "name"]);
        });
    });
    describe('#artistAlbum()', function() {
        it('藝術家名下的所有專輯', async function() {
            const albums = await netease.artistAlbum(artistId, 0, 2);
            albums.should.have.all.keys(['artist', 'hotAlbums', 'more']);
            albums.hotAlbums.length.should.equal(2);
            albums.more.should.equal(true);
        });
    });
    describe('#search()', function() {
        it('搜索單曲', async function() {
            const result = await netease.search(keyword, 1, 0, 2);
            result.should.have.all.keys(['songs', 'songCount']);
            result.songs.length.should.equal(2);
        });
        it('搜索專輯', async function () {
            const result = await netease.search(keyword, 100, 0, 2);
            result.should.have.all.keys(['artists', 'artistCount']);
            result.artists.length.should.equal(2);
        });
        it('搜索播放列表', async function () {
            const result = await netease.search(keyword, 1000, 0, 2);
            result.should.have.all.keys(['playlists', 'playlistCount']);
            result.playlists.length.should.equal(2);
        });
        it('搜索用戶', async function () {
            const result = await netease.search(keyword, 1002, 0, 2);
            result.should.have.all.keys(['userprofiles', 'userprofileCount']);
            result.userprofiles.length.should.equal(2);
        });
    });
    describe('#encSearch()', function () {
        it('搜索單曲', async function () {
            const result = await netease.encSearch(keyword, 1, 0, 2);
            result.should.have.all.keys(['songs', 'songCount']);
            result.songs.length.should.equal(2);
        });
        it('搜索專輯', async function () {
            const result = await netease.encSearch(keyword, 100, 0, 2);
            result.should.have.all.keys(['artists', 'artistCount']);
            result.artists.length.should.equal(2);
        });
        it('搜索播放列表', async function () {
            const result = await netease.encSearch(keyword, 1000, 0, 2);
            result.should.have.all.keys(['playlists', 'playlistCount']);
            result.playlists.length.should.equal(2);
        });
        it('搜索用戶', async function () {
            const result = await netease.encSearch(keyword, 1002, 0, 2);
            result.should.have.all.keys(['userprofiles', 'userprofileCount']);
            result.userprofiles.length.should.equal(2);
        });
    });
});