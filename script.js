// Config: gắn sẵn Affiliate IDs
const CONFIG = {
  shopee: { enabled: true, param: 'af_id', id: '17351700112' },
  lazada: { enabled: true, param: 'aff_id', id: '218701259' }
};

const el = {
  input: document.getElementById('inputUrl'),
  btnGenerate: document.getElementById('btnGenerate'),
  btnCopy: document.getElementById('btnCopy'),
  btnOpen: document.getElementById('btnOpen'),
  output: document.getElementById('output'),
  shareFb: document.getElementById('shareFb'),
  shareZalo: document.getElementById('shareZalo'),
  shareMessenger: document.getElementById('shareMessenger'),
  shopeeId: document.getElementById('shopeeId'),
  lazadaId: document.getElementById('lazadaId'),
  counter: document.getElementById('counter'),
  themeToggle: document.getElementById('themeToggle')
};

if(el.shopeeId) el.shopeeId.textContent = CONFIG.shopee.id;
if(el.lazadaId) el.lazadaId.textContent = CONFIG.lazada.id;

// Theme
function setTheme(theme){
  if(theme === 'dark'){
    document.documentElement.classList.add('dark');
    el.themeToggle.textContent = '☀️';
  } else {
    document.documentElement.classList.remove('dark');
    el.themeToggle.textContent = '🌙';
  }
  localStorage.setItem('aff_theme', theme);
}
const savedTheme = localStorage.getItem('aff_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
setTheme(savedTheme);
el.themeToggle.addEventListener('click', ()=>{
  const cur = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  setTheme(cur === 'dark' ? 'light' : 'dark');
});

// Core affiliate
function normalizeUrl(url){
  url = url.trim();
  if(!/^https?:\\/\\//i.test(url)) url = 'https://' + url;
  return url;
}
function detectPlatform(url){
  const u = url.toLowerCase();
  if(u.includes('shopee.') || u.includes('shp.ee')) return 'shopee';
  if(u.includes('lazada.') || u.includes('lzd.co')) return 'lazada';
  return null;
}
function addParam(url, key, value){
  try{
    const u = new URL(url);
    u.searchParams.set(key, value);
    return u.toString();
  }catch{ return url + (url.includes('?')?'&':'?') + key + '=' + value; }
}
function generateAffiliate(url){
  url = normalizeUrl(url);
  const p = detectPlatform(url);
  if(!p) throw new Error('Chỉ hỗ trợ Shopee hoặc Lazada');
  const c = CONFIG[p];
  return addParam(url, c.param, c.id);
}

// Counter
function getCounter(){
  const raw = localStorage.getItem('aff_counter');
  const d = new Date().toISOString().slice(0,10);
  let c = {date:d,count:0};
  if(raw){
    try{ c = JSON.parse(raw); }catch{}
    if(c.date!==d){c={date:d,count:0};}
  }
  return c;
}
function saveCounter(c){localStorage.setItem('aff_counter',JSON.stringify(c));}
function incCounter(){
  let c=getCounter();c.count++;saveCounter(c);renderCounter();
}
function renderCounter(){
  let c=getCounter();el.counter.textContent=`Bạn đã tạo ${c.count} link hôm nay 🔗`;
}
renderCounter();

// === TinyURL Shortener ===
async function shortenTinyURL(url){
  try{
    const res = await fetch(`https://api.tinyurl.com/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 00f7a5b2a8c12a97d9f98cb6fd2f77b5' // public demo token
      },
      body: JSON.stringify({ url })
    });
    if(!res.ok) throw new Error('TinyURL lỗi kết nối');
    const data = await res.json();
    return data.data.tiny_url || url;
  }catch(e){
    console.error(e);
    return url;
  }
}

// Generate button with TinyURL shortening
el.btnGenerate.addEventListener('click', async ()=>{
  const val = el.input.value.trim();
  if(!val){
    alert('Vui lòng dán link sản phẩm Shopee hoặc Lazada.');
    return;
  }
  try{
    const aff = generateAffiliate(val);
    const short = await shortenTinyURL(aff);
    el.output.value = short || aff;
    setBtns(true);
    incCounter();
  } catch(err){
    alert(err.message || 'Lỗi khi tạo link.');
    setBtns(false);
    el.output.value = '';
  }
});

// Buttons and share actions
function setBtns(s){
  el.btnCopy.disabled=!s;el.btnOpen.disabled=!s;
  el.shareFb.disabled=!s;el.shareZalo.disabled=!s;el.shareMessenger.disabled=!s;
}
el.btnCopy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(el.output.value);alert('Đã sao chép!');}catch{alert('Không thể copy tự động');}});
el.btnOpen.addEventListener('click',()=>{if(el.output.value)window.open(el.output.value,'_blank');});
el.shareFb.addEventListener('click',()=>{const u=encodeURIComponent(el.output.value);if(!u)return;window.open('https://www.facebook.com/sharer/sharer.php?u='+u,'_blank');});
el.shareMessenger.addEventListener('click',()=>{const u=encodeURIComponent(el.output.value);if(!u)return;window.open('https://www.facebook.com/dialog/send?link='+u+'&app_id=266241143963202','_blank');});
el.shareZalo.addEventListener('click',()=>{const u=encodeURIComponent(el.output.value);if(!u)return;window.open('https://zalo.me/share?url='+u,'_blank');});
