/* Local SVG maps: no remote tiles or API keys; north is always up. */
const mapNames = {rental:'Hello 租車・与根門市',airport:'那霸機場',lch:'LCH 海濱飯店',torifito:'那霸旭橋托里菲托',aquarium:'美麗海水族館',kishimoto:'岸本食堂本店',kouri:'古宇利海灘',shrimp:'古宇利蝦蝦飯',manzamo:'萬座毛',beef:'琉球的牛・恩納本館',village:'北谷美國村',kokusai:'國際通',world:'沖繩世界・玉泉洞',rakusui:'山之茶屋・樂水',hamacha:'濱邊之茶屋',senaga:'瀨長島',pancake:'幸福鬆餅・沖繩店'};
function dayMapPoints(index){
 const d=days[index];
 return [...new Set([d.route[0],...d.stops.map(s=>s[1]),d.stay].filter(id=>id && mapGeography.coordinates[id]))];
}
function mapNumber(index,id){return id?dayMapPoints(index).indexOf(id)+1:0;}
function renderDayMap(index){
 const ids=dayMapPoints(index), coordinates=mapGeography.coordinates;
 const w=340,h=310,padding=48;
 const centerLat=ids.reduce((sum,id)=>sum+coordinates[id][1],0)/ids.length;
 const cosine=Math.cos(centerLat*Math.PI/180);
 const raw=([lon,lat])=>[lon*cosine,-lat];
 const xy=ids.map(id=>raw(coordinates[id]));
 const xmin=Math.min(...xy.map(p=>p[0])),xmax=Math.max(...xy.map(p=>p[0]));
 const ymin=Math.min(...xy.map(p=>p[1])),ymax=Math.max(...xy.map(p=>p[1]));
 const scale=Math.min((w-2*padding)/Math.max(xmax-xmin,.035),(h-2*padding)/Math.max(ymax-ymin,.035));
 const cx=(xmin+xmax)/2,cy=(ymin+ymax)/2;
 const project=p=>{const [x,y]=raw(p);return [w/2+(x-cx)*scale,h/2+(y-cy)*scale];};
 const actual=ids.map(id=>project(coordinates[id]));
 // Move numbered badges, not geographic anchors, to separate nearby restaurants.
 // Leader lines retain their true positions even when two POIs are metres apart.
 const badges=[];
 for(const [x,y] of actual){
  let chosen=[x,y];
  for(let attempt=0;attempt<140;attempt++){
   const radius=attempt===0?0:18+Math.floor((attempt-1)/12)*8;
   const angle=(attempt%12)*Math.PI/6;
   const candidate=[Math.max(20,Math.min(w-20,x+Math.cos(angle)*radius)),Math.max(38,Math.min(h-35,y+Math.sin(angle)*radius))];
   const inCompass=candidate[0]>282 && candidate[1]<74;
   const inScale=candidate[0]<118 && candidate[1]>h-62;
   if(!inCompass && !inScale && badges.every(p=>Math.hypot(p[0]-candidate[0],p[1]-candidate[1])>=36)){chosen=candidate;break;}
  }
  badges.push(chosen);
 }
 const land=mapGeography.rings.map(r=>'M'+r.map(p=>project(p).map(n=>n.toFixed(2)).join(',')).join('L')+'Z').join('');
 const line=actual.map(p=>p.map(n=>n.toFixed(2)).join(',')).join(' ');
 const kmChoices=[.2,.5,1,2,5,10,20],km=kmChoices.filter(k=>k/111.32*scale<85).pop() || .2;
 const bar=km/111.32*scale;
 const svg=`<svg class="daily-map-svg" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="map-title-${index} map-desc-${index}" xmlns="http://www.w3.org/2000/svg"><title id="map-title-${index}">Day ${index+1} 地點相對位置</title><desc id="map-desc-${index}">北方朝上，依地理座標繪製。${ids.map((id,i)=>`${i+1} ${mapNames[id]}`).join('；')}。虛線不是實際道路。</desc><defs><pattern id="map-grid-${index}" width="34" height="31" patternUnits="userSpaceOnUse"><path d="M34 0H0V31" fill="none" stroke="#c1dbdb" stroke-width=".7"/></pattern></defs><rect width="340" height="310" fill="#e1f0f2"/><rect width="340" height="310" fill="url(#map-grid-${index})"/><path d="${land}" fill="#f7f6e8" stroke="#9bb6a5" stroke-width="1.15" stroke-linejoin="round"/><polyline class="map-order-line" points="${line}" fill="none" stroke="#397e77" stroke-width="2" stroke-dasharray="5 5" opacity=".8"/>${ids.map((id,i)=>{const [x,y]=actual[i],[bx,by]=badges[i];return `<g class="map-pin ${places[id].type==='住宿'?'hotel-pin':''}" data-map-pin="${id}"><path d="M${x},${y}L${bx},${by}" stroke="#405f5a" stroke-width="1.4"/><circle cx="${x}" cy="${y}" r="3" fill="#284f49" stroke="white" stroke-width="1"/><a href="${escapeHTML(mapURL(id))}" target="_blank" rel="noopener noreferrer" aria-label="${i+1} ${escapeHTML(mapNames[id])}，開啟地圖"><circle class="map-pin-hit" cx="${bx}" cy="${by}" r="21" fill="transparent"/><circle class="map-pin-badge" cx="${bx}" cy="${by}" r="14" fill="${places[id].type==='住宿'?'#ae6735':'#176f64'}" stroke="white" stroke-width="3"/><text x="${bx}" y="${by+5}" text-anchor="middle" fill="white" font-size="14" font-weight="750">${i+1}</text></a></g>`;}).join('')}<g transform="translate(304 18)" aria-hidden="true"><rect x="-14" y="-8" width="30" height="55" rx="5" fill="white" fill-opacity=".9"/><text x="1" y="5" text-anchor="middle" fill="#284f49" font-size="11" font-weight="700">北 N</text><path d="M1 13L-5 28L1 24L7 28Z" fill="#284f49"/></g><g transform="translate(18 283)" aria-hidden="true"><rect x="-8" y="-14" width="${bar+20}" height="30" rx="4" fill="white" fill-opacity=".9"/><path d="M0 0V5H${bar}V0" fill="none" stroke="#284f49" stroke-width="2"/><text x="${bar/2}" y="-4" text-anchor="middle" font-size="10" fill="#284f49">${km<1?km*1000+' m':km+' km'}</text></g></svg>`;
 return `<aside class="daily-map" aria-label="當日地點小地圖"><div class="daily-map-heading"><div><span>DAY ${String(index+1).padStart(2,'0')} · LOCATION MAP</span><h4>今天，我們在這裡。</h4></div><span class="map-count">${ids.length} 處</span></div>${svg}<ol class="map-legend">${ids.map((id,i)=>`<li><a href="${escapeHTML(mapURL(id))}" target="_blank" rel="noopener noreferrer" data-map-place="${id}"><span class="map-number ${places[id].type==='住宿'?'hotel-number':''}">${i+1}</span><span>${mapNames[id]}</span><small>${places[id].type==='住宿'?'住宿':'↗'}</small></a></li>`).join('')}</ol><p class="map-caption">編號對應行程地點；同地點再次停留共用編號。近距離標記以引線分開，圓點為座標位置。虛線僅連接順序，非實際行車道路。</p><div class="map-attribution">地圖：<a href="https://github.com/dataofjapan/land" target="_blank" rel="noopener noreferrer">地球地図日本</a> · 地點：<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a></div></aside>`;
}
