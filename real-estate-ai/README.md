# Real Estate AI - Sri Lanka Edition 🇱🇰

A comprehensive AI-powered real estate analysis platform specifically designed for the Sri Lankan property market. Predicts property prices, analyzes locations, and evaluates whether properties represent good deals using explainable AI with provenance tracking.

## 🏗️ Architecture

- **Backend**: FastAPI with Python
- **Frontend**: React + Vite + TailwindCSS
- **Database**: SQLite (default) / PostgreSQL (optional)
- **AI**: Google Gemini AI for LLM explanations
- **Security**: JWT authentication, input sanitization, output filtering
- **Testing**: pytest for backend testing

## 🇱🇰 Sri Lanka-Specific Features

### **Local Market Intelligence**
- **Sri Lankan Cities**: Colombo, Kandy, Galle, Jaffna, Negombo, Matara, Anuradhapura
- **Local Property Types**: Houses, Apartments, Commercial, Land, Tea Estates
- **Currency**: LKR (Sri Lankan Rupees)
- **Local Regulations**: UDA guidelines, municipal regulations
- **Market Trends**: Colombo market analysis, tourist area valuations

### **Localized Analysis**
- **Location Scoring**: Proximity to schools, hospitals, transport, beaches
- **Price Estimation**: Based on Sri Lankan market data and trends
- **Deal Evaluation**: Local market conditions and investment potential
- **Cultural Factors**: Heritage sites, tourist attractions, local amenities

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd real-estate-ai/backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize database:**
   ```bash
   # Create initial migration
   alembic revision --autogenerate -m "Initial migration"
   
   # Apply migration
   alembic upgrade head
   ```

6. **Run the backend:**
   ```bash
   uvicorn app.main:app --reload
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd real-estate-ai/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the frontend:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=sqlite:///./realestate.db
JWT_SECRET=your_secure_jwt_secret_here
GEMINI_API_KEY=your_google_gemini_api_key
ALLOW_ORIGINS=*
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Database Configuration

- **SQLite (Default)**: No additional setup required
- **PostgreSQL**: Install `psycopg2-binary` and update `DATABASE_URL`

## 🧪 Testing

### Backend Tests

```bash
cd real-estate-ai/backend
pytest
```

### Frontend Tests

```bash
cd real-estate-ai/frontend
npm test
```

## 📡 API Endpoints

### Authentication
- `POST /auth/signup` - Create user account
- `POST /auth/login` - Authenticate user
- `GET /auth/me` - Get current user info

### Property Analysis
- `POST /property/query` - Analyze property (requires auth)
- `GET /property/history` - Get query history (requires auth)

### Feedback
- `POST /feedback/` - Submit feedback (requires auth)
- `GET /feedback/response/{response_id}` - Get response feedback

## 🔍 Example Usage - Sri Lanka

### 1. User Registration
```bash
curl -X POST "http://localhost:8000/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "securepassword123"
  }'
```

### 2. User Login
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### 3. Property Analysis - Colombo Example
```bash
curl -X POST "http://localhost:8000/property/query" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### 4. Property Analysis - Kandy Example
```bash
curl -X POST "http://localhost:8000/property/query" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

## 🏛️ Project Structure

```
real-estate-ai/
├── backend/
│   ├── app/
│   │   ├── agents/           # AI agents for analysis
│   │   ├── api/              # API endpoints
│   │   ├── core/             # Configuration and security
│   │   ├── db/               # Database setup
│   │   ├── models/           # SQLAlchemy models
│   │   └── main.py           # FastAPI application
│   ├── alembic/              # Database migrations
│   ├── tests/                # Test files
│   ├── requirements.txt      # Python dependencies
│   └── env.example          # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # React contexts
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   └── main.jsx          # React entry point
│   ├── package.json          # Node.js dependencies
│   └── vite.config.js        # Vite configuration
└── README.md                 # This file
```

## 🤖 AI Agents - Sri Lanka Edition

### Price Agent
- Estimates property values using Sri Lankan market data
- Provides confidence scores and comparable properties
- Considers local factors: tourist areas, heritage sites, development zones
- Fallback when ML models are unavailable

### Location Agent
- Analyzes property locations based on Sri Lankan cities and districts
- Generates location scores and bullet points for local amenities
- Creates provenance information for transparency
- Includes local factors: proximity to beaches, temples, schools, hospitals

### Deal Agent
- Evaluates whether properties represent good deals in Sri Lankan market
- Uses Gemini AI for detailed explanations in local context
- Provides verdicts: Good Deal, Fair, or Overpriced
- Considers local market conditions and investment potential

### Security Agent
- Sanitizes user inputs to prevent attacks
- Filters outputs for safety
- Preserves provenance while ensuring security

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input sanitization and validation
- Output filtering for harmful content
- CORS configuration
- Rate limiting (configurable)

## 🚀 Deployment

### Backend Deployment

1. **Production server:**
   ```bash
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. **Environment variables:**
   - Set `DATABASE_URL` to production database
   - Use strong `JWT_SECRET`
   - Configure `ALLOW_ORIGINS` for production domains

### Frontend Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Serve static files:**
   - Use nginx, Apache, or CDN
   - Configure API proxy to backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include error logs and reproduction steps

## 🔮 Future Enhancements - Sri Lanka Focus

- **Local Market Data Integration**: Real-time LKR property listings
- **Tourist Area Analysis**: Beach properties, heritage site proximity
- **Tea Estate Valuation**: Agricultural land and estate properties
- **Local Language Support**: Sinhala and Tamil interface
- **Mobile Application**: Optimized for Sri Lankan users
- **Advanced Reporting**: Local market trends and investment analysis
- **Government Data Integration**: UDA, municipal, and tax information
- **Local Agent Network**: Connect with Sri Lankan real estate professionals
