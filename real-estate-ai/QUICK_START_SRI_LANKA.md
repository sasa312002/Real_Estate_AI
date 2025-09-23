# 🚀 Quick Start Guide - Sri Lanka Edition

## 🇱🇰 Welcome to Real Estate AI - Sri Lanka Edition!

This platform provides AI-powered real estate analysis specifically designed for the Sri Lankan property market, with local pricing (LKR), cities, districts, and market intelligence.

## ⚡ Quick Start (5 Minutes)

### **Option 1: Use Startup Scripts (Recommended)**

#### **Windows Users:**
```bash
# Double-click or run:
start_srilanka.bat
```

#### **Linux/Mac Users:**
```bash
# Make executable and run:
chmod +x start_srilanka.sh
./start_srilanka.sh
```

### **Option 2: Manual Setup**

#### **1. Backend Setup:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

pip install fastapi uvicorn pydantic email-validator python-multipart
cp env.example .env
# Edit .env with your API keys
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### **2. Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

## 🔑 Required API Keys

### **Google Gemini AI (Required)**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `.env` file:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

### **JWT Secret (Required)**
1. Generate a secure random string
2. Add to `.env` file:
   ```env
   JWT_SECRET=your_secure_random_string_here
   ```

## 🏠 Test the Platform

### **1. Open the Application**
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

### **2. Create an Account**
- Click "Sign Up"
- Enter email, username, and password
- You'll receive a JWT token

### **3. Analyze a Property**
Use the example queries below:

#### **Colombo Property Analysis:**
```json
{
  "query": "Analyze this 3-bedroom house in Colombo 3",
  "features": {
    "city": "Colombo",
    "district": "Colombo 3",
    "lat": 6.9271,
    "lon": 79.8612,
    "beds": 3,
    "baths": 2,
    "area": 1200,
    "year_built": 2015,
    "asking_price": 45000000,
    "property_type": "House",
    "land_size": 500
  }
}
```

#### **Kandy Property Analysis:**
```json
{
  "query": "Analyze this apartment in Kandy near Peradeniya University",
  "features": {
    "city": "Kandy",
    "district": "Peradeniya",
    "lat": 7.2906,
    "lon": 80.6337,
    "beds": 2,
    "baths": 1,
    "area": 800,
    "year_built": 2020,
    "asking_price": 25000000,
    "property_type": "Apartment",
    "floor": 3
  }
}
```

#### **Galle Beach Property:**
```json
{
  "query": "Analyze this beach house in Galle Fort area",
  "features": {
    "city": "Galle",
    "district": "Galle Fort",
    "lat": 6.0535,
    "lon": 80.2210,
    "beds": 4,
    "baths": 3,
    "area": 2000,
    "year_built": 2010,
    "asking_price": 75000000,
    "property_type": "Villa",
    "land_size": 3000
  }
}
```

## 🌟 Sri Lanka-Specific Features

### **🏙️ Cities & Districts**
- **25+ Major Cities**: Colombo, Kandy, Galle, Jaffna, Negombo, Matara, etc.
- **Colombo 15 Districts**: Detailed analysis of each district
- **Special Areas**: Tourist zones, heritage sites, university areas

### **💰 LKR Pricing**
- **Local Currency**: Sri Lankan Rupees (LKR)
- **Market-Based**: Realistic LKR pricing for local market
- **Property Types**: Houses, apartments, commercial, land, tea estates

### **📍 Location Analysis**
- **Local Amenities**: Schools, hospitals, transport, beaches
- **Tourist Areas**: Beach proximity, heritage site access
- **Investment Zones**: Development areas, growth potential

### **🧠 AI Intelligence**
- **Local Market Data**: Sri Lankan property trends
- **Cultural Factors**: Heritage sites, religious places
- **Tourism Impact**: Beach areas, cultural sites

## 📱 Platform Features

### **Property Analysis**
- Price estimation in LKR
- Location scoring (0-1 scale)
- Deal evaluation (Good/Fair/Overpriced)
- Investment potential analysis

### **Market Intelligence**
- Local market trends
- Comparable properties
- Investment recommendations
- Risk assessment

### **User Management**
- Secure user accounts
- Property search history
- Saved properties
- Analysis reports

## 🔧 Troubleshooting

### **Common Issues:**

#### **1. Backend Won't Start:**
```bash
# Check dependencies
pip install fastapi uvicorn pydantic email-validator python-multipart

# Check .env file exists
cp env.example .env
```

#### **2. Frontend Won't Start:**
```bash
# Check Node.js version (16+)
node --version

# Clear npm cache
npm cache clean --force
npm install
```

#### **3. API Errors:**
- Check if backend is running on port 8000
- Verify API key in .env file
- Check browser console for errors

#### **4. Database Issues:**
```bash
# Reset database
rm realestate_srilanka.db
# Restart backend (tables will be recreated)
```

## 📚 Learn More

### **Documentation:**
- **Full Features**: `SRI_LANKA_FEATURES.md`
- **API Reference**: Backend running on http://localhost:8000/docs
- **README**: `README.md`

### **Example Queries:**
- **Colombo**: Business district, residential areas
- **Kandy**: Cultural capital, university area
- **Galle**: Beach properties, heritage sites
- **Jaffna**: Northern development, cultural heritage
- **Negombo**: Airport proximity, beach tourism

## 🚀 Next Steps

### **Immediate:**
1. ✅ Start the platform
2. ✅ Create user account
3. ✅ Test property analysis
4. ✅ Explore different cities

### **Advanced:**
1. **Custom Analysis**: Create your own property queries
2. **Market Research**: Analyze different areas and property types
3. **Investment Planning**: Use AI insights for property decisions
4. **Local Integration**: Connect with Sri Lankan real estate data

### **Future:**
1. **Mobile App**: iOS and Android applications
2. **Local Language**: Sinhala and Tamil support
3. **Government Data**: UDA and municipal integration
4. **Real-time Listings**: Live property data

## 🆘 Support

### **Getting Help:**
1. Check the troubleshooting section above
2. Review error messages in terminal/console
3. Check the documentation files
4. Verify API keys and configuration

### **Platform Status:**
- **Backend Health**: http://localhost:8000/healthz
- **API Documentation**: http://localhost:8000/docs
- **Frontend Status**: Check browser console

---

## 🎯 Ready to Start?

Your Sri Lanka Real Estate AI platform is ready! Use the startup scripts or follow the manual setup to get started. The platform will provide you with AI-powered insights into the Sri Lankan property market, helping you make informed real estate decisions.

**Happy Property Hunting in Sri Lanka! 🇱🇰**
