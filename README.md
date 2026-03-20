# HoopsHub

A mobile app for finding pickup basketball games and courts near you.

Built with [Expo](https://expo.dev) (React Native), [Expo Router](https://docs.expo.dev/router/introduction), and [Uniwind](https://uniwind.dev) for styling.

## Tech Stack

- **Expo / React Native** — cross-platform mobile (iOS, Android, web)
- **Expo Router** — file-based navigation
- **Uniwind + Tailwind CSS v4** — utility-first styling for native
- **Zustand** — global auth state
- **Axios** — API client
- **React Hook Form + Zod** — form validation
- **expo-secure-store** — secure token storage on native (localStorage on web)

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Unauthenticated screens (login, register)
│   ├── (tabs)/          # Authenticated tab screens (home, explore, courts, games, profile)
│   └── _layout.tsx      # Root layout — font loading, auth guard, splash screen
├── api/                 # API layer (auth, courts, games, profiles)
├── store/               # Zustand stores (authStore)
├── components/          # Shared UI components
├── tw/                  # className-typed RN component wrappers (View, Text, TextInput, etc.)
├── types/               # Shared TypeScript types
├── hooks/               # Custom hooks
├── constants/           # Theme constants
└── global.css           # Tailwind theme tokens (colors, fonts)
```

## Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Copy the environment file and fill in your API URL

   ```bash
   cp .env.example .env
   ```

3. Start the dev server

   ```bash
   npx expo start
   ```

   Then open in an iOS simulator, Android emulator, or on device.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | ✅ | Base URL of the backend API, including `/api` suffix |

Variables prefixed with `EXPO_PUBLIC_` are inlined at build time and safe to expose to the client. Do **not** put secrets in `EXPO_PUBLIC_` variables.

### EAS Builds

Set environment variables for each build profile in your EAS dashboard or in `eas.json`:

```json
{
  "build": {
    "development": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api-staging.hoopshub.com/api"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.hoopshub.com/api"
      }
    }
  }
}
```

## Theme Tokens

Defined in `src/global.css`:

| Token | Value |
|---|---|
| `bg-dark` | `#0A0A0A` |
| `bg-surface` | `#181818` |
| `text-cream` | `#F0EDE8` |
| `text-orange` | `#FF5C00` |
| `text-muted` | `#7A7870` |
| `text-danger` | `#f87171` |
| `font-display` | Bebas Neue |
| `font-sans` | DM Sans |

## Authentication Flow

The root layout (`src/app/_layout.tsx`) restores the session from secure storage on launch and redirects to `/(auth)/login` or `/(tabs)` accordingly. The auth store (`src/store/authStore.ts`) manages login, register, logout, and token persistence.
