# Local Demand Finder

Local Demand Finder is a mock-first full-stack web app that helps small sellers spot promising products by combining demand signals, competition levels, and pricing guidance.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Styling: Custom responsive CSS with a SaaS dashboard layout

## Backend Style

- Backend code now uses ES5-style/CommonJS syntax
- REST API routes and response design remain the same
- Frontend remains modern React/Vite code

## Features

- Dashboard with trending products, demand scores, pricing guidance, and recommendations
- Product research page for manual analysis by product, category, and location
- Seller input page for adding new observations
- Product details page with metric breakdown and observation history
- Opportunity alerts when demand is high and competition is low
- Mock-first data mode so the app works before any scraping or third-party integrations
- Modular integration layer for trends, marketplace data, social signals, and price tracking
- Integration status page with manual refresh
- Product opportunity page with combined demand and competition analysis
- Live Data Mode toggle with source-wise Google Trends, YouTube, Shopping, and optional Instagram data
- 24-hour API response caching to reduce cost when MongoDB mode is enabled

## Project Structure

```text
local-demand-finder/
  backend/
    src/
      config/
      controllers/
      data/
      middleware/
      models/
      routes/
      scripts/
      services/
      utils/
  frontend/
    src/
      components/
      pages/
      services/
      styles/
      utils/
```

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment files

Backend:

```powershell
Copy-Item backend/.env.example backend/.env
```

Frontend:

```powershell
Copy-Item frontend/.env.example frontend/.env
```

If you are on macOS or Linux, use `cp` instead of `Copy-Item`.

### 3. Start the app

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

Backend runs on `http://localhost:5000`

## Live API Setup

Add these values to `backend/.env` when you want live integrations:

```text
GOOGLE_TRENDS_API_KEY=
GOOGLE_TRENDS_API_URL=
YOUTUBE_API_KEY=
SERPAPI_KEY=
META_ACCESS_TOKEN=
INSTAGRAM_BUSINESS_ACCOUNT_ID=
API_CACHE_TTL_HOURS=24
```

Notes:

- Google Trends does not have a stable public official API documented in the sources I checked, so this project uses the `google-trends-api` npm package as the default live fallback.
- `GOOGLE_TRENDS_API_URL` is optional and only needed if you have access to a private or alpha Trends endpoint.
- `YOUTUBE_API_KEY` is the main free official API key you can use for live signals in this project.
- `SERPAPI_KEY` is optional. If it is missing, shopping data falls back to mock marketplace records instead of breaking the app.
- Instagram is optional and only used when both Meta credentials are provided.
- If live providers fail or keys are missing, the app falls back to mock data and marks the result as partial when appropriate.

### API key setup

1. Google Trends
   Use the built-in `google-trends-api` package fallback first. If you later receive access to a private or alpha Trends endpoint, set both `GOOGLE_TRENDS_API_URL` and `GOOGLE_TRENDS_API_KEY`.
2. YouTube Data API
   Create a Google Cloud project, enable `YouTube Data API v3`, then generate an API key and place it in `YOUTUBE_API_KEY`.
3. SerpApi
   Create a SerpApi account, enable Google Shopping usage on your plan, then copy the API key into `SERPAPI_KEY`.
4. Instagram Graph API (optional)
   Create a Meta app, connect an Instagram Business or Creator account, generate a long-lived access token, and set both `META_ACCESS_TOKEN` and `INSTAGRAM_BUSINESS_ACCOUNT_ID`.

### Cache behavior

- API responses are cached for 24 hours.
- In MongoDB mode, cached responses are stored in MongoDB.
- In mock mode, cache falls back to in-memory storage.

## MongoDB Setup

This first version defaults to mock data so the app works immediately.

To switch to MongoDB-backed data:

1. Set `USE_MOCK_DATA=false` in `backend/.env`
2. Add a valid `MONGODB_URI`
3. Seed the database:

```bash
npm run seed
```

## Scoring Logic

The live opportunity engine calculates demand from four source families:

```text
demandScore =
  googleSearchInterest * 0.45 +
  youtubeEngagementScore * 0.25 +
  shoppingReviewScore * 0.20 +
  priceStabilityScore * 0.10
```

Competition score is:

```text
competitionScore = numberOfShoppingResults + repeatedSimilarProducts
```

Recommendations:

- `ENTER` when demand is above 70 and competition is low
- `TEST SMALL QTY` when demand is above 70 and competition is high
- `WAIT` when demand is between 40 and 70
- `AVOID` when demand is below 40

## Seed Data

The backend includes sample observations for products such as:

- Reusable lunch bags
- Organic jaggery cubes
- Copper water bottles
- LED strip lights
- Bluetooth speakers
- Yoga resistance bands

## API Overview

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/analysis/analyze`
- `POST /api/observations`
- `GET /api/trends?keyword=&location=`
- `GET /api/marketplace/search?keyword=&category=&location=`
- `GET /api/price/average?productName=&category=&location=`
- `GET /api/opportunity/analyze?keyword=&category=&location=`
- `GET /api/integrations/status`
- `POST /api/integrations/refresh`
- `GET /api/integrations/trends?keyword=&location=&liveMode=`
- `GET /api/integrations/youtube?keyword=&location=&liveMode=`
- `GET /api/integrations/shopping?keyword=&location=&liveMode=`

Live integration response highlights:

- `/api/integrations/trends` returns `keyword`, `location`, `searchInterest`, `trendDirection`, and `relatedQueries`
- `/api/integrations/youtube` returns `videoCount`, `topVideos`, `totalViewsApprox`, and `engagementScore`
- `/api/integrations/shopping` returns normalized shopping items with `productName`, `source`, `price`, `rating`, `reviews`, `link`, and `thumbnail`
- `/api/opportunity/analyze` combines all available live or fallback sources and flags `partialData` when one provider fails

## Extensibility Notes

- Mock data and repository logic are isolated so external APIs or scraping jobs can plug in later
- MongoDB models are already in place for raw observations and stored product insights
- The frontend uses a central API client so backend integrations can evolve without rewiring page components
- Integration providers live under `backend/src/integrations/` so sources can be added or removed cleanly
- Retry logic, rate limiting, and user-agent config are built into the provider runner
