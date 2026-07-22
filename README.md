# MakeupAI & Skin Analysis Platform

A premium, AI-powered web application that provides real-time skin analysis, virtual makeup try-on, and personalized cosmetic recommendations. The platform features a Next.js (App Router) + TypeScript frontend powered by a hybrid Python backend utilizing MediaPipe, OpenCV, and FastAPI.

---

## Table of Contents
1. [Key Features](#key-features)
2. [Project Architecture](#project-architecture)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Setup & Installation](#setup--installation)
   - [Prerequisites](#prerequisites)
   - [Frontend Setup](#frontend-setup)
   - [Backend / Python Setup](#backend--python-setup)
6. [API Endpoints](#api-endpoints)
7. [Python Engines / Scripts](#python-engines--scripts)
8. [License](#license)

---

## Key Features

- **🔍 AI Skin Analysis**: Upload a facial photo to analyze skin characteristics, tone (e.g., Fair, Medium, Deep), undertone (Warm, Cool, Neutral, Olive), and detect concerns (dryness, oiliness, redness, wrinkles, dark circles) with a confidence rating.
- **💄 Virtual Try-On**: Try on cosmetic products in real-time or customize colors/finishes for lipsticks, eyeshadows, blushes, eyeliners, and foundations.
- **✨ Real-Time Webcam Studio**: Supports live camera feed processing with face detection, facial landmarks, and gesture-controlled makeup applications (using MediaPipe).
- **📋 Personalized Recommendations**: Dynamic matching algorithms recommend perfect makeup shades (foundations, concealers, blushes, lipsticks, eyeshadows) and custom skincare routines based on your unique skin profile.
- **🛍️ Curated Products Dashboard**: Explore and filter professional-grade cosmetics matching your analysis profile.
- **👗 Lookbooks & Occasions**: Customized cosmetic styles optimized for events like weddings, dates, office work, or casual outings.
- **📝 Interactive Quiz**: A beauty and skincare questionnaire that defines user preferences and styles.

---

## Project Architecture

The application is designed using a **hybrid server-to-script and direct API pattern**:

1. **Next.js App Server (Frontend & API Route Coordinator)**:
   - Houses the UI layout, state management, pages, and components.
   - Provides wrapper Node.js API routes (`/api/advanced-makeup`, `/api/realtime-makeup`, `/api/transform-makeup`).
   - When these endpoints receive base64 image data, they spawn a child Python process to run specialized OpenCV/MediaPipe scripts and return the output.
   - Includes graceful JavaScript fallbacks if Python or its dependencies are unavailable.
2. **FastAPI Python Backend (Direct Performance Server)**:
   - A standalone FastAPI server running on `http://localhost:8000`.
   - The `/skin-analysis` page uploads images directly to `/analyze` on this server.
   - It performs fast, deterministic skin tone and concern classification using Pillow and image properties.
3. **Core Python Engines (`/scripts`)**:
   - Spawns CV2 & MediaPipe for heavy computation.
   - **`skin_analysis.py`**: Performs face mesh tracking, extracts forehead/cheek/nose skin patches, uses K-Means clustering for skin color classification, and runs texture/redness analyses.
   - **`advanced_realtime_makeup_engine.py`**: Applies digital filters to lips, eyes, cheeks, etc., using MediaPipe face mesh coordinates.

---

## Technology Stack

### Frontend & Wrapper Server
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Tailwind CSS Animate
- **UI Components**: Radix UI Primitives (Accordion, Alert Dialog, Dialog, Dropdown Menu, Progress, Slider, Tabs, Toast)
- **Icons**: Lucide React
- **Themes**: `next-themes` (Dark/Light mode)

### Python Core & Backend
- **Framework**: FastAPI (Uvicorn ASGI server)
- **Computer Vision**: OpenCV (cv2)
- **Machine Learning / Landmarks**: Google MediaPipe (Face Mesh & Face Detection)
- **Data & Math Processing**: NumPy, SciPy, Scikit-learn (K-Means Clustering)
- **Image Processing**: Pillow (PIL)

---

## Folder Structure

```
SkinAnalysis/
├── app/                           # Next.js App Router (Main UI Pages)
│   ├── api/                       # Next.js Server-side API Endpoints
│   │   ├── advanced-makeup/       # Spawns advanced_realtime_makeup_engine.py
│   │   ├── realtime-makeup/       # Spawns realtime_makeup_engine.py
│   │   ├── skin-analysis/         # Local mock/fallback endpoint
│   │   └── transform-makeup/      # Spawns makeup_transformation.py
│   ├── auth/                      # Login and Registration routes
│   ├── lookbook/                  # Styled makeup collections page
│   ├── occasions/                 # Custom look recommendations by occasion
│   ├── products/                  # Cosmetic product catalogs
│   ├── quiz/                      # Interactive user skin preferences questionnaire
│   ├── real-time-analysis/        # Live webcam analysis UI
│   ├── skin-analysis/             # Photo upload AI Skin Analysis page
│   ├── virtual-tryOn/             # Virtual makeup studio page
│   ├── globals.css                # Global styles
│   └── page.tsx                   # Interactive landing page
├── backend/                       # Python FastAPI Standalone Server
│   ├── main.py                    # Main FastAPI app & endpoint routing
│   ├── run.py                     # Entry point for Uvicorn on port 8000
│   └── (scaffold files)           # Standard configs
├── components/                    # Reusable React & UI Components
│   ├── ui/                        # Radix UI wrapper components
│   ├── navbar.tsx                 # Main Navigation bar
│   ├── hero-section.tsx           # Home Hero Section
│   ├── webcam-capture.tsx         # MediaStream camera component
│   └── realtime-makeup-studio.tsx # Advanced try-on canvas logic
├── scripts/                       # Core Python AI Engines
│   ├── requirements.txt           # Python package requirements
│   ├── skin_analysis.py           # MediaPipe + K-Means skin analysis
│   ├── advanced_realtime_makeup_engine.py # Advanced face filters & gesture commands
│   ├── realtime_makeup_engine.py  # Realtime face filter calculations
│   └── makeup_transformation.py   # Complete makeup transformations
├── package.json                   # Next.js package config
├── tailwind.config.js             # Tailwind configuration
└── tsconfig.json                  # TypeScript compiler settings
```

---

## Setup & Installation

### Prerequisites
- **Node.js**: v18+ and `npm` or `pnpm`
- **Python**: v3.9+ with `pip`

### Frontend Setup
1. From the project root (`SkinAnalysis/`), install dependencies:
   ```bash
   npm install
   ```
2. Run the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`.

### Backend / Python Setup
To run the standalone skin analysis server:
1. Navigate to the `backend` directory or work from the root and setup a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r scripts/requirements.txt
   ```
3. Run the FastAPI server:
   ```bash
   python backend/run.py
   ```
   The FastAPI server runs on `http://localhost:8000`. You can inspect documentation at `http://localhost:8000/docs`.

*Note: For the Next.js wrapper APIs to execute, make sure `python` or `python3` is available in your system path.*

---

## API Endpoints

### 1. Standalone Python FastAPI Backend (Port 8000)
- **`GET /`**: Server health status.
- **`GET /health`**: Detailed server parameters.
- **`POST /analyze`**: Accepts an uploaded image file (multipart/form-data) and returns a JSON dictionary of skin tone, undertone, detected concerns, and product recommendations.

### 2. Next.js API Routes (Port 3000)
- **`POST /api/advanced-makeup`**: Spawns `advanced_realtime_makeup_engine.py` with base64 image data and makeup settings JSON.
- **`POST /api/transform-makeup`**: Spawns `makeup_transformation.py` with a base64 image and target style name.
- **`POST /api/skin-analysis`**: Returns simulated fallback analysis results if the main FastAPI backend is offline.

---

## Python Engines / Scripts

The python engine files located in the `/scripts` directory are used by server-side APIs:

- **`skin_analysis.py`**: Initiates a MediaPipe Face Mesh, segments face regions (forehead, left/right cheeks, nose), clusters skin colors using Scikit-Learn KMeans, analyzes red channel dominance for redness detection, calculates textures for oiliness, and estimates line densities for wrinkle detection.
- **`advanced_realtime_makeup_engine.py`**: Takes camera frame base64 input and overlays color overlays on lips/face using MediaPipe landmarks. Also implements gesture detection (e.g., peace sign, thumbs up) to cycle through styles dynamically.
- **`makeup_transformation.py`**: Re-maps full facial structures and applies pre-designed aesthetic looks (romantic, bold, natural, etc.) onto input images.