const SHOPEE_ID = "17351700112";
const LAZADA_ID = "218701259";

// ✅ Mở rộng link Shopee (qua is.gd để né CORS)
async function expandShopeeLink(shortUrl) {
  try {
    const res = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(shortUrl)}`);
    const longUrl = await res.text();
    return longUrl.includes("http") ? longUrl : shortUrl;
  } catch {
    return shortUrl;
  }
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

// ✅ Thêm aff ID mới
async function processUrl(url) {
  let newUrl = cleanAffiliateParams(url);

  if (newUrl.includes("s.shopee.vn") || newUrl.includes("shp.ee")) {
    const expanded = await expandShopeeLink(newUrl);
    newUrl = cleanAffiliateParams(expanded);
    if (expanded.includes("shopee.vn")) {
      newUrl = expanded.includes("?")
        ? `${newUrl}&af_id=${SHOPEE_ID}`
        : `${newUrl}?af_id=${SHOPEE_ID}`;
    }
  } else if (newUrl.includes("shopee.vn")) {
    newUrl = newUrl.includes("?")
      ? `${newUrl}&af_id=${SHOPEE_ID}`
      : `${newUrl}?af_id=${SHOPEE_ID}`;
  } else if (newUrl.includes("lazada.vn")) {
    newUrl = newUrl.includes("?")
      ? `${newUrl}&aff_id=${LAZADA_ID}`
      : `${newUrl}?aff_id=${LAZADA_ID}`;
  }

  return await shortenTiny(newUrl);
}

// ✅ Xử lý toàn bộ đoạn text
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

// ✅ Copy
function copyResult() {
  const output = document.getElementById("output");
  output.select();
  document.execCommand("copy");
}
