#!/bin/bash

# Flavatix PWA Lighthouse Audit Script
# Usage: ./scripts/pwa-audit.sh

set -e

echo "🔍 Flavatix PWA Lighthouse Audit"
echo "================================"
echo ""

# Check if dev server is running
if ! curl -s http://localhost:3000 > /dev/null; then
  echo "❌ Dev server not running on http://localhost:3000"
  echo "Please run: npm run dev"
  exit 1
fi

echo "✅ Dev server detected"
echo ""

# Check if lighthouse is installed
if ! command -v lighthouse &> /dev/null; then
  echo "📦 Installing Lighthouse CLI..."
  npm install -g lighthouse
fi

echo "🚀 Running PWA audit..."
echo ""

# Create reports directory
mkdir -p reports

# Run Lighthouse PWA audit
lighthouse http://localhost:3000 \
  --only-categories=pwa \
  --output=html \
  --output=json \
  --output-path=./reports/pwa-audit \
  --chrome-flags="--headless" \
  --quiet

echo "✅ Audit complete!"
echo ""
echo "📊 Reports generated:"
echo "  - HTML: ./reports/pwa-audit.report.html"
echo "  - JSON: ./reports/pwa-audit.report.json"
echo ""

# Extract and display score
SCORE=$(cat ./reports/pwa-audit.report.json | jq '.categories.pwa.score * 100')
echo "📈 PWA Score: $SCORE/100"
echo ""

# Provide recommendations
if (( $(echo "$SCORE < 90" | bc -l) )); then
  echo "⚠️  Score is below 90. Please review:"
  echo "  - ./reports/pwa-audit.report.html"
  echo "  - PWA_LAUNCH_AUDIT_REPORT.md"
  echo "  - PWA_QUICK_CHECKLIST.md"
else
  echo "✅ Excellent! Your PWA is ready for launch!"
fi

echo ""
echo "💡 Open the HTML report in your browser for detailed findings:"
echo "   open ./reports/pwa-audit.report.html"
