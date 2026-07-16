# Platica App

Personal finance mobile app built with Expo (React Native) + TypeScript.

## Stack

- **Runtime**: Expo SDK 57 / React Native 0.76
- **Navigation**: expo-router (file-based routing)
- **Theming**: Custom dark/light theme following system preference
- **i18n**: i18next (es, en, de) — auto-detects device language
- **Storage**: expo-secure-store (auth tokens)
- **Backend**: Shared wallets-backend API

## Project Structure

```
app/                  # File-based routes (expo-router)
  (auth)/             # Auth group (login)
  (tabs)/             # Main tab navigation (dashboard, transactions, accounts, profile)
  _layout.tsx         # Root layout with ThemeProvider
src/
  components/ui/      # Reusable UI primitives (Button, Card)
  hooks/              # Custom hooks (useAuth)
  i18n/               # i18next config + locale JSONs
  screens/            # Screen components
  services/           # API client, auth service
  theme/              # Colors, light/dark themes, ThemeContext
```

## Getting Started

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

## Environment

Copy `.env.example` to `.env` and configure:
- `EXPO_PUBLIC_API_URL` — backend API base URL
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth client ID
