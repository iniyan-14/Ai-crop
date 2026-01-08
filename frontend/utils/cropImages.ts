// Crop image management system
// For now uses placeholders, can be updated with real images later

export const CROP_IMAGES = {
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
};

// Function to get crop image (can be updated to fetch from API)
export const getCropImage = (cropName: string): string => {
  // For now returns placeholder data
  // TODO: Integrate with Unsplash/Pexels API or local assets
  return CROP_IMAGES[cropName]?.description || 'Crop plant';
};

// Function to fetch from Unsplash (add your API key)
export const fetchCropImageFromUnsplash = async (cropName: string): Promise<string> => {
  try {
    const UNSPLASH_KEY = 'YOUR_KEY_HERE'; // Add your Unsplash API key
    const query = `${cropName} plant agriculture india farm`;
    
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_KEY}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    
    const data = await response.json();
    return data.results[0]?.urls?.regular || '';
  } catch (error) {
    console.error('Error fetching crop image:', error);
    return '';
  }
};

// Function to fetch from Pexels (add your API key)
export const fetchCropImageFromPexels = async (cropName: string): Promise<string> => {
  try {
    const PEXELS_KEY = 'YOUR_KEY_HERE'; // Add your Pexels API key
    const query = `${cropName} crop farm healthy plant`;
    
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': PEXELS_KEY
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    
    const data = await response.json();
    return data.photos[0]?.src?.large || '';
  } catch (error) {
    console.error('Error fetching crop image:', error);
    return '';
  }
};
