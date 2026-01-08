# AI Crop Doctor - Image Setup Guide

## 📸 Getting High-Quality Crop Images

Your app needs crop images for the UI. Here are your options:

### **Option 1: Use Free Stock Photo APIs (Recommended)**

#### Step 1: Get Free API Keys

**Unsplash (50 requests/hour free)**
1. Visit: https://unsplash.com/developers
2. Sign up for a free account
3. Click "New Application"
4. Fill in details:
   - Application name: "AI Crop Doctor"
   - Description: "Crop disease detection app for farmers"
5. Accept terms and create
6. Copy your **Access Key**

**Pexels (200 requests/hour free)**
1. Visit: https://www.pexels.com/api/
2. Sign up for a free account
3. Click "Get Started" or "Generate API Key"
4. Copy your **API Key**

#### Step 2: Add Keys to Your App

Edit `/app/frontend/utils/cropImages.ts`:

```typescript
// Line 89: Add your Unsplash key
const UNSPLASH_KEY = 'YOUR_ACTUAL_KEY_HERE';

// Line 132: Add your Pexels key
const PEXELS_KEY = 'YOUR_ACTUAL_KEY_HERE';
```

#### Step 3: Test the Integration

The app will automatically:
- ✅ Fetch images on first load
- ✅ Cache them for 7 days
- ✅ Use cached images on subsequent loads
- ✅ Show icon placeholders if images fail

---

### **Option 2: Use Local Image Assets**

If you prefer using your own images:

#### Step 1: Create Assets Folder
```bash
mkdir -p /app/frontend/assets/crops
```

#### Step 2: Add Crop Images

Download or create images for each crop:
- `rice.jpg`
- `maize.jpg`
- `wheat.jpg`
- `sugarcane.jpg`
- `cotton.jpg`
- `turmeric.jpg`
- `pepper.jpg`
- `coconut.jpg`
- `arecanut.jpg`
- `tomato.jpg`
- `potato.jpg`
- `banana.jpg`
- `mango.jpg`
- `apple.jpg`
- `orange.jpg`
- `grapes.jpg`

Place them in `/app/frontend/assets/crops/`

#### Step 3: Update Code

Modify the crop cards to use local assets:
```typescript
import RiceImage from '../assets/crops/rice.jpg';

<Image source={RiceImage} style={styles.cropImage} />
```

---

### **Option 3: Use PlantVillage Dataset**

For training your AI model:

1. Download from: https://www.kaggle.com/datasets/emmarex/plantdisease
2. Contains 54,000+ images of healthy and diseased plants
3. Multiple crop types included
4. Free and open-source

---

### **Option 4: Generate with AI**

Use AI image generation services:

**DALL-E 3** (via OpenAI)
```bash
curl https://api.openai.com/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "dall-e-3",
    "prompt": "Professional agricultural photography of a healthy rice plant with bright green paddy leaves in an Indian farm field, photorealistic, high resolution, natural sunlight",
    "n": 1,
    "size": "1024x1024"
  }'
```

**Stable Diffusion** (Free, self-hosted)
- Install: https://github.com/AUTOMATIC1111/stable-diffusion-webui
- Use prompt from above
- Generate locally

---

## 🎨 Image Requirements

### For UI Display:
- **Format**: JPG or PNG
- **Size**: 500x500px to 1000x1000px
- **Aspect Ratio**: 1:1 (square)
- **Quality**: 80-90% (good balance)
- **Style**: Photorealistic, natural colors
- **Content**: Clear, healthy plant, outdoor setting

### For AI Training:
- **Format**: JPG
- **Size**: 224x224px or 256x256px (model input size)
- **Dataset**: Include both healthy and diseased
- **Labels**: Properly categorized by disease type

---

## 🚀 Quick Start (Recommended)

1. **Get Pexels API Key** (200 free requests/hour)
   - Visit: https://www.pexels.com/api/
   - Sign up and get key

2. **Add to App**
   - Edit `/app/frontend/utils/cropImages.ts`
   - Replace `YOUR_PEXELS_API_KEY` with your actual key

3. **Test**
   - Launch app
   - Images will load automatically
   - Check console for any errors

4. **Optional: Add Unsplash as Backup**
   - Get key from https://unsplash.com/developers
   - Add to same file
   - App will try Pexels first, then Unsplash

---

## 📝 Notes

- **Cache Duration**: Images cached for 7 days
- **Fallback**: If APIs fail, app shows icon placeholders
- **Offline**: Cached images work offline
- **Performance**: Images load once, then cached
- **Cost**: Free tier is sufficient for development

---

## 🐛 Troubleshooting

**Images not loading?**
1. Check API key is correct
2. Check internet connection
3. Check console for error messages
4. Verify rate limits not exceeded

**Want to use different images?**
1. Clear cache: Call `clearImageCache()`
2. New images will be fetched on next load

**Need help?**
- Check `/app/frontend/utils/cropImages.ts` comments
- API documentation: Unsplash/Pexels docs
- PlantVillage dataset documentation

---

## ✅ Current Status

- ✅ Image management system created
- ✅ Caching system implemented
- ✅ API integration ready
- ✅ Fallback system in place
- ⏳ **TODO: Add your API keys**
- ⏳ **TODO: Test image loading**

Once you add API keys, images will work automatically!
