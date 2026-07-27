import axios from 'axios';

export interface SpotifyTrack {
    name: string;
    artists: string;
    popularity: string;
    link: string;
    thumbnail: string | null;
    duration: string | null;
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
                artists: res.data.author_name || 'Spotify Artist',
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
    const base = alyachanUrl || process.env.ALYACHAN_API || '';
    const key = alyachanKey || process.env.ALYACHAN_KEY || '';

    if (base && key) {
        const cleanBase = base.replace(/\/+$/, "");
        // We will try several potential endpoints for AlyaChan Spotify search
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

    // Fallback: search oembed or empty if query is a direct Spotify URL
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
