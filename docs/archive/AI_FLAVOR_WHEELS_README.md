# AI-Powered Flavor Wheels Implementation

This implementation adds AI-powered descriptor extraction and custom category taxonomy generation to Flavatix.

## Features Implemented

### 1. AI Descriptor Extraction
- **Service**: `lib/ai/descriptorExtractionService.ts`
- **Model**: Claude Haiku 3.5 (fast & cost-effective)
- **Functionality**: Automatically extracts and classifies descriptors from tasting notes into:
  - Aroma (smell-related)
  - Flavor (taste-related)
  - Texture (mouthfeel, body)
  - Metaphor (emotional, place, cultural associations)

### 2. Custom Category Taxonomy Generation
- **Service**: `lib/ai/taxonomyGenerationService.ts`
- **Model**: Claude Haiku 3.5
- **Functionality**: Generates flavor taxonomy for ANY custom category (e.g., "mezcal", "kombucha", "ceremonial matcha")
- **Caching**: First user triggers AI generation, subsequent users get instant cached results

### 3. Updated API Endpoints
- **POST /api/flavor-wheels/extract-descriptors**: Enhanced with AI extraction (falls back to keyword-based)
- **POST /api/categories/get-or-create-taxonomy**: Generate/retrieve category taxonomies
- **GET /api/admin/ai-usage-stats**: Monitor AI usage and costs (admin only)

### 4. New Components
- **UnifiedFlavorWheelPage**: Displays aggregated flavor wheel from all user tastings
- Integrates with existing FlavorWheelVisualization component

## Database Migration

### IMPORTANT: Manual Migration Required

The database schema has been prepared in `migrations/ai_flavor_wheels_schema.sql` but must be run manually via Supabase Dashboard.

### Migration Steps:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/kobuclkvlacdwvxmakvq

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Execute Migration**
   - Copy ENTIRE contents of `migrations/ai_flavor_wheels_schema.sql`
   - Paste into SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Verify Migration**
   - Check that tables were created:
     - `category_taxonomies`
     - `ai_extraction_logs`
   - Check that columns were added to existing tables:
     - `flavor_descriptors`: `normalized_form`, `ai_extracted`, `extraction_model`
     - `quick_tastings`: `taxonomy_id`, `auto_flavor_wheel`
     - `flavor_wheels`: `aggregation_scope`, `descriptor_limit`

### What the Migration Does:

1. **Creates New Tables**:
   - `category_taxonomies`: Stores AI-generated flavor taxonomies for custom categories
   - `ai_extraction_logs`: Tracks AI usage for monitoring and cost analysis

2. **Adds Columns to Existing Tables**:
   - Tracks which descriptors were AI-extracted vs keyword-based
   - Links tastings to their category taxonomies
   - Enables auto-generated flavor wheels

3. **Creates Database Function**:
   - `get_unified_flavor_wheel_data()`: Aggregates all user descriptors into unified wheel

4. **Sets Up Security**:
   - Row Level Security (RLS) policies
   - Proper grants for authenticated/anon users

## Environment Variables

Add to `.env.local`:

```bash
# Anthropic AI (Required for AI features)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Existing Supabase variables (should already be set)
NEXT_PUBLIC_SUPABASE_URL=https://kobuclkvlacdwvxmakvq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

### Getting an Anthropic API Key:

1. Sign up at: https://console.anthropic.com/
2. Navigate to: API Keys
3. Create new key
4. Copy and add to `.env.local`

## Cost Estimates

Based on Claude Haiku 3.5 pricing:
- **Input**: $0.25 per million tokens
- **Output**: $1.25 per million tokens

### Per-Tasting Cost:
- Average extraction: 100-300 tokens
- Cost: ~$0.001-0.003 per tasting
- Example: 1000 tastings/month = $1-3/month

### Monthly Estimates:
- 1,000 active users: $5-10/month
- 10,000 active users: $50-100/month

## Usage

### Automatic AI Extraction

AI extraction happens automatically when users save tasting notes. No UI changes required!

### API Usage Examples

#### Extract Descriptors with AI:

```typescript
const response = await fetch('/api/flavor-wheels/extract-descriptors', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    sourceType: 'quick_tasting',
    sourceId: tastingId,
    text: 'This coffee has bright strawberry and jasmine notes with a silky mouthfeel.',
    category: 'coffee',
    useAI: true, // Enable AI (default: true)
  }),
});

