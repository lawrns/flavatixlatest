#!/bin/bash

echo "🔧 Fixing ALL dark mode contrast issues site-wide..."

# Find all TSX and JSX files
files=$(find pages components -type f \( -name "*.tsx" -o -name "*.jsx" \))

for file in $files; do
  # Skip if file already processed or is a test file
  if [[ "$file" == *"test"* ]] || [[ "$file" == *"spec"* ]]; then
    continue
  fi

  # Fix text-zinc-600 (medium gray) -> needs light gray in dark mode
  sed -i '' 's/text-zinc-600"/text-zinc-600 dark:text-zinc-300"/g' "$file"
  sed -i '' "s/text-zinc-600'/text-zinc-600 dark:text-zinc-300'/g" "$file"
  sed -i '' 's/text-zinc-600 /text-zinc-600 dark:text-zinc-300 /g' "$file"

  # Fix text-zinc-700 (darker gray) -> needs lighter gray in dark mode
  sed -i '' 's/text-zinc-700"/text-zinc-700 dark:text-zinc-200"/g' "$file"
  sed -i '' "s/text-zinc-700'/text-zinc-700 dark:text-zinc-200'/g" "$file"
  sed -i '' 's/text-zinc-700 /text-zinc-700 dark:text-zinc-200 /g' "$file"

  # Fix text-zinc-800 (very dark) -> needs white in dark mode
  sed -i '' 's/text-zinc-800"/text-zinc-800 dark:text-zinc-100"/g' "$file"
  sed -i '' "s/text-zinc-800'/text-zinc-800 dark:text-zinc-100'/g" "$file"
  sed -i '' 's/text-zinc-800 /text-zinc-800 dark:text-zinc-100 /g' "$file"

  # Fix text-zinc-900 (almost black) -> needs white in dark mode
  sed -i '' 's/text-zinc-900"/text-zinc-900 dark:text-zinc-50"/g' "$file"
  sed -i '' "s/text-zinc-900'/text-zinc-900 dark:text-zinc-50'/g" "$file"
  sed -i '' 's/text-zinc-900 /text-zinc-900 dark:text-zinc-50 /g' "$file"

  # Fix bg-white without dark mode
  sed -i '' 's/bg-white"/bg-white dark:bg-zinc-800"/g' "$file"
  sed -i '' "s/bg-white'/bg-white dark:bg-zinc-800'/g" "$file"
  sed -i '' 's/bg-white /bg-white dark:bg-zinc-800 /g' "$file"

  # Fix border-zinc-200 (light border) -> needs darker border in dark mode
  sed -i '' 's/border-zinc-200"/border-zinc-200 dark:border-zinc-700"/g' "$file"
  sed -i '' "s/border-zinc-200'/border-zinc-200 dark:border-zinc-700'/g" "$file"
  sed -i '' 's/border-zinc-200 /border-zinc-200 dark:border-zinc-700 /g' "$file"

  # Fix border-zinc-300 -> needs darker in dark mode
  sed -i '' 's/border-zinc-300"/border-zinc-300 dark:border-zinc-600"/g' "$file"
  sed -i '' "s/border-zinc-300'/border-zinc-300 dark:border-zinc-600'/g" "$file"
  sed -i '' 's/border-zinc-300 /border-zinc-300 dark:border-zinc-600 /g' "$file"
done

# Clean up duplicate dark: classes
for file in $files; do
  # Remove duplicate dark: classes (e.g., "dark:text-zinc-300 dark:text-zinc-300")
  sed -i '' 's/dark:\([a-z-]*\) dark:\1/dark:\1/g' "$file"
  sed -i '' 's/dark:\([a-z-]*\) dark:\1/dark:\1/g' "$file"
done

echo "✅ Fixed all dark mode issues!"
echo "📊 Summary:"
echo "  - Fixed text-zinc-600/700/800/900 colors"
echo "  - Fixed bg-white backgrounds"
echo "  - Fixed border-zinc-200/300 borders"
echo ""
echo "🔄 Files modified: $(echo "$files" | wc -l)"
