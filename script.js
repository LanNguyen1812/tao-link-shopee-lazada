// v8: multi-line processing + multi-platform (Shopee, Lazada, Tiki, TikTok) + TinyURL + auto-copy + loading

const DEFAULT_CONFIG = {
  shopee: { enabled: true, param: 'af_id', idElem: 'cfgShopee' },
  lazada: { enabled: true, param: 'aff_id', idElem: 'cfgLazada' },
  tiki:   { enabled: true, param: 'affiliate_id', idElem: 'cfgTiki' },
  tiktok: { enabled: true, param: 'aff_id', idElem: 'cfgTiktok' }
};

const el = {
  multiInput: document.getElementById('multiInput'),
  btnGenerate: document.getElementById('btnGenerate'),
  btnPreview: document.getElementById('btnPreview'),
  useTiny: document.getElementById('useTiny'),
  autoCopy: document.getElementById('autoCopy'),
  result: document.getElementById('result'),
  btnCopyResult: document.getElementById('btnCopyResult'),
  btnClear: document.getElementById('btnClear'),
  status: document.getElementById('status'),
  shopeeId: document.getElementById('shopeeId'),
  lazadaId: document.getElementById('lazadaId'),
  cfgShopee: document.getElementById('cfgShopee'),
  cfgLazada: document.getElementById('cfgLazada'),
  cfgTiki: document.getElementById('cfgTiki'),
  cfgTiktok: document.getElementById('cfgTiktok'),
  badges: document.getElementById('badges'),
  themeToggle: document.getElementById('themeToggle')
};

