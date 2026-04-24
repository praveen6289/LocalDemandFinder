# Local Demand Finder KT

This document is a file-by-file knowledge transfer for the Local Demand Finder project.

## 1. Project Purpose

Local Demand Finder helps small sellers decide what products to stock by combining:

- demand signals
- competition level
- price guidance
- recommendation logic

The current version is mock-first:

- it works immediately using sample data
- it is already structured to support MongoDB persistence
- it is designed so scraping or third-party marketplace APIs can be added later

## 2. High-Level Architecture

### Frontend

- React + Vite
- SaaS-style dashboard UI
- Calls backend through a single API service layer

### Backend

- Node.js + Express
- Mongoose models for MongoDB
- Mock-data service path for version 1
- Central scoring and insight generation logic

### Data Flow

1. Frontend submits user action
2. Express route receives request
3. Controller validates request and delegates to service
4. Service reads observations, calculates insight, and returns result
5. Frontend renders cards, tables, alerts, and details

## 3. Root Files

### `.gitignore`

- Ignores `node_modules`, build outputs, env files, and runtime folders.
- Keeps local dependencies and sensitive config out of version control.

### `package.json`

- Root workspace config for the monorepo-style setup.
- Defines `backend` and `frontend` as npm workspaces.
- Main commands:
- `npm run dev` starts both frontend and backend together
- `npm run dev:backend` starts backend only
- `npm run dev:frontend` starts frontend only
- `npm run build` builds the frontend
- `npm run seed` seeds MongoDB from backend script

### `README.md`

- Project setup guide.
- Explains stack, features, folder structure, env setup, API overview, and Mongo usage.
- This is the first file a new developer should read before running the app.

### `Local-Demand-Finder-complete.zip`

- Packaged archive of the project.
- Not part of runtime logic.
- Exists only as a downloadable delivery artifact.

## 4. Backend KT

## Backend Entry and Config

### `backend/package.json`

- Backend-specific package config.
- Declares backend dependencies such as `express`, `mongoose`, `cors`, `morgan`, and `dotenv`.
- Scripts:
- `npm run dev` runs the server in watch mode
- `npm run start` runs the server normally
- `npm run seed` loads sample data into MongoDB

### `backend/.env.example`

- Sample environment file for backend.
- Defines:
- `PORT`
- `CLIENT_URL`
- `USE_MOCK_DATA`
- `MONGODB_URI`

### `backend/src/server.js`

- Backend startup file.
- Connects the database using `connectDatabase()`.
- Creates the Express app.
- Starts listening on the configured port.
- This is the backend runtime entry point.

### `backend/src/app.js`

- Creates and configures the Express application.
- Adds middleware:
- `cors`
- `express.json()`
- `morgan`
- Registers all API routes under `/api/...`
- Adds `/api/health` route for health checking.
- Adds 404 and global error middleware.

### `backend/src/config/env.js`

- Reads environment variables using `dotenv`.
- Exposes normalized config values to the rest of the backend.
- Important behavior:
- `USE_MOCK_DATA` is treated as `true` unless explicitly set to `false`

### `backend/src/config/database.js`

- Handles MongoDB connection.
- If app is in mock mode, it skips Mongo connection.
- If mock mode is disabled, it connects using Mongoose.

## Backend Data and Models

### `backend/src/data/mockObservations.js`

- Sample observation dataset used in the first version.
- Each observation includes:
- `productName`
- `category`
- `location`
- `price`
- `numberOfSellers`
- `reviewsCount`
- `searchInterest`
- `priceTrend`
- `observedAt`
- These records simulate market signals without any scraping.

### `backend/src/models/ProductObservation.js`

- Mongoose schema for raw seller/product observations.
- This represents the base input data collected from users or future data pipelines.
- Includes validation for required fields and numeric ranges.
- Indexed by product/category/location to support grouped analysis.

### `backend/src/models/ProductInsight.js`

