const SHOPEE_ID = "17351700112";
const LAZADA_ID = "218701259";

// ✅ Mở rộng link Shopee rút gọn (hỗ trợ s.shopee.vn, shp.ee, shp.sh)
async function expandShopeeLink(shortUrl) {
  try {
    // Bước 1: thử mở redirect qua API của allorigins
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(shortUrl)}`);
    const data = await res.json();
    const match = data.contents.match(/https:\/\/shopee\.vn\/[^\s"']+/);
    if (match) return match[0];
  } catch (e) {
    console.warn("expandShopeeLink fail 1:", e);
  }

  try {
    // Bước 2: fallback dùng TinyURL để ép mở redirect
    const res2 = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(shortUrl)}`);
    const text = await res2.text();
    if (text.includes("shopee.vn")) return text;
  } catch (e) {
    console.warn("expandShopeeLink fail 2:", e);
  }

  return shortUrl;
}

// ✅ Rút gọn link bằng is.gd
async function shortenTiny(url) {
  try {
    const res = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
    const tiny = await res.text();
    return tiny.startsWith("http") ? tiny : url;
  } catch {
    return url;
  }
}

// ✅ Xóa aff cũ
function cleanAffiliateParams(url) {
  try {
    const u = new URL(url);
    ["af_id", "aff_id", "utm_source", "utm_medium", "utm_campaign"].forEach(p => u.searchParams.delete(p));
    return u.toString().replace(/(\?|&)$/, "");
  } catch {
    return url;
  }
}

// ✅ Thêm aff ID mới và rút gọn lại
async function processUrl(url) {
  let newUrl = cleanAffiliateParams(url);

  if (newUrl.includes("s.shopee.vn") || newUrl.includes("shp.ee") || newUrl.includes("shp.sh")) {
    const expanded = await expandShopeeLink(newUrl);
    newUrl = cleanAffiliateParams(expanded);
    if (expanded.includes("shopee.vn")) {
      newUrl = expanded.includes("?") ? `${expanded}&af_id=${SHOPEE_ID}` : `${expanded}?af_id=${SHOPEE_ID}`;
    }
  } else if (newUrl.includes("shopee.vn")) {
    newUrl = newUrl.includes("?") ? `${newUrl}&af_id=${SHOPEE_ID}` : `${newUrl}?af_id=${SHOPEE_ID}`;
  } else if (newUrl.includes("lazada.vn")) {
    newUrl = newUrl.includes("?") ? `${newUrl}&aff_id=${LAZADA_ID}` : `${newUrl}?aff_id=${LAZADA_ID}`;
  }

  return await shortenTiny(newUrl);
}

// ✅ Xử lý toàn bộ văn bản nhiều dòng
async function generateLinks() {
  const input = document.getElementById("input").value.trim();
  const output = document.getElementById("output");
  if (!input) return;

  const lines = input.split(/\n+/);
  let results = [];

  for (const line of lines) {
    const match = line.match(/https?:\/\/[\w\.-]+\S*/);
    if (!match) {
      results.push(line);
      continue;
    }

    const url = match[0];
    const newLink = await processUrl(url);
    results.push(line.replace(url, newLink));
  }

  output.value = results.join("\n");
}

// ✅ Copy kết quả
function copyResult() {
  const output = document.getElementById("output");
  output.select();
  document.execCommand("copy");
}
