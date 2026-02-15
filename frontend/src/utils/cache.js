
const CACHE_NAME = 'skillmatch-chat-cache-v1';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const chatCache = {
    set: (key, data) => {
        const item = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(`${CACHE_NAME}_${key}`, JSON.stringify(item));
    },

    get: (key) => {
        const itemStr = localStorage.getItem(`${CACHE_NAME}_${key}`);
        if (!itemStr) return null;

        const item = JSON.parse(itemStr);
        if (Date.now() - item.timestamp > CACHE_EXPIRY) {
            localStorage.removeItem(`${CACHE_NAME}_key`);
            return null;
        }
        return item.data;
    },

    clear: (key) => {
        localStorage.removeItem(`${CACHE_NAME}_${key}`);
    }
};
