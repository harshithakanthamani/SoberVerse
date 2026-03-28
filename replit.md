# SoberVerse - Replit Setup

## Project Overview
SoberVerse is a cross-platform application built with Angular and Tauri. In the Replit environment, we're running the Angular web frontend only (Tauri is for desktop apps and not applicable here).

**Purpose**: Track habits and addictions with tools for analytics, reminders, and progress monitoring.

**Tech Stack**:
- Frontend: Angular 20
- UI Libraries: PrimeNG, Angular Material, Tailwind CSS
- Charts: Chart.js
- Local Storage: Dexie (IndexedDB wrapper)
- i18n: Transloco (English-only)

## Current Configuration

### Development Environment
- **Port**: 5000 (configured for Replit webview)
- **Host**: 0.0.0.0 (allows external access)
- **Allowed Hosts**: all (required for Replit proxy)
- **Workflow**: "Start application" runs `npx ng serve --configuration development --port 5000 --host 0.0.0.0 --disable-host-check`

### Authentication
- **Type**: Offline, localStorage-only (fully private)
- **Storage**: `sv_auth_user` in `localStorage` (SHA-256 hashed password), `sv_auth_session` in `sessionStorage`
- **Guard**: `src/app/guards/auth.guard.ts` — all routes except `/login` are protected
- **Service**: `src/app/services/auth.service.ts`
- **Login Page**: `src/app/pages/login/` — tabbed Sign In / Create Account with animations

### Environment Variables
The app uses optional Google Gemini API integration (for AI features). Configuration is in:
- `src/environments/environment.ts` (generated, gitignored)
- `src/environments/.env` (user secrets, gitignored)
- `src/environments/.env.example` (template)

Current environment file has empty API keys - the app will work without them, but AI features will be unavailable.

### Deployment
- **Type**: Static site deployment
- **Build Command**: `npm run build`
- **Public Directory**: `dist/addiction-tracker/browser`

## Project Structure
```
src/
├── app/
│   ├── components/       # Shared components (header, substance, achievements, etc.)
│   ├── dto/              # Data transfer objects
│   ├── guards/           # Route guards (auth.guard.ts)
│   ├── pages/            # Route pages (home, login, achievements, etc.)
│   ├── services/         # Angular services (auth, achievement, substance, etc.)
│   └── app.routes.ts     # Route definitions (all guarded except /login)
├── assets/
│   ├── i18n/en.json      # English translations (only language supported)
│   └── icons/            # SVG icons for achievements/UI
├── environments/         # Environment configuration
└── styles.scss           # Global styles (animations, page transitions)

src-tauri/                # Tauri desktop app code (not used in Replit)
```

## Key Files
- `src/app/services/auth.service.ts` — Auth logic (register, login, logout, SHA-256 hashing)
- `src/app/guards/auth.guard.ts` — Route guard, redirects unauthenticated users to /login
- `src/app/pages/login/login.component.*` — Login/register UI with animations
- `src/app/services/achievement.service.ts` — Achievement detection + DataUpdatedService integration
- `src/app/components/header/header.component.*` — Header with nav, settings dropdown, logout
- `src/assets/i18n/en.json` — All UI strings in English (Portuguese/Spanish keys removed)
- `src/styles.scss` — Global styles with fadeInUp, scaleInBounce, float, badgeAppear animations

## Important Notes

1. **Tauri Components**: This project includes Tauri (Rust-based desktop framework), but only the Angular web portion runs in Replit. The `getCurrentWindow()` call has been removed from AppComponent to prevent crashes.

2. **Dependencies**: All npm packages are installed. Use `npm install --ignore-scripts` to avoid git lock conflicts.

3. **Build Warnings**: Minor warnings exist (optional chaining, deprecated Sass @import) but don't affect functionality.

4. **Local Database**: Uses Dexie for IndexedDB storage - all data stays in the browser.

5. **Achievement Reactivity**: `AchievementService.updateAchievement()` emits `DataUpdatedService` events on the `achievement` table. Both `home.component.ts` and `achievements.component.ts` subscribe to reload automatically when achievements change.

## Recent Changes (March 2026)

### Auth System (Privacy-First, Offline)
- Built complete `AuthService` with SHA-256 password hashing, stored in localStorage
- Sessions stored in sessionStorage (cleared on browser close)
- `authGuard` protects all routes except `/login`
- Login page: tabbed Sign In / Create Account with animated gradient background
- Header: displays username avatar chip + logout button

### Achievements Fix
- `AchievementService.updateAchievement()` now emits `DataUpdatedService` events
- `achievements.component.ts` and `home.component.ts` subscribe and auto-reload
- `navigateToAchievements()` in home now actually navigates instead of throwing

### UI Improvements
- Global animations in `styles.scss`: fadeInUp, fadeInDown, scaleInBounce, float, badgeAppear, progress, shimmer
- Page transition on router-outlet
- AppComponent conditionally renders overlays (header, substance popup, etc.) only when authenticated

### Translations Cleanup
- Removed all Portuguese/Spanish-only translation keys from `en.json`
- Added English keys for all UI strings used by the header and other components
- Added missing translations: About, Home, Finances, Backup, Sync, App Settings, achievement names, trigger names, etc.

### Debug Log Cleanup
- Removed all Portuguese debug `console.log` strings from TypeScript components
- Removed top-level `console.log` from `substance-icon-select.component.ts`
- Cleaned up debug logs in `record-substance-use.component.ts`

## Development Commands

- `npm start` - Start dev server (already running via workflow)
- `npm run build` - Production build
- `npm test` - Run tests
- `npm run config` - Generate environment.ts from .env file
