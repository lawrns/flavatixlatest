#!/bin/bash

# Comprehensive site-wide dark mode fix script
# Fixes all navigation footers, text colors, backgrounds, and borders

echo "Starting comprehensive dark mode fixes..."

# Find all TSX files in pages directory
files=$(find pages -name "*.tsx" -type f)

for file in $files; do
  echo "Processing: $file"

  # Fix footer backgrounds - bg-background-light without dark mode
  sed -i '' 's/bg-background-light">/bg-background-light dark:bg-background-dark">/g' "$file"

  # Fix text-zinc-500 nav links without dark mode
  sed -i '' 's/text-zinc-500"/text-zinc-500 dark:text-zinc-300"/g' "$file"

  # Fix any remaining text-gray colors without dark mode
  sed -i '' 's/text-gray-300"/text-gray-300 dark:text-gray-400"/g' "$file"
  sed -i '' 's/text-gray-400"/text-gray-400 dark:text-gray-300"/g' "$file"
  sed -i '' 's/text-gray-500"/text-gray-500 dark:text-gray-400"/g' "$file"
  sed -i '' 's/text-gray-600"/text-gray-600 dark:text-gray-300"/g' "$file"
  sed -i '' 's/text-gray-700"/text-gray-700 dark:text-gray-200"/g' "$file"
  sed -i '' 's/text-gray-800"/text-gray-800 dark:text-gray-100"/g' "$file"
  sed -i '' 's/text-gray-900"/text-gray-900 dark:text-gray-50"/g' "$file"

  # Fix bg-gray colors without dark mode
  sed -i '' 's/bg-gray-50"/bg-gray-50 dark:bg-gray-900"/g' "$file"
  sed -i '' 's/bg-gray-100"/bg-gray-100 dark:bg-gray-800"/g' "$file"
  sed -i '' 's/bg-gray-200"/bg-gray-200 dark:bg-gray-700"/g' "$file"
  sed -i '' 's/bg-gray-300"/bg-gray-300 dark:bg-gray-600"/g' "$file"

  # Fix border-gray colors without dark mode
  sed -i '' 's/border-gray-200"/border-gray-200 dark:border-gray-700"/g' "$file"
  sed -i '' 's/border-gray-300"/border-gray-300 dark:border-gray-600"/g' "$file"
  sed -i '' 's/border-gray-400"/border-gray-400 dark:border-gray-500"/g' "$file"
done

echo "Comprehensive dark mode fixes complete!"
echo "Processed $(echo "$files" | wc -l | xargs) files"
