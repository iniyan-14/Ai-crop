// Enhanced crop image management with caching
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CropImageData {
  placeholder: string;
  color: string;
  description: string;
  imageUrl?: string;
}

export const CROP_IMAGES: Record<string, CropImageData> = {
  Rice: {
    placeholder: 'leaf',
    color: '#22c55e',
    description: 'Paddy rice plant with green leaves',
  },
  Maize: {
    placeholder: 'leaf',
    color: '#84cc16',
    description: 'Corn plant with broad leaves',
  },
  Wheat: {
    placeholder: 'leaf',
    color: '#eab308',
    description: 'Wheat stalks with grain heads',
  },
  Sugarcane: {
    placeholder: 'leaf',
    color: '#65a30d',
    description: 'Tall sugarcane stalks',
  },
  Cotton: {
    placeholder: 'flower',
    color: '#f5f5f5',
    description: 'Cotton plant with white bolls',
  },
  Turmeric: {
    placeholder: 'nutrition',
    color: '#f59e0b',
    description: 'Turmeric plant with wide leaves',
  },
  Pepper: {
    placeholder: 'nutrition',
    color: '#dc2626',
    description: 'Pepper vines with green leaves',
  },
  Coconut: {
    placeholder: 'nutrition',
    color: '#78350f',
    description: 'Coconut palm with green coconuts',
  },
  Arecanut: {
    placeholder: 'nutrition',
    color: '#92400e',
    description: 'Arecanut palm tree',
  },
  Tomato: {
    placeholder: 'nutrition',
    color: '#dc2626',
    description: 'Tomato plant with red fruits',
  },
  Potato: {
    placeholder: 'nutrition',
    color: '#92400e',
    description: 'Potato plant with tubers',
  },
  Banana: {
    placeholder: 'nutrition',
    color: '#fbbf24',
    description: 'Banana plant with fruit bunch',
  },
  Mango: {
    placeholder: 'nutrition',
    color: '#f59e0b',
    description: 'Mango tree with green fruits',
  },
  Apple: {
    placeholder: 'nutrition',
    color: '#dc2626',
    description: 'Apple tree with red fruits',
  },
  Orange: {
    placeholder: 'nutrition',
    color: '#f97316',
    description: 'Orange tree with citrus fruits',
  },
  Grapes: {
    placeholder: 'nutrition',
    color: '#7c3aed',
    description: 'Grape vines with clusters',
  },
  Strawberry: {
    placeholder: 'nutrition',
    color: '#ec4899',
    description: 'Strawberry plant with red berries',
  },
  Papaya: {
    placeholder: 'nutrition',
    color: '#fb923c',
    description: 'Papaya tree with green fruits',
  },
  Guava: {
    placeholder: 'nutrition',
    color: '#84cc16',
    description: 'Guava tree with green fruits',
  },
  Pomegranate: {
    placeholder: 'nutrition',
    color: '#dc2626',
    description: 'Pomegranate tree with red fruits',
  },
};

const CACHE_PREFIX = 'crop_image_';
const CACHE_EXPIRY_DAYS = 7;

interface CachedImage {
  url: string;
  timestamp: number;
}

// Check if cached image is still valid
const isCacheValid = (timestamp: number): boolean => {
  const now = Date.now();
  const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return now - timestamp < expiryTime;
};

// Get cached image URL
export const getCachedImageUrl = async (cropName: string): Promise<string | null> => {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${cropName}`);
    if (!cached) return null;

    const cachedData: CachedImage = JSON.parse(cached);
    if (isCacheValid(cachedData.timestamp)) {
      return cachedData.url;
    } else {
      // Cache expired, remove it
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${cropName}`);
      return null;
    }
  } catch (error) {
    console.error('Error getting cached image:', error);
    return null;
  }
};

// Cache image URL
export const cacheImageUrl = async (cropName: string, url: string): Promise<void> => {
  try {
    const cachedData: CachedImage = {
      url,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(`${CACHE_PREFIX}${cropName}`, JSON.stringify(cachedData));
  } catch (error) {
    console.error('Error caching image:', error);
  }
};

// Fetch from Unsplash (Free tier: 50 requests/hour)
export const fetchCropImageFromUnsplash = async (cropName: string): Promise<string> => {
  try {
    // Check cache first
    const cachedUrl = await getCachedImageUrl(cropName);
    if (cachedUrl) return cachedUrl;

    // TODO: Add your Unsplash Access Key here
    const UNSPLASH_KEY = 'YOUR_UNSPLASH_ACCESS_KEY';
    
    if (UNSPLASH_KEY === 'YOUR_UNSPLASH_ACCESS_KEY') {
      console.warn('Unsplash API key not configured');
      return '';
    }

    const query = `${cropName} plant agriculture farm healthy`;
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Unsplash');
    }

    const data = await response.json();
    const imageUrl = data.results[0]?.urls?.regular || '';

    if (imageUrl) {
      await cacheImageUrl(cropName, imageUrl);
    }

    return imageUrl;
  } catch (error) {
    console.error('Error fetching from Unsplash:', error);
    return '';
  }
};

// Fetch from Pexels (Free tier: 200 requests/hour)
export const fetchCropImageFromPexels = async (cropName: string): Promise<string> => {
  try {
    // Check cache first
    const cachedUrl = await getCachedImageUrl(cropName);
    if (cachedUrl) return cachedUrl;

    // TODO: Add your Pexels API key here
    const PEXELS_KEY = 'YOUR_PEXELS_API_KEY';
    
    if (PEXELS_KEY === 'YOUR_PEXELS_API_KEY') {
      console.warn('Pexels API key not configured');
      return '';
    }

    const query = `${cropName} crop farm healthy plant agriculture`;
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': PEXELS_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Pexels');
    }

    const data = await response.json();
    const imageUrl = data.photos[0]?.src?.large || '';

    if (imageUrl) {
      await cacheImageUrl(cropName, imageUrl);
    }

    return imageUrl;
  } catch (error) {
    console.error('Error fetching from Pexels:', error);
    return '';
  }
};

// Main function to get crop image (tries cache, then API)
export const getCropImage = async (cropName: string): Promise<string> => {
  // Try cache first
  const cachedUrl = await getCachedImageUrl(cropName);
  if (cachedUrl) return cachedUrl;

  // Try fetching from Pexels (higher rate limit)
  const pexelsUrl = await fetchCropImageFromPexels(cropName);
  if (pexelsUrl) return pexelsUrl;

  // Fallback to Unsplash
  const unsplashUrl = await fetchCropImageFromUnsplash(cropName);
  if (unsplashUrl) return unsplashUrl;

  // Return empty string if all fail (will use icon placeholder)
  return '';
};

// Preload images for all crops (call on app startup)
export const preloadCropImages = async (crops: string[]): Promise<void> => {
  console.log('Preloading crop images...');
  const promises = crops.map(crop => getCropImage(crop));
  await Promise.allSettled(promises);
  console.log('Crop images preloaded');
};

// Clear all cached images
export const clearImageCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
    console.log('Image cache cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};
