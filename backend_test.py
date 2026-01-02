#!/usr/bin/env python3
"""
AI Crop Doctor Backend API Testing Suite
Tests all backend endpoints with real data and proper error handling
"""

import requests
import base64
import json
import time
from PIL import Image
from io import BytesIO
import os
from datetime import datetime

# Get backend URL from frontend env
BACKEND_URL = "https://crop-doctor-28.preview.emergentagent.com/api"

def load_image_as_base64(image_path):
    """Load image file and convert to base64"""
    try:
        with open(image_path, 'rb') as img_file:
            # Load and process image
            img = Image.open(img_file)
            
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize if too large
            max_size = 800
            if img.width > max_size or img.height > max_size:
                img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            # Convert to base64
            buffered = BytesIO()
            img.save(buffered, format="JPEG", quality=85)
            img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
            
            print(f"✓ Image loaded: {image_path} ({img.width}x{img.height})")
            return img_base64
    except Exception as e:
        print(f"✗ Failed to load image {image_path}: {e}")
        return None

def test_health_endpoint():
    """Test GET /api/health endpoint"""
    print("\n=== Testing Health Check Endpoint ===")
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Health check passed")
            print(f"  Status: {data.get('status')}")
            print(f"  Services: {data.get('services')}")
            return True
        else:
            print(f"✗ Health check failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Health check error: {e}")
        return False

def test_root_endpoint():
    """Test GET /api/ endpoint"""
    print("\n=== Testing Root API Endpoint ===")
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Root endpoint working")
            print(f"  Message: {data.get('message')}")
            print(f"  Version: {data.get('version')}")
            print(f"  Status: {data.get('status')}")
            return True
        else:
            print(f"✗ Root endpoint failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Root endpoint error: {e}")
        return False

def test_disease_detection(image_base64, crop_type, test_name):
    """Test POST /api/detect-disease endpoint"""
    print(f"\n=== Testing Disease Detection: {test_name} ===")
    try:
        payload = {
            "image": image_base64,
            "crop_type": crop_type,
            "language": "en"
        }
        
        print(f"Sending request for {crop_type} analysis...")
        start_time = time.time()
        
        response = requests.post(
            f"{BACKEND_URL}/detect-disease", 
            json=payload, 
            timeout=60,  # Increased timeout for AI analysis
            headers={"Content-Type": "application/json"}
        )
        
        end_time = time.time()
        print(f"Response time: {end_time - start_time:.2f} seconds")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Disease detection successful")
            print(f"  ID: {data.get('id')}")
            print(f"  Disease: {data.get('disease_name')}")
            print(f"  Confidence: {data.get('confidence_score'):.2f}")
            print(f"  Crop Type: {data.get('crop_type')}")
            print(f"  Treatment Steps: {len(data.get('treatment_steps', []))} steps")
            print(f"  Fertilizer Suggestions: {len(data.get('fertilizer_suggestions', []))} suggestions")
            print(f"  Prevention Tips: {len(data.get('prevention_tips', []))} tips")
            print(f"  Detection Date: {data.get('detection_date')}")
            print(f"  Has Thumbnail: {'Yes' if data.get('image_thumbnail') else 'No'}")
            
            # Validate required fields
            required_fields = ['id', 'disease_name', 'confidence_score', 'treatment_steps', 
                             'fertilizer_suggestions', 'prevention_tips', 'detection_date', 'image_thumbnail']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"⚠ Missing fields: {missing_fields}")
                return False
            
            # Validate confidence score range
            confidence = data.get('confidence_score', 0)
            if not (0.0 <= confidence <= 1.0):
                print(f"⚠ Invalid confidence score: {confidence}")
                return False
            
            return True
        else:
            print(f"✗ Disease detection failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Disease detection error: {e}")
        return False

