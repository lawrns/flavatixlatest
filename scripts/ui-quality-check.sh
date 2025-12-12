#!/bin/bash
# UI Quality Check Script
# Run this before deploying to ensure UI/UX quality standards are met

set -e

echo "🔍 Flavatix UI Quality Check"
echo "============================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# 1. TypeScript type check
echo "📝 Running TypeScript type check..."
if npx tsc --noEmit 2>/dev/null; then
    echo -e "${GREEN}✓ TypeScript: No type errors${NC}"
else
    echo -e "${RED}✗ TypeScript: Type errors found${NC}"
    ((ERRORS++))
fi
echo ""

# 2. ESLint check
echo "🔧 Running ESLint..."
if npm run lint 2>/dev/null; then
    echo -e "${GREEN}✓ ESLint: No errors${NC}"
else
    echo -e "${YELLOW}⚠ ESLint: Warnings or errors found (check output above)${NC}"
    ((WARNINGS++))
fi
echo ""

# 3. Build check
echo "🏗️  Running production build..."
if npm run build 2>/dev/null; then
    echo -e "${GREEN}✓ Build: Successful${NC}"
else
    echo -e "${RED}✗ Build: Failed${NC}"
    ((ERRORS++))
fi
echo ""

# 4. Check for console.log statements (excluding legitimate uses)
echo "🔍 Checking for debug console.log statements..."
DEBUG_LOGS=$(grep -r "console\.log" --include="*.tsx" --include="*.ts" pages/ components/ 2>/dev/null | grep -v "// eslint" | grep -v "logger\." | wc -l | tr -d ' ')
if [ "$DEBUG_LOGS" -gt 10 ]; then
    echo -e "${YELLOW}⚠ Found $DEBUG_LOGS console.log statements - consider using logger utility${NC}"
    ((WARNINGS++))
else
    echo -e "${GREEN}✓ Console logs: Acceptable ($DEBUG_LOGS found)${NC}"
fi
echo ""

# 5. Check for TODO/FIXME comments
echo "📋 Checking for TODO/FIXME comments..."
TODOS=$(grep -r "TODO\|FIXME" --include="*.tsx" --include="*.ts" pages/ components/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$TODOS" -gt 0 ]; then
    echo -e "${YELLOW}⚠ Found $TODOS TODO/FIXME comments${NC}"
    ((WARNINGS++))
else
    echo -e "${GREEN}✓ No TODO/FIXME comments found${NC}"
fi
echo ""

# 6. Check for hardcoded colors (should use design tokens)
echo "🎨 Checking for hardcoded colors..."
HARDCODED_COLORS=$(grep -rE "#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}" --include="*.tsx" pages/ 2>/dev/null | grep -v "CATEGORY_COLORS\|// Color" | wc -l | tr -d ' ')
if [ "$HARDCODED_COLORS" -gt 5 ]; then
    echo -e "${YELLOW}⚠ Found $HARDCODED_COLORS hardcoded colors in pages - consider using design tokens${NC}"
    ((WARNINGS++))
else
    echo -e "${GREEN}✓ Hardcoded colors: Acceptable ($HARDCODED_COLORS found)${NC}"
fi
echo ""

# 7. Check bundle size
echo "📦 Checking bundle sizes..."
MAIN_BUNDLE=$(find .next/static/chunks -name "main-*.js" 2>/dev/null | head -1)
if [ -n "$MAIN_BUNDLE" ]; then
    SIZE=$(ls -lh "$MAIN_BUNDLE" | awk '{print $5}')
    echo -e "${GREEN}✓ Main bundle size: $SIZE${NC}"
fi
echo ""

# Summary
echo "============================"
echo "📊 Summary"
echo "============================"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
else
    echo -e "${RED}❌ $ERRORS error(s) and $WARNINGS warning(s) found${NC}"
    exit 1
fi

echo ""
echo "💡 Performance Tips:"
echo "   - Run Lighthouse in Chrome DevTools for Core Web Vitals"
echo "   - Target: LCP < 2.5s, INP < 200ms, CLS < 0.1"
echo "   - Use React DevTools Profiler to identify slow components"
echo ""
