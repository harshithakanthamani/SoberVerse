# SoberVerse - Replit Setup

## Project Overview
SoberVerse is a cross-platform application built with Angular and Tauri. In the Replit environment, we're running the Angular web frontend only (Tauri is for desktop apps and not applicable here).

**Purpose**: Track habits and addictions with tools for analytics, reminders, and progress monitoring.

**Tech Stack**:
- Frontend: Angular 20
- UI Libraries: PrimeNG, Angular Material, Tailwind CSS
- Charts: Chart.js
- Local Storage: Dexie (IndexedDB wrapper)
- i18n: Transloco

## Current Configuration

### Development Environment
- **Port**: 5000 (configured for Replit webview)
- **Host**: 0.0.0.0 (allows external access)
- **Allowed Hosts**: all (required for Replit proxy)
- **Workflow**: "Start application" runs `npm start` (Angular dev server)

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
├── app/               # Angular application code
├── assets/            # Static assets (icons, images)
├── environments/      # Environment configuration
└── styles.scss        # Global styles

src-tauri/             # Tauri desktop app code (not used in Replit)
```

## Important Notes

1. **Tauri Components**: This project includes Tauri (Rust-based desktop framework), but only the Angular web portion runs in Replit. Desktop-specific features won't work. You may see Tauri-related errors in the console (e.g., "Cannot read properties of undefined (reading 'metadata')") - these are expected and don't affect the web functionality.

2. **Dependencies**: All npm packages are installed. The `prepare` script (husky git hooks) is skipped to avoid git conflicts.

3. **Build Warnings**: Minor warnings exist (optional chaining, deprecated Sass @import) but don't affect functionality.

4. **Local Database**: Uses Dexie for IndexedDB storage - all data stays in the browser.

## Recent Changes (Nov 27, 2024)

### Currency and Language Update
- Converted all currency references to Indian Rupees (₹/INR)
- Set default locale to `en-IN` and currency to `INR`
- Removed Spanish and Portuguese language support, keeping only English
- Updated translation keys and UI templates to reflect currency change

### Rebranding Complete
- Rebranded entire project from "Addiction Tracker" to "SoberVerse"
- Updated files: package.json, index.html, README.md, tauri.conf.json
- Updated all translation files (en.json, es.json, pt-br.json)
- Updated Angular components (header, version, onboarding, auth)
- Updated splash screen and desktop app configuration
- Note: Internal Angular project name in angular.json kept as "addiction-tracker" for build compatibility

### Initial Setup
- Created `src/environments/environment.ts` with empty API keys
- Updated `angular.json` to bind dev server to port 5000 with host 0.0.0.0 and allow all hosts
- Configured "Start application" workflow for webview on port 5000
- Set up static site deployment configuration
- Installed all npm dependencies (with --ignore-scripts to skip husky)

## Development Commands

- `npm start` - Start dev server (already running via workflow)
- `npm run build` - Production build
- `npm test` - Run tests
- `npm run config` - Generate environment.ts from .env file