// theme (reuse)
function setTheme(t){
  if(t==='dark'){document.documentElement.classList.add('dark'); el.themeToggle.textContent='☀️';}
  else {document.documentElement.classList.remove('dark'); el.themeToggle.textContent='🌙';}
  try{localStorage.setItem('aff_theme', t);}catch{}
}
const saved = localStorage.getItem('aff_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light');
setTheme(saved);
el.themeToggle.addEventListener('click', ()=> setTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark'));

// show current IDs in footer
function refreshFooterIDs(){
  if(el.cfgShopee) el.shopeeId.textContent = el.cfgShopee.value || '';
  if(el.cfgLazada) el.lazadaId.textContent = el.cfgLazada.value || '';
}
if(el.cfgShopee) el.cfgShopee.addEventListener('input', refreshFooterIDs);
if(el.cfgLazada) el.cfgLazada.addEventListener('input', refreshFooterIDs);
refreshFooterIDs();

// helper: detect URLs in a text (simple regex)
const urlRegex = /https?:\/\/[^\s)\\[\\]'"<>]+/gi;

// platform detector
function detectPlatform(url){
  const u = url.toLowerCase();
  if(u.includes('shopee.')) return 'shopee';
  if(u.includes('lazada.')) return 'lazada';
  if(u.includes('tiki.')) return 'tiki';
  if(u.includes('tiktok.') || u.includes('vm.tiktok.com') || u.includes('vt.tiktok.com')) return 'tiktok';
  return null;
}

// get affiliate param & id at runtime (from cfg inputs)
function getPlatformConfig(platform){
  if(!platform) return null;
  if(platform==='shopee') return { param: DEFAULT_CONFIG.shopee.param, id: el.cfgShopee.value || '' };
  if(platform==='lazada') return { param: DEFAULT_CONFIG.lazada.param, id: el.cfgLazada.value || '' };
  if(platform==='tiki') return { param: DEFAULT_CONFIG.tiki.param, id: el.cfgTiki.value || '' };
  if(platform==='tiktok') return { param: DEFAULT_CONFIG.tiktok.param, id: el.cfgTiktok.value || '' };
  return null;
}

// safely add param
function addParamToUrl(url, key, value){
  try{
    const u = new URL(url);
    u.searchParams.set(key, value);
    return u.toString();
  }catch(e){
    const sep = url.includes('?') ? '&' : '?';
    return url + sep + encodeURIComponent(key) + '=' + encodeURIComponent(value);
  }
}

// TinyURL shorten (public)
async function shortenTiny(url){
  try{
    const r = await fetch('https://tinyurl.com/api-create.php?url=' + encodeURIComponent(url));
    if(!r.ok) throw new Error('TinyURL lỗi');
    const txt = await r.text();
    return txt && txt.startsWith('http') ? txt : url;
  }catch(e){
    console.error('Tiny err', e);
    return url;
  }
}

// process one URL: generate affiliate link (and optionally shorten)
async function processUrl(url, useTiny){
  const plat = detectPlatform(url);
  const cfg = getPlatformConfig(plat);
  if(!cfg || !cfg.id) {
    // If no config or no ID, return original url (preserve)
    return url;
  }
  const aff = addParamToUrl(url, cfg.param, cfg.id);
  if(useTiny) return await shortenTiny(aff);
  return aff;
}

// MAIN: parse multi-line text and replace every URL
async function processTextBlock(text, useTiny, progressCb){
  // find all URLs
  const urls = text.match(urlRegex);
  if(!urls || urls.length===0) return text;
  // use a Map to cache processed urls (avoid duplicate shortens)
  const cache = new Map();
  // process sequentially or parallel
  let processed = 0;
  for(const original of urls){
    if(cache.has(original)) { processed++; if(progressCb) progressCb(processed, urls.length); continue; }
    try{
      const newUrl = await processUrl(original, useTiny);
      cache.set(original, newUrl);
    }catch(e){
      cache.set(original, original);
    }
    processed++;
    if(progressCb) progressCb(processed, urls.length);
  }
  // replace in text all occurrences (preserve surrounding text)
  let out = text;
  // replace longest-first to avoid partial collisions
  const sorted = Array.from(cache.keys()).sort((a,b)=> b.length - a.length);
  for(const k of sorted){
    const v = cache.get(k);
    // use simple replace all
    out = out.split(k).join(v);
  }
  return out;
}

// status / counter
function getCounter(){
  try{
    const raw = localStorage.getItem('aff_counter');
    const today = new Date().toISOString().slice(0,10);
    let o = raw ? JSON.parse(raw) : { date: today, count: 0 };
    if(o.date !== today) { o = { date: today, count: 0 }; localStorage.setItem('aff_counter', JSON.stringify(o)); }
    return o;
  }catch(e){
    const t = new Date().toISOString().slice(0,10);
    return { date: t, count: 0 };
  }
}
function incCounterBy(n){
  const obj = getCounter();
  obj.count = (obj.count || 0) + n;
  localStorage.setItem('aff_counter', JSON.stringify(obj));
  updateStatus();
}
function updateStatus(){
  const obj = getCounter();
  el.status.textContent = `Bạn đã tạo ${obj.count} link hôm nay 🔗`;
}
updateStatus();

// helper: show badges detected platforms from text
function refreshBadgesFromText(text){
  const found = new Set();
  const m = text.match(urlRegex);
  if(m){
    for(const u of m){
      const p = detectPlatform(u);
      if(p) found.add(p);
    }
  }
  el.badges.innerHTML = '';
  if(found.size===0){
    el.badges.innerHTML = '<span class="badge">No links</span>';
    return;
  }
  const map = { shopee:'Shopee', lazada:'Lazada', tiki:'Tiki', tiktok:'TikTok' };
  for(const p of found){
    const span = document.createElement('span');
    span.className = 'badge';
    span.textContent = map[p] || p;
    el.badges.appendChild(span);
  }
}

// UI: loading state
function setLoading(on, text){
  if(on){
    el.btnGenerate.disabled = true;
    el.btnGenerate.textContent = text || 'Đang tạo...';
  } else {
    el.btnGenerate.disabled = false;
    el.btnGenerate.textContent = 'Tạo Link Ngay';
  }
}

// Event handlers
el.multiInput.addEventListener('input', ()=> refreshBadgesFromText(el.multiInput.value));
el.btnPreview.addEventListener('click', async ()=>{
  const useTiny = el.useTiny.checked;
  setLoading(true,'Xử lý (xem trước)...');
  const out = await processTextBlock(el.multiInput.value, useTiny, (p,total)=>{ el.status.textContent = `Đang xử lý ${p}/${total} link...`; });
  el.result.value = out;
  el.btnCopyResult.disabled = false;
  setLoading(false);
});

el.btnGenerate.addEventListener('click', async ()=>{
  const text = el.multiInput.value;
  if(!text || text.trim().length===0){ alert('Vui lòng dán nội dung cần tạo link.'); return; }
  const useTiny = el.useTiny.checked;
  setLoading(true,'Đang tạo link...');
  try{
    // process and replace links
    const out = await processTextBlock(text, useTiny, (p,total)=>{ el.status.textContent = `Đang xử lý ${p}/${total} link...`; });
    el.result.value = out;
    el.btnCopyResult.disabled = false;
    // count how many URLs processed -> increment counter accordingly
    const urls = text.match(urlRegex); const n = urls ? urls.length : 0;
    if(n>0) incCounterBy(n);
    // auto copy if selected
    if(el.autoCopy.checked){
      try{ await navigator.clipboard.writeText(out); alert('Đã tạo và sao chép kết quả!'); }
      catch(e){ alert('Đã tạo link. (Không thể copy tự động trên trình duyệt này)'); }
    } else {
      alert('Đã tạo link xong!');
    }
  }catch(e){
    console.error(e);
    alert('Có lỗi khi tạo link. Vui lòng thử lại.');
  }finally{
    setLoading(false);
    updateStatus();
  }
});

el.btnCopyResult.addEventListener('click', async ()=>{
  try{ await navigator.clipboard.writeText(el.result.value); alert('Đã sao chép kết quả!'); }
  catch(e){ alert('Không thể copy tự động. Hãy copy thủ công.'); }
});
el.btnClear.addEventListener('click', ()=>{ el.multiInput.value=''; el.result.value=''; el.btnCopyResult.disabled=true; refreshBadgesFromText(''); });

// initial badges
refreshBadgesFromText('');