- Mongoose schema for processed insights.
- Stores computed business output such as:
- `demandScore`
- `competitionScore`
- `competitionLevel`
- `averageSellingPrice`
- `suggestedEntryPrice`
- `recommendation`
- `alert`
- Useful for future optimization if insights are precomputed and cached instead of recalculated on every request.

## Backend Controllers

### `backend/src/controllers/dashboardController.js`

- Controller for the dashboard API.
- Calls `getDashboardData()` from the service layer.
- Returns dashboard highlights, trending products, and alerts.

### `backend/src/controllers/observationController.js`

- Controller for seller input submission.
- Validates required fields and numeric fields.
- Enforces `searchInterest` range from 0 to 100.
- Creates a new observation and returns the updated insight for that product group.

### `backend/src/controllers/productController.js`

- Handles product listing and product detail requests.
- `getProducts()` returns all computed product insights, optionally filtered.
- `getProductById()` returns a single insight by its generated insight key.

### `backend/src/controllers/researchController.js`

- Handles product analysis requests from the research page.
- Requires `productName`, `category`, and `location`.
- Returns either:
- an insight built from matching observation history
- or a fallback heuristic insight if there is no exact historical match

## Backend Routes

### `backend/src/routes/dashboardRoutes.js`

- Express router for dashboard endpoints.
- Exposes `GET /api/dashboard`.

### `backend/src/routes/observationRoutes.js`

- Express router for observation submission.
- Exposes `POST /api/observations`.

### `backend/src/routes/productRoutes.js`

- Express router for product endpoints.
- Exposes:
- `GET /api/products`
- `GET /api/products/:id`

### `backend/src/routes/researchRoutes.js`

- Express router for research/analyze endpoints.
- Exposes `POST /api/analysis/analyze`.

## Backend Service Layer

### `backend/src/services/insightService.js`

- This is the most important backend file.
- It contains the core business logic that turns observations into insights.

Main responsibilities:

- choose data source:
- in-memory mock observations when mock mode is on
- MongoDB observations when mock mode is off
- sanitize and normalize user input
- group observations by product/category/location
- aggregate observation metrics
- calculate dashboard data
- create new observations
- analyze products using historical or fallback data
- rebuild insight records for seed/persistence flow

Important functions:

- `getAllInsights()`
- returns grouped and scored product opportunities

- `getDashboardData()`
- returns dashboard highlights, top products, and alerts

- `getInsightById()`
- finds one product insight by generated key

- `createObservation()`
- adds a new observation to mock memory or MongoDB

- `analyzeProduct()`
- gives insight for a requested product/category/location

- `persistInsightsToDatabase()`
- recalculates and stores insight records in MongoDB

Why this file matters:

- If recommendation logic changes, this is the first place to inspect.
- If later you add scraping/API integrations, they will likely feed data into the logic here.

## Backend Utilities and Middleware

### `backend/src/utils/formatters.js`

- Small helper functions for data formatting and grouping.
- `toTitleCase()` normalizes input text.
- `createInsightKey()` creates a URL-safe unique key per product/category/location group.
- `average()` computes averages for numeric arrays.

### `backend/src/utils/scoring.js`

- Central scoring and recommendation logic.
- Implements:
- score clamping
- review normalization
- competition level mapping
- suggested entry price calculation
- recommendation rules
- opportunity alert generation
- demand score formula

Business rules implemented here:

- demand score combines search interest, reviews, and price trend
- competition level is derived from number of sellers
- `ENTER` when demand is high and competition is low
- `WAIT` for mid-range opportunities
- `AVOID` for low demand or high competition

### `backend/src/middleware/errorHandler.js`

- Shared Express error handlers.
- `notFoundHandler()` handles unknown routes.
- `errorHandler()` handles runtime/server errors and returns JSON responses.

## Backend Script

### `backend/src/scripts/seed.js`

