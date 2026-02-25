// ========================
// CẤU HÌNH AFFILIATE ID
// ========================
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
  counter: document.getElementById('counter')
};

if (el.shopeeId) el.shopeeId.textContent = CONFIG.shopee.id;
if (el.lazadaId) el.lazadaId.textContent = CONFIG.lazada.id;

// ========================
// HÀM HỖ TRỢ
// ========================
function normalizeUrl(url) {
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  return url;
}

function detectPlatform(url) {
  const u = url.toLowerCase();
  if (u.includes('shopee.') || u.includes('shp.ee')) return 'shopee';
  if (u.includes('lazada.') || u.includes('lzd.co')) return 'lazada';
  return null;
}

function addParam(url, key, value) {
  try {
    const u = new URL(url);
    u.searchParams.set(key, value);
    return u.toString();
  } catch {
    return url + (url.includes('?') ? '&' : '?') + key + '=' + value;
  }
}

function generateAffiliate(url) {
  url = normalizeUrl(url);
  const platform = detectPlatform(url);
  if (!platform) throw new Error('Chỉ hỗ trợ link Shopee hoặc Lazada');
  const cfg = CONFIG[platform];
  return addParam(url, cfg.param, cfg.id);
}

// ========================
// BỘ ĐẾM LINK TẠO HÔM NAY
// ========================
function getCounter() {
  const raw = localStorage.getItem('aff_counter');
  const today = new Date().toISOString().slice(0, 10);
  let data = { date: today, count: 0 };
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {}
    if (data.date !== today) data = { date: today, count: 0 };
  }
  return data;
}
function saveCounter(data) {
  localStorage.setItem('aff_counter', JSON.stringify(data));
}
function incCounter() {
  const c = getCounter();
  c.count++;
  saveCounter(c);
  renderCounter();
}
function renderCounter() {
  const c = getCounter();
  el.counter.textContent = `Bạn đã tạo ${c.count} link hôm nay 🔗`;
}
renderCounter();

// ========================
// RÚT GỌN LINK VỚI TINYURL
// ========================
async function shortenTinyURL(url) {
  try {
    const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error('TinyURL lỗi');
    const short = await res.text();
    return short.startsWith('http') ? short : url;
  } catch (err) {
    console.error('TinyURL Error:', err);
    return url;
  }
}

// ========================
// XỬ LÝ SỰ KIỆN
// ========================
el.btnGenerate.addEventListener('click', async () => {
  const inputUrl = el.input.value.trim();
  if (!inputUrl) {
    alert('Vui lòng dán link sản phẩm Shopee hoặc Lazada.');
    return;
  }

  try {
    const affUrl = generateAffiliate(inputUrl);
    const shortUrl = await shortenTinyURL(affUrl);
    el.output.value = shortUrl || affUrl;
    incCounter();
    toggleButtons(true);
  } catch (err) {
    alert(err.message || 'Lỗi khi tạo link');
    toggleButtons(false);
  }
});

// ========================
// NÚT BẤM & CHIA SẺ
// ========================
function toggleButtons(enabled) {
  [el.btnCopy, el.btnOpen, el.shareFb, el.shareZalo, el.shareMessenger].forEach(
    (btn) => (btn.disabled = !enabled)
  );
}

el.btnCopy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(el.output.value);
    alert('Đã sao chép link!');
  } catch {
    alert('Không thể copy tự động, vui lòng copy thủ công.');
  }
});

el.btnOpen.addEventListener('click', () => {
  if (el.output.value) window.open(el.output.value, '_blank');
});

el.shareFb.addEventListener('click', () => {
  const u = encodeURIComponent(el.output.value);
  if (!u) return;
  window.open('https://www.facebook.com/sharer/sharer.php?u=' + u, '_blank');
});

el.shareMessenger.addEventListener('click', () => {
  const u = encodeURIComponent(el.output.value);
  if (!u) return;
  window.open(
    'https://www.facebook.com/dialog/send?link=' + u + '&app_id=266241143963202',
    '_blank'
  );
});

el.shareZalo.addEventListener('click', () => {
  const u = encodeURIComponent(el.output.value);
  if (!u) return;
  window.open('https://zalo.me/share?url=' + u, '_blank');
});
