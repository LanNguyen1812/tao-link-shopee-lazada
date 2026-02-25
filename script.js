const SHOPEE_ID = "17351700112";
const LAZADA_ID = "218701259";

async function expandShopeeLink(shortUrl) {
  try {
    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(shortUrl)}`);
    const expandedUrl = await response.text();
    return expandedUrl.includes("http") ? expandedUrl : shortUrl;
  } catch {
    return shortUrl;
  }
}

async function shortenTiny(url) {
  try {
    const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    const shortUrl = await res.text();
    return shortUrl.startsWith("http") ? shortUrl : url;
  } catch {
    return url;
  }
}

function cleanAffiliateParams(url) {
  try {
    const u = new URL(url);
    ["af_id", "aff_id", "utm_source", "utm_medium", "utm_campaign"].forEach(p => u.searchParams.delete(p));
    return u.toString().replace(/(\?|&)$/, "");
  } catch {
    return url;
  }
}

async function processUrl(url) {
  let newUrl = cleanAffiliateParams(url);

  // Link rút gọn Shopee
  if (newUrl.includes("s.shopee.vn") || newUrl.includes("shp.ee")) {
    const expanded = await expandShopeeLink(newUrl);
    newUrl = cleanAffiliateParams(expanded);
    if (expanded.includes("shopee.vn")) {
      newUrl = expanded.includes("?")
        ? `${newUrl}&af_id=${SHOPEE_ID}`
        : `${newUrl}?af_id=${SHOPEE_ID}`;
    }
  }
  // Link Shopee gốc
  else if (newUrl.includes("shopee.vn")) {
    newUrl = newUrl.includes("?")
      ? `${newUrl}&af_id=${SHOPEE_ID}`
      : `${newUrl}?af_id=${SHOPEE_ID}`;
  }
  // Link Lazada
  else if (newUrl.includes("lazada.vn")) {
    newUrl = newUrl.includes("?")
      ? `${newUrl}&aff_id=${LAZADA_ID}`
      : `${newUrl}?aff_id=${LAZADA_ID}`;
  }

  // Sau khi gắn aff → rút gọn lại
  return await shortenTiny(newUrl);
}

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

function copyResult() {
  const output = document.getElementById("output");
  output.select();
  document.execCommand("copy");
}
