# Doodlz — Firebase Setup & Security Guide

This document provides complete instructions for connecting **Doodlz** to your Firebase backend.

---

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Name your project (e.g., `doodlz-game`).
4. Google Analytics is optional; you can disable it for a faster setup.
5. Click **Create project** and wait for provisioning to finish.

---

## 2. Register the Web Application

1. In the Project Overview page, click the Web icon (**`</>`**) to register a web app.
2. Enter an App nickname (e.g., `Doodlz Web`).
3. Leave "Firebase Hosting" unchecked for now (or check it if you wish to host on Firebase Hosting).
4. Click **Register app**.
5. Firebase will display your `firebaseConfig` keys containing:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

---

## 3. Configure Local Environment Variables

1. In your local project root (`D:\DOODLZ`), copy `.env.example` to create a `.env.local` file:
   ```powershell
   copy .env.example .env.local
   ```
2. Populate `.env.local` with your credentials:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=doodlz-game.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=doodlz-game
   VITE_FIREBASE_STORAGE_BUCKET=doodlz-game.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:1234567890:web:...
   ```
3. **Security Note**: Never commit `.env` or `.env.local` files to Git. They are ignored by [.gitignore](file:///d:/DOODLZ/.gitignore).

---

## 4. Enable Authentication

1. In the Firebase Console sidebar, select **Build > Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab:
   - Enable **Anonymous** (allows players to join instantly as guests without passwords).
   - *(Optional)* Enable **Email/Password** or **Google** if persistent player accounts are desired later.
4. Save the changes.

---

## 5. Create Cloud Firestore Database

1. In the sidebar, select **Build > Firestore Database**.
2. Click **Create database**.
3. Choose a Firestore location close to your players (e.g., `nam5 (us-central)` or `asia-south1`).
4. Select **Start in production mode** (all reads and writes are locked down by default).
5. Click **Create**.

---

## 6. Deploy Security Rules

This repository provides production-ready security rules in [firestore.rules](file:///d:/DOODLZ/firestore.rules).

### Option A: Via Firebase CLI (Recommended)
1. Install Firebase CLI globally (if not already installed):
   ```powershell
   npm install -g firebase-tools
   ```
2. Login to your Google account:
   ```powershell
   firebase login
   ```
3. Initialize firestore in the project directory:
   ```powershell
   firebase use --add <your-firebase-project-id>
   ```
4. Deploy the security rules:
   ```powershell
   firebase deploy --only firestore:rules
   ```

### Option B: Via Firebase Console
1. Open **Firestore Database > Rules** tab in the Firebase Console.
2. Paste the contents of [firestore.rules](file:///d:/DOODLZ/firestore.rules).
3. Click **Publish**.

---

## 7. Cost Control & Free Quotas (Spark Plan)

Doodlz is designed to operate safely inside Firebase's generous **Free Spark Plan**:
- **Firestore**: 50,000 document reads/day, 20,000 document writes/day, 1 GB storage.
- **Authentication**: Unlimited anonymous authentication.
- **Network Egress**: 10 GB/month free.

**Cost Control Best Practices:**
- Drawing strokes are sent as batched objects rather than continuous pixel streams to minimize Firestore document write counts.
- Firestore listeners are detached on React component unmount (`useEffect` return cleanup).

---

## 8. Running and Testing Locally

1. Restart your Vite development server to load newly created `.env.local` variables:
   ```powershell
   npm run dev
   ```
2. Check the browser developer console:
   - If configured: Firebase initializes with your project ID.
   - If unconfigured: Doodlz runs automatically in offline/local simulator mode.
