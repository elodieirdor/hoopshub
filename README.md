# HoopsHub

A mobile app for finding pickup basketball games and courts near you.

Built with [Expo](https://expo.dev) (React Native), [Expo Router](https://docs.expo.dev/router/introduction), and [NativeWind](https://www.nativewind.dev) for styling.

## Tech Stack

- **Expo / React Native** — cross-platform mobile (iOS & Android)
- **Expo Router** — file-based navigation
- **NativeWind v5 + Tailwind CSS v4** — utility-first styling via `react-native-css`
- **Zustand** — global auth state
- **Axios** — API client
- **React Hook Form + Zod** — form validation
- **expo-secure-store** — secure token storage

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
├── tw/                  # CSS-wrapped RN components (View, Text, TextInput, etc.)
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

2. Start the dev server

   ```bash
   npx expo start
   ```

   Then open in an iOS simulator, Android emulator, or on device via [Expo Go](https://expo.dev/go).

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

The root layout (`src/app/_layout.tsx`) restores the session from secure storage on launch and redirects to `/(auth)/login` or `/(tabs)` accordingly. The auth store (`src/store/authStore.ts`) manages login, register, logout, and token persistence via `expo-secure-store`.
