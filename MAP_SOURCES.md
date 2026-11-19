# 每日小地圖資料來源

## 底圖

海岸線來源：**地球地図日本（日本國土地理院／GSI）**，透過 [dataofjapan/land 的 japan.geojson](https://github.com/dataofjapan/land) 取得沖繩縣圖形，擷取沖繩本島周邊並將座標四捨五入至小數點後五位，以本機 SVG 呈現。此專案為非營利個人旅遊手冊，地圖畫面與此文件均保留出典。海岸線是歷史一般化資料，並非最新測繪或道路導航底圖。

## 地點座標

地點使用 WGS84 經緯度。多數地點透過 [Nominatim](https://nominatim.openstreetmap.org/) 查詢 OpenStreetMap 資料，資料 © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)，ODbL。檢索名稱與行政區核對原行程地點。

- 那霸機場：以航廈區（國內線航廈 POI）為相對位置代表，不代表國際線報到櫃台。
- LCH：採 [飯店官方交通頁](https://kariyushi-lchresort.jp/access/) 內嵌地圖座標。
- 美國村：採 [官方交通頁](https://www.okinawa-americanvillage.com/access/) 內嵌地圖中心。
- 幸福鬆餅：採 [官方店舖頁](https://magia.tokyo/shop) 沖繩分店內嵌地圖座標。
- 國際通：以久茂地段路段座標作區域代表，不代表整條街僅此一點。
- 樂水：顯示餐廳大致座標；點擊導航仍依原行程指向官方指定停車場。

- Hello rent a car 与根門市：依使用者訂單地址（8-8 Yone）與 [Tabirai 那霸機場店](https://tc.tabirai.net/s/car/okinawa/company/hello-rentacar/branch/?PID=5347) 地址交叉核對，使用該門市頁內嵌地圖座標（26.1731309, 127.658639）。

## 表現方式與限制

- 北方固定朝上；經度按當日平均緯度修正比例，保持各地點相對位置。
- 範圍依當天地點自動調整，附北箭頭、比例尺與編號對照。
- 按首次出現給編號，同地再次停留共用編號；未知租車門市不虛構座標。
- 餐廳相距極近時，僅將編號徽章移開，使用引線連接真實座標圓點。
- 虛線只表示首次出現的地點連接順序，不是道路或實際開車路線。部分地點是選配停留。
- SVG 與座標隨網站本地提供，無外部地圖圖磚、追蹤或 API 金鑰；點擊標記和圖例後才前往 Google Maps。
