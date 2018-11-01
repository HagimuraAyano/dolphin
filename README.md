# dolphin🐬

collections of music api

## netease 🐷

- `songs(sids, proxy)`
- `song(sid, proxy)`
- `songUri(sid, proxy)`
- `lyric(sid, proxy)`
- `search(keyword, type = 1, offset = 0, limit = 30, proxy)`
- `encSearch(keyword, type = 1, offset = 0, limit = 30, proxy)`
- `playlist(id, proxy)`
- `album(id, proxy)`
- `encAlbum(id, proxy)`
- `artistAlbum(id, offset = 0, limit = 5, proxy)`

## tencent 🐧

- `songs(ids, proxy)`
- `song(id, proxy)`
- `songUri(id, proxy)`
- `lyric(id, proxy)`
- `album(id, proxy)`
- `playlist(id, proxy)`
- `search(keyword, type = 'song', page = 1, limit = 30, proxy)`

## migu 🎧

- `songs(ids, proxy)` -- decrypted
- `songSimple(id, proxy)` -- decrypted
- `song(id, proxy)`
- `lyric(id, proxy)`
- `album(id, proxy)`
- `playlist(id, page=1, proxy)`
- `search(keyword, page = 1, type = 'song', proxy)`
- `artistSong(id, page=1, proxy)`
- `artistAlbum(id, page=1, proxy)`

## xiami 🦐

- `songs(idlist, proxy)`
- `songsByPageId(pidList, proxy)`
- `song(id, proxy)`
- `songUri(id, proxy)`
- `songByPageId(pid, proxy)`
- `lyric(id, proxy)`
- `album(id, proxy)`
- `playlist(id, proxy)`

## baidu 🐻