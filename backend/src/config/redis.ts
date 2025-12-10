// Redis is disabled - using in-memory caching instead
// This file exists for compatibility but does nothing

const mockRedisClient = {
    get: async () => null,
    set: async () => 'OK',
    del: async () => 1,
    exists: async () => 0,
    expire: async () => 1,
    ttl: async () => -1,
    keys: async () => [],
    flushall: async () => 'OK',
    on: () => { },
    connect: async () => {
    },
    disconnect: async () => { },
    quit: async () => { },
};

export default mockRedisClient;
