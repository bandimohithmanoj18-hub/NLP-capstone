# Vercel Deployment Guide

This guide walks you through deploying the **AI Consumer Complaint & NCH Guidance System** frontend on **Vercel** and linking it with your backend API.

---

## 1. Overview of the Deployment Architecture

- **Frontend (Vercel)**:
  - React 18 + TypeScript + Vite + Tailwind CSS.
  - Deployed globally on Vercel's Edge CDN.
  - Automatically configured with SPA routing via `vercel.json`.
- **Backend (Render / Railway / Docker / VPS)**:
  - FastAPI + SQLite (`app.db`) + RAG FAISS + Tesseract OCR + ReportLab/DOCX generators.
  - Runs in a containerized or persistent Python 3.12+ environment with persistent disk storage for database and documents.

---

## 2. Deploying the Frontend to Vercel

### Method A: Via Vercel Dashboard & GitHub (Recommended)

1. **Push your code to GitHub / GitLab / Bitbucket**:
   ```bash
   git add .
   git commit -m "Configure Vercel deployment and dynamic API URL"
   git push origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Sign in and select your repository (`NLP-CAPSTONE`).

3. **Configure Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Select `frontend` (or leave as root `/`, since the repository contains both a root `vercel.json` and a `frontend/vercel.json`).
   - If Root Directory is `frontend`:
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`
   - If Root Directory is `/` (root):
     - Settings are automatically picked up from `vercel.json`.

4. **Add Environment Variables**:
   In the **Environment Variables** section:
   - `VITE_API_URL`: `https://your-backend-service-url.com` *(optional: leave blank if you use local proxy or reverse proxy)*

5. **Deploy**:
   - Click **Deploy**. Vercel will build and assign you a production URL (e.g., `https://your-project.vercel.app`).

---

### Method B: Via Vercel CLI (Direct Terminal Deployment)

You can deploy directly from your local terminal using `npx vercel`:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Run Vercel deployment CLI
npx -y vercel

# Follow the interactive prompts:
# ? Set up and deploy "~/NLP-CAPSTONE/frontend"? [Y/n] y
# ? Which scope do you want to deploy to? (Select your team/account)
# ? Link to existing project? [y/N] n
# ? What's your project's name? ai-consumer-complaint-portal
# ? In which directory is your code located? ./
# ? Want to modify these settings? [y/N] n
```

To deploy directly to production:
```bash
npx -y vercel --prod
```

---

## 3. Hosting the Backend (FastAPI + SQLite + OCR)

Because the backend needs persistent storage for SQLite (`app.db`), OCR uploads (`data/uploads`), and generated complaints (`data/generated`), host the backend on a container-friendly platform:

### Option 1: Render.com (Free / Low Cost)
1. Go to [render.com](https://render.com) and click **New Web Service**.
2. Connect your repository.
3. Configure:
   - **Environment**: `Python` (or `Docker` using the included [Dockerfile](file:///c:/Users/bandi/Downloads/NLP-CAPSTONE/Dockerfile))
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Copy the assigned URL (e.g. `https://nlp-capstone-api.onrender.com`).
5. Paste it as `VITE_API_URL` in your Vercel project settings.

### Option 2: Railway.app (One-Click Docker)
1. Go to [railway.app](https://railway.app) and create a **New Project from GitHub Repo**.
2. Railway detects the `Dockerfile` in the root and builds the complete container with Tesseract OCR pre-installed.
3. In project settings, generate a domain (e.g. `https://nlp-capstone.up.railway.app`).
4. Set this domain as `VITE_API_URL` in Vercel.

---

## 4. Reverse Proxying API via Vercel (Optional)

If you prefer your frontend to call `/api/v1/...` on the same domain without dealing with CORS, update your `vercel.json` with a rewrite rule pointing to your deployed backend:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-service.onrender.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 5. Verification Checklist

- [x] `vercel.json` configured for root monorepo and `frontend/vercel.json` configured for subfolder builds.
- [x] Dynamic backend URL reading implemented in `frontend/src/services/api.ts` (`VITE_API_URL`).
- [x] TypeScript declarations registered in `frontend/src/vite-env.d.ts`.
- [x] Production build passes cleanly (`npm run build` succeeds).
- [x] SPA client routing (`index.html` fallback) configured for non-asset routes.
