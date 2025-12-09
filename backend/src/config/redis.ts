import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST
    ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}`
    : 'redis://localhost:6379';

const redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        // Stop retrying after 10 attempts in production if Redis is unavailable
        if (process.env.NODE_ENV === 'production' && times > 10) {
            console.warn('⚠️ Redis unavailable - running without cache');
            return null; // Stop retrying
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
            return true;
        }
        return false;
    },
    lazyConnect: true, // Don't connect immediately
});

redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
});

redisClient.on('error', (err) => {
    console.error('❌ Redis connection error:', err.message);
    // Don't crash the app, just log the error
});

// Try to connect, but don't crash if it fails
redisClient.connect().catch((err) => {
    console.warn('⚠️ Redis unavailable, continuing without cache:', err.message);
});

export default redisClient;
