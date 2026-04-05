# cl2

Expo (React Native) learning app: topic “grove” maps, generated readings, ingest reader, recommendations, and local notes—styled as a calm, forest-and-paper UI.

## Requirements

- **Node.js** 18+ (LTS recommended)
- **npm**
- **Expo Go** on a physical device, or an emulator with the Expo dev tools
- For **live knowledge data**: a Supabase project (optional; the app falls back to a built-in catalog)

## Install

```bash
git clone <repo-url> cl2
cd cl2
npm install
```

### Environment variables (Expo app)

Create a **`.env`** file in the project root (same folder as `package.json`). Expo only exposes variables that start with **`EXPO_PUBLIC_`** to the client.

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL (`https://….supabase.co`) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `EXPO_PUBLIC_API_URL` | Optional Flask API base, e.g. `http://192.168.1.10:5000` (use your machine’s LAN IP on a real phone) |

If Supabase vars are omitted, the app uses the **bundled local knowledge graph** and still runs.

> **Expo Go + Reanimated:** This project pins **`react-native-worklets@0.5.1`** to match Expo SDK 54’s native modules. If you change worklets/Reanimated versions, align them with [Expo’s bundled versions](https://docs.expo.dev/versions/latest/) or use a dev build.

## Run

```bash
npx expo start
```

Then scan the QR code with Expo Go (Android) or the Camera app (iOS), or press `a` / `i` for Android / iOS simulator.

After dependency or native-related changes, clear the Metro cache:

```bash
npm run start:clear
# or: npx expo start --clear
```

### Web (optional)

```bash
npm run web
```

## Optional Python backend

A small Flask API lives in **`backend/`** (used only if `EXPO_PUBLIC_API_URL` is set). Backend env vars (Supabase service key, DB, OpenAI, etc.) are separate from the Expo `EXPO_PUBLIC_*` keys.

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

Default URL: `http://127.0.0.1:5000`.

## How the app works (quick tour)

### Flow

- **Production build path:** Onboarding → auth screens → commute/preferences → **pick interests** → **Main** tabs.
- **Development (`__DEV__`):** The app opens **Main** tabs immediately so you can iterate on Learn/Home without repeating onboarding.

### Main tabs

- **Home** — Entry dashboard and streak-style stats (local).
- **Learn** — Three sections:
  - **Grove** — Radial **topic maps** per selected interest; tap a branch for a preview sheet (generate reading, optional immersive fullscreen). Swipe horizontally between topics. Data comes from **Supabase** when configured, else **local JSON**.
  - **Ingest** — Paste a URL and open the **in-app reader** (WebView) with listen / summarize / save actions.
  - **For you** — Article cards ranked from **local recommendation data** using your stored interests.
- **Notes** — Saved thoughts and snippets, grouped by topic.
- **Profile** — Edit interests, sign out, and app metadata.

### Data & services

- **Supabase** — Knowledge interests/subtopics when `EXPO_PUBLIC_SUPABASE_*` is set (`src/lib/supabase.js`, `src/services/knowledgeSupabase.js`).
- **LLM / readings** — `src/services/llmService.js` (can use remote APIs when keys are available; otherwise sensible fallbacks).
- **Local storage** — AsyncStorage for profile, interests, notes, streaks (`src/services/localProfileStorage.js` and related).

### Database schema (Supabase)

SQL for the knowledge catalog is in **`supabase/knowledge_schema.sql`**—run it in the Supabase SQL editor to match what the app expects.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run start:clear` | Start with cleared Metro cache |
| `npm run android` / `npm run ios` | Open on device/simulator via Expo |

## Project layout (high level)

- `App.js` — Navigation shell, fonts, tabs vs onboarding.
- `src/screens/` — Screens by area (Auth, Learn, Home, Notes, Profile).
- `src/components/knowledge/` — Grove graph, preview sheet, immersive canvas, edges, texture.
- `src/components/reader/` — Reader chrome (progress, glass action panel).
- `src/navigation/` — Learn stack + tab metrics.
- `backend/` — Optional Flask API.

---

**License / private:** See `package.json` (`"private": true`).
