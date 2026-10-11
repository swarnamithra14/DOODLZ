# 🚀 Doodlz — Live Deployment Guide

Deploy Doodlz live to the web so you and your friends can play across phones, tablets, and laptops!

---

## 🌟 Option A: Firebase Hosting (Direct to `doodlz-game.web.app`)

Since your Firebase project **`doodlz-game`** is already active and configured, Firebase Hosting provides a free, blazingly fast SSL-secured web URL.

### Step 1: Log in to Firebase CLI (One-time)
Open a terminal in your project directory (`d:\DOODLZ`) and run:
```bash
npx firebase-tools login
```
> A browser window will open asking you to sign into the Google account where `doodlz-game` was created. Click **Allow**.

### Step 2: Deploy in One Command!
Run:
```bash
npm run deploy:firebase
```
*(Or `npx firebase-tools deploy --only hosting`)*

🎉 **Your game is live!** Firebase will output your live URL:
- `https://doodlz-game.web.app`
- `https://doodlz-game.firebaseapp.com`

---

## ⚡ Option B: Vercel (1-Click Deployment from GitHub)

Your GitHub repository is already pushed to:
👉 **[github.com/swarnamithra14/DOODLZ](https://github.com/swarnamithra14/DOODLZ)**

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **Add New...** > **Project**.
3. Under *Import Git Repository*, select **`DOODLZ`**.
4. Framework Preset will automatically detect **Vite**.
5. Click **Deploy**!
   *(The project has built-in fallbacks and `vercel.json` preconfigured, so you don't even have to manually type environment variables unless you wish to)*.

Within 30 seconds, Vercel gives you a custom URL (e.g., `https://doodlz-swarnamithra.vercel.app`).

---

## 📱 Playing with Friends on Phones & Laptops

1. **Host creates a room**:
   - Open the live URL on your computer or phone.
   - Enter your name, choose an avatar, and click **Create Room**.
   - Note the **4-letter Room Code** (e.g. `K9X2`).
2. **Friends join**:
   - Share the URL and the 4-letter code via WhatsApp, Discord, or text.
   - Friends open the link on mobile or desktop, enter their name and the room code, and click **Join Room**.
3. **Play!**:
   - The drawer draws smoothly using touch/finger on phones or mouse/trackpad on laptop.
   - Guessers type their guesses in real time.
   - Authoritative host timers, score updates, and drawer rotations sync automatically across all devices!
