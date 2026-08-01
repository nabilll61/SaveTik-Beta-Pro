import axios from 'axios';

export interface CapCutMedia {
  index: number;
  url: string;
  type: string;
  suffix: string;
  size: string | null;
}

export interface CapCutDownloadResult {
  code: number;
  timestamp: number;
  data: {
    title: string | null;
    cover: string | null;
    original_url: string;
    platform: string;
    platform_key: string;
    videos: CapCutMedia[];
    audios: CapCutMedia[];
    best_video: string | null;
    total_media: number;
    response_time: number | null;
  };
}

/**
 * Scraper CapCut video download tanpa watermark
 * Author: Kayllano Aveline
 * Description: Capcut Downloader Full metadata via SnapVideoTools
 */
export async function capcutDownload(videoUrl: string): Promise<CapCutDownloadResult> {
  if (!videoUrl) throw new Error("URL CapCut tidak boleh kosong");

  const initHeaders = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36"
  };

  const initRes = await axios.get("https://snapvideotools.com/id/capcut-downloader", {
    headers: initHeaders,
    maxRedirects: 5,
    timeout: 10000
  });

  const rawHeaderMuanis = (initRes.headers as any)["set-muani"] || (initRes.headers as any)["set-cookie"] || [];
  let sessionmuani = "";
  const cookieList = Array.isArray(rawHeaderMuanis) ? rawHeaderMuanis : [rawHeaderMuanis];
  for (const c of cookieList) {
    if (typeof c === 'string') {
      const muani = c.split(";")[0];
      if (muani.startsWith("SESSION=")) {
        sessionmuani = muani;
      }
    }
  }

  const crotdalam = [
    "org.springframework.web.servlet.i18n.muaniLocaleResolver.LOCALE=id",
    sessionmuani
  ].filter(Boolean).join("; ");

  const headers = {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "content-type": "application/json",
    "muani": crotdalam,
    "origin": "https://snapvideotools.com",
    "referer": "https://snapvideotools.com/id/capcut-downloader",
    "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
    "x-requested-with": "XMLHttpRequest"
  };

  const payload = {
    text: videoUrl
  };

  const res = await axios.post(
    "https://snapvideotools.com/id/api/snap",
    payload,
    { headers, timeout: 15000 }
  );

  const data = res.data;

  if (data.code !== 0 || !data.data) {
    throw new Error("Gagal mengunduh dari CapCut: " + (data.message || "Unknown error"));
  }

  const videoData = data.data;
  const mediaUrls = videoData.mediaUrls || [];
  const videos = mediaUrls.filter((m: any) => m.type === "video");
  const audios = mediaUrls.filter((m: any) => m.type === "audio");

  return {
    code: 200,
    timestamp: Date.now(),
    data: {
      title: videoData.title || null,
      cover: videoData.cover || null,
      original_url: videoData.orignalUrl || videoUrl,
      platform: videoData.platformName || "CapCut",
      platform_key: videoData.platformKey || "capcut",
      videos: videos.map((v: any, i: number) => ({
        index: i + 1,
        url: v.url,
        type: v.type,
        suffix: v.suffix || "mp4",
        size: v.size || null
      })),
      audios: audios.map((a: any, i: number) => ({
        index: i + 1,
        url: a.url,
        type: a.type,
        suffix: a.suffix || "mp3",
        size: a.size || null
      })),
      best_video: videos.length > 0 ? videos[0].url : null,
      total_media: mediaUrls.length,
      response_time: data.responseTime || null
    }
  };
}
