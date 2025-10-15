# Netlify Environment Setup Guide

## Prerequisites
- Node.js and npm installed
- Netlify account with site deployed
- OpenAI API key

## Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

## Step 2: Login to Netlify

```bash
netlify login
```

This will open a browser window to authenticate.

## Step 3: Link Your Site

Navigate to your project directory:

```bash
cd /Users/lukatenbosch/Downloads/flavatixlatest
netlify link
```

Select your site from the list or enter the site ID.

## Step 4: Set Environment Variables

Set the OpenAI API key (replace with your actual key):

```bash
netlify env:set OPENAI_API_KEY "your-openai-api-key-here"
```

Verify it was set:

```bash
netlify env:list
```

## Step 5: Set Additional Environment Variables

```bash
# Supabase (if not already set)
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://your-project.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your-anon-key"

# Database URL for server-side operations
netlify env:set DATABASE_URL "your-database-connection-string"
```

## Step 6: Redeploy

Trigger a new deployment to apply the environment variables:

```bash
netlify deploy --prod
```

Or via Git:

```bash
git commit --allow-empty -m "Trigger redeploy with env vars"
git push origin main
```

## Verification

After deployment, check the Netlify dashboard:
1. Go to Site Settings > Environment Variables
2. Verify OPENAI_API_KEY is listed (value will be hidden)
3. Check build logs for any environment variable errors

## Troubleshooting

### Environment Variable Not Working
- Clear build cache: `netlify build --clear-cache`
- Check variable scope (build-time vs runtime)
- Verify variable name matches code (case-sensitive)

### API Key Issues
- Test API key locally first
- Check OpenAI account quota
- Verify no trailing spaces in key

## Alternative: Set via Netlify Dashboard

1. Go to https://app.netlify.com
2. Select your site
3. Site Settings > Environment Variables
4. Click "Add a variable"
5. Name: `OPENAI_API_KEY`
6. Value: Your API key
7. Scope: All (or specific contexts)
8. Save and redeploy