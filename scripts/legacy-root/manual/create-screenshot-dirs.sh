#!/bin/bash

# Flavatix Screenshot Directory Creator
# This script creates the complete directory structure for app store screenshots

set -e  # Exit on error

BASE_DIR="/home/laurence/downloads/flavatixlatest/public/screenshots"

echo "📱 Creating Flavatix screenshot directory structure..."
echo ""

# Create main directories
echo "Creating iOS directories..."
mkdir -p "$BASE_DIR"/ios/iphone-15-pro-max
mkdir -p "$BASE_DIR"/ios/ipad-pro-12-9

echo "Creating Android directories..."
mkdir -p "$BASE_DIR"/android/pixel-8-pro
mkdir -p "$BASE_DIR"/android/tablet-large

echo "Creating marketing directories..."
mkdir -p "$BASE_DIR"/marketing/social-media
mkdir -p "$BASE_DIR"/marketing/press-kit

echo "Creating working directories..."
mkdir -p "$BASE_DIR"/working/raw-captures
mkdir -p "$BASE_DIR"/working/drafts
mkdir -p "$BASE_DIR"/working/templates

echo ""
echo "✅ Directory structure created successfully!"
echo ""
echo "📁 Location: $BASE_DIR"
echo ""
echo "📋 Next Steps:"
echo "   1. Review SCREENSHOTS_GUIDE.md for complete instructions"
echo "   2. Capture screenshots using real devices or simulators"
echo "   3. Place screenshots in appropriate directories"
echo "   4. Follow naming convention: 0{number}-{screen-name}.png"
echo ""
echo "📖 Quick reference:"
echo "   - iOS iPhone: $BASE_DIR/ios/iphone-15-pro-max/"
echo "   - iOS iPad:   $BASE_DIR/ios/ipad-pro-12-9/"
echo "   - Android:    $BASE_DIR/android/pixel-8-pro/"
echo "   - Tablet:     $BASE_DIR/android/tablet-large/"
echo ""
