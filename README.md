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

Demand score is calculated from normalized inputs:

```text
demandScore = searchInterest * 0.5 + normalizedReviews * 0.3 + priceTrend * 0.2
```

- `searchInterest` is expected on a 0-100 scale
- `normalizedReviews` is derived from `reviewsCount` and capped at 100
- `priceTrend` is a derived trend score on a 0-100 scale

Competition score is based on `numberOfSellers`.

Recommendations:

- `ENTER` when demand is above 70 and competition is low
- `WAIT` when demand is between 40 and 70 with manageable competition
- `AVOID` when demand is below 40 or competition is high

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

## Extensibility Notes

- Mock data and repository logic are isolated so external APIs or scraping jobs can plug in later
- MongoDB models are already in place for raw observations and stored product insights
- The frontend uses a central API client so backend integrations can evolve without rewiring page components
