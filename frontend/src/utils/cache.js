
const CACHE_NAME = 'skillmatch-chat-cache-v1';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes standard

export const chatCache = {
    set: (key, data, expiry = CACHE_EXPIRY) => {
        const item = {
            data,
            timestamp: Date.now(),
            expiry
        };
        localStorage.setItem(`${CACHE_NAME}_${key}`, JSON.stringify(item));
    },

    get: (key) => {
        const itemStr = localStorage.getItem(`${CACHE_NAME}_${key}`);
        if (!itemStr) return null;

        const item = JSON.parse(itemStr);
        const expiryTime = item.expiry || CACHE_EXPIRY;
        
        if (Date.now() - item.timestamp > expiryTime) {
            localStorage.removeItem(`${CACHE_NAME}_${key}`);
            return null;
        }
        return item.data;
    },

    clear: (key) => {
        localStorage.removeItem(`${CACHE_NAME}_${key}`);
    }
};
