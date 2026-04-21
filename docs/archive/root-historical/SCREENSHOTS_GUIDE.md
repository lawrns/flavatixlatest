# Flavatix App Store Screenshots Guide

## Overview

This guide provides comprehensive instructions for creating professional app store screenshots for Flavatix on both Apple App Store and Google Play Store. Screenshots are critical for app discovery and conversion rates.

---

## Table of Contents

1. [Platform Requirements](#platform-requirements)
2. [Device Specifications](#device-specifications)
3. [Required Screens](#required-screens)
4. [Capture Instructions](#capture-instructions)
5. [Tools & Software](#tools--software)
6. [Design Best Practices](#design-best-practices)
7. [File Naming Conventions](#file-naming-conventions)
8. [Storage Location](#storage-location)
9. [Checklist](#checklist)

---

## Platform Requirements

### Apple App Store

**Requirements:**
- **Quantity:** 3-10 screenshots per device type
- **Formats:** PNG or JPEG
- **Resolution:** Must match device dimensions exactly
- **No transparency:** All screenshots must be opaque
- **No borders:** Full-screen captures only
- **Frame/Bezel:** Not allowed (Apple provides these automatically)

**Device Types:**
- iPhone 6.7" Display (iPhone 14 Pro Max, 15 Pro Max)
- iPhone 6.5" Display (iPhone 14 Plus, 15 Plus)
- iPhone 6.1" Display (iPhone 14, 15, 16)
- iPad Pro 12.9" Display
- iPad Pro 11" Display

**Recommended:** Submit for 6.7" iPhone and 12.9" iPad for maximum coverage

### Google Play Store

**Requirements:**
- **Quantity:** At least 2 screenshots, maximum 8
- **Formats:** PNG or JPEG (no transparency)
- **Resolution:**
  - Phone: 1080x1920px (minimum), 3840x2160px (maximum)
  - Tablet: 1920x1080px (minimum), 3840x2160px (maximum)
- **Aspect Ratio:** 16:9 or 9:16 (portrait or landscape)
- **File Size:** Maximum 8MB per screenshot

**Device Types:**
- Phone (required)
- Tablet (recommended)

---

## Device Specifications

### iPhone Screenshots

| Device | Resolution | Status |
|--------|------------|--------|
| iPhone 15 Pro Max / 14 Pro Max | 1290 x 2796px | ✅ Recommended |
| iPhone 15 Plus / 14 Plus | 1284 x 2778px | ✅ Recommended |
| iPhone 15 / 14 / 16 | 1179 x 2556px | ✅ Good coverage |
| iPhone SE (3rd gen) | 1170 x 2532px | Optional |

### Android Screenshots

| Device | Resolution | Status |
|--------|------------|--------|
| Pixel 8 Pro / Samsung S24 Ultra | 1440 x 3120px | ✅ Recommended |
| Pixel 7 / Samsung S23 | 1080 x 2400px | ✅ Good coverage |
| Standard 1080p phones | 1080 x 1920px | ✅ Minimum requirement |

### Tablet Screenshots

| Device | Resolution | Platform |
|--------|------------|----------|
| iPad Pro 12.9" (2022+) | 2048 x 2732px | iOS |
| iPad Pro 11" (2022+) | 1668 x 2388px | iOS |
| iPad Air (2022+) | 1640 x 2360px | iOS |
| Android Tablet (large) | 1600 x 2560px | Android |

---

## Required Screens

### Priority Screens (for both platforms)

1. **Dashboard/Home Screen**
   - Shows personalized flavor profile
   - Displays recent discoveries
   - Shows quick actions (scan, search, explore)

2. **Flavor Scanner/Camera Flow**
   - Camera view with scanning overlay
   - Shows AR/flavor detection in action
   - Interactive and dynamic

3. **Flavor Wheel Visualization**
   - Interactive flavor wheel
   - Shows flavor relationships
   - Colorful and visually engaging

4. **Flavor Detail/Result Screen**
   - Shows flavor notes and characteristics
   - Displays pairing suggestions
   - Rich visual content

5. **Discovery/Explore Screen**
   - Browse flavor categories
   - Search functionality
   - Trending or recommended items

### Optional Screens

6. **Profile/Preferences Screen**
   - User preferences
   - Saved flavors
   - Taste history

7. **Social/Sharing Screen**
   - Share functionality
   - Community features
   - Reviews/ratings

---

## Capture Instructions

### Method 1: iOS Simulator (Recommended for Initial Shots)

**Setup:**
```bash
# Install Xcode from Mac App Store (required for Simulator)

# Open iOS Simulator
open -a Simulator

# Or run specific device
xcrun simctl boot "iPhone 15 Pro Max"
```

**Capture Screenshots:**
```bash
# Save screenshots to ~/Desktop/Screenshots
xcrun simctl io booted screenshot ~/Desktop/Screenshots/iphone-15-pro-max-1.png

# Or use keyboard shortcut: Command + Shift + 4 + Space (click Simulator window)
```

**Advantages:**
- Fast iteration
- Perfect resolution
- No network needed
- Consistent device state

**Limitations:**
- Doesn't show camera features well
- May not render animations accurately

### Method 2: Android Emulator (Recommended for Initial Shots)

**Setup:**
```bash
# Install Android Studio
# Create virtual device through AVD Manager

# Launch emulator
emulator -avd Pixel_8_Pro_API_34 &

# Capture screenshots via ADB
adb shell screencap -p /sdcard/screen.png
adb pull /sdcard/screen.png ~/Desktop/Screenshots/android-phone-1.png
```

**Capture with Android Studio:**
- Click the camera icon in emulator toolbar
- Saves to ~/Pictures/screenshots/

### Method 3: Real Device Screenshots (Best Quality)

#### iPhone/iPad

**Method A - Hardware Buttons:**
1. Navigate to screen in Flavatix app
2. Press and hold **Side Button + Volume Up** (iPhone X and later)
3. OR **Side Button + Home Button** (older devices)
4. Screen flashes white = captured
5. Find in Photos app > Screenshots album

**Method B - Accessibility Shortcut:**
```bash
# Enable in Settings > Accessibility > Touch > AssistiveTouch
# Customize Top Level Menu > Screenshot
# Tap AssistiveTouch button > Screenshot
```

**Export from Device:**
```bash
# Using Image Capture (Mac)
open /Applications/Image\ Capture.app

# Or via AirDrop to Mac
# Or sync via iCloud Photos
```

#### Android Phone/Tablet

**Method A - Hardware Buttons:**
1. Navigate to screen in Flavatix app
2. Press **Power + Volume Down** simultaneously
3. Screen flashes = captured
4. Find in Photos app > Screenshots album or Google Photos

**Method B - Quick Settings:**
```bash
# Enable in Settings > Gestures > Quick Capture
# Three-finger swipe down to capture
```

**Export from Device:**
```bash
# Connect via USB
adb devices
adb pull /sdcard/Pictures/Screenshots/ ~/Desktop/Screenshots/

# Or use Google Drive sync
# Or email to yourself
```

### Method 4: Browser Stack or Real Device Cloud (Premium)

**Services:**
- BrowserStack (https://www.browserstack.com)
- AWS Device Farm
- Firebase Test Lab

**Advantages:**
- Real devices on cloud
- Automated screenshot capture
- Multiple devices at once
- No hardware needed

---

## Tools & Software

### Screenshot Capture

| Tool | Platform | Cost | Use Case |
|------|----------|------|----------|
| iOS Simulator | iOS | Free | Development shots |
| Android Emulator | Android | Free | Development shots |
| Real Device Hardware | All | Hardware cost | Production screenshots |
| BrowserStack | All | Paid | Cloud testing |
| ScreenCloud | All | Free/$9.99/mo | Cloud capture |

### Screenshot Enhancement

| Tool | Platform | Cost | Use Case |
|------|----------|------|----------|
| Figma | All | Free | Add text, borders, annotations |
| Canva | All | Free/Paid | Templates and design |
| Sketch | Mac | Paid | Design tool |
| Photoshop | All | Paid | Professional editing |
| CleanShot X | Mac | $29 | Capture and annotate |
| Snagit | All | $62.99 | Screen capture |
| XnConvert | All | Free | Batch resize/rename |

### Device Mockups (Optional)

**Note:** Apple and Google prefer clean screenshots without mockups. Use mockups only for marketing materials, not app store submission.

| Tool | Cost | Use Case |
|------|------|----------|
| Figma Mockups | Free | Device frames |
| Placeit | Paid | Photo mockups |
| Smartmockups | Paid | Professional frames |
| Magic Mockups | Paid | Quick mockups |

---

## Design Best Practices

### Visual Composition

**DO:**
✅ Use high-quality, sharp images
✅ Show real app interface (no fake UI)
✅ Highlight key features in each screenshot
✅ Use consistent color scheme across screenshots
✅ Include device status bar (time, battery) for realism
✅ Show progressive feature discovery
✅ Use bright, engaging colors
✅ Ensure text is readable at small sizes
✅ Leave some negative space for clarity

**DON'T::**
❌ Add borders, frames, or device mockups
❌ Use low-resolution or blurry images
❌ Overload with text
❌ Use fake or placeholder content
❌ Show error states or loading screens
❌ Include sensitive user data
❌ Use watermarks or logos overlaid on screen
❌ Show third-party apps or competitor features

### Screenshot Order Strategy

**Screenshot 1: Hero Shot**
- Most impressive feature
- Strong visual impact
- Should make users want to learn more

**Screenshot 2: Core Value**
- Primary use case
- Shows main benefit
- How it solves the user's problem

**Screenshot 3: Key Feature**
- Second most important feature
- Shows depth of functionality
- Demonstrates unique capability

**Screenshot 4: Social Proof/Discovery**
- Explore features
- Content variety
- User engagement

**Screenshot 5: Call to Action**
- Sign-up or onboarding
- Easy to get started
- Low friction entry point

### Text and Annotations

**For Google Play Store Only:**
- You can add brief text overlays (up to 15% of screen)
- Keep text minimal and descriptive
- Use sans-serif fonts
- Ensure high contrast
- Maximum 4 lines of text per screenshot

**For Apple App Store:**
- No text overlays allowed
- Each screenshot can have a caption (45 characters max)
- Focus on visual storytelling

### Content Preparation

**Before Capturing:**

1. **Clean Test Data:**
   - Use realistic but fake user names
   - Include diverse flavor profiles
   - Show variety of content
   - Avoid blank states or empty lists

2. **Optimal Conditions:**
   - Fully charged device (show 100% battery)
   - Good WiFi/cellular signal
   - Current time (morning/afternoon)
   - Clean notifications (or none)
   - No "low storage" warnings

3. **App State:**
   - Fresh app restart
   - Cached images loaded
   - Animations completed
   - No loading spinners
   - All content rendered

---

## File Naming Conventions

### Standard Format

```
{platform}-{device}-{screen}-{number}.{ext}
```

### Examples

**iOS:**
```
ios-iphone-15-pro-max-dashboard-01.png
ios-iphone-15-pro-max-scanner-02.png
ios-iphone-15-pro-max-flavor-wheel-03.png
ios-iphone-15-pro-max-flavor-detail-04.png
ios-iphone-15-pro-max-discovery-05.png

ios-ipad-pro-12-9-dashboard-01.png
ios-ipad-pro-12-9-flavor-wheel-02.png
```

**Android:**
```
android-pixel-8-pro-dashboard-01.png
android-pixel-8-pro-scanner-02.png
android-pixel-8-pro-flavor-wheel-03.png
android-pixel-8-pro-flavor-detail-04.png
android-pixel-8-pro-discovery-05.png

android-tablet-large-dashboard-01.png
android-tablet-large-flavor-wheel-02.png
```

### Alternative Format (by Screen)

```
screenshots/
  ios/
    iphone/
      01-dashboard.png
      02-scanner.png
      03-flavor-wheel.png
      04-flavor-detail.png
      05-discovery.png
    ipad/
      01-dashboard.png
      02-flavor-wheel.png
      03-scanner.png
  android/
    phone/
      01-dashboard.png
      02-scanner.png
      03-flavor-wheel.png
      04-flavor-detail.png
      05-discovery.png
    tablet/
      01-dashboard.png
      02-flavor-wheel.png
```

---

## Storage Location

### Project Structure

```
/home/laurence/downloads/flavatixlatest/
  public/
    screenshots/
      README.md (this file)

      # iOS Screenshots
      ios/
        iphone-15-pro-max/
          01-dashboard.png
          02-scanner.png
          03-flavor-wheel.png
          04-flavor-detail.png
          05-discovery.png

        ipad-pro-12-9/
          01-dashboard.png
          02-flavor-wheel.png
          03-scanner.png
          04-flavor-detail.png

      # Android Screenshots
      android/
        pixel-8-pro/
          01-dashboard.png
          02-scanner.png
          03-flavor-wheel.png
          04-flavor-detail.png
          05-discovery.png

        tablet-large/
          01-dashboard.png
          02-flavor-wheel.png
          03-scanner.png

      # Marketing Materials (with mockups)
      marketing/
        social-media/
          instagram-square.png
          twitter-post.png

        press-kit/
          hero-mockup.png
          feature-showcase.png

      # Working Files (not for production)
      working/
        raw-captures/
        drafts/
        templates/
```

### Directory Creation Script

```bash
#!/bin/bash
# Create screenshot directory structure

BASE_DIR="/home/laurence/downloads/flavatixlatest/public/screenshots"

# Create main directories
mkdir -p "$BASE_DIR"/ios/iphone-15-pro-max
mkdir -p "$BASE_DIR"/ios/ipad-pro-12-9
mkdir -p "$BASE_DIR"/android/pixel-8-pro
mkdir -p "$BASE_DIR"/android/tablet-large
mkdir -p "$BASE_DIR"/marketing/social-media
mkdir -p "$BASE_DIR"/marketing/press-kit
mkdir -p "$BASE_DIR"/working/raw-captures
mkdir -p "$BASE_DIR"/working/drafts
mkdir -p "$BASE_DIR"/working/templates

# Create README
cat > "$BASE_DIR/README.md" << 'EOF'
# Flavatix App Store Screenshots

This directory contains all screenshots for Apple App Store and Google Play Store submission.

## Directory Structure

- `ios/` - Apple App Store screenshots
  - `iphone-15-pro-max/` - iPhone 15 Pro Max screenshots (1290x2796px)
  - `ipad-pro-12-9/` - iPad Pro 12.9" screenshots (2048x2732px)

- `android/` - Google Play Store screenshots
  - `pixel-8-pro/` - Pixel 8 Pro screenshots (1440x3120px)
  - `tablet-large/` - Large tablet screenshots (1600x2560px)

- `marketing/` - Marketing materials with mockups
  - `social-media/` - Social media images
  - `press-kit/` - Press kit materials

- `working/` - Working files (not for production)
  - `raw-captures/` - Unedited screenshots from devices
  - `drafts/` - Work-in-progress edits
  - `templates/` - Design templates

## File Naming

Follow the pattern: `0{number}-{screen-name}.png`

Example: `01-dashboard.png`, `02-scanner.png`, `03-flavor-wheel.png`

## Quick Reference

See `../SCREENSHOTS_GUIDE.md` for comprehensive documentation.

Last updated: $(date +%Y-%m-%d)
EOF

echo "Screenshot directory structure created at: $BASE_DIR"
```

Save this script as `create-screenshot-dirs.sh` and run:

```bash
chmod +x create-screenshot-dirs.sh
./create-screenshot-dirs.sh
```

---

## Checklist

### Pre-Capture Checklist

- [ ] Review app for any visual bugs or UI issues
- [ ] Ensure app is built with production configuration
- [ ] Prepare test data (flavor profiles, sample items)
- [ ] Clean device notifications and status indicators
- [ ] Charge devices to 100%
- [ ] Connect to stable WiFi
- [ ] Set device language to English (or target language)
- [ ] Disable low power mode
- [ ] Update app to latest version

### Capture Checklist

**iOS (iPhone):**
- [ ] 01-dashboard.png - Home screen with personalized profile
- [ ] 02-scanner.png - Camera view with scanning overlay
- [ ] 03-flavor-wheel.png - Interactive flavor wheel
- [ ] 04-flavor-detail.png - Flavor notes and characteristics
- [ ] 05-discovery.png - Browse/explore screen

**iOS (iPad):**
- [ ] 01-dashboard.png - Home screen optimized for tablet
- [ ] 02-flavor-wheel.png - Larger flavor wheel visualization
- [ ] 03-scanner.png - Camera interface on tablet
- [ ] 04-flavor-detail.png - Detail view with more content

**Android (Phone):**
- [ ] 01-dashboard.png - Home screen with material design
- [ ] 02-scanner.png - Camera view with Android UI
- [ ] 03-flavor-wheel.png - Interactive flavor wheel
- [ ] 04-flavor-detail.png - Flavor information screen
- [ ] 05-discovery.png - Explore and browse screen

**Android (Tablet):**
- [ ] 01-dashboard.png - Tablet-optimized home
- [ ] 02-flavor-wheel.png - Large flavor wheel
- [ ] 03-scanner.png - Tablet camera interface

### Post-Capture Checklist

- [ ] Verify all screenshots are sharp and in focus
- [ ] Check resolution matches requirements exactly
- [ ] Ensure no transparency in images
- [ ] Verify files are PNG or JPEG format
- [ ] Check file sizes are within limits
- [ ] Name files according to convention
- [ ] Organize into correct directories
- [ ] Create backup copy
- [ ] Test on different screens (check readability)
- [ ] Validate no sensitive data is visible
- [ ] Review for consistency across screenshots

### Submission Checklist

**App Store Connect:**
- [ ] Login to App Store Connect
- [ ] Navigate to App > Screenshots
- [ ] Upload iPhone screenshots (6.7" display)
- [ ] Upload iPad screenshots (12.9" display)
- [ ] Add localized captions for each screenshot
- [ ] Preview in App Store Connect
- [ ] Save changes

**Google Play Console:**
- [ ] Login to Google Play Console
- [ ] Navigate to Main Store Listing > Screenshots
- [ ] Upload phone screenshots (minimum 2)
- [ ] Upload tablet screenshots (recommended)
- [ ] Add localized descriptions for each
- [ ] Preview on different device previews
- [ ] Save changes

---

## Additional Resources

### Apple Resources

- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Human Interface Guidelines - App Store](https://developer.apple.com/design/human-interface-guidelines/app-store-overview)
- [App Store Screenshot Specifications](https://help.apple.com/app-store-connect/#/devd274dd912)

### Google Resources

- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Play Store Asset Specifications](https://support.google.com/googleplay/android-developer/answer/10788770)
- [Material Design Guidelines](https://material.io/design)

### Screenshot Tools

- [CleanShot X](https://cleanshot.com/) - Best macOS screenshot tool
- [ScreenCloud](https://screencloud.com/) - Cross-platform capture
- [Canva](https://www.canva.com/) - Design templates
- [Figma](https://www.figma.com/) - Design and collaboration

---

## Quick Reference Summary

### iPhone 15 Pro Max (1290 x 2796px)
1. Dashboard
2. Scanner
3. Flavor Wheel
4. Flavor Detail
5. Discovery

### iPad Pro 12.9" (2048 x 2732px)
1. Dashboard
2. Flavor Wheel
3. Scanner
4. Flavor Detail

### Android Phone (1440 x 3120px)
1. Dashboard
2. Scanner
3. Flavor Wheel
4. Flavor Detail
5. Discovery

### Android Tablet (1600 x 2560px)
1. Dashboard
2. Flavor Wheel
3. Scanner

---

## Troubleshooting

### Issue: Screenshots appear blurry

**Solution:**
- Use actual device or high-resolution simulator
- Ensure display zoom is set to default
- Check app is using proper image assets (@3x for iOS)
- Verify no scaling in post-processing

### Issue: Wrong resolution

**Solution:**
- Verify device model matches target resolution
- Use simulator for exact resolution
- Resize images with proper tools (maintain quality)
- Check for any device scaling settings

### Issue: Captured screenshots have device frame

**Solution:**
- Use built-in screenshot methods (not third-party tools)
- For iOS: Don't use mockup frames
- For Android: Ensure clean capture
- Crop to exact content area if needed

### Issue: Inconsistent appearance across screenshots

**Solution:**
- Use same device for all screenshots
- Capture in same session (same app state)
- Ensure consistent lighting/time in status bar
- Use post-processing carefully

---

## Maintenance

### When to Update Screenshots

- New major UI redesign
- Significant feature updates
- Seasonal campaigns (holidays, events)
- Low conversion rates (A/B test new designs)
- New device sizes released
- Localization for new markets

### Version Control

Consider tracking screenshot versions:

```
screenshots/
  v1.0/  # Initial release
  v1.5/  # Minor UI update
  v2.0/  # Major redesign
  current -> v2.0  # Symlink to active version
```

---

## Conclusion

Professional app store screenshots are critical for Flavatix's success. Following this guide ensures:

✅ Compliance with platform requirements
✅ Consistent, high-quality visuals
✅ Effective feature showcasing
✅ Professional presentation
✅ Easy maintenance and updates

**Remember:** Screenshots are often the first impression potential users have of Flavatix. Invest time in capturing and presenting the best possible representation of your app.

---

**Last Updated:** 2026-01-22
**Version:** 1.0
**Maintained By:** Flavatix Team
