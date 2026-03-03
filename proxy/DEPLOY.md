# FreePass Proxy — Deployment Guide

## Files in this project:
```
proxy/
├── server.js        ← Backend proxy logic
├── package.json     ← Dependencies
└── public/
    └── index.html   ← Frontend UI
```

---

## Deploy on Railway (Recommended)

1. Go to https://railway.app and sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Upload these files to a GitHub repo first:
   - Go to https://github.com/new → create a repo
   - Upload all 3 files (keeping the folder structure)
4. Connect that repo to Railway
5. Railway auto-detects Node.js and runs `npm start`
6. Click **"Generate Domain"** to get your public URL
7. Done! 🎉

---

## Deploy on Render

1. Go to https://render.com and sign up
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repo (same as above)
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
5. Click **"Create Web Service"**
6. Wait ~2 minutes for it to build
7. Your URL will be: `https://your-app-name.onrender.com`

---

## How to use it once deployed:

- Visit your deployed URL
- Type any website (e.g. `google.com`) in the box
- Click **Browse →**
- The site loads through your proxy!

---

## Notes:
- Some sites (Netflix, Google login, etc.) block proxies
- Works best for reading/browsing regular websites
- No data is stored or logged
