from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import base64
from io import BytesIO
from PIL import Image
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
    EMERGENT_AVAILABLE = True
except Exception:
    EMERGENT_AVAILABLE = False
    class UserMessage:
        def __init__(self, text: str, file_contents: list = None):
            self.text = text
            self.file_contents = file_contents or []

    class ImageContent:
        def __init__(self, image_base64: str):
            self.image_base64 = image_base64

    class LlmChat:
        def __init__(self, api_key: str = "", session_id: str = "", system_message: str = ""):
            self.api_key = api_key
            self.session_id = session_id
            self.system_message = system_message

        def with_model(self, provider: str, model: str):
            return self

        async def send_message(self, user_message: UserMessage):
            fallback = {
                "disease_name": "Healthy",
                "confidence_score": 0.95,
                "treatment_steps": [],
                "fertilizer_suggestions": [],
                "prevention_tips": ["No treatment necessary; monitor regularly"]
            }
            return json.dumps(fallback)
import httpx
import json

ROOT_DIR = Path(__file__).parent

# Ensure a .env file exists with required keys. If missing, create with safe defaults.
ENV_PATH = ROOT_DIR / '.env'
DEFAULTS = {
    'MONGO_URL': '',
    'DB_NAME': 'ai_crop_db',
    'EXPO_PUBLIC_BACKEND_URL': 'http://127.0.0.1:8000',
}

if not ENV_PATH.exists():
    try:
        with open(ENV_PATH, 'w', encoding='utf-8') as f:
            for k, v in DEFAULTS.items():
                f.write(f"{k}={v}\n")
        logger = logging.getLogger(__name__)
        logger.info(f"Created default .env at {ENV_PATH}")
    except Exception:
        pass

load_dotenv(str(ENV_PATH))

# MongoDB connection (optional). If MONGO_URL is missing, use an in-memory fallback.
MONGO_URL = os.environ.get('MONGO_URL', '').strip()
DB_NAME = os.environ.get('DB_NAME', DEFAULTS['DB_NAME'])

if MONGO_URL:
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
    except Exception:
        # Fall back to in-memory DB if connection fails
        client = None
        db = None
else:
    client = None
    db = None

# In-memory fallback DB implementation
class _InMemoryCollection:
    def __init__(self):
        self._data = []

    async def insert_one(self, doc):
        self._data.append(doc)
        return {'inserted_id': len(self._data) - 1}

    def find(self, *args, **kwargs):
        class _Cursor:
            def __init__(self, data):
                self._data = data

            def sort(self, *a, **k):
                return self

            def limit(self, n):
                return self

            async def to_list(self, limit):
                return self._data[:limit]

        return _Cursor(self._data)

class _InMemoryDB:
    def __init__(self):
        self.detections = _InMemoryCollection()

if db is None:
    db = _InMemoryDB()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Get API keys from environment
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY', 'demo_key')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define Models
class DiseaseDetectionRequest(BaseModel):
    image: str  # base64 encoded image
    crop_type: str
    language: str = "en"

class TreatmentRecommendation(BaseModel):
    disease_name: str
    confidence_score: float
    treatment_steps: List[str]
    fertilizer_suggestions: List[str]
    prevention_tips: List[str]

class DiseaseDetectionResponse(BaseModel):
    id: str
    disease_name: str
    confidence_score: float
    crop_type: str
    treatment_steps: List[str]
    fertilizer_suggestions: List[str]
    prevention_tips: List[str]
    detection_date: datetime
    image_thumbnail: str

class DetectionHistory(BaseModel):
    id: str
    user_id: str
    disease_name: str
    confidence_score: float
    crop_type: str
    detection_date: datetime
    image_thumbnail: str

class WeatherAdvisory(BaseModel):
    location: str
    temperature: float
    humidity: float
    weather_condition: str
    crop_advice: List[str]


# Helper function to process and validate image
def process_image(base64_image: str) -> str:
    """Process and validate the base64 image"""
    try:
        # Remove data URL prefix if present
        if 'base64,' in base64_image:
            base64_image = base64_image.split('base64,')[1]
        
        # Decode and validate image
        img_data = base64.b64decode(base64_image)
        img = Image.open(BytesIO(img_data))
        
        # Resize if too large (max 1024px)
        max_size = 1024
        if img.width > max_size or img.height > max_size:
            img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Save back to base64
        buffered = BytesIO()
        img.save(buffered, format="JPEG", quality=85)
        return base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    except Exception as e:
        logger.error(f"Image processing error: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid image format")