def test_history_endpoint():
    """Test GET /api/history endpoint"""
    print("\n=== Testing Detection History Endpoint ===")
    try:
        # Test without parameters
        response = requests.get(f"{BACKEND_URL}/history", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ History endpoint working")
            print(f"  Records returned: {len(data)}")
            
            if data:
                # Check first record structure
                first_record = data[0]
                print(f"  Sample record ID: {first_record.get('id')}")
                print(f"  Sample disease: {first_record.get('disease_name')}")
                print(f"  Sample confidence: {first_record.get('confidence_score')}")
                print(f"  Sample date: {first_record.get('detection_date')}")
                
                # Validate required fields in history records
                required_fields = ['id', 'user_id', 'disease_name', 'confidence_score', 
                                 'crop_type', 'detection_date', 'image_thumbnail']
                missing_fields = [field for field in required_fields if field not in first_record]
                
                if missing_fields:
                    print(f"⚠ Missing fields in history record: {missing_fields}")
                    return False
            
            # Test with limit parameter
            print("\n  Testing with limit parameter...")
            response_limited = requests.get(f"{BACKEND_URL}/history?limit=2", timeout=10)
            if response_limited.status_code == 200:
                limited_data = response_limited.json()
                print(f"  Limited records returned: {len(limited_data)}")
                if len(limited_data) <= 2:
                    print(f"  ✓ Limit parameter working correctly")
                else:
                    print(f"  ⚠ Limit parameter not working correctly")
            
            return True
        else:
            print(f"✗ History endpoint failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ History endpoint error: {e}")
        return False

def test_weather_advisory():
    """Test GET /api/weather-advisory endpoint"""
    print("\n=== Testing Weather Advisory Endpoint ===")
    
    # Test with valid coordinates (Delhi, India)
    try:
        params = {
            "latitude": 28.6139,
            "longitude": 77.2090,
            "crop_type": "Tomato"
        }
        
        response = requests.get(f"{BACKEND_URL}/weather-advisory", params=params, timeout=15)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Weather advisory working")
            print(f"  Location: {data.get('location')}")
            print(f"  Temperature: {data.get('temperature')}°C")
            print(f"  Humidity: {data.get('humidity')}%")
            print(f"  Weather Condition: {data.get('weather_condition')}")
            print(f"  Crop Advice: {len(data.get('crop_advice', []))} recommendations")
            
            # Print some advice
            advice = data.get('crop_advice', [])
            for i, tip in enumerate(advice[:3]):  # Show first 3 tips
                print(f"    {i+1}. {tip}")
            
            # Validate required fields
            required_fields = ['location', 'temperature', 'humidity', 'weather_condition', 'crop_advice']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"⚠ Missing fields: {missing_fields}")
                return False
            
            # Test with invalid coordinates
            print("\n  Testing with invalid coordinates...")
            invalid_params = {
                "latitude": 999,
                "longitude": 999,
                "crop_type": "Rice"
            }
            
            invalid_response = requests.get(f"{BACKEND_URL}/weather-advisory", params=invalid_params, timeout=15)
            if invalid_response.status_code == 200:
                invalid_data = invalid_response.json()
                print(f"  ✓ Invalid coordinates handled gracefully")
                print(f"    Location: {invalid_data.get('location')}")
                print(f"    Advice count: {len(invalid_data.get('crop_advice', []))}")
            
            return True
        else:
            print(f"✗ Weather advisory failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Weather advisory error: {e}")
        return False

def main():
    """Run all backend tests"""
    print("🌱 AI Crop Doctor Backend API Testing Suite")
    print("=" * 50)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Track test results
    test_results = {}
    
    # Test 1: Health Check
    test_results['health'] = test_health_endpoint()
    
    # Test 2: Root endpoint
    test_results['root'] = test_root_endpoint()
    
    # Test 3: Disease Detection with real images
    # Load test images
    tomato_image = load_image_as_base64('/app/tomato_leaf.jpg')
    plant_image = load_image_as_base64('/app/plant_disease.jpg')
    
    if tomato_image:
        test_results['disease_detection_1'] = test_disease_detection(tomato_image, "Tomato", "Tomato Leaf")
    else:
        test_results['disease_detection_1'] = False
        print("✗ Skipping tomato disease detection - image not available")
    
    if plant_image:
        test_results['disease_detection_2'] = test_disease_detection(plant_image, "Rice", "Plant Disease")
    else:
        test_results['disease_detection_2'] = False
        print("✗ Skipping plant disease detection - image not available")
    
    # Test 4: History endpoint (after disease detection)
    test_results['history'] = test_history_endpoint()
    
    # Test 5: Weather advisory
    test_results['weather'] = test_weather_advisory()
    
    # Summary
    print("\n" + "=" * 50)
    print("🔍 TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(test_results.values())
    total = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is working correctly.")
        return True
    else:
        print(f"⚠️  {total - passed} test(s) failed. Check the logs above for details.")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)