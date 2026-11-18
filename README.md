# 沖繩，慢慢走。Okinawa 2027

2027/1/13–1/19，雙人七天六夜自駕行程網站。

**網站：https://bbfishes.github.io/okinawa-2027/**

## 功能
- 七天日期切換、建議時間軸、粗估車程、各日雨備。
- Google Maps 個別地點與當日多站路線。
- 每日地理位置小地圖：桌面與行程左右並排、手機置於行程上方；編號對照、住宿配色、北箭頭與比例尺，近距離徽章避讓。底圖與座標本地載入，不依賴地圖圖磚服務。
- 美食與景點分類、店名／地區／地址搜尋。
- 名護 LCH 與那霸旭橋 Torifito 各三晚的住宿資料。
- 每站完成記號、12 項行前清單、每日筆記；僅儲存在目前瀏覽器的 localStorage，不跨裝置同步。
- 下載 JSON 筆記備份；目前不支援備份匯入。
- 列印包含七天行程、住宿、行前準備，可另存 PDF。
- 無框架、無第三方 CDN、無追蹤、無 API 金鑰。首頁為非等比例 SVG 示意；每日小地圖按經緯度繪製，海岸線為一般化底圖，非道路導航圖。資料來源見 `MAP_SOURCES.md`。

## 檔案
- `index.html`：頁面骨架、沖繩路線示意圖。
- `style.css`、`mobile.css`：響應式版型、窄手機觸控與安全區域、列印版面。
- `data.js`：地點、每日行程、餐廳地址與資料來源、行前清單。
- `app.js`：互動與本機儲存。
- `icon.svg`：網站圖示。
- `tests/smoke.cjs`：Playwright 瀏覽器冒煙測試。

本機可使用任一靜態 HTTP 伺服器；不需要 build。GitHub Pages 由 `main` 根目錄發布。

## 路線調整
水族館與古宇利拆成兩天；美國村移到 1/16 南下移宿日，避免折回名護。恩納燒肉安排 1/15，避開抵達日取車延誤。岸本食堂只指定本店，不把週四公休的八重岳店當 1/14 備案。樂水按官網 11:00–15:00、14:00 最後點餐安排 13:00 預約建議。

## 資訊狀態
住宿與日期沿用原規劃，**不代表已訂房**。未代訂機票、租車、餐廳或付款。航班、租車門市、實際房價與訂單待確認。

時間與車程為規劃粗估，不是即時路況。餐費若未標明官方價格，就是預算預留額度，不是報價。天氣提醒是季節性準備方向，不是旅行日期的預報。官方資訊可能更新，出發前須再確認。

## 主要來源
- [LCH 官網](https://kariyushi-lchresort.jp/en/)／[停車 FAQ](https://kariyushi-lchresort.jp/faq/)
- [Torifito 交通與停車](https://torifito.jp/nahaab/access)
- [美麗海水族館營業時間](https://churaumi.okinawa/tc/guide/hour/)
- [琉球的牛恩納本館](https://u-shi.net/onna/)
- [山之茶屋樂水](https://sachibaru.jp/yamacha/)
- [濱邊之茶屋](https://sachibaru.jp/hamacha/)
- [KOURI SHRIMP](https://lovesokinawa.co.jp/)
- [幸福鬆餅店舖資訊](https://magia.tokyo/shop)
- [岸本食堂本店旅遊資訊](https://www.okinawatraveler.net/shop/789)

地址／營業資訊整理於 2026 年 11 月，最終以當日官方公告與訂單為準。
