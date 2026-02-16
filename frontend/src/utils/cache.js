
const CACHE_NAME = 'skillmatch-chat-cache-v1';
const DEFAULT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours for chat history

export const chatCache = {
    _getKey: (key) => {
        const userId = localStorage.getItem('userId');
        return `${CACHE_NAME}_${userId || 'anon'}_${key}`;
    },

    set: (key, data, expiry = DEFAULT_EXPIRY) => {
        const item = {
            data,
            timestamp: Date.now(),
            expiry
        };
        localStorage.setItem(chatCache._getKey(key), JSON.stringify(item));
    },

    get: (key) => {
        const itemStr = localStorage.getItem(chatCache._getKey(key));
        if (!itemStr) return null;

        const item = JSON.parse(itemStr);
        const expiryTime = item.expiry || DEFAULT_EXPIRY;
        
        if (Date.now() - item.timestamp > expiryTime) {
            localStorage.removeItem(chatCache._getKey(key));
            return null;
        }
        return item.data;
    },

    clear: (key) => {
        localStorage.removeItem(chatCache._getKey(key));
    },

    clearAll: () => {
        const userId = localStorage.getItem('userId');
        const prefix = `${CACHE_NAME}_${userId || 'anon'}_`;
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(prefix)) {
                localStorage.removeItem(key);
            }
        });
    }
};
