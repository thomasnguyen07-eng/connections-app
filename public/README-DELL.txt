ANDROID SYNC PACKAGE — 2026-10-02
=================================
Source: macincloud ~/NewApp/ios/App/App/public/
Target: Dell Android project

WHAT TO DO:
1. This folder contains the ENTIRE public/ folder with all fixes.
2. On Dell, replace your Android project's web assets with these files.
3. Typical Android location:
   <project>/android/app/src/main/assets/public/
4. Also copy the "_dist" folder to <project>/dist/ (Capacitor uses it)
5. Copy "_capacitor.config.json" to <project>/capacitor.config.json
6. Run: npx cap sync android
7. Build .aab in Android Studio
8. Upload to Play Console

ALL FIXES INCLUDED:
- IAP integration (RevenueCat)
- Sign-in error messages (6 languages)
- Password eye toggle
- Worm toggle preserves form/images/language
- Email recipient fixes
- X (Twitter) logo
- iPad layout fix
- Debug console owner-gated
- All other fixes from the past 3 months

Files were copied on: 2026-10-02
