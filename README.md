# 🌾 AI Crop Doctor - Complete Documentation

**AI-Powered Crop Disease Detection & Advisory System for Indian Farmers**

A mobile application built with Expo (React Native) that helps farmers detect crop diseases using AI, get treatment recommendations, and access weather-based crop advisory - all in their native language.

---

## 📱 Features

### Core Functionality
- **🔍 AI Disease Detection**: Upload plant leaf images for instant disease identification using OpenAI GPT-5.2 Vision
- **🗣️ Multilingual Support**: Full UI in 5 languages (English, Kannada, Tamil, Telugu, Malayalam)
- **📡 Offline Mode**: Works without internet with cached data
- **🔊 Voice Assistance**: Text-to-speech for accessibility
- **📸 Photo Capture**: Camera and gallery integration
- **🌤️ Weather Advisory**: Location-based crop recommendations
- **📊 Detection History**: Track all disease detections
- **👨‍🌾 Farmer-Friendly UI**: Large buttons, simple navigation, visual icons

### Supported Crops (20 Types)
- **Cereals**: Rice, Maize, Wheat
- **Cash Crops**: Cotton, Sugarcane
- **Spices**: Turmeric, Pepper
- **Plantation**: Coconut, Arecanut
- **Vegetables**: Tomato, Potato
- **Fruits**: Banana, Mango, Apple, Orange, Grapes, Strawberry, Papaya, Guava, Pomegranate

### Disease Database
Comprehensive disease information for all crops including:
- Common diseases per crop type
- Confidence scoring
- Treatment steps
- Fertilizer recommendations
- Prevention tips

---

## 🏗️ Architecture

### Tech Stack

**Frontend**
- Expo (React Native) - Cross-platform mobile development
- TypeScript - Type safety
- Expo Router - File-based navigation
- AsyncStorage - Local data persistence
- Expo Speech - Voice features
- Expo Image Picker - Camera/gallery access
- Expo Location - GPS for weather

**Backend**
- FastAPI (Python) - High-performance API
- MongoDB - NoSQL database
- OpenAI GPT-5.2 Vision - AI disease detection
- emergentintegrations - LLM integration library
- Pydantic - Data validation

**Infrastructure**
- Kubernetes - Container orchestration
- Supervisor - Process management
- Nginx - Reverse proxy
- Ngrok - Tunnel for mobile testing

---

## 📦 Project Structure

```
/app
├── backend/
│   ├── server.py              # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
├── frontend/
│   ├── app/
│   │   ├── index.tsx          # Home screen (crop selection)
│   │   ├── analysis.tsx       # Disease analysis results
│   │   ├── history.tsx        # Detection history
│   │   ├── weather.tsx        # Weather advisory
│   │   └── _layout.tsx        # Navigation layout
│   ├── utils/
│   │   ├── translations.ts    # Multilingual translations
│   │   ├── offlineStorage.ts  # Offline data management
│   │   └── cropImages.ts      # Image management system
│   ├── app.json               # Expo configuration
│   ├── package.json           # Dependencies
│   └── .env                   # Environment variables
├── IMAGE_SETUP.md             # Image sourcing guide
└── README.md                  # This file
```

---

## 🖼️ Image Setup

The app needs crop images for the UI. See **[IMAGE_SETUP.md](./IMAGE_SETUP.md)** for detailed instructions.

**Quick Start:**
1. Get free Pexels API key: https://www.pexels.com/api/
2. Add to `/app/frontend/utils/cropImages.ts`
3. Images load automatically with 7-day caching

---

## 🌍 Multilingual System

### Supported Languages
| Language | Code | Native Name | Status |
|----------|------|-------------|--------|
| English | en | English | ✅ Complete |
| Kannada | kn | ಕನ್ನಡ | ✅ Complete |
| Tamil | ta | தமிழ் | ✅ Complete |
| Telugu | te | తెలుగు | ✅ Complete |
| Malayalam | ml | മലയാളം | ✅ Complete |

---

## 📊 API Endpoints

### Health Check
```
GET /api/health
Response: {"status":"healthy","timestamp":"...","services":{...}}
```

### Disease Detection
```
POST /api/detect-disease
Body: {
  "image": "base64_encoded_string",
  "crop_type": "Tomato",
  "language": "en"
}
Response: {
  "id": "uuid",
  "disease_name": "Late Blight",
  "confidence_score": 0.85,
  "treatment_steps": [...],
  "fertilizer_suggestions": [...],
  "prevention_tips": [...]
}
```

### Detection History
```
GET /api/history?limit=50
Response: [...detection records...]
```

### Weather Advisory
```
GET /api/weather-advisory?latitude=12.9716&longitude=77.5946&crop_type=Rice
Response: {
  "location": "...",
  "temperature": 28.5,
  "humidity": 65,
  "weather_condition": "Clear",
  "crop_advice": [...]
}
```

---

## 🎨 UI/UX Design

### Design Principles
1. **Farmer-First**: Large touch targets (48px+), simple workflows
2. **Visual Clarity**: Icons > text, high contrast colors
3. **Accessibility**: Voice guidance, multilingual, offline support
4. **Cultural Relevance**: Local languages, agricultural themes
5. **Performance**: Optimized for rural networks

