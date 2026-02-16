import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import axios from 'axios';
import Constants from 'expo-constants';

const BACKEND_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  'http://127.0.0.1:8000';

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  weather_condition: string;
  crop_advice: string[];
}

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    requestLocationAndFetch();
  }, []);

  const requestLocationAndFetch = async () => {
    try {
      setLoading(true);
      setError('');

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required for weather advisory',
          [{ text: 'OK' }]
        );
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Fetch weather advisory
      await fetchWeatherAdvisory(
        location.coords.latitude,
        location.coords.longitude
      );
    } catch (err: any) {
      console.error('Location error:', err);
      setError(err.message || 'Failed to get location');
      setLoading(false);
    }
  };

  const fetchWeatherAdvisory = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/weather-advisory`,
        {
          params: {
            latitude,
            longitude,
            crop_type: 'general',
          },
        }
      );

      setWeather(response.data);
    } catch (err: any) {
      console.error('Weather fetch error:', err);
      setError(err.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear')) return 'sunny';
    if (conditionLower.includes('cloud')) return 'cloud';
    if (conditionLower.includes('rain')) return 'rainy';
    if (conditionLower.includes('storm')) return 'thunderstorm';
    if (conditionLower.includes('snow')) return 'snow';
    return 'partly-sunny';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weather Advisory</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={requestLocationAndFetch}
          disabled={loading}
        >
          <Ionicons name="refresh" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Fetching weather data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color="#ef4444" />
            <Text style={styles.errorTitle}>Unable to Load Weather</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={requestLocationAndFetch}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : weather ? (
          <>
            {/* Weather Card */}
            <View style={styles.weatherCard}>
              <View style={styles.weatherHeader}>
                <Ionicons
                  name={getWeatherIcon(weather.weather_condition) as any}
                  size={64}
                  color="#3b82f6"
                />
                <View style={styles.weatherInfo}>
                  <Text style={styles.temperature}>
                    {Math.round(weather.temperature)}°C
                  </Text>
                  <Text style={styles.condition}>{weather.weather_condition}</Text>
                  <Text style={styles.location}>{weather.location}</Text>
                </View>
              </View>

              <View style={styles.weatherDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="water" size={24} color="#3b82f6" />
                  <Text style={styles.detailLabel}>Humidity</Text>
                  <Text style={styles.detailValue}>{weather.humidity}%</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="thermometer" size={24} color="#ef4444" />
                  <Text style={styles.detailLabel}>Temperature</Text>
                  <Text style={styles.detailValue}>
                    {Math.round(weather.temperature)}°C
                  </Text>
                </View>
              </View>
            </View>

            {/* Crop Advisory */}
            <View style={styles.advisorySection}>
              <View style={styles.advisoryHeader}>
                <Ionicons name="leaf" size={24} color="#10b981" />
                <Text style={styles.advisoryTitle}>Crop Advisory</Text>
              </View>

              {weather.crop_advice.map((advice, index) => (
                <View key={index} style={styles.advisoryCard}>
                  <Ionicons name="information-circle" size={20} color="#3b82f6" />
                  <Text style={styles.advisoryText}>{advice}</Text>
                </View>
              ))}
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Ionicons name="bulb" size={24} color="#f59e0b" />
              <Text style={styles.infoText}>
                Weather-based recommendations help you optimize crop care and prevent
                disease outbreaks. Check regularly for updates.
              </Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  refreshButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  errorTitle: {
    fontSize: 20,
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
  weatherCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  weatherInfo: {
    marginLeft: 20,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#111827',
  },
  condition: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  advisorySection: {
    marginBottom: 20,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  advisoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  advisoryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  advisoryText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginLeft: 12,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
});
