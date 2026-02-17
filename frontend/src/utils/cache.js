
const CACHE_NAME = 'skillmatch-chat-cache-v1';
const DEFAULT_EXPIRY = 3 * 24 * 60 * 60 * 1000; // 3 days

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
    },

    cleanup: () => {
        const keys = Object.keys(localStorage);
        const now = Date.now();
        keys.forEach(key => {
            if (key.startsWith(CACHE_NAME)) {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    const expiryTime = item.expiry || DEFAULT_EXPIRY;
                    if (now - item.timestamp > expiryTime) {
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    // Not our cache item or malformed
                }
            }
        });
        
        // Global clear every 3 days regardless of individual item expiry
        const lastGlobalClear = localStorage.getItem('last_global_cache_clear');
        if (!lastGlobalClear || now - parseInt(lastGlobalClear) > DEFAULT_EXPIRY) {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(CACHE_NAME)) {
                    localStorage.removeItem(key);
                }
            });
            localStorage.setItem('last_global_cache_clear', now.toString());
        }
    }
};
