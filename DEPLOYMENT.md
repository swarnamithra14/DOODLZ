# 🚀 DOODLZ — Deployment Guide

This guide explains how to deploy **DOODLZ** for free so industry reviewers and friends can play the live game online from anywhere.

---

## 📌 Architecture Overview

Because DOODLZ relies on persistent, bidirectional WebSockets (**Socket.IO**), the architecture is deployed as:
1. **Backend Server** (Node.js + Express + Socket.IO) on a persistent web container service (**Render** or **Railway**).
2. **Frontend Client** (React + Vite) on a fast global edge CDN (**Vercel** or **Render**).
3. **Database** (MySQL) on a free cloud MySQL provider (**Aiven**, **Railway**, or **Clever Cloud**).

---

## Option A: Recommended Free Deployment (Render + Vercel)

### Part 1: Deploy Backend to Render (Free)

1. Sign up / Log in to [Render.com](https://render.com) using your GitHub account (`swarnamithra14`).
2. Click **New +** → Select **Web Service**.
3. Choose your repository: `swarnamithra14/DOODLZ`.
4. Configure the Web Service settings:
   - **Name**: `doodlz-server` (or your preferred name)
   - **Region**: Closest to you (e.g., Singapore or Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Instance Type**: `Free`
5. Click **Advanced** → **Add Environment Variables**:
   ```ini
   PORT = 5000
   CLIENT_URL = https://your-doodlz-frontend.vercel.app (You will update this with your frontend URL after Part 2)
   DB_HOST = (Your cloud MySQL host or leave blank for in-memory mode)
   DB_PORT = 3306
   DB_USER = (Your cloud MySQL user)
   DB_PASSWORD = (Your cloud MySQL password)
   DB_NAME = doodlz
   ```
6. Click **Deploy Web Service**.
7. Once deployed, Render will provide a live URL, for example:  
   `https://doodlz-server.onrender.com`

---

### Part 2: Deploy Frontend to Vercel (Free)

1. Sign up / Log in to [Vercel.com](https://vercel.com) using your GitHub account.
2. Click **Add New...** → **Project**.
3. Import your repository: `swarnamithra14/DOODLZ`.
4. Configure the Project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   ```ini
   VITE_SERVER_URL = https://doodlz-server.onrender.com
   ```
   *(Paste your actual Render backend URL from Part 1 here)*
6. Click **Deploy**.
7. Vercel will build and assign you a live domain, e.g.:  
   `https://doodlz.vercel.app`

---

### Part 3: Link Backend and Frontend

1. Go back to your **Render** dashboard → `doodlz-server` → **Environment**.
2. Update `CLIENT_URL` to your live Vercel URL:
   ```ini
   CLIENT_URL = https://doodlz.vercel.app
   ```
3. Click **Save Changes** (Render will redeploy with CORS configured for your frontend).
4. Visit `https://doodlz.vercel.app` — your game is live on the internet!

---

## 🗄️ (Optional) Free Cloud MySQL Setup

If you want persistent match storage in the cloud:

1. **Aiven for MySQL** ([aiven.io](https://aiven.io)):
   - Offers a free MySQL tier.
   - Copy the provided Host, Port, User, and Password into your Render backend environment variables.
2. **Railway MySQL** ([railway.app](https://railway.app)):
   - One-click MySQL service with automated connection strings.

*(Note: If you don't configure a database, DOODLZ gracefully defaults to in-memory mode and is 100% playable!)*
