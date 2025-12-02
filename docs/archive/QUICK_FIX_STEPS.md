# Flavor Wheels - Quick Fix Steps

## ⚡ 3-Step Fix (10 minutes)

### Step 1: Apply Database Policies
```bash
# Generate the SQL
node fix_flavor_wheels_rls.js

# Copy the output SQL
# Go to: https://app.supabase.com/project/kobuclkvlacdwvxmakvq/sql/new
# Paste and run the SQL
```

### Step 2: Insert Test Data
```bash
# Run the seeding script
node seed_flavor_descriptors.js

# Should see: "✅ Test data inserted successfully!"
```

### Step 3: Test the Feature
```bash
# Restart dev server
npm run dev

# Open browser
# Go to: http://localhost:3032/flavor-wheels
# Login: dev@devtix.com / 123test
# Select: Aroma + Personal
# Click: Regenerate Wheel
```

---

## ✅ Success = No 401 Errors + Wheel Renders

See [FLAVOR_WHEELS_FIX_GUIDE.md](FLAVOR_WHEELS_FIX_GUIDE.md) for detailed troubleshooting.
