# HoopsHub NZ — Expo App

## Project Overview
HoopsHub NZ is a basketball pickup game finder app for New Zealand. This repo is the Expo mobile app.

## Tech Stack
- **Framework**: Expo (SDK 51+) with Expo Router (file-based routing)
- **Language**: TypeScript
- **Styling**: Uniwind (Tailwind v4 for React Native) — use `className` for static styles, inline `style` for dynamic/computed values
- **State**: Zustand (`src/store/authStore.ts`)
- **Data fetching**: React Query (`@tanstack/react-query`) — use `useQuery` / `useMutation`, not `useState`/`useEffect`
- **Forms**: react-hook-form + zod
- **HTTP**: axios (`src/api/client.ts`)
- **Auth storage**: expo-secure-store (token key: `auth_token`)
- **Maps**: react-native-maps
- **Icons**: @expo/vector-icons (Ionicons)

## API
- **Local**: `http://hoopshub-api.test/api`
- **Auth**: Bearer token via `Authorization` header
- Token is loaded from SecureStore and attached automatically by the axios interceptor

## Design System

### Colors
```
Background:   #0A0A0A
Surface:      #181818
Surface 2:    #202020
Orange:       #FF5C00
Orange light: #FF7A2B
Text:         #F0EDE8
Muted:        #7A7870
Border:       rgba(255,255,255,0.08)
Green:        #22C55E
Red:          #EF4444
Amber:        #F59E0B
```

### Typography
- **Display/headings**: Bebas Neue (loaded via expo-font) — use the `<Heading>` component (`src/components/ui/Heading.tsx`), never raw `<Text>` with `font-display`
  - `level={1}` (`text-4xl`) — page/screen titles
  - `level={2}` (`text-2xl`) — section headers
  - `level={3}` (`text-xl`) — subsection headers
- **Body**: DM Sans

