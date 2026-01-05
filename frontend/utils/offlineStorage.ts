// Offline storage utility for AI Crop Doctor
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  LANGUAGE: '@crop_doctor:language',
  OFFLINE_MODE: '@crop_doctor:offline_mode',
  CACHED_DETECTIONS: '@crop_doctor:cached_detections',
  OFFLINE_ADVISORY: '@crop_doctor:offline_advisory',
};

export const OfflineStorage = {
  // Language preferences
  async getLanguage(): Promise<string> {
    try {
      const language = await AsyncStorage.getItem(KEYS.LANGUAGE);
      return language || 'en';
    } catch (error) {
      console.error('Error getting language:', error);
      return 'en';
    }
  },

  async setLanguage(language: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.LANGUAGE, language);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  },

  // Offline mode
  async getOfflineMode(): Promise<boolean> {
    try {
      const mode = await AsyncStorage.getItem(KEYS.OFFLINE_MODE);
      return mode === 'true';
    } catch (error) {
      console.error('Error getting offline mode:', error);
      return false;
    }
  },

  async setOfflineMode(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.OFFLINE_MODE, enabled.toString());
    } catch (error) {
      console.error('Error setting offline mode:', error);
    }
  },

  // Cached detections
  async getCachedDetections(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CACHED_DETECTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting cached detections:', error);
      return [];
    }
  },

  async addCachedDetection(detection: any): Promise<void> {
    try {
      const cached = await this.getCachedDetections();
      cached.unshift(detection);
      // Keep only last 50 detections
      const trimmed = cached.slice(0, 50);
      await AsyncStorage.setItem(KEYS.CACHED_DETECTIONS, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error caching detection:', error);
    }
  },

  // Offline advisory data
  async getOfflineAdvisory(cropType: string): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(`${KEYS.OFFLINE_ADVISORY}:${cropType}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting offline advisory:', error);
      return null;
    }
  },

  async setOfflineAdvisory(cropType: string, advisory: any): Promise<void> {
    try {
      await AsyncStorage.setItem(`${KEYS.OFFLINE_ADVISORY}:${cropType}`, JSON.stringify(advisory));
    } catch (error) {
      console.error('Error setting offline advisory:', error);
    }
  },

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([KEYS.CACHED_DETECTIONS, KEYS.OFFLINE_ADVISORY]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};
