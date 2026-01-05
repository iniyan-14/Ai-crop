import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

const CROP_TYPES = [
  // Fruits
  'Apple',
  'Banana',
  'Mango',
  'Orange',
  'Grapes',
  'Strawberry',
  'Papaya',
  'Guava',
  'Pomegranate',
  'Coconut',
  // Vegetables
  'Tomato',
  'Potato',
  // Cash Crops
  'Cotton',
  'Sugarcane',
  'Turmeric',
  // Spices
  'Pepper',
  // Plantation Crops
  'Arecanut',
  // Cereals
  'Rice',
  'Maize',
  'Wheat',
];

export default function Index() {
  const [selectedCrop, setSelectedCrop] = useState<string>('');

  const getCropIcon = (crop: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      'Tomato': 'nutrition',
      'Apple': 'nutrition',
      'Banana': 'nutrition',
      'Mango': 'nutrition',
      'Orange': 'nutrition',
      'Grapes': 'nutrition',
      'Strawberry': 'nutrition',
      'Papaya': 'nutrition',
      'Guava': 'nutrition',
      'Pomegranate': 'nutrition',
      'Rice': 'leaf',
      'Maize': 'leaf',
      'Cotton': 'leaf',
      'Wheat': 'leaf',
      'Potato': 'leaf',
    };
    return iconMap[crop] || 'leaf-outline';
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Camera and gallery permissions are needed to analyze plant images.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async (useCamera: boolean) => {
    if (!selectedCrop) {
      Alert.alert('Select Crop Type', 'Please select your crop type first');
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
        // Navigate to analysis screen with image and crop type
        router.push({
          pathname: '/analysis',
          params: {
            image: result.assets[0].base64,
            cropType: selectedCrop,
          },
        });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="leaf" size={48} color="#10b981" />
          </View>
          <Text style={styles.title}>AI Crop Doctor</Text>
          <Text style={styles.subtitle}>Detect Plant Diseases Instantly</Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
          <Text style={styles.infoText}>
            Upload a clear photo of the plant leaf to detect diseases and get treatment recommendations
          </Text>
        </View>

        {/* Crop Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Crop Type</Text>
          <View style={styles.cropGrid}>
            {CROP_TYPES.map((crop) => (
              <TouchableOpacity
                key={crop}
                style={[
                  styles.cropButton,
                  selectedCrop === crop && styles.cropButtonSelected,
                ]}
                onPress={() => setSelectedCrop(crop)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={getCropIcon(crop)}
                  size={24}
                  color={selectedCrop === crop ? '#10b981' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.cropText,
                    selectedCrop === crop && styles.cropTextSelected,
                  ]}
                >
                  {crop}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Plant Image</Text>
          
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.cameraButton,
              !selectedCrop && styles.buttonDisabled,
            ]}
            onPress={() => pickImage(true)}
            disabled={!selectedCrop}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={28} color="#fff" />
            <Text style={styles.actionButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.galleryButton,
              !selectedCrop && styles.buttonDisabled,
            ]}
            onPress={() => pickImage(false)}
            disabled={!selectedCrop}
            activeOpacity={0.8}
          >
            <Ionicons name="images" size={28} color="#fff" />
            <Text style={styles.actionButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <Ionicons name="scan" size={32} color="#10b981" />
            <Text style={styles.featureTitle}>AI Detection</Text>
            <Text style={styles.featureText}>Advanced AI analysis</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="medical" size={32} color="#3b82f6" />
            <Text style={styles.featureTitle}>Treatment</Text>
            <Text style={styles.featureText}>Expert recommendations</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="time" size={32} color="#f59e0b" />
            <Text style={styles.featureTitle}>History</Text>
            <Text style={styles.featureText}>Track detections</Text>
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navButtons}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/history')}
            activeOpacity={0.7}
          >
            <Ionicons name="time-outline" size={24} color="#3b82f6" />
            <Text style={styles.navButtonText}>View History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/weather')}
            activeOpacity={0.7}
          >
            <Ionicons name="cloud-outline" size={24} color="#3b82f6" />
            <Text style={styles.navButtonText}>Weather Advisory</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  cropGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cropButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minWidth: '30%',
  },
  cropButtonSelected: {
    borderColor: '#10b981',
    backgroundColor: '#d1fae5',
  },
  cropText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  cropTextSelected: {
    color: '#10b981',
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
  },
  cameraButton: {
    backgroundColor: '#10b981',
  },
  galleryButton: {
    backgroundColor: '#3b82f6',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  featuresSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingVertical: 16,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  navButtons: {
    gap: 12,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  navButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#3b82f6',
  },
});
