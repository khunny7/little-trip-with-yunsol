// Simple in-memory cache for profile images
const imageCache = new Map();

// Clear cache if it gets too large (prevent memory leaks)
const MAX_CACHE_SIZE = 50;

export const clearOldCache = () => {
  if (imageCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(imageCache.entries());
    // Keep only the most recent half
    const keepEntries = entries.slice(-Math.floor(MAX_CACHE_SIZE / 2));
    imageCache.clear();
    keepEntries.forEach(([key, value]) => imageCache.set(key, value));
  }
};

// Function to clear cache manually (useful for rate limiting)
export const clearImageCache = () => {
  imageCache.clear();
  console.log('Avatar image cache cleared');
};

// Check if image is cached
export const getCachedImage = (src) => {
  return imageCache.get(src);
};

// Cache an image
export const setCachedImage = (src, value) => {
  clearOldCache();
  imageCache.set(src, value);
};

// Check if image exists in cache
export const hasCachedImage = (src) => {
  return imageCache.has(src);
};
