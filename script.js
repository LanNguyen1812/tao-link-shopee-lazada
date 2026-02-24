// Config: gắn sẵn Affiliate IDs
const CONFIG = {
  shopee: { enabled: true, param: 'af_id', id: '17351700112' },
  lazada: { enabled: true, param: 'aff_id', id: '218701259' },
  tiki: { enabled: false, param: 'affiliate_id', id: '' }
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
  lazadaId: document.getElementById('lazadaId')
};

el.shopeeId.textContent = CONFIG.shopee.id;
el.lazadaId.textContent = CONFIG.lazada.id;

function normalizeUrl(url){
  url = url.trim();
  if(!/^https?:\/\//i.test(url)){
    url = 'https://' + url;
  }
  return url;
}

function detectPlatform(url){
  const u = url.toLowerCase();
  if(u.includes('shopee.') || u.includes('shp.ee')) return 'shopee';
  if(u.includes('lazada.') || u.includes('lzd.co')) return 'lazada';
  if(u.includes('tiki.')) return 'tiki';
  return null;
}

function addParam(url, key, value){
  try{
    const urlObj = new URL(url);
    if(!urlObj.searchParams.has(key)){
      urlObj.searchParams.append(key, value);
    } else {
      urlObj.searchParams.set(key, value);
    }
    return urlObj.toString();
  } catch(e){
    const sep = url.includes('?') ? '&' : '?';
    return url + sep + encodeURIComponent(key) + '=' + encodeURIComponent(value);
  }
}

function generateAffiliate(url){
  url = normalizeUrl(url);
  const platform = detectPlatform(url);
  if(!platform) throw new Error('Không nhận diện được sàn (Chỉ hỗ trợ Shopee & Lazada).');
  const cfg = CONFIG[platform];
  if(!cfg || !cfg.enabled || !cfg.id) throw new Error('Affiliate ID chưa được cấu hình cho sàn này.');
  return addParam(url, cfg.param, cfg.id);
}

function setButtonsEnabled(enabled){
  el.btnCopy.disabled = !enabled;
  el.btnOpen.disabled = !enabled;
  el.shareFb.disabled = !enabled;
  el.shareZalo.disabled = !enabled;
  el.shareMessenger.disabled = !enabled;
}

el.btnGenerate.addEventListener('click', ()=>{
  const original = el.input.value.trim();
  if(!original){
    alert('Vui lòng dán link sản phẩm Shopee hoặc Lazada.');
    return;
  }
  try{
    const aff = generateAffiliate(original);
    el.output.value = aff;
    setButtonsEnabled(true);
  } catch(err){
    alert(err.message || 'Lỗi khi tạo link.');
    setButtonsEnabled(false);
    el.output.value = '';
  }
});

el.btnCopy.addEventListener('click', async ()=>{
  try{
    await navigator.clipboard.writeText(el.output.value);
    alert('Đã sao chép link!');
  } catch(e){
    alert('Trình duyệt không cho phép copy tự động. Hãy copy thủ công.');
  }
});

el.btnOpen.addEventListener('click', ()=>{
  const u = el.output.value;
  if(u) window.open(u, '_blank');
});

el.shareFb.addEventListener('click', ()=>{
  const u = encodeURIComponent(el.output.value || '');
  if(!u) return;
  const fb = 'https://www.facebook.com/sharer/sharer.php?u=' + u;
  window.open(fb, '_blank');
});
el.shareMessenger.addEventListener('click', ()=>{
  const u = encodeURIComponent(el.output.value || '');
  if(!u) return;
  const ms = 'https://www.facebook.com/dialog/send?link=' + u + '&app_id=266241143963202';
  window.open(ms, '_blank');
});
el.shareZalo.addEventListener('click', ()=>{
  const u = encodeURIComponent(el.output.value || '');
  if(!u) return;
  const zalo = 'https://zalo.me/share?url=' + u;
  window.open(zalo, '_blank');
});
