# 更新記錄

## v1.0.1

新增:

- `#tencent.m3u`
- `#netease.m3u`

將站點在線播放列表轉換成 m3u 格式的播放列表.

## v1.0.2

針對 migu 接口 v2 升級至 v3, 對 API 做如下操作:

1. 針對 migu 接口從 v2 升級至 v3, 調整 API
2. 新增 `#m3u` 方法
3. 調整 migu 的測試文件

合併整個項目的請求部分代碼, 刪除冗餘重複部分.

## v1.0.3

1. 修正 `#xiami.lyric` 在請求無歌詞音樂歌詞時產生的錯誤
2. 調整 `#netease.lyric` 請求歌詞時返回的結果, 將 json 調整爲文件

## v1.0.4

1. netease 請求部分使用 https(非 https 請求 netease 大概率不響應)
2. netease 請求部分加上超時限制
3. 刪除 netease 加密部分的冗餘代碼