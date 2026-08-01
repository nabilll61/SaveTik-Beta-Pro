// FILE STATUS: BARU DIPERBAIKI / RECENTLY REPAIRED - INTEGRATED NEW SPOTIDOWN SCRAPER ENGINE
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface SpotifyTrack {
    name: string;
    artists: string;
    popularity: string;
    link: string;
    thumbnail: string | null;
    duration: string | null;
}

// =========================================================================
// 🎵 SPOTIDOWN SCRAPER CLASS (NEW DEPLOYMENT RESOLVER)
// =========================================================================
export class SpotidownScraper {
    private baseUrl = 'https://spotidown.app';
    private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    /**
     * Helper to initiate session cookies and get the dynamic token field
     */
    private async _getSession(): Promise<{ sessionCookie: string; dynamicName: string; dynamicValue: string }> {
        const response = await axios.get(`${this.baseUrl}/en3`, {
            headers: {
                'User-Agent': this.userAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });

        const cookies = response.headers['set-cookie'] || [];
        const sessionCookie = cookies.map(c => c.split(';')[0]).join('; ');

        const $ = cheerio.load(response.data);
        const form = $('form[name="spotifyurl"]');
        if (!form.length) {
            throw new Error('Spotify URL search form not found on homepage.');
        }

        let dynamicName = '';
        let dynamicValue = '';
        form.find('input[type="hidden"]').each((i, elem) => {
            const name = $(elem).attr('name');
            const val = $(elem).attr('value');
            if (name && name !== 'g-recaptcha-response') {
                dynamicName = name;
                dynamicValue = val;
            }
        });

        return { sessionCookie, dynamicName, dynamicValue };
    }

    /**
     * Search for songs or resolve a Spotify URL (returns track list and session cookie)
     */
    async search(queryOrUrl: string): Promise<{ tracks: any[]; sessionCookie: string }> {
        const { sessionCookie, dynamicName, dynamicValue } = await this._getSession();

        const payload: Record<string, string> = {
            url: queryOrUrl,
            'g-recaptcha-response': '',
        };
        if (dynamicName) {
            payload[dynamicName] = dynamicValue;
        }

        const response = await axios.post(`${this.baseUrl}/action`, new URLSearchParams(payload).toString(), {
            headers: {
                'User-Agent': this.userAgent,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': this.baseUrl,
                'Referer': `${this.baseUrl}/en3`,
                'X-Requested-With': 'XMLHttpRequest',
                'Cookie': sessionCookie
            }
        });

        if (response.data.error) {
            throw new Error(response.data.message || 'Lookup failed.');
        }

        const $ = cheerio.load(response.data.data);
        const tracks: any[] = [];

        $('form[name="submitspurl"]').each((i, formElem) => {
            const form = $(formElem);
            const data = form.find('input[name="data"]').val() as string;
            const base = form.find('input[name="base"]').val() as string;
            const token = form.find('input[name="token"]').val() as string;

            if (data && base && token) {
                let metadata: any = {};
                try {
                    const decodedMeta = Buffer.from(data, 'base64').toString('utf8');
                    metadata = JSON.parse(decodedMeta);
                } catch (e) {
                    metadata = { error: 'Failed parsing metadata' };
                }

                tracks.push({
                    metadata,
                    form: { data, base, token }
                });
            }
        });

        return { tracks, sessionCookie };
    }

    /**
     * Fetch direct download links for a resolved track form token
     */
    async getDownloadLinks(form: { data: string; base: string; token: string }, sessionCookie: string): Promise<{ mp3: string | null; cover: string | null }> {
        const response = await axios.post(`${this.baseUrl}/action/track`, new URLSearchParams(form as any).toString(), {
            headers: {
                'User-Agent': this.userAgent,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': this.baseUrl,
                'Referer': `${this.baseUrl}/en3`,
                'X-Requested-With': 'XMLHttpRequest',
                'Cookie': sessionCookie
            }
        });

        if (response.data.error) {
            throw new Error(response.data.message || 'Failed getting download links.');
        }

        const $ = cheerio.load(response.data.data);
        const links: { mp3: string | null; cover: string | null } = {
            mp3: null,
            cover: null
        };

        $('a').each((i, elem) => {
            const href = $(elem).attr('href');
            const text = $(elem).text().trim().replace(/\s+/g, ' ');
            if (!href) return;

            if (text.toLowerCase().includes('download mp3')) {
                links.mp3 = href;
            } else if (text.toLowerCase().includes('download cover')) {
                links.cover = href;
            }
        });

        return links;
    }
}

export async function spotifyOfficial(searchTerm: string, limit = 20): Promise<SpotifyTrack[]> {
    return [];
}

export async function getSpotifyOembed(spotifyUrl: string) {
    try {
        const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0";
        const res = await axios.get(`https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`, {
            headers: { 'user-agent': UA },
            timeout: 8000
        });
        if (res.data) {
            return {
                title: res.data.title || 'Spotify Track',
                artists: res.data.author_name || '',
                thumbnail: res.data.thumbnail_url || null,
                html: res.data.html || null
            };
        }
    } catch (e) {
        // ignore
    }
    return null;
}

export async function searchSpotify(query: string, alyachanUrl?: string, alyachanKey?: string): Promise<SpotifyTrack[]> {
    // 1. Try SpotidownScraper as our primary high-performance provider
    try {
        const scraper = new SpotidownScraper();
        const { tracks, sessionCookie } = await scraper.search(query);
        
        const results: SpotifyTrack[] = [];
        for (const track of tracks) {
            const m = track.metadata;
            const spotifyUrl = m.tid ? `https://open.spotify.com/track/${m.tid}` : '';
            
            let downloadLink = spotifyUrl;
            
            // If it is a direct Spotify URL search or there's only 1 track, pre-resolve the direct download link!
            if (query.includes('spotify.com') || query.includes('open.spotify') || tracks.length === 1) {
                try {
                    const links = await scraper.getDownloadLinks(track.form, sessionCookie);
                    if (links.mp3) {
                        downloadLink = links.mp3;
                    }
                } catch (dlErr: any) {
                    console.error("SpotidownScraper pre-resolve download link failed:", dlErr.message || dlErr);
                }
            }

            results.push({
                name: m.name || 'Spotify Track',
                artists: m.artist || m.artists?.join(', ') || 'Unknown Artist',
                popularity: '90',
                link: downloadLink, // Direct MP3 stream URL or fallback
                thumbnail: m.cover || m.thumbnail || null,
                duration: m.duration || null
            });
        }
        
        if (results.length > 0) {
            return results;
        }
    } catch (err: any) {
        console.warn("SpotidownScraper search failed, falling back:", err.message || err);
    }

    // 2. Fallback to AlyaChan API if configured
    const base = alyachanUrl || process.env.ALYACHAN_API || '';
    const key = alyachanKey || process.env.ALYACHAN_KEY || '';

    if (base && key) {
        const cleanBase = base.replace(/\/+$/, "");
        const endpoints = [
            `${cleanBase}/api/search/spotify`,
            `${cleanBase}/api/downloader/spotifysearch`,
            `${cleanBase}/api/downloader/spotify`
        ];

        for (const url of endpoints) {
            try {
                const res = await axios.get(url, {
                    params: { q: query, query: query, url: query },
                    headers: {
                        Authorization: `Bearer ${key}`,
                        "Content-Type": "application/json",
                    },
                    timeout: 8000,
                    validateStatus: () => true
                });

                if (res.status === 200 && res.data) {
                    const body = res.data;
                    const items = body.data || body.result || body;
                    if (Array.isArray(items)) {
                        return items.map((item: any) => ({
                            name: item.title || item.name || 'Spotify Track',
                            artists: item.artist || item.artists?.join(", ") || item.author || 'Unknown Artist',
                            popularity: item.popularity || '80',
                            link: item.url || item.link || item.download || '',
                            thumbnail: item.thumbnail || item.cover || null,
                            duration: item.duration || null
                        }));
                    }
                }
            } catch (e) {
                // Try next endpoint
            }
        }
    }

    // 3. Last fallback: search oembed if query is a direct Spotify URL
    if (query.includes('spotify.com') || query.includes('open.spotify')) {
        try {
            const oembed = await getSpotifyOembed(query);
            if (oembed) {
                return [{
                    name: oembed.title,
                    artists: oembed.artists,
                    popularity: '90',
                    link: query,
                    thumbnail: oembed.thumbnail,
                    duration: '03:30'
                }];
            }
        } catch (e) {}
    }

    return [];
}
