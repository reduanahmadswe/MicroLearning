import redisClient from '../config/redis';

export class CacheService {
    /**
     * Get data from cache
     * @param key Cache key
     */
    static async get<T>(key: string): Promise<T | null> {
        try {
            const data = await redisClient.get(key);
            if (data) {
                return JSON.parse(data) as T;
            }
            return null;
        } catch (error) {
            console.error('Cache Get Error:', error);
            return null; // Fail silently, return null to fetch from DB
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
            const serializedData = JSON.stringify(data);
            await redisClient.setex(key, ttl, serializedData);
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
            await redisClient.del(key);
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
            const stream = redisClient.scanStream({
                match: pattern,
                count: 100,
            });

            stream.on('data', async (keys: string[]) => {
                if (keys.length) {
                    const pipeline = redisClient.pipeline();
                    keys.forEach((key) => pipeline.del(key));
                    await pipeline.exec();
                }
            });

            stream.on('end', () => {
                // console.log(`Invalidated keys matching: ${pattern}`);
            });
        } catch (error) {
            console.error('Cache Invalidate Pattern Error:', error);
        }
    }
}