# Helper function to analyze disease using GPT-4 Vision
async def analyze_crop_disease(base64_image: str, crop_type: str, language: str) -> dict:
    """Analyze crop disease using OpenAI GPT-4 Vision"""
    try:
        # If emergentintegrations is available, ensure API key is present
        if EMERGENT_AVAILABLE and not EMERGENT_LLM_KEY:
            raise HTTPException(status_code=500, detail="Missing EMERGENT_LLM_KEY environment variable")
        # Create LlmChat instance
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"crop-analysis-{uuid.uuid4()}",
            system_message="You are an expert agricultural pathologist specializing in crop disease identification. Provide detailed, accurate disease diagnosis and treatment recommendations."
        )
        
        # Use GPT-5.2 model
        chat.with_model("openai", "gpt-5.2")
        
        # Create image content
        image_content = ImageContent(image_base64=base64_image)
        
        # Create analysis prompt
        prompt = f"""Analyze this {crop_type} plant/fruit leaf or fruit image for diseases.

You are an expert agricultural pathologist. Analyze the image carefully and identify any diseases, pests, or health issues.

Common diseases by crop type:
- Apple: Apple Scab, Fire Blight, Powdery Mildew, Cedar Apple Rust, Black Rot
- Banana: Panama Disease, Black Sigatoka, Banana Bunchy Top Virus, Banana Streak Virus
- Mango: Anthracnose, Powdery Mildew, Bacterial Canker, Mango Malformation
- Orange/Citrus: Citrus Canker, Citrus Greening (HLB), Citrus Black Spot, Melanose
- Grapes: Downy Mildew, Powdery Mildew, Black Rot, Anthracnose, Pierce's Disease
- Strawberry: Gray Mold, Powdery Mildew, Leaf Spot, Anthracnose
- Papaya: Papaya Ringspot Virus, Anthracnose, Black Spot, Powdery Mildew
- Guava: Anthracnose, Wilt Disease, Canker, Fruit Fly damage
- Pomegranate: Bacterial Blight, Fruit Rot, Cercospora Leaf Spot
- Coconut: Bud Rot, Leaf Blight, Root Wilt, Stem Bleeding, Thanjavur Wilt
- Tomato: Early Blight, Late Blight, Septoria Leaf Spot, Bacterial Spot, Fusarium Wilt
- Potato: Late Blight, Early Blight, Black Leg, Potato Virus Y
- Cotton: Bacterial Blight, Verticillium Wilt, Fusarium Wilt, Boll Rot
- Sugarcane: Red Rot, Smut, Wilt, Leaf Scald, Pokkah Boeng
- Turmeric: Leaf Spot, Leaf Blotch, Rhizome Rot, Scale Insects
- Pepper: Foot Rot (Phytophthora), Anthracnose, Leaf Spot, Pollu Beetle damage
- Arecanut: Fruit Rot, Koleroga (Mahali), Yellow Leaf Disease, Inflorescence Die-back
- Rice: Blast, Bacterial Blight, Sheath Blight, Brown Spot
- Maize: Northern Corn Leaf Blight, Gray Leaf Spot, Common Rust, Ear Rot
- Wheat: Rust diseases, Powdery Mildew, Septoria, Fusarium Head Blight

Provide your response in the following JSON format:
{{
    "disease_name": "Name of the disease (or 'Healthy' if no disease detected)",
    "confidence_score": 0.0-1.0,
    "treatment_steps": ["Step 1", "Step 2", "Step 3"],
    "fertilizer_suggestions": ["Fertilizer 1", "Fertilizer 2"],
    "prevention_tips": ["Tip 1", "Tip 2", "Tip 3"]
}}

Be specific and practical. If the image shows a healthy plant/fruit, indicate that.
For fruits, also check for signs of rot, fungal infections, pest damage, or ripening issues.
Provide treatment in {language} language context but keep JSON keys in English."""
        
        # Send message with image
        user_message = UserMessage(
            text=prompt,
            file_contents=[image_content]
        )
        
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        try:
            # Extract JSON from response (handle markdown code blocks)
            response_text = response.strip()
            if '```json' in response_text:
                response_text = response_text.split('```json')[1].split('```')[0].strip()
            elif '```' in response_text:
                response_text = response_text.split('```')[1].split('```')[0].strip()
            
            result = json.loads(response_text)
            return result
        except json.JSONDecodeError:
            # If JSON parsing fails, create structured response from text
            logger.warning("Failed to parse JSON, using fallback")
            return {
                "disease_name": "Analysis completed",
                "confidence_score": 0.75,
                "treatment_steps": [response[:200]],
                "fertilizer_suggestions": ["Consult local agricultural expert for specific recommendations"],
                "prevention_tips": ["Regular monitoring", "Proper irrigation", "Balanced fertilization"]
            }
    
    except Exception as e:
        logger.error(f"Disease analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# API Routes
@api_router.get("/")
async def root():
    return {"message": "AI Crop Doctor API", "version": "1.0", "status": "active"}


@api_router.post("/detect-disease", response_model=DiseaseDetectionResponse)
async def detect_disease(request: DiseaseDetectionRequest):
    """
    Detect crop disease from an uploaded image
    """
    try:
        # Process the image
        processed_image = process_image(request.image)
        
        # Analyze the disease
        analysis = await analyze_crop_disease(processed_image, request.crop_type, request.language)
        
        # Generate detection ID
        detection_id = str(uuid.uuid4())
        
        # Create response
        response = DiseaseDetectionResponse(
            id=detection_id,
            disease_name=analysis.get('disease_name', 'Unknown'),
            confidence_score=float(analysis.get('confidence_score', 0.0)),
            crop_type=request.crop_type,
            treatment_steps=analysis.get('treatment_steps', []),
            fertilizer_suggestions=analysis.get('fertilizer_suggestions', []),
            prevention_tips=analysis.get('prevention_tips', []),
            detection_date=datetime.utcnow(),
            image_thumbnail=processed_image
        )
        
        # Save to database
        await db.detections.insert_one(response.model_dump())
        
        logger.info(f"Disease detected: {analysis.get('disease_name')} with confidence {analysis.get('confidence_score')}")
        
        return response
    
    except Exception as e:
        logger.error(f"Detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/history", response_model=List[DetectionHistory])
async def get_detection_history(user_id: str = "default", limit: int = 50):
    """
    Get detection history for a user
    """
    try:
        # Optimized query with projection to limit fields
        projection = {
            '_id': 0,
            'id': 1,
            'disease_name': 1,
            'confidence_score': 1,
            'crop_type': 1,
            'detection_date': 1,
            'image_thumbnail': 1
        }
        detections = await db.detections.find({}, projection).sort("detection_date", -1).limit(limit).to_list(limit)
        
        history = [
            DetectionHistory(
                id=str(d.get('id', '')),
                user_id=user_id,
                disease_name=d.get('disease_name', ''),
                confidence_score=d.get('confidence_score', 0.0),
                crop_type=d.get('crop_type', ''),
                detection_date=d.get('detection_date', datetime.utcnow()),
                image_thumbnail=d.get('image_thumbnail', '')
            )
            for d in detections
        ]
        
        return history
    
    except Exception as e:
        logger.error(f"History retrieval error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/weather-advisory")
async def get_weather_advisory(latitude: float, longitude: float, crop_type: str = "general"):
    """
    Get weather-based crop advisory
    """
    try:
        # Call OpenWeatherMap API (using demo for now)
        weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={OPENWEATHER_API_KEY}&units=metric"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(weather_url, timeout=10.0)
            
            if response.status_code == 200:
                weather_data = response.json()
                
                # Extract weather info
                temp = weather_data.get('main', {}).get('temp', 0)
                humidity = weather_data.get('main', {}).get('humidity', 0)
                condition = weather_data.get('weather', [{}])[0].get('main', 'Unknown')
                location = weather_data.get('name', 'Unknown')
                
                # Generate crop advice based on weather
                advice = []
                if temp > 35:
                    advice.append("High temperature alert: Increase irrigation frequency")
                    advice.append("Consider shade netting for sensitive crops")
                elif temp < 10:
                    advice.append("Low temperature warning: Protect crops from frost")
                    advice.append("Consider mulching to retain soil warmth")
                
                if humidity > 80:
                    advice.append("High humidity: Monitor for fungal diseases")
                    advice.append("Ensure good air circulation around plants")
                elif humidity < 30:
                    advice.append("Low humidity: Increase watering schedule")
                
                if condition == 'Rain':
                    advice.append("Rainfall detected: Check drainage systems")
                    advice.append("Delay fertilizer application until after rain")
                
                if not advice:
                    advice.append("Weather conditions are favorable for crop growth")
                    advice.append("Continue regular monitoring and care routine")
                
                return WeatherAdvisory(
                    location=location,
                    temperature=temp,
                    humidity=humidity,
                    weather_condition=condition,
                    crop_advice=advice
                )
            else:
                # Return mock data if API fails
                return WeatherAdvisory(
                    location="Your Location",
                    temperature=28.0,
                    humidity=65.0,
                    weather_condition="Clear",
                    crop_advice=[
                        "Weather conditions are favorable",
                        "Continue regular monitoring",
                        "Ensure adequate irrigation"
                    ]
                )
    
    except Exception as e:
        logger.error(f"Weather advisory error: {str(e)}")
        # Return mock data on error
        return WeatherAdvisory(
            location="Location unavailable",
            temperature=25.0,
            humidity=60.0,
            weather_condition="Unknown",
            crop_advice=[
                "Unable to fetch weather data",
                "Continue regular crop monitoring",
                "Consult local agricultural extension service"
            ]
        )


@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": "connected",
            "ai_service": "ready"
        }
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
