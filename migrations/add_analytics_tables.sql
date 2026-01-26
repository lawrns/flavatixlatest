-- ============================================================================
-- Analytics Tables for PWA Metrics Tracking
-- ============================================================================
-- This migration creates tables for tracking PWA metrics needed for the
-- Day 90 Capacitor decision:
-- - MAU/DAU tracking
-- - Mobile vs desktop traffic split
-- - PWA install rate
-- - User acquisition cost (CAC)
-- - Unit economics (LTV if monetization active)
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table: analytics_events
-- Stores all custom analytics events
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  user_id UUID,
  platform TEXT NOT NULL,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes for common queries
  CONSTRAINT analytics_events_event_name_check CHECK (event_name IS NOT NULL)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_platform ON public.analytics_events(platform);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);

-- ============================================================================
-- Table: analytics_page_views
-- Stores page view events for traffic analysis
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.analytics_page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  path TEXT NOT NULL,
  referrer TEXT,
  platform TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes for common queries
  CONSTRAINT analytics_page_views_path_check CHECK (path IS NOT NULL)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_user_id ON public.analytics_page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_platform ON public.analytics_page_views(platform);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_created_at ON public.analytics_page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_path ON public.analytics_page_views(path);

-- ============================================================================
-- Table: analytics_pwa_installs
-- Stores PWA installation events
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.analytics_pwa_installs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  platform TEXT NOT NULL,
  user_agent TEXT,
  source TEXT DEFAULT 'direct', -- direct, campaign, referral, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_pwa_installs_user_id ON public.analytics_pwa_installs(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_pwa_installs_platform ON public.analytics_pwa_installs(platform);
CREATE INDEX IF NOT EXISTS idx_analytics_pwa_installs_created_at ON public.analytics_pwa_installs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_pwa_installs_source ON public.analytics_pwa_installs(source);

-- ============================================================================
-- Table: analytics_sessions
-- Stores user session data for MAU/DAU calculation
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.analytics_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  session_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  duration INTEGER NOT NULL, -- Duration in seconds
  pages_viewed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes for common queries
  CONSTRAINT analytics_sessions_session_id_check CHECK (session_id IS NOT NULL),
  CONSTRAINT analytics_sessions_duration_check CHECK (duration >= 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user_id ON public.analytics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_platform ON public.analytics_sessions(platform);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_created_at ON public.analytics_sessions(created_at DESC);

-- ============================================================================
-- Table: analytics_user_acquisition
-- Stores user acquisition data for CAC calculation
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.analytics_user_acquisition (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  source TEXT NOT NULL, -- organic, paid, referral, social, etc.
  campaign TEXT,
  cost NUMERIC(10, 2), -- Cost in currency units
  platform TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes for common queries
  CONSTRAINT analytics_user_acquisition_user_id_check CHECK (user_id IS NOT NULL),
  CONSTRAINT analytics_user_acquisition_source_check CHECK (source IS NOT NULL)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_user_acquisition_user_id ON public.analytics_user_acquisition(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_acquisition_source ON public.analytics_user_acquisition(source);
CREATE INDEX IF NOT EXISTS idx_analytics_user_acquisition_created_at ON public.analytics_user_acquisition(created_at DESC);

-- ============================================================================
-- Enable Row Level Security (RLS)
-- ============================================================================

-- Enable RLS on all analytics tables
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_pwa_installs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_user_acquisition ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Analytics events: Service role can insert, authenticated users can only see their own
CREATE POLICY "Service role can insert analytics events"
  ON public.analytics_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Users can view own analytics events"
  ON public.analytics_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Page views: Service role can insert, authenticated users can only see their own
CREATE POLICY "Service role can insert page views"
  ON public.analytics_page_views
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Users can view own page views"
  ON public.analytics_page_views
  FOR SELECT
  USING (auth.uid() = user_id);

-- PWA installs: Service role can insert, authenticated users can only see their own
CREATE POLICY "Service role can insert PWA installs"
  ON public.analytics_pwa_installs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Users can view own PWA installs"
  ON public.analytics_pwa_installs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Sessions: Service role can insert, authenticated users can only see their own
CREATE POLICY "Service role can insert sessions"
  ON public.analytics_sessions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Users can view own sessions"
  ON public.analytics_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- User acquisition: Service role can insert, authenticated users can only see their own
CREATE POLICY "Service role can insert user acquisition"
  ON public.analytics_user_acquisition
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Users can view own user acquisition"
  ON public.analytics_user_acquisition
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- Grant permissions
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.analytics_events TO service_role;
GRANT ALL ON public.analytics_page_views TO service_role;
GRANT ALL ON public.analytics_pwa_installs TO service_role;
GRANT ALL ON public.analytics_sessions TO service_role;
GRANT ALL ON public.analytics_user_acquisition TO service_role;

-- ============================================================================
-- Helper Views for Common Metrics
-- ============================================================================

-- View: Daily Active Users (DAU)
CREATE OR REPLACE VIEW analytics_daily_active_users AS
SELECT
  DATE(created_at) AS date,
  platform,
  COUNT(DISTINCT user_id) AS daily_active_users,
  COUNT(*) AS total_sessions
FROM public.analytics_sessions
WHERE user_id IS NOT NULL
GROUP BY DATE(created_at), platform
ORDER BY date DESC, platform;

-- View: Monthly Active Users (MAU)
CREATE OR REPLACE VIEW analytics_monthly_active_users AS
SELECT
  DATE_TRUNC('month', created_at) AS month,
  platform,
  COUNT(DISTINCT user_id) AS monthly_active_users
FROM public.analytics_sessions
WHERE user_id IS NOT NULL
GROUP BY DATE_TRUNC('month', created_at), platform
ORDER BY month DESC, platform;

-- View: PWA Install Rate
CREATE OR REPLACE VIEW analytics_pwa_install_rate AS
WITH installs AS (
  SELECT
    DATE(created_at) AS date,
    platform,
    COUNT(*) AS install_count
  FROM public.analytics_pwa_installs
  GROUP BY DATE(created_at), platform
),
sessions AS (
  SELECT
    DATE(created_at) AS date,
    platform,
    COUNT(DISTINCT user_id) AS unique_users
  FROM public.analytics_sessions
  WHERE user_id IS NOT NULL
  GROUP BY DATE(created_at), platform
)
SELECT
  COALESCE(sessions.date, installs.date) AS date,
  COALESCE(sessions.platform, installs.platform) AS platform,
  COALESCE(installs.install_count, 0) AS installs,
  COALESCE(sessions.unique_users, 0) AS unique_users,
  CASE
    WHEN sessions.unique_users > 0 THEN
      ROUND((COALESCE(installs.install_count, 0)::NUMERIC / sessions.unique_users) * 100, 2)
    ELSE 0
  END AS install_rate_percentage
FROM installs
FULL OUTER JOIN sessions ON installs.date = sessions.date AND installs.platform = sessions.platform
ORDER BY date DESC, platform;

-- View: Mobile vs Desktop Traffic
CREATE OR REPLACE VIEW analytics_platform_split AS
SELECT
  DATE(created_at) AS date,
  platform,
  COUNT(*) AS page_views,
  COUNT(DISTINCT user_id) AS unique_users
FROM public.analytics_page_views
GROUP BY DATE(created_at), platform
ORDER BY date DESC, platform;

-- View: User Acquisition Cost (CAC)
CREATE OR REPLACE VIEW analytics_cac AS
SELECT
  DATE_TRUNC('month', created_at) AS month,
  source,
  COUNT(*) AS users_acquired,
  SUM(cost) AS total_cost,
  CASE
    WHEN COUNT(*) > 0 THEN ROUND((SUM(cost) / COUNT(*))::NUMERIC, 2)
    ELSE 0
  END AS cac_per_user
FROM public.analytics_user_acquisition
WHERE cost IS NOT NULL
GROUP BY DATE_TRUNC('month', created_at), source
ORDER BY month DESC, source;

-- ============================================================================
-- Comments for documentation
-- ============================================================================
COMMENT ON TABLE public.analytics_events IS 'Stores all custom analytics events for tracking user interactions';
COMMENT ON TABLE public.analytics_page_views IS 'Stores page view events for traffic analysis and MAU/DAU calculation';
COMMENT ON TABLE public.analytics_pwa_installs IS 'Stores PWA installation events for tracking install rates';
COMMENT ON TABLE public.analytics_sessions IS 'Stores user session data for engagement metrics and MAU/DAU calculation';
COMMENT ON TABLE public.analytics_user_acquisition IS 'Stores user acquisition data for CAC and LTV calculation';

COMMENT ON VIEW analytics_daily_active_users IS 'Daily Active Users (DAU) by platform';
COMMENT ON VIEW analytics_monthly_active_users IS 'Monthly Active Users (MAU) by platform';
COMMENT ON VIEW analytics_pwa_install_rate IS 'PWA installation rate as percentage of unique users';
COMMENT ON VIEW analytics_platform_split IS 'Mobile vs desktop traffic split';
COMMENT ON VIEW analytics_cac IS 'Customer Acquisition Cost (CAC) by source and month';
