const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());

// Helper: fix relative URLs to go through proxy
function rewriteUrls(html, baseUrl) {
  const $ = cheerio.load(html);
  const base = new URL(baseUrl);

  const fixUrl = (url) => {
    if (!url || url.startsWith("data:") || url.startsWith("javascript:") || url.startsWith("#")) return url;
    try {
      const abs = new URL(url, base).href;
      return `/proxy?url=${encodeURIComponent(abs)}`;
    } catch {
      return url;
    }
  };

  $("a[href]").each((_, el) => {
    $(el).attr("href", fixUrl($(el).attr("href")));
  });
  $("img[src]").each((_, el) => {
    $(el).attr("src", fixUrl($(el).attr("src")));
  });
  $("link[href]").each((_, el) => {
    $(el).attr("href", fixUrl($(el).attr("href")));
  });
  $("script[src]").each((_, el) => {
    $(el).attr("src", fixUrl($(el).attr("src")));
  });
  $("form[action]").each((_, el) => {
    $(el).attr("action", fixUrl($(el).attr("action")));
  });

  return $.html();
}

// Main proxy route
app.get("/proxy", async (req, res) => {
  let { url } = req.query;
  if (!url) return res.status(400).send("No URL provided.");

  // Auto-add https if missing
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Referer: url,
      },
      responseType: "arraybuffer",
      maxRedirects: 5,
      timeout: 15000,
    });

    const contentType = response.headers["content-type"] || "";

    // For HTML, rewrite URLs
    if (contentType.includes("text/html")) {
      const html = Buffer.from(response.data).toString("utf-8");
      const rewritten = rewriteUrls(html, url);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(rewritten);
    }

    // For CSS, rewrite urls()
    if (contentType.includes("text/css")) {
      let css = Buffer.from(response.data).toString("utf-8");
      css = css.replace(/url\(['"]?(.*?)['"]?\)/g, (match, u) => {
        if (!u || u.startsWith("data:")) return match;
        try {
          const abs = new URL(u, url).href;
          return `url('/proxy?url=${encodeURIComponent(abs)}')`;
        } catch {
          return match;
        }
      });
      res.setHeader("Content-Type", "text/css");
      return res.send(css);
    }

    // For everything else (images, fonts, JS), pipe directly
    res.setHeader("Content-Type", contentType);
    return res.send(response.data);
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).send(`
      <html><body style="font-family:sans-serif;padding:40px;background:#0f0f0f;color:#fff">
        <h2>⚠️ Could not load page</h2>
        <p>Reason: ${err.message}</p>
        <p>Some sites block proxies. Try another URL.</p>
        <a href="/" style="color:#6ee7b7">← Go back</a>
      </body></html>
    `);
  }
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