const result = await response.json();
// {
//   success: true,
//   descriptors: [...],
//   savedCount: 5,
//   tokensUsed: 250,
//   processingTimeMs: 1200,
//   extractionMethod: 'ai'
// }
```

#### Generate Category Taxonomy:

```typescript
const response = await fetch('/api/categories/get-or-create-taxonomy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    categoryName: 'ceremonial matcha',
  }),
});

const result = await response.json();
// {
//   success: true,
//   taxonomy: {
//     taxonomy_data: {
//       baseTemplate: 'tea',
//       aromaCategories: ['Vegetal', 'Umami', 'Marine', 'Grassy'],
//       flavorCategories: ['Sweet', 'Bitter', 'Savory', 'Creamy'],
//       typicalDescriptors: ['umami', 'vegetal', 'marine', 'grassy', 'buttery'],
//       textureNotes: ['creamy', 'frothy', 'thick'],
//       aiModel: 'claude-haiku-3-20240307'
//     }
//   },
//   cached: false
// }
```

## Monitoring

### Check AI Usage Stats (Admin Only):

```bash
curl -X GET https://flavatix.com/api/admin/ai-usage-stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "success": true,
  "stats": {
    "period": "Last 30 days",
    "totalRequests": 1250,
    "totalTokens": 312500,
    "estimatedCost": "$0.1875",
    "avgProcessingTimeMs": 1150,
    "tokensPerRequest": 250,
    "successRate": 98
  }
}
```

## Fallback Strategy

If AI extraction fails (API error, rate limit, etc.), the system automatically falls back to keyword-based extraction. Users won't notice any interruption.

## Testing

After deployment, test with:

1. **Create a tasting** with descriptive notes
2. **Check descriptor extraction**: Should see AI-extracted descriptors in database
3. **View flavor wheel**: Navigate to flavor wheels page
4. **Test custom category**: Create tasting with category "kombucha" or "mezcal"

## Troubleshooting

### AI Extraction Not Working

1. **Check API Key**: Verify `ANTHROPIC_API_KEY` in environment variables
2. **Check Logs**: Look for errors in Vercel function logs
3. **Verify Fallback**: Keyword extraction should still work

### Database Errors

1. **Run Migration**: Ensure migration was executed in Supabase
2. **Check RLS Policies**: Verify policies are enabled
3. **Check Grants**: Ensure proper table permissions

### Performance Issues

1. **Monitor Token Usage**: Check `/api/admin/ai-usage-stats`
2. **Adjust Descriptor Limit**: Modify `descriptor_limit` in flavor_wheels table
3. **Cache Taxonomies**: Custom categories are cached after first generation

## Future Enhancements

### Phase 2 (Not Yet Implemented):
- Semantic descriptor grouping with embeddings
- AI-powered flavor wheel insights
- Real-time descriptor suggestions while typing
- Cross-category palate analysis

### Phase 3 (Future):
- Voice-to-text tasting notes
- Image recognition for tasting cards
- Collaborative flavor wheels
- Personalized recommendations

## Support

For issues or questions:
- Check Vercel deployment logs
- Review Supabase database logs
- Monitor AI usage stats endpoint
- Check this README for troubleshooting steps

---

**Implementation Date**: January 2025
**AI Model**: Claude Haiku 3.5
**Cost**: ~$0.001-0.003 per tasting
**Status**: ✅ Ready for deployment (after manual migration)
