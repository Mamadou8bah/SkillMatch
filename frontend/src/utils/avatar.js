const DEFAULT_STYLE = 'adventurer';
const DEFAULT_VARIANT = '1';
const STORAGE_PREFIX = 'avatarConfig_';

export const AVATAR_STYLES = ['adventurer', 'micah', 'bottts', 'lorelei'];
export const AVATAR_VARIANTS = ['1', '2', '3', '4', '5', '6'];

export const buildAvatarUrl = (style, seed) =>
  `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;

export const getAvatarStorageKey = (userId) => `${STORAGE_PREFIX}${userId || 'guest'}`;

export const getAvatarConfig = (userId) => {
  const key = getAvatarStorageKey(userId);
  const raw = localStorage.getItem(key);
  if (!raw) return { style: DEFAULT_STYLE, variant: DEFAULT_VARIANT };
  try {
    const parsed = JSON.parse(raw);
    return {
      style: parsed?.style || DEFAULT_STYLE,
      variant: parsed?.variant || DEFAULT_VARIANT
    };
  } catch {
    return { style: DEFAULT_STYLE, variant: DEFAULT_VARIANT };
  }
};

export const saveAvatarConfig = (userId, style, variant) => {
  const key = getAvatarStorageKey(userId);
  localStorage.setItem(key, JSON.stringify({ style, variant }));
};

export const getAvatarUrlForUser = ({ userId, fullName, email }) => {
  const cfg = getAvatarConfig(userId);
  const base = (fullName || email || 'SkillMatchUser').trim() || 'SkillMatchUser';
  const seed = `${base}-${cfg.variant}`;
  return buildAvatarUrl(cfg.style, seed);
};
