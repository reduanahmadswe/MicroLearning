// Simple in-memory cache (no Redis)
const cache = new Map<string, { data: any; expires: number }>();

export class CacheService {
    /**
     * Get data from cache
     * @param key Cache key
     */
    static async get<T>(key: string): Promise<T | null> {
        try {
            const item = cache.get(key);
            if (!item) return null;

            // Check if expired
            if (Date.now() > item.expires) {
                cache.delete(key);
                return null;
            }

            return item.data as T;
        } catch (error) {
            console.error('Cache Get Error:', error);
            return null;
        }
    }

    /**
     * Set data in cache
     * @param key Cache key
     * @param data Data to store
     * @param ttl Time to live in seconds (default: 3600 - 1 hour)
     */
    static async set(key: string, data: any, ttl: number = 3600): Promise<void> {
        try {
            cache.set(key, {
                data,
                expires: Date.now() + (ttl * 1000),
            });
        } catch (error) {
            console.error('Cache Set Error:', error);
        }
    }

    /**
     * Delete data from cache
     * @param key Cache key
     */
    static async del(key: string): Promise<void> {
        try {
            cache.delete(key);
        } catch (error) {
            console.error('Cache Delete Error:', error);
        }
    }

    /**
     * Delete all keys matching a pattern
     * @param pattern Pattern to match (e.g., 'feed:*')
     */
    static async invalidatePattern(pattern: string): Promise<void> {
        try {
            const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
            const keysToDelete: string[] = [];

            for (const key of cache.keys()) {
                if (regex.test(key)) {
                    keysToDelete.push(key);
                }
            }

            keysToDelete.forEach(key => cache.delete(key));
        } catch (error) {
            console.error('Cache Invalidate Pattern Error:', error);
        }
    }
}

// Clean up expired cache entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, item] of cache.entries()) {
        if (now > item.expires) {
            cache.delete(key);
        }
    }
}, 5 * 60 * 1000);
