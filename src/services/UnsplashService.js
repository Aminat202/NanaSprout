const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

// Get today's LOCAL date (not UTC!)
const getTodayKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// Single cache key for background
const CACHE_KEY = 'nanasprout_background_cache';

export const fetchThemeImage = async (theme) => {
    const todayKey = getTodayKey();

    // Check if we have a valid cached image
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { date, theme: cachedTheme, url } = JSON.parse(cached);

            // Only use cache if date AND theme match
            if (date === todayKey && cachedTheme === theme) {
                console.log(`[Cache] ✓ Using cached image for "${theme}" (${date})`);
                return url;
            } else {
                console.log(`[Cache] ✗ Invalid - Date: ${date !== todayKey ? 'OLD' : 'OK'}, Theme: ${cachedTheme !== theme ? 'CHANGED' : 'OK'}`);
            }
        }
    } catch (e) {
        console.warn('[Cache] Read error:', e);
    }

    // Fetch new image using theme directly as search query
    try {
        console.log(`[Unsplash] Searching for: "${theme}"`);

        const response = await fetch(
            `https://api.unsplash.com/photos/random?query=${encodeURIComponent(theme)}&orientation=landscape&client_id=${ACCESS_KEY}`
        );

        if (!response.ok) throw new Error('Unsplash API error');

        const data = await response.json();
        const imageUrl = data.urls.regular;

        // Cache the image URL with theme info
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                date: todayKey,
                theme: theme,
                url: imageUrl
            }));
            console.log(`[Cache] Saved new image for "${theme}" (${todayKey})`);
        } catch (e) {
            console.warn('[Cache] Write error:', e);
        }

        return imageUrl;

    } catch (error) {
        console.error('Error fetching Unsplash image:', error);
        // Return a high-quality fallback from Unsplash source or internal public assets
        return `https://source.unsplash.com/featured/1600x900?${theme}`;
    }
};