### Component conventions
- Dark backgrounds everywhere — never white/light surfaces
- Orange (#FF5C00) for primary actions and active states
- Subtle borders (rgba white 8% opacity) between elements
- Rounded corners: 8px for small elements, 12px for cards, 16px for sheets

## File Structure
```
app/
├── _layout.tsx                  # Root — loads auth, handles redirects
├── (auth)/
│   ├── _layout.tsx              # Redirects to tabs if authenticated
│   ├── login.tsx
│   └── register.tsx
└── (app)/
    ├── _layout.tsx              # Protected — redirects to login if not authenticated
    ├── (tabs)/
    │   ├── _layout.tsx          # Bottom tab bar (Courts / Games / Profile)
    │   ├── index.tsx            # Court map screen
    │   ├── games.tsx            # Game feed screen
    │   └── profile.tsx          # Profile screen
    ├── courts/
    │   └── [id].tsx             # Court detail
    ├── games/
    │   ├── [id].tsx             # Game detail
    │   └── create.tsx           # Create game
    └── profile/
        └── edit.tsx             # Edit profile

src/
├── api/
│   ├── client.ts                # Axios instance — attaches Bearer token automatically
│   ├── auth.ts                  # register, login, logout, me
│   ├── courts.ts                # getCourts, getCourt, createCourt
│   ├── games.ts                 # getGames, getGame, createGame, joinGame, leaveGame, updateGame, deleteGame, getMyGames, getCourtGames
│   ├── queries.ts               # Centralized queryOptions — courtQueries, gameQueries, userQueries, invitationQueries
│   ├── invitations.ts           # getMyInvitations, sendInvitation, respondToInvitation, searchInvitable, getGameInvitations
│   └── profiles.ts              # getProfile, updateProfile
├── components/
│   ├── ui/                      # Shared: Heading, Badge, FilterChips, Stars, CityPicker, ErrorState, FormInput
│   ├── courts/                  # CourtCard, CourtPin
│   ├── games/                   # GameCard, UpcomingGameCard, ScheduleGameCard, SectionHeader, PlayerSpots, SkillTag, GameHistoryRow
│   └── profile/                 # ProfileIdentity, ProfileStats, ProfileRepSection
├── hooks/
│   ├── useGames.ts
│   └── useProfile.ts
├── store/
│   └── authStore.ts             # user, token, isAuthenticated, isLoading, login, register, logout, loadUser
└── types/
    └── index.ts                 # User, CurrentUser, Court, Game, GamePlayer, Rating, GameInvitation, ApiError
```

## Auth Flow
- `app/_layout.tsx` calls `authStore.loadUser()` on mount
- If no token in SecureStore → redirect to `/(auth)/login`
- If token exists → fetch `/me` → set user in store → redirect to `/(app)/(tabs)`
- `app/(app)/_layout.tsx` — if not authenticated redirect to login
- `app/(auth)/_layout.tsx` — if authenticated redirect to tabs
- Logout: delete token from SecureStore → clear store → router.replace('/(auth)/login')

## TypeScript Types (src/types/index.ts)
```typescript
User, Profile, Court, Game, GamePlayer, Rating, ApiError
```
Always import types from `src/types` — never redefine inline.

## Key Business Rules (reflected in UI)
- Games have status: open / full / cancelled / completed
- Skill levels: beginner / intermediate / advanced / comp / any
- Game types: 3v3 / 5v5 / casual
- Court types: indoor / outdoor
- Player ratings are 1-5 across: punctuality, sportsmanship, skill_accuracy, fun_to_play
- Host is always shown as first player in game_players list
- **Join / Leave / Cancel only happen from the game detail screen** (`games/[id].tsx`) — never from cards
- `GameCard` shows a green "Joined" badge when the auth user is in `game_players`
- Cancel option (host only) and Leave option (non-host) are in the bottom action bar of the detail screen
- **Invitations**: any confirmed player (including host) can invite; `invitationQueries.forGame` only runs when the current user is in `game_players`
- Pending invitations count against open spots — `emptySlots = max_players - confirmed - pending`; invite button hides when `emptySlots === 0`

## Skill Level Colors
```
beginner:     blue   (#3B82F6)
intermediate: orange (#FF5C00)
advanced:     amber  (#F59E0B)
comp:         red    (#EF4444)
any:          green  (#22C55E)
```

## Game Status Colors
```
open:      green  (#22C55E)
full:      red    (#EF4444)
filling:   amber  (#F59E0B)  — when >70% spots filled
cancelled: muted  (#7A7870)
completed: muted  (#7A7870)
```

## Groups Feature
- Groups are recurring pickup communities (e.g. "Saturday Morning Crew at Cowles")
- A group can be tied to a specific court or be court-agnostic
- Games can optionally belong to a group — shown on group detail screen
- Group members get notified when a new game is posted to their group
- Public groups appear in discovery list, private groups are invite only
- Owner role shown with a crown/badge on member list

## Navigation Patterns
- Use `router.push()` for forward navigation
- Use `router.back()` for back navigation
- Use `router.replace()` for auth redirects (no back stack)
- Pass IDs via route params: `router.push('/games/123')`
- Read params with `useLocalSearchParams()`

### Native Stack Headers
Stack screens use the native React Navigation header — never render a custom `View`-based header with a manual back button. Configure header options via `<Stack.Screen options={...} />` inside the screen component.

Global header style is set in `app/_layout.tsx` (dark bg, cream tint, Bebas Neue title font). Per-screen overrides:
```typescript
// Title only
<Stack.Screen options={{ title: 'SETTINGS' }} />

// Title + right action (e.g. Save)
<Stack.Screen options={{
  title: 'EDIT PROFILE',
  headerRight: () => <Pressable onPress={save}><Text>Save</Text></Pressable>,
}} />

// Custom left button (e.g. close instead of back)
<Stack.Screen options={{
  title: 'POST A GAME',
  headerLeft: () => <Pressable onPress={router.back}><Ionicons name="close" /></Pressable>,
}} />
```

**Exceptions — screens that keep custom headers:**
- `(tabs)/index.tsx` and `(tabs)/profile.tsx` — `NativeTabs` screens have no Stack header; their inline header `View` is intentional.

## Common Patterns

### Fetching data
Use React Query — not `useState`/`useEffect`. Always use `queryOptions` from `src/api/queries.ts` — never hardcode queryKeys inline.
```typescript
import { gameQueries, courtQueries, userQueries } from '@/api/queries';

const { data: game } = useQuery(gameQueries.detail(id));
const { data: courts = [] } = useQuery(courtQueries.list(activeCity));
const { data: upcoming = [] } = useQuery(gameQueries.myUpcoming());
```

Available query factories:
- `courtQueries.list(city)` — courts for a city, staleTime 60min
- `courtQueries.detail(id)` — single court, staleTime 30min
- `gameQueries.feedForCity(city, enabled)` — open games feed for city, staleTime 2min
- `gameQueries.list(params?)` — games with arbitrary params, staleTime 2min
- `gameQueries.detail(id)` — single game, staleTime 1min
- `gameQueries.forCourt(courtId)` — games at a court
- `gameQueries.myUpcoming()` — current user's upcoming games
- `userQueries.detail(id)` — public user profile
- `invitationQueries.myPending()` — current user's pending invitations (inbox)
- `invitationQueries.forGame(gameId)` — pending invitations for a game (only fetch when user is a confirmed player)

### Mutations
```typescript
const mutation = useMutation({
  mutationFn: () => joinGame(id),
  onSuccess: () =>
    queryClient.invalidateQueries({ queryKey: gameQueries.detail(id).queryKey }),
  onError: () => Alert.alert('Error', 'Something went wrong.'),
});
```
Always use `.queryKey` from the query factory for invalidations — never hardcode the key.

### Form with react-hook-form + zod
```typescript
const schema = z.object({ email: z.string().email() });
type FormData = z.infer<typeof schema>;

const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

### Pull to refresh
```typescript
const [refreshing, setRefreshing] = useState(false);
const onRefresh = async () => {
  setRefreshing(true);
  await fetchData();
  setRefreshing(false);
};
// Add to ScrollView/FlatList:
refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF5C00" />}
```

## Build Order
1. Shared UI components (Button, Input, Badge, Card, Avatar)
2. Login screen
3. Register screen
4. Courts map screen
5. Court detail screen
6. Game feed screen
7. Game detail screen
8. Create game screen
9. Profile screen
10. Edit profile screen
11. Groups list screen (new tab or discovery section)
12. Group detail screen
13. Create group screen
14. Empty states, loading states, error states
15. Pull to refresh on all lists
16. 