// Redis is disabled - using in-memory caching instead
// This file exists for compatibility but does nothing

const disabledRedisClient = {
    get: async () => { throw new Error('Redis disabled: mock client removed'); },
    set: async () => { throw new Error('Redis disabled: mock client removed'); },
    del: async () => { throw new Error('Redis disabled: mock client removed'); },
    exists: async () => { throw new Error('Redis disabled: mock client removed'); },
    expire: async () => { throw new Error('Redis disabled: mock client removed'); },
    ttl: async () => { throw new Error('Redis disabled: mock client removed'); },
    keys: async () => { throw new Error('Redis disabled: mock client removed'); },
    flushall: async () => { throw new Error('Redis disabled: mock client removed'); },
    on: () => { /* no-op */ },
    connect: async () => { throw new Error('Redis disabled: mock client removed'); },
    disconnect: async () => { /* no-op */ },
    quit: async () => { /* no-op */ },
};

export default disabledRedisClient;