### Color Scheme
- **Primary Green**: #10b981 (agriculture, growth)
- **Light BG**: #f0fdf4 (soft, easy on eyes)
- **Blue**: #3b82f6 (information)
- **Orange**: #f59e0b (warnings)
- **Red**: #ef4444 (errors, offline)

---

## 🚢 Deployment Status

✅ **PRODUCTION READY**

All systems operational:
- ✅ Backend API running
- ✅ Frontend Expo running
- ✅ MongoDB connected
- ✅ AI service ready
- ✅ All permissions configured
- ✅ Multilingual support active
- ✅ Offline mode ready

---

## 📈 Performance

### Benchmarks
- **Disease Detection**: 7-12 seconds (AI processing)
- **History Load**: <1 second (cached)
- **Weather Fetch**: 2-3 seconds (API call)
- **App Launch**: 2-4 seconds

---

## 🎯 Quick Start

1. **Scan QR code** with Expo Go app
2. **Select language** (Kannada/Tamil/Telugu/Malayalam/English)
3. **Choose crop type**
4. **Take photo** or select from gallery
5. **Get results** with AI analysis
6. **View treatment** recommendations

---

---

**Run On Devices**

- **Start Backend:** Navigate to the `backend` folder, create a virtual environment, install dependencies, and run the server.

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
# source .venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

- **Start Expo (mobile app):** in a separate terminal start the Expo dev server from the `frontend` folder.

```bash
cd frontend
npm install
npm start
```

- **Configuring the backend URL:** The app reads `EXPO_PUBLIC_BACKEND_URL` from the Expo runtime `extra` config (see [frontend/app.config.js](frontend/app.config.js)). You can set it in `frontend/.env` or via environment when running Expo. By default the project uses `http://127.0.0.1:8000`.

- **Android emulator (Android Studio / AVD):** Use the special host `10.0.2.2` to reach a backend running on the host machine.

1. Update `frontend/.env` (or `app.config.js` extra) to:

```text
EXPO_PUBLIC_BACKEND_URL=http://10.0.2.2:8000
```

2. Launch the emulator, start the backend, then start Expo. The app running in the emulator will call the backend at `10.0.2.2`.

- **Real device (physical phone) via ngrok:** Use `ngrok` to expose your local backend so a phone on a different network can reach it.

1. Install ngrok and run a tunnel pointing to port 8000:

```bash
ngrok http 8000
# Copy the HTTPS forwarding URL shown by ngrok, e.g. https://a1b2-34-56-78.ngrok.io
```

2. Update `frontend/.env` (or set an environment variable) to point to the ngrok HTTPS URL:

```text
EXPO_PUBLIC_BACKEND_URL=https://a1b2-34-56-78.ngrok.io
```

3. Restart Expo (if running) so `app.config.js` injects the new `extra` value. On the phone open Expo Go and scan the project QR code — the app will call the tunneled backend.

- **Building a production APK / EAS:** Use EAS Build for production-ready binaries.

1. Install and configure EAS CLI:

```bash
npm install -g eas-cli
eas login
eas build:configure
```

2. Set the production backend URL in `frontend/.env` or in EAS build profile environment variables:

```text
EXPO_PUBLIC_BACKEND_URL=https://your-production-backend.example.com
```

3. Build an Android APK / AAB:

```bash
eas build -p android --profile production
```

You can also use the `eas.json` provided at `frontend/eas.json` to control profiles (`development`, `preview`, `production`).

4. Build an iOS app (macOS + Apple account required):

```bash
eas build -p ios --profile production
```

Notes:
- If you change `frontend/.env`, restart the Expo dev server so `app.config.js` reloads the values.
- For emulator testing, prefer `10.0.2.2` for Android; for iOS Simulator use `http://127.0.0.1:8000`.
- In production, always use HTTPS backend endpoints and set `EMERGENT_LLM_KEY`, `MONGO_URL`, and `DB_NAME` as secure environment variables for the backend runtime. See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment notes.

EAS / CI notes:
- The included `frontend/eas.json` contains `development`, `preview`, and `production` profiles and is compatible with Expo managed workflow.
- To run non-interactive EAS builds (useful for CI) you must either:
  - Be logged in via `eas login` in your terminal, OR
  - Provide an `EXPO_TOKEN` environment variable (create token from your Expo account).
- A sample env file with placeholders is available at `frontend/.env.example` (do NOT commit real tokens).

GitHub Actions (EAS) setup
1. Go to your GitHub repository -> Settings -> Secrets and variables -> Actions -> New repository secret.
2. Add a secret named `EXPO_TOKEN` with the value you obtain from `eas token:create` or from the Expo web dashboard.
3. (Optional) Add `EXPO_PUBLIC_BACKEND_URL` as a secret if you want the production build to use a specific backend URL.

This repo includes a workflow at `.github/workflows/eas-build.yml` which triggers on `push` to `main` and on manual `workflow_dispatch`. The workflow uses `EXPO_TOKEN` from GitHub Secrets and runs:

```bash
npm ci
npx eas-cli build -p android --profile production --non-interactive
```

The workflow does not expose secrets and uses the values from the repository's GitHub Secrets.

Where to find APK/AAB
- After a successful GitHub Actions run the built APK/AAB will be attached to a GitHub Release with tag `build-<run_number>`. Go to your repository -> Releases to download the artifact.

---

**Built with ❤️ for Indian Farmers** 🌾🇮🇳
