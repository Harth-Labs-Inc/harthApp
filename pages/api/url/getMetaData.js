import { load } from "cheerio";
import axios from "axios";

const userAgents = [
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134",
  "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0",
  "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
];

const getYoutubeEmbedLink = (link) => {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?.*v=|shorts\/)([a-zA-Z0-9_-]{11})|youtu\.be\/([a-zA-Z0-9_-]{11})/;
  const match = link.match(regex);
  const videoId = match ? match[1] || match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

function buildFullURL(rootURL, path) {
  if (!path) return null;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  try {
    const url = new URL(path, rootURL);
    return url.href;
  } catch (error) {
    console.error("Error building full URL:", error);
    return null;
  }
}

export default async (req, res) => {
  let obj;
  try {
    obj = JSON.parse(req.body);
  } catch (e) {
    obj = req.body;
  }

  const { url } = obj;
  let result = {};

  try {
    const randomUserAgent =
      userAgents[Math.floor(Math.random() * userAgents.length)];

    const response = await axios.get(url, {
      headers: {
        "User-Agent": randomUserAgent,
      },
      timeout: 5000,
    });

    const html = response.data;
    const $ = load(html);

    let videoLink = $('meta[property="og:video"]').attr("content");
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const embedLink = getYoutubeEmbedLink(url);
      if (embedLink) videoLink = embedLink;
    }

    const absoluteFaviconURL = buildFullURL(
      url,
      $('link[rel="icon"]').attr("href") ||
        $('link[rel="shortcut icon"]').attr("href")
    );
    result = {
      hybridGraph: {
        title:
          $('meta[property="og:title"]').attr("content") || $("title").text(),
        site_name: $('meta[property="og:site_name"]').attr("content"),
        description:
          $('meta[property="og:description"]').attr("content") ||
          $('meta[name="description"]').attr("content"),
        url: $('meta[property="og:url"]').attr("content") || url,
        image:
          $('meta[property="og:image"]').attr("content") ||
          $('meta[name="twitter:image"]').attr("content") ||
          $('meta[name="twitter:image:src"]').attr("content"),
        video: videoLink,
        favicon: absoluteFaviconURL,
      },
    };
  } catch (error) {
    console.log(error, "error");
    if (error.response?.data) {
      const $ = load(error.response.data);
      result = {
        hybridGraph: {
          title:
            $('meta[property="og:title"]').attr("content") || $("title").text(),
          site_name: $('meta[property="og:site_name"]').attr("content"),
          description:
            $('meta[property="og:description"]').attr("content") ||
            $('meta[name="description"]').attr("content"),
          url: $('meta[property="og:url"]').attr("content") || url,
          image: $('meta[property="og:image"]').attr("content"),
          favicon:
            $('link[rel="icon"]').attr("href") ||
            $('link[rel="shortcut icon"]').attr("href"),
        },
      };
    }
  }

  return res.json(result);
};