- MongoDB seed script.
- Connects to DB, clears previous observations, inserts mock observations, and rebuilds product insights.
- Used when moving from pure mock mode to actual database-backed mode.

## 5. Frontend KT

## Frontend Entry and Config

### `frontend/package.json`

- Frontend-specific package config.
- Uses React, React DOM, React Router, and Vite.
- Scripts:
- `npm run dev` starts Vite dev server
- `npm run build` creates production frontend build
- `npm run preview` previews built frontend

### `frontend/.env.example`

- Sample env file for frontend.
- Defines `VITE_API_BASE_URL`.
- Frontend API calls read this value through Vite env handling.

### `frontend/index.html`

- Base HTML document for the Vite app.
- Contains the `root` div where React mounts.

### `frontend/vite.config.js`

- Vite configuration file.
- Registers React plugin.
- Sets frontend dev server port to `5173`.

### `frontend/src/main.jsx`

- React entry point.
- Mounts the app into the DOM.
- Wraps the app with `BrowserRouter` so page routing works.
- Imports global styles.

### `frontend/src/App.jsx`

- Top-level route definition.
- Wraps the app in `AppShell`.
- Defines the main pages:
- dashboard
- add product data
- analyze product
- product details
- unknown routes redirect back to dashboard

## Frontend Shared Components

### `frontend/src/components/AppShell.jsx`

- Shared application layout.
- Renders sidebar branding, navigation links, and a small architecture note.
- Wraps all page content so every page has a consistent shell.

### `frontend/src/components/PageHeader.jsx`

- Reusable page heading component.
- Supports eyebrow text, title, description, and optional right-side action.

### `frontend/src/components/StatCard.jsx`

- Reusable summary metric card used on the dashboard.
- Displays a label, value, and hint.

### `frontend/src/components/FilterBar.jsx`

- Dashboard filter UI.
- Lets the user filter by location and text search.

### `frontend/src/components/InsightChart.jsx`

- Displays a simple bar-based leaderboard for product demand.
- Visualizes demand score and pricing info in dashboard-friendly form.

### `frontend/src/components/ProductTable.jsx`

- Main dashboard table for product opportunities.
- Shows:
- product
- demand
- competition
- average price
- entry price
- recommendation
- Links each row to the product details page.

### `frontend/src/components/RecommendationBadge.jsx`

- Small badge component for `ENTER`, `WAIT`, or `AVOID`.
- Keeps recommendation styling consistent across the app.

### `frontend/src/components/AlertBanner.jsx`

- Displays the opportunity alert message.
- Used when demand is high and competition is low.

### `frontend/src/components/ResultCard.jsx`

- Shared result card used by:
- analyze page
- add observation page
- Shows recommendation summary, metrics, score breakdown, and optional details link.
- Details link is shown only when there are actual observations behind the result.

### `frontend/src/components/EmptyState.jsx`

- Reusable empty-state block.
- Used when there are no matching products or no observations to display.

## Frontend Pages

### `frontend/src/pages/DashboardPage.jsx`

- Home dashboard page.
- Loads dashboard data from backend.
- Shows stat cards, filters, alerts, chart, and product table.
- Uses `useDeferredValue()` so search filtering feels smoother.

### `frontend/src/pages/AnalyzeProductPage.jsx`

- Product research page.
- Lets user submit `productName`, `category`, and `location`.
- Calls backend analyze endpoint.
- Shows result in `ResultCard`.

### `frontend/src/pages/AddObservationPage.jsx`

- Seller input page.
- Lets user manually submit market observations.
- Sends observation to backend.
- Displays resulting updated insight.
- Uses `startTransition()` to keep UI responsive while updating state.

### `frontend/src/pages/ProductDetailsPage.jsx`

- Product details page for a selected product insight.
- Loads one product by ID.
- Shows:
- recommendation summary
- demand and competition metrics
- score breakdown
- decision guide
- observation history table

