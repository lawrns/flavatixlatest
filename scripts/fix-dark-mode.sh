#!/bin/bash

# Fix hardcoded background colors to support dark mode
# Replace bg-background-light with dark mode compatible class

echo "Fixing hardcoded background colors..."

# Find all .tsx and .jsx files and replace bg-background-light with dark mode support
find pages components -type f \( -name "*.tsx" -o -name "*.jsx" \) -exec sed -i '' \
  's/className="bg-background-light font-display text-zinc-900"/className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-50"/g' {} +

find pages components -type f \( -name "*.tsx" -o -name "*.jsx" \) -exec sed -i '' \
  's/className="bg-background-light/className="bg-background-light dark:bg-background-dark/g' {} +

find pages components -type f \( -name "*.tsx" -o -name "*.jsx" \) -exec sed -i '' \
  's/text-zinc-900 dark:text-zinc-50 dark:bg-background-dark/text-zinc-900 dark:text-zinc-50/g' {} +

echo "Done! Fixed all hardcoded backgrounds."
