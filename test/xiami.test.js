const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const xiami = require('../lib/xiami');

chai.use(chaiAsPromised);
chai.should();

describe('蝦米音樂單元測試', function() {
    // songid -- 墓仔埔也敢去
    const songid = 'bfzU15f8c';
    const otherSongid = '8Ghmam179ce';
    const retry = 4;

    describe('#songs()', function() {
        this.retries(retry);
        it('獲取一組歌曲的信息', async function() {
            return xiami.songs([songid, otherSongid]).should.eventually.satisfy(function(result) {
                return result.length === 2;
            });
        });
    });

    describe('#song()', function() {
        this.retries(retry);
        it('獲取單曲信息', async function() {
            return xiami.song(songid).should.eventually.satisfy(function(info) {
                return info.songName === '墓仔埔也敢去';
            });
        });
    });

    describe('#songUri()', function() {
        this.retries(retry);
        it('獲取音樂資源鏈接', async function() {
            return xiami.songUri(songid).should.eventually.not.equal(undefined);
        });
    });

    describe('#lyric()', function() {
        this.retries(retry);
        it('獲取單曲的歌詞', async function() {
            return xiami.songUri(songid).should.eventually.satisfy(function(lrc) {
                return lrc && lrc.length > 0;
            })
        })
    });
});
