import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { translations, LANGUAGES, Language } from '../utils/translations';
import { OfflineStorage } from '../utils/offlineStorage';
import * as Speech from 'expo-speech';

const CROP_TYPES = [
  { name: 'Rice', icon: 'leaf', category: 'cereals' },
  { name: 'Maize', icon: 'leaf', category: 'cereals' },
  { name: 'Wheat', icon: 'leaf', category: 'cereals' },
  { name: 'Sugarcane', icon: 'leaf', category: 'cash' },
  { name: 'Cotton', icon: 'leaf', category: 'cash' },
  { name: 'Turmeric', icon: 'nutrition', category: 'spices' },
  { name: 'Pepper', icon: 'nutrition', category: 'spices' },
  { name: 'Coconut', icon: 'nutrition', category: 'plantation' },
  { name: 'Arecanut', icon: 'nutrition', category: 'plantation' },
  { name: 'Tomato', icon: 'nutrition', category: 'vegetables' },
  { name: 'Potato', icon: 'nutrition', category: 'vegetables' },
  { name: 'Banana', icon: 'nutrition', category: 'fruits' },
  { name: 'Mango', icon: 'nutrition', category: 'fruits' },
  { name: 'Apple', icon: 'nutrition', category: 'fruits' },
  { name: 'Orange', icon: 'nutrition', category: 'fruits' },
  { name: 'Grapes', icon: 'nutrition', category: 'fruits' },
];

