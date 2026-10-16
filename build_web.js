// 과학 탐험 노트: src_science.html(아티팩트 원본) 하나로 두 가지를 만든다
//  1) science.html  - 독립 실행 HTML (exe 안에 들어감, 더블클릭으로도 열림)
//  2) docs\         - 휴대폰 홈 화면용 웹앱 (manifest + 오프라인 저장 service worker, GitHub Pages가 이 폴더를 보여 줌)
// 실행: node build_web.js   (아이콘은 make_icons.ps1 로 먼저 만들어 둔다)
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=__dirname;
const APP={name:'과학 탐험 노트',short:'과학 노트',desc:'초등 5학년 2학기 과학을 이야기·놀이 실험·퀴즈로 배워요',theme:'#3B7DDB',bg:'#F6F9FC',cachePrefix:'sci5'};

const src=fs.readFileSync(path.join(ROOT,'src_science.html'),'utf8');
// 아티팩트는 게시할 때 기본 틀(doctype, viewport, 작은 reset)이 덧씌워지므로 여기서 직접 넣어 준다
const BASE=`<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>`;
function page(extraHead,extraBody){
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
${extraHead}${BASE}
${src}
${extraBody}
</html>
`;
}

/* 1) 독립 실행 HTML */
fs.writeFileSync(path.join(ROOT,'science.html'),page('',''));
console.log('science.html 만듦');

/* 2) 휴대폰 웹앱 */
const OUT=path.join(ROOT,'docs');
fs.mkdirSync(path.join(OUT,'icons'),{recursive:true});
for(const f of ['icon-192.png','icon-512.png','maskable-512.png'])fs.copyFileSync(path.join(ROOT,'icons',f),path.join(OUT,'icons',f));
const head=`<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="${APP.theme}">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="${APP.short}">
<link rel="apple-touch-icon" href="icons/icon-192.png">
<link rel="icon" href="icons/icon-192.png">
`;
// 오프라인 저장 등록 + 새 버전 알림 (보드게임 교실과 같은 방식)
const REG=`<div id="swUpd" class="sw-upd" hidden role="status"><span id="swMsg">새 버전이 나왔어요</span><button id="swNow" type="button">지금 바꾸기</button><button id="swLater" type="button">나중에</button></div>
<style>.sw-upd{position:fixed;left:50%;transform:translateX(-50%);top:calc(10px + env(safe-area-inset-top,0px));z-index:95;display:flex;align-items:center;gap:8px;
padding:7px 8px 7px 16px;border-radius:999px;background:#1E2A44;color:#fff;font:600 14px "Apple SD Gothic Neo","Malgun Gothic",sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.3);
max-width:calc(100vw - 24px);white-space:nowrap}
.sw-upd button{border:0;border-radius:999px;padding:6px 12px;font-family:inherit;font-weight:700;font-size:13px;cursor:pointer}
#swNow{background:#FFC83D;color:#3A2800}#swLater{background:transparent;color:#cfd8e6}</style>
<script>(function(){if(!('serviceWorker' in navigator))return;
var reloading=false;navigator.serviceWorker.addEventListener('controllerchange',function(){if(reloading)return;reloading=true;location.reload();});
function show(w){var b=document.getElementById('swUpd');b.hidden=false;
  document.getElementById('swNow').onclick=function(){document.getElementById('swMsg').textContent='바꾸는 중…';w.postMessage('SKIP');};
  document.getElementById('swLater').onclick=function(){b.hidden=true;};}
addEventListener('load',function(){navigator.serviceWorker.register('sw.js').then(function(reg){
  if(reg.waiting&&navigator.serviceWorker.controller)show(reg.waiting);
  reg.addEventListener('updatefound',function(){var w=reg.installing;if(w)w.addEventListener('statechange',function(){if(w.state==='installed'&&navigator.serviceWorker.controller)show(w);});});
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')reg.update().catch(function(){});});
}).catch(function(){});});})();</script>`;
fs.writeFileSync(path.join(OUT,'index.html'),page(head,REG));
fs.writeFileSync(path.join(OUT,'manifest.webmanifest'),JSON.stringify({
  name:APP.name,short_name:APP.short,description:APP.desc,lang:'ko',start_url:'./index.html',scope:'./',
  display:'standalone',orientation:'any',background_color:APP.bg,theme_color:APP.theme,
  icons:[{src:'icons/icon-192.png',sizes:'192x192',type:'image/png'},{src:'icons/icon-512.png',sizes:'512x512',type:'image/png'},
    {src:'icons/maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]},null,2));
const FILES=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png'];
const h=crypto.createHash('sha1');for(const f of FILES.slice(1))h.update(fs.readFileSync(path.join(OUT,f)));
const VER=h.digest('hex').slice(0,10),PRE=APP.cachePrefix;
fs.writeFileSync(path.join(OUT,'sw.js'),`// 오프라인 저장 (버전 ${VER})
const CACHE='${PRE}-${VER}',FILES=${JSON.stringify(FILES)};
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))));});
self.addEventListener('message',e=>{if(e.data==='SKIP')self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('${PRE}-')&&k!==CACHE&&k!=='${PRE}-font').map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);if(e.request.method!=='GET')return;
  // 글꼴(구글 폰트)은 한 번 받으면 저장해 두고 씀
  if(u.hostname.endsWith('fonts.googleapis.com')||u.hostname.endsWith('fonts.gstatic.com')){
    e.respondWith(caches.open('${PRE}-font').then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(res=>{c.put(e.request,res.clone());return res;}).catch(()=>r))));return;}
  if(u.origin!==location.origin)return;
  // 화면은 인터넷이 되면 최신본, 안 되거나 3초 넘게 걸리면 저장본
  if(e.request.mode==='navigate'){
    const net=fetch(e.request,{cache:'no-cache'}).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(k=>k.put(e.request,c));}return res;});
    const saved=()=>caches.match(e.request,{ignoreSearch:true});
    e.respondWith(Promise.race([net.catch(()=>null),new Promise(r=>setTimeout(()=>r(null),3000))]).then(r=>r||saved().then(s=>s||net)));return;}
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request)));
});
`);
console.log(`docs\\ 만듦 · 버전 ${VER}`);
