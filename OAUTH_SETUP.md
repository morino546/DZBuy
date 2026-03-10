# DZBuy OAuth Setup (Google + Facebook)

## 1) Install dependencies
```bash
npm install
```

## 2) Create environment file
```bash
cp .env.example .env
```

Then fill:
- `SESSION_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`

## 3) Google Console
Create OAuth client and set Authorized redirect URI:
- `http://localhost:3000/auth/google/callback`

## 4) Meta (Facebook) Developers
Create app and set Valid OAuth Redirect URI:
- `http://localhost:3000/auth/facebook/callback`

## 5) Run server
```bash
npm start
```

Open:
- `http://localhost:3000`

## Notes
- OAuth works only when server is running (not via direct file open).
- If provider keys are missing, corresponding route returns `503`.
- Session is cookie-based using `express-session`.
