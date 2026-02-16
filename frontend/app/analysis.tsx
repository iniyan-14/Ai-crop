import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import axios from 'axios';
import Constants from 'expo-constants';

// Resolve backend URL from Expo runtime config, then environment, then a safe local default.
const BACKEND_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  'http://127.0.0.1:8000';

interface AnalysisResult {
  id: string;
  disease_name: string;
  confidence_score: number;
  crop_type: string;
  treatment_steps: string[];
  fertilizer_suggestions: string[];
  prevention_tips: string[];
  detection_date: string;
  image_thumbnail: string;
}

export default function Analysis() {
  const params = useLocalSearchParams();
  const { image, cropType } = params;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (image && cropType) {
      analyzeImage();
    } else {
      setError('Missing image or crop type');
      setLoading(false);
    }
  }, []);

  const analyzeImage = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.post(
        `${BACKEND_URL}/api/detect-disease`,
        {
          image: image as string,
          crop_type: cropType as string,
          language: 'en',
        },
        {
          timeout: 60000, // 60 seconds
        }
      );

      if (response.data) {
        setResult(response.data);
      } else {
        throw new Error('No data received');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  const speakResult = async () => {
    if (!result) return;

    const text = `Disease detected: ${result.disease_name}. Confidence: ${Math.round(result.confidence_score * 100)}%. Treatment steps: ${result.treatment_steps.join('. ')}`;

    setSpeaking(true);
    Speech.speak(text, {
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const stopSpeaking = () => {
    Speech.stop();
    setSpeaking(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Analyzing image...</Text>
          <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Analysis Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={analyzeImage}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!result) {
    return null;
  }

  const confidenceColor =
    result.confidence_score > 0.7
      ? '#10b981'
      : result.confidence_score > 0.4
      ? '#f59e0b'
      : '#ef4444';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backIconButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analysis Result</Text>
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={speaking ? stopSpeaking : speakResult}
          >
            <Ionicons
              name={speaking ? 'stop-circle' : 'volume-high'}
              size={24}
              color="#3b82f6"
            />
          </TouchableOpacity>
        </View>

        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `data:image/jpeg;base64,${result.image_thumbnail}` }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Disease Info */}
        <View style={styles.diseaseCard}>
          <View style={styles.diseaseHeader}>
            <Ionicons name="bug" size={32} color={confidenceColor} />
            <View style={styles.diseaseInfo}>
              <Text style={styles.diseaseName}>{result.disease_name}</Text>
              <Text style={styles.cropType}>{result.crop_type}</Text>
            </View>
          </View>
          <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor }]}>
            <Text style={styles.confidenceText}>
              {Math.round(result.confidence_score * 100)}% Confidence
            </Text>
          </View>
        </View>

        {/* Treatment Steps */}
        {result.treatment_steps.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medical" size={24} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Treatment Steps</Text>
            </View>
            {result.treatment_steps.map((step, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.listItemText}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Fertilizer Suggestions */}
        {result.fertilizer_suggestions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flask" size={24} color="#10b981" />
              <Text style={styles.sectionTitle}>Fertilizer Recommendations</Text>
            </View>
            {result.fertilizer_suggestions.map((fertilizer, index) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.listItemText}>{fertilizer}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Prevention Tips */}
        {result.prevention_tips.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#f59e0b" />
              <Text style={styles.sectionTitle}>Prevention Tips</Text>
            </View>
            {result.prevention_tips.map((tip, index) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="bulb" size={20} color="#f59e0b" />
                <Text style={styles.listItemText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButtonPrimary}
            onPress={() => router.push('/')}
          >
            <Text style={styles.actionButtonPrimaryText}>New Analysis</Text>
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
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backIconButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  voiceButton: {
    padding: 8,
  },
  imageContainer: {
    backgroundColor: '#fff',
    padding: 16,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  diseaseCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  diseaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  diseaseInfo: {
    marginLeft: 12,
    flex: 1,
  },
  diseaseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  cropType: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  confidenceBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  confidenceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginLeft: 8,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  actionButtonPrimary: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
