# Screenshot Quick Reference

Fast reference for capturing Flavatix app store screenshots.

---

## Device Resolutions

| Platform | Device | Resolution | Screens Needed |
|----------|--------|------------|----------------|
| iOS | iPhone 15 Pro Max | 1290 x 2796px | 5 |
| iOS | iPad Pro 12.9" | 2048 x 2732px | 4 |
| Android | Pixel 8 Pro | 1440 x 3120px | 5 |
| Android | Tablet | 1600 x 2560px | 3 |

---

## Required Screens (All Platforms)

1. **Dashboard** - Home screen with personalized profile
2. **Scanner** - Camera view with scanning overlay
3. **Flavor Wheel** - Interactive flavor visualization
4. **Flavor Detail** - Flavor notes and characteristics
5. **Discovery** - Browse/explore screen

---

## Capture Commands

### iOS Simulator
```bash
# Launch simulator
open -a Simulator

# Capture screenshot
xcrun simctl io booted screenshot ~/Desktop/ios-screen-1.png
```

### Android Emulator
```bash
# Capture via ADB
adb shell screencap -p /sdcard/screen.png
adb pull /sdcard/screen.png ~/Desktop/android-screen-1.png
```

### Real Device - iOS
- Press: **Side Button + Volume Up** (simultaneously)
- Find in: Photos > Screenshots

### Real Device - Android
- Press: **Power + Volume Down** (simultaneously)
- Find in: Photos > Screenshots or Google Photos

---

## File Naming

```
0{number}-{screen-name}.png

Examples:
01-dashboard.png
02-scanner.png
03-flavor-wheel.png
04-flavor-detail.png
05-discovery.png
```

---

## Storage Locations

```
/home/laurence/downloads/flavatixlatest/public/screenshots/

├── ios/
│   ├── iphone-15-pro-max/  (5 screenshots)
│   └── ipad-pro-12-9/      (4 screenshots)
├── android/
│   ├── pixel-8-pro/        (5 screenshots)
│   └── tablet-large/       (3 screenshots)
├── marketing/              (promotional materials)
└── working/                (drafts and raw captures)
```

---

## Pre-Capture Checklist

- [ ] Device at 100% battery
- [ ] Strong WiFi connection
- [ ] Notifications cleared
- [ ] App updated to latest version
- [ ] Test data populated
- [ ] No loading states visible

---

## Platform-Specific Notes

### Apple App Store
- **Format:** PNG or JPEG
- **No transparency** allowed
- **No borders** or frames
- **Quantity:** 3-10 per device type
- **Captions:** 45 characters max (per screenshot)

### Google Play Store
- **Format:** PNG or JPEG
- **Resolution:** 1080x1920px minimum
- **Aspect ratio:** 16:9 or 9:16
- **Quantity:** 2-8 screenshots
- **Text overlays:** Allowed (up to 15% of screen)

---

## Tools

| Tool | Platform | Purpose |
|------|----------|---------|
| iOS Simulator | macOS | Development screenshots |
| Android Emulator | All | Development screenshots |
| CleanShot X | macOS | Professional capture |
| Canva | All | Design/templates |
| Figma | All | Design/collaboration |

---

## Submission Links

- **App Store Connect:** https://appstoreconnect.apple.com
- **Google Play Console:** https://play.google.com/console

---

## Full Documentation

See `/home/laurence/downloads/flavatixlatest/SCREENSHOTS_GUIDE.md` for complete guide.

---

**Version:** 1.0 | **Updated:** 2026-01-22
