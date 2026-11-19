// Run with NODE_PATH pointing to an installed Playwright package.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.BASE_URL || 'http://127.0.0.1:8765/';
const output = process.env.ARTIFACT_DIR || process.env.TMPDIR || '.';
(async()=>{
 const browser=await chromium.launch({headless:true});
 const errors=[];
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base);await p.waitForSelector('.day-panel');
 assert.equal(await p.locator('.day-button').count(),7);
 assert.equal(await p.locator('#flight-overview .flight-card').count(),2);
 const outbound=await p.locator('[data-flight="outbound"]').innerText();
 for(const t of ['CI 0120','2027/01/13','08:10','10:50','TPE','OKA','台灣時間 UTC+8','日本時間 UTC+9'])assert.ok(outbound.includes(t),`outbound missing ${t}`);
 const inbound=await p.locator('[data-flight="return"]').innerText();
 for(const t of ['CI 0121','2027/01/19','11:55','12:35','日本時間 UTC+9','台灣時間 UTC+8'])assert.ok(inbound.includes(t),`return missing ${t}`);
 // The same-day clock difference is not the actual flight duration.
 assert.equal((Date.parse('2027-01-13T10:50:00+09:00')-Date.parse('2027-01-13T08:10:00+08:00'))/60000,100);
 assert.equal((Date.parse('2027-01-19T12:35:00+08:00')-Date.parse('2027-01-19T11:55:00+09:00'))/60000,100);
 await p.locator('#flight-overview').screenshot({path:output+'/okinawa-flights-desktop.png'});
 const rentalText=await p.locator('#rental-overview').innerText();
 for(const t of ['Hello rent a car','Toyota PIXIS EPOCH 或同級','2027/1/13（三）','2027/1/18（一）','11:00','与根8-8','時間衝突','尚未獲供應商確認'])assert.ok(rentalText.includes(t),`rental missing ${t}`);
 assert.equal((Date.parse('2027-01-13T11:00:00+09:00')-Date.parse('2027-01-13T10:50:00+09:00'))/60000,10);
 assert.equal(await p.locator('#rental-overview a[href*="maps"]').count(),1);
 await p.locator('#rental-overview').screenshot({path:output+'/okinawa-rental-desktop.png'});
 const summary=await p.evaluate(()=>({days:days.length,places:Object.keys(places).length,checklist:checklist.length,stops:days.reduce((n,d)=>n+d.stops.length,0)}));
 for(let i=0;i<7;i++){
  await p.click(`[data-day="${i}"]`);
  assert.equal(await p.locator('.stop').count(),await p.evaluate(i=>days[i].stops.length,i));
  assert.equal(await p.locator('.daily-map-svg').count(),1);
  if(i===0){assert.ok((await p.locator('.day-header .rental-conflict').innerText()).includes('11:00'));assert.ok((await p.locator('.timeline').innerText()).includes('尚待供應商確認'));assert.equal(await p.locator('[data-map-pin="rental"]').count(),1);assert.ok((await p.locator('.timeline').innerText()).includes('05:30'));assert.ok((await p.locator('.day-flight-summary').innerText()).includes('CI 0120'));}
  if(i===5){const text=await p.locator('.timeline').innerText();for(const t of ['09:00','10:15','11:00','還車','計程車'])assert.ok(text.includes(t));assert.ok(!text.includes('15:00–16:30'));assert.ok((await p.locator('.rental-day-notice').innerText()).includes('11:00'));assert.ok((await p.locator('.route-row a').getAttribute('href')).includes('Hello'));assert.ok((await p.locator('.map-legend').innerText()).includes('Hello'));}
  if(i===6){for(const text of ['08:00','08:15','09:00','11:55','12:35'])assert.ok((await p.locator('.timeline').innerText()).includes(text));assert.ok((await p.locator('.day-flight-summary').innerText()).includes('CI 0121'));}
  const mapIds=await p.evaluate(i=>dayMapPoints(i),i);
  assert.equal(await p.locator('[data-map-pin]').count(),mapIds.length);
  assert.equal(await p.locator('.map-legend li').count(),mapIds.length);
  const badges=await p.locator('.map-pin-badge').evaluateAll(nodes=>nodes.map(n=>[+n.getAttribute('cx'),+n.getAttribute('cy')]));
  for(let a=0;a<badges.length;a++){
   assert.ok(badges[a][0]>=14&&badges[a][0]<=326&&badges[a][1]>=14&&badges[a][1]<=296,'pin outside SVG');
   for(let b=a+1;b<badges.length;b++) assert.ok(Math.hypot(badges[a][0]-badges[b][0],badges[a][1]-badges[b][1])>=35,'overlapping numbered pins');
  }
  assert.ok(!(await p.locator('.daily-map-svg').innerHTML()).includes('NaN'));
  await p.locator('.daily-map').screenshot({path:output+`/okinawa-map-day-${i+1}.png`});
  const href=await p.locator('.route-row a').getAttribute('href');
  const url=new URL(href);assert.equal(url.hostname,'www.google.com');assert.equal(url.searchParams.get('travelmode'),'driving');assert.ok(url.searchParams.get('destination'));
 }
 await p.click('[data-day="0"]');
 assert.ok((await p.locator('.booked-summary').innerText()).includes('豪華海景大床房'));
 assert.ok((await p.locator('.timeline').innerText()).includes('15:00–22:00'));
 await p.click('.booked-summary [data-tab="stays"]');assert.equal(await p.locator('.booking-details').count(),2);
 await p.click('#main-nav [data-tab="itinerary"]');
 await p.click('[data-done="0-0"]');
 await p.fill('[data-note="0"]','測試筆記 </textarea><img src=x onerror=alert(1)>');
 await p.reload();await p.waitForSelector('.day-panel');
 assert.equal(await p.locator('[data-done="0-0"]').getAttribute('aria-pressed'),'true');
 assert.equal(await p.locator('[data-note="0"]').inputValue(),'測試筆記 </textarea><img src=x onerror=alert(1)>');
 assert.equal(await p.locator('#view img').count(),0);
 await p.click('[data-tab="places"]');assert.equal(await p.locator('.place-card').count(),summary.places-2);
 await p.click('[data-filter="餐廳"]');assert.equal(await p.locator('.place-card').count(),await p.evaluate(()=>Object.values(places).filter(p=>p.type==='餐廳').length));
 await p.fill('#search','古宇利');assert.equal(await p.locator('.place-card').count(),1);assert.ok((await p.locator('.place-card').innerText()).includes('314'));
 await p.fill('#search','xyz沒有這裡');assert.equal(await p.locator('.empty').count(),1);
 await p.click('[data-tab="stays"]');assert.equal(await p.locator('.stay-card').count(),2);
 assert.equal(await p.locator('.booking-details').count(),2);
 const lchText=await p.locator('[data-stay="lch"]').innerText();
 for(const text of ['豪華海景大床房','2027/1/13（三）','2027/1/16（六）','15:00–22:00','11:00 前','1996 Kise','提前 1 天','游泳池'])assert.ok(lchText.includes(text),`LCH booking missing ${text}`);
 const torifitoText=await p.locator('[data-stay="torifito"]').innerText();
 for(const text of ['舒適雙人床房','2027/1/16（六）','2027/1/19（二）','14:00 後','11:00 前','免費行李寄存','1 Chome-11-19 Nishi'])assert.ok(torifitoText.includes(text),`Torifito booking missing ${text}`);
 assert.ok(!/\b\d{16}\b/.test(await p.locator('#view').innerText()),'private booking identifier rendered');
 assert.ok(!(await p.locator('#view').innerText()).includes('住宿安排 ≠ 已完成訂房'));
 await p.locator('[data-stay="lch"]').screenshot({path:output+'/okinawa-booking-lch.png'});
 await p.locator('[data-stay="torifito"]').screenshot({path:output+'/okinawa-booking-torifito.png'});
 await p.click('[data-tab="prepare"]');assert.equal(await p.locator('[data-check]').count(),summary.checklist);
 await p.check('[data-check="license"]');await p.reload();await p.waitForSelector('[data-check]');assert.equal(await p.locator('[data-check="license"]').isChecked(),true);
 const dlPromise=p.waitForEvent('download');await p.click('#export-notes');const dl=await dlPromise;const file=await dl.path();assert.equal(JSON.parse(fs.readFileSync(file,'utf8')).checks.license,true);
 await p.goto(base+'#itinerary-3');await p.waitForSelector('[data-day="2"][aria-pressed="true"]');
 const allLinks=await p.evaluate(()=>Object.keys(places).map(id=>mapURL(id)));assert.equal(allLinks.length,summary.places);for(const url of allLinks)assert.ok(new URL(url).searchParams.get('query'));
 await p.evaluate(()=>{localStorage.removeItem('okinawa2027.v1');});await p.goto(base);await p.reload();await p.waitForSelector('.day-panel');
 await p.screenshot({path:output+'/okinawa-desktop.png',fullPage:true});
 for(const width of [320,375,390,768,1440]){
  await p.setViewportSize({width,height:900});
  for(const tab of ['itinerary','places','stays','prepare']){
   await p.click(`[data-tab="${tab}"]`);await p.waitForTimeout(100);
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`horizontal overflow ${width}/${tab}`);
   if(tab==='itinerary'){
    for(let day=0;day<7;day++){
     await p.click(`[data-day="${day}"]`);
     assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`daily map overflow ${width}/${day}`);
     const bounds=await p.evaluate(()=>{const m=document.querySelector('.daily-map').getBoundingClientRect(),c=document.querySelector('.day-content').getBoundingClientRect();return {mx:m.x,my:m.y,mw:m.width,mb:m.bottom,cx:c.x,cy:c.y,cw:c.width};});
     assert.ok(bounds.mw>=width*(width<=390?.72:.15),'map too small');
     if(width>1100)assert.ok(bounds.mx>=bounds.cx+bounds.cw-1,'desktop map not beside timeline');
     else assert.ok(bounds.mb<=bounds.cy+2,'mobile map not above timeline');
    }
   }
  }
 }
 await p.setViewportSize({width:390,height:844});await p.click('[data-tab="itinerary"]');await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await p.screenshot({path:output+'/okinawa-mobile.png',fullPage:true});
 await p.locator('#flight-overview').screenshot({path:output+'/okinawa-flights-mobile.png'});
 await p.locator('#rental-overview').screenshot({path:output+'/okinawa-rental-mobile.png'});
 await p.evaluate(()=>beforePrint());assert.equal(await p.locator('.day-panel').count(),7);
 assert.equal(await p.locator('#view .flight-card').count(),2);
 assert.equal(await p.locator('#view .rental-card').count(),1);
 await p.pdf({path:output+'/okinawa-itinerary.pdf',format:'A4',printBackground:true,margin:{top:'12mm',bottom:'12mm',left:'10mm',right:'10mm'}});
 await p.evaluate(()=>afterPrint());assert.equal(await p.locator('.day-panel').count(),1);
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}});});const bp=await blocked.newPage();bp.on('pageerror',e=>errors.push(e.message));await bp.goto(base);await bp.waitForSelector('.day-panel');assert.ok((await bp.locator('.notes-status').innerText()).includes('無法儲存'));
 const migration=await browser.newContext();await migration.addInitScript(()=>localStorage.setItem('okinawa2027.v1',JSON.stringify({done:{'0-0':true,'6-0':true,'1-0':true},notes:{'0':'保留的旅遊筆記'},checks:{license:true}})));const mp=await migration.newPage();await mp.goto(base);await mp.waitForSelector('.day-panel');
 const migrated=await mp.evaluate(()=>({done:saved.done,notes:saved.notes,checks:saved.checks}));assert.equal(migrated.done['0-0'],undefined);assert.equal(migrated.done['6-0'],undefined);assert.equal(migrated.done['1-0'],true);assert.equal(migrated.notes['0'],'保留的旅遊筆記');assert.equal(migrated.checks.license,true);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',base,...summary,viewports:[320,375,390,768,1440],tested:['all days','maps','filters','search','notes escaping and persistence','checklist persistence','JSON download','deep links','all tabs horizontal overflow','print all days','blocked storage fallback'],errors},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