export default function Index() {
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [language, setLanguage] = useState<Language>('en');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedLanguage = await OfflineStorage.getLanguage();
    const savedOfflineMode = await OfflineStorage.getOfflineMode();
    setLanguage(savedLanguage as Language);
    setOfflineMode(savedOfflineMode);
  };

  const changeLanguage = async (newLanguage: Language) => {
    setLanguage(newLanguage);
    await OfflineStorage.setLanguage(newLanguage);
    setShowLanguageModal(false);
    
    // Voice announcement
    const langName = LANGUAGES.find(l => l.code === newLanguage)?.nativeName;
    Speech.speak(`Language changed to ${langName}`, { language: newLanguage });
  };

  const toggleOfflineMode = async () => {
    const newMode = !offlineMode;
    setOfflineMode(newMode);
    await OfflineStorage.setOfflineMode(newMode);
    
    const message = newMode 
      ? translations[language].offlineModeEnabled || 'Offline mode enabled'
      : translations[language].onlineModeEnabled || 'Online mode enabled';
    Alert.alert('', message);
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert(
          translations[language].permissionsNeeded,
          translations[language].cameraPermission
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async (useCamera: boolean) => {
    if (!selectedCrop) {
      Alert.alert('', translations[language].selectCropFirst);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      let result;
      if (useCamera) {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: 'images',
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          base64: true,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'images',
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          base64: true,
        });
      }

      if (!result.canceled && result.assets[0].base64) {
        router.push({
          pathname: '/analysis',
          params: {
            image: result.assets[0].base64,
            cropType: selectedCrop,
            language: language,
            offlineMode: offlineMode.toString(),
          },
        });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('', translations[language].errorOccurred || 'Error occurred');
    }
  };

  const speakInstruction = () => {
    Speech.speak(translations[language].infoText, { language });
  };

  const t = translations[language];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Language Selector */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.languageButton}
              onPress={() => setShowLanguageModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="language" size={24} color="#10b981" />
              <Text style={styles.languageButtonText}>
                {LANGUAGES.find(l => l.code === language)?.nativeName}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.offlineButton, offlineMode && styles.offlineButtonActive]}
              onPress={toggleOfflineMode}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={offlineMode ? 'cloud-offline' : 'cloud-done'} 
                size={20} 
                color={offlineMode ? '#ef4444' : '#10b981'} 
              />
              <Text style={[styles.offlineText, offlineMode && styles.offlineTextActive]}>
                {offlineMode ? t.offline : t.online}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.logoContainer}>
            <Ionicons name="leaf" size={56} color="#10b981" />
          </View>
          <Text style={styles.title}>{t.appName}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>

        {/* Voice Instruction Button */}
        <TouchableOpacity 
          style={styles.voiceHelpButton}
          onPress={speakInstruction}
          activeOpacity={0.7}
        >
          <Ionicons name="volume-high" size={28} color="#3b82f6" />
          <Text style={styles.voiceHelpText}>{t.voiceInput}</Text>
        </TouchableOpacity>

        {/* Crop Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.selectCrop}</Text>
          <View style={styles.cropGrid}>
            {CROP_TYPES.map((crop) => (
              <TouchableOpacity
                key={crop.name}
                style={[
                  styles.cropCard,
                  selectedCrop === crop.name && styles.cropCardSelected,
                ]}
                onPress={() => setSelectedCrop(crop.name)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.cropIconContainer,
                  selectedCrop === crop.name && styles.cropIconContainerSelected
                ]}>
                  <Ionicons
                    name={crop.icon as any}
                    size={36}
                    color={selectedCrop === crop.name ? '#fff' : '#10b981'}
                  />
                </View>
                <Text style={[
                  styles.cropName,
                  selectedCrop === crop.name && styles.cropNameSelected,
                ]}>
                  {crop.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Large Action Buttons */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>{t.uploadImage}</Text>
          
          <TouchableOpacity
            style={[
              styles.largeActionButton,
              styles.cameraButton,
              !selectedCrop && styles.buttonDisabled,
            ]}
            onPress={() => pickImage(true)}
            disabled={!selectedCrop}
            activeOpacity={0.8}
          >
            <View style={styles.largeButtonContent}>
              <View style={styles.largeIconCircle}>
                <Ionicons name="camera" size={48} color="#fff" />
              </View>
              <Text style={styles.largeButtonText}>{t.takePhoto}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.largeActionButton,
              styles.galleryButton,
              !selectedCrop && styles.buttonDisabled,
            ]}
            onPress={() => pickImage(false)}
            disabled={!selectedCrop}
            activeOpacity={0.8}
          >
            <View style={styles.largeButtonContent}>
              <View style={styles.largeIconCircle}>
                <Ionicons name="images" size={48} color="#fff" />
              </View>
              <Text style={styles.largeButtonText}>{t.chooseGallery}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Access Buttons */}
        <View style={styles.quickAccessSection}>
          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={() => router.push('/history')}
            activeOpacity={0.7}
          >
            <Ionicons name="time" size={40} color="#f59e0b" />
            <Text style={styles.quickAccessText}>{t.history}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={() => router.push('/weather')}
            activeOpacity={0.7}
          >
            <Ionicons name="cloud" size={40} color="#3b82f6" />
            <Text style={styles.quickAccessText}>{t.weather}</Text>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={32} color="#3b82f6" />
          <Text style={styles.infoText}>{t.infoText}</Text>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language / ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ</Text>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  language === lang.code && styles.languageOptionSelected,
                ]}
                onPress={() => changeLanguage(lang.code as Language)}
                activeOpacity={0.7}
              >
                <Text style={styles.languageOptionText}>
                  {lang.nativeName}
                </Text>
                {language === lang.code && (
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.modalCloseText}>Close / ಮುಚ್ಚಿ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  languageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  offlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  offlineButtonActive: {
    backgroundColor: '#fee2e2',
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  offlineTextActive: {
    color: '#ef4444',
  },
  logoContainer: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
  },
  voiceHelpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dbeafe',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  voiceHelpText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e40af',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 16,
  },
  cropGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cropCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    elevation: 1,
  },
  cropCardSelected: {
    borderColor: '#10b981',
    backgroundColor: '#d1fae5',
  },
  cropIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cropIconContainerSelected: {
    backgroundColor: '#10b981',
  },
  cropName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  cropNameSelected: {
    color: '#065f46',
    fontWeight: '700',
  },
  actionSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  largeActionButton: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cameraButton: {
    backgroundColor: '#10b981',
  },
  galleryButton: {
    backgroundColor: '#3b82f6',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  largeButtonContent: {
    alignItems: 'center',
    gap: 16,
  },
  largeIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  quickAccessSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickAccessText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: '#1e40af',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 12,
  },
  languageOptionSelected: {
    backgroundColor: '#d1fae5',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  languageOptionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  modalCloseButton: {
    backgroundColor: '#e5e7eb',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});