## Frontend Services and Utils

### `frontend/src/services/api.js`

- Central API client for the frontend.
- All fetch logic is kept here so components/pages do not duplicate request code.
- Handles JSON requests and standardized error extraction.

Exposed functions:

- `getDashboard()`
- `createObservation()`
- `analyzeProduct()`
- `getProductDetails()`

### `frontend/src/utils/format.js`

- Frontend formatting helpers.
- `formatCurrency()` renders INR currency values.
- `formatDate()` renders readable dates for observation history and detail pages.

### `frontend/src/styles/global.css`

- Main application styling file.
- Defines:
- theme colors
- typography
- layout grid
- sidebar design
- cards
- charts
- forms
- tables
- badges
- responsive behavior

This file is the main place to update the project’s visual design.

## 6. How Main Features Work

## Dashboard

Frontend path:

- `frontend/src/pages/DashboardPage.jsx`
- `frontend/src/components/StatCard.jsx`
- `frontend/src/components/FilterBar.jsx`
- `frontend/src/components/InsightChart.jsx`
- `frontend/src/components/ProductTable.jsx`

Backend path:

- `backend/src/routes/dashboardRoutes.js`
- `backend/src/controllers/dashboardController.js`
- `backend/src/services/insightService.js`

## Analyze Product

Frontend path:

- `frontend/src/pages/AnalyzeProductPage.jsx`
- `frontend/src/components/ResultCard.jsx`
- `frontend/src/services/api.js`

Backend path:

- `backend/src/routes/researchRoutes.js`
- `backend/src/controllers/researchController.js`
- `backend/src/services/insightService.js`

## Add Product Data

Frontend path:

- `frontend/src/pages/AddObservationPage.jsx`
- `frontend/src/components/ResultCard.jsx`

Backend path:

- `backend/src/routes/observationRoutes.js`
- `backend/src/controllers/observationController.js`
- `backend/src/services/insightService.js`

## Product Details

Frontend path:

- `frontend/src/pages/ProductDetailsPage.jsx`

Backend path:

- `backend/src/routes/productRoutes.js`
- `backend/src/controllers/productController.js`
- `backend/src/services/insightService.js`

## 7. Where to Change Things Later

### If you want to change recommendation rules

- Update `backend/src/utils/scoring.js`

### If you want to change aggregation or fallback insight behavior

- Update `backend/src/services/insightService.js`

### If you want to add a new API

1. Add route file or route entry
2. Add controller
3. Add service logic
4. Add frontend API function if needed
5. Connect it to a page/component

### If you want to switch fully to MongoDB

1. Set `USE_MOCK_DATA=false`
2. Set valid `MONGODB_URI`
3. Run `npm run seed`
4. Start app again

### If you want to add scraping later

Suggested future design:

1. Create a dedicated ingestion service
2. Store raw observations in `ProductObservation`
3. Recompute `ProductInsight`
4. Reuse the existing frontend without major structural change

## 8. Recommended Reading Order for New Developer

1. `README.md`
2. `package.json`
3. `backend/src/server.js`
4. `backend/src/app.js`
5. `backend/src/services/insightService.js`
6. `backend/src/utils/scoring.js`
7. `frontend/src/App.jsx`
8. `frontend/src/pages/DashboardPage.jsx`
9. `frontend/src/pages/AnalyzeProductPage.jsx`
10. `frontend/src/pages/AddObservationPage.jsx`
11. `frontend/src/pages/ProductDetailsPage.jsx`

## 9. Short Summary

If someone asks "where is the real brain of this app?":

- backend scoring rules live in `backend/src/utils/scoring.js`
- backend orchestration lives in `backend/src/services/insightService.js`
- frontend routing starts in `frontend/src/App.jsx`
- frontend API calls live in `frontend/src/services/api.js`
- frontend dashboard UI starts in `frontend/src/pages/DashboardPage.jsx`

