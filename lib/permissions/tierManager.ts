/**
 * Tier Management System
 * Handles feature access and limits based on user tiers (no payment required)
 */

export type UserTier = 'free' | 'pro' | 'team';

export interface TierLimits {
  tastingsPerMonth: number;
  itemsPerTasting: number;
  offlineDevices: number;
  aiRecommendations: boolean;
  pdfExport: boolean;
  csvExport: boolean;
  collaborativeTastings: boolean;
  teamMembers: number;
  analyticsDepth: 'basic' | 'advanced' | 'full';
  flavorWheelTypes: string[];
  photoStorage: number; // MB
  sessionHistory: number; // days
  customCategories: boolean;
  advancedFilters: boolean;
  apiAccess: boolean;
}

export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  free: {
    tastingsPerMonth: 5,
    itemsPerTasting: 10,
    offlineDevices: 1,
    aiRecommendations: false,
    pdfExport: false,
    csvExport: true,
    collaborativeTastings: false,
    teamMembers: 1,
    analyticsDepth: 'basic',
    flavorWheelTypes: ['personal'],
    photoStorage: 50,
    sessionHistory: 30,
    customCategories: false,
    advancedFilters: false,
    apiAccess: false
  },
  pro: {
    tastingsPerMonth: -1, // unlimited
    itemsPerTasting: -1, // unlimited
    offlineDevices: 3,
    aiRecommendations: true,
    pdfExport: true,
    csvExport: true,
    collaborativeTastings: true,
    teamMembers: 1,
    analyticsDepth: 'advanced',
    flavorWheelTypes: ['personal', 'universal', 'comparative'],
    photoStorage: 500,
    sessionHistory: 365,
    customCategories: true,
    advancedFilters: true,
    apiAccess: false
  },
  team: {
    tastingsPerMonth: -1,
    itemsPerTasting: -1,
    offlineDevices: -1, // unlimited
    aiRecommendations: true,
    pdfExport: true,
    csvExport: true,
    collaborativeTastings: true,
    teamMembers: -1, // unlimited
    analyticsDepth: 'full',
    flavorWheelTypes: ['personal', 'universal', 'comparative', 'team'],
    photoStorage: 5000,
    sessionHistory: -1, // unlimited
    customCategories: true,
    advancedFilters: true,
    apiAccess: true
  }
};

export interface UserQuota {
  tier: UserTier;
  tastingsThisMonth: number;
  storageUsed: number;
  teamMembersCount: number;
}

export class TierManager {
  private tier: UserTier;
  private quota: UserQuota;

  constructor(tier: UserTier = 'free', quota?: Partial<UserQuota>) {
    this.tier = tier;
    this.quota = {
      tier,
      tastingsThisMonth: 0,
      storageUsed: 0,
      teamMembersCount: 1,
      ...quota
    };
  }

  /**
   * Check if a feature is available for the current tier
   */
  hasFeature(feature: keyof TierLimits): boolean {
    const limits = TIER_LIMITS[this.tier];
    const value = limits[feature];

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return value !== 0;
    }

    return true;
  }

  /**
   * Check if user can create a new tasting
   */
  canCreateTasting(): { allowed: boolean; reason?: string } {
    const limits = TIER_LIMITS[this.tier];

    if (limits.tastingsPerMonth === -1) {
      return { allowed: true };
    }

    if (this.quota.tastingsThisMonth >= limits.tastingsPerMonth) {
      return {
        allowed: false,
        reason: `You've reached your monthly limit of ${limits.tastingsPerMonth} tastings. Upgrade to Pro for unlimited tastings.`
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user can add an item to tasting
   */
  canAddItem(currentItemCount: number): { allowed: boolean; reason?: string } {
    const limits = TIER_LIMITS[this.tier];

    if (limits.itemsPerTasting === -1) {
      return { allowed: true };
    }

    if (currentItemCount >= limits.itemsPerTasting) {
      return {
        allowed: false,
        reason: `Free tier is limited to ${limits.itemsPerTasting} items per tasting. Upgrade to Pro for unlimited items.`
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user can upload a photo
   */
  canUploadPhoto(fileSizeMB: number): { allowed: boolean; reason?: string } {
    const limits = TIER_LIMITS[this.tier];

    if (this.quota.storageUsed + fileSizeMB > limits.photoStorage) {
      return {
        allowed: false,
        reason: `Storage limit reached (${limits.photoStorage}MB). Upgrade for more storage.`
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user can use AI features
   */
  canUseAI(): { allowed: boolean; reason?: string } {
    if (!this.hasFeature('aiRecommendations')) {
      return {
        allowed: false,
        reason: 'AI recommendations are available in Pro and Team tiers.'
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user can export to PDF
   */
  canExportPDF(): { allowed: boolean; reason?: string } {
    if (!this.hasFeature('pdfExport')) {
      return {
        allowed: false,
        reason: 'PDF export is available in Pro and Team tiers.'
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user can create collaborative session
   */
  canCollaborate(): { allowed: boolean; reason?: string } {
    if (!this.hasFeature('collaborativeTastings')) {
      return {
        allowed: false,
        reason: 'Collaborative tastings are available in Pro and Team tiers.'
      };
    }

    return { allowed: true };
  }

  /**
   * Get feature comparison for upgrade prompt
   */
  getUpgradeFeatures(): string[] {
    const currentLimits = TIER_LIMITS[this.tier];
    const nextTier = this.tier === 'free' ? 'pro' : 'team';
    const nextLimits = TIER_LIMITS[nextTier];

    const features: string[] = [];

    if (currentLimits.tastingsPerMonth !== -1 && nextLimits.tastingsPerMonth === -1) {
      features.push('Unlimited tastings per month');
    }

    if (!currentLimits.aiRecommendations && nextLimits.aiRecommendations) {
      features.push('AI-powered flavor recommendations');
    }

    if (!currentLimits.pdfExport && nextLimits.pdfExport) {
      features.push('Professional PDF reports');
    }

    if (!currentLimits.collaborativeTastings && nextLimits.collaborativeTastings) {
      features.push('Real-time collaborative tastings');
    }

    if (currentLimits.photoStorage < nextLimits.photoStorage) {
      features.push(`${nextLimits.photoStorage}MB photo storage`);
    }

    return features;
  }

  /**
   * Update quota usage
   */
  updateQuota(updates: Partial<UserQuota>) {
    this.quota = { ...this.quota, ...updates };
  }

  /**
   * Get current tier
   */
  getTier(): UserTier {
    return this.tier;
  }

  /**
   * Get current quota
   */
  getQuota(): UserQuota {
    return this.quota;
  }

  /**
   * Get limits for current tier
   */
  getLimits(): TierLimits {
    return TIER_LIMITS[this.tier];
  }

  /**
   * Check if user should see upgrade prompt
   */
  shouldPromptUpgrade(): boolean {
    if (this.tier === 'team') return false;

    const limits = TIER_LIMITS[this.tier];

    // Check if approaching limits
    if (limits.tastingsPerMonth !== -1 &&
        this.quota.tastingsThisMonth >= limits.tastingsPerMonth * 0.8) {
      return true;
    }

    if (limits.photoStorage !== -1 &&
        this.quota.storageUsed >= limits.photoStorage * 0.8) {
      return true;
    }

    return false;
  }
}

// Global tier manager instance
let globalTierManager: TierManager | null = null;

export function getTierManager(): TierManager {
  if (!globalTierManager) {
    globalTierManager = new TierManager('free');
  }
  return globalTierManager;
}

export function setUserTier(tier: UserTier, quota?: Partial<UserQuota>) {
  globalTierManager = new TierManager(tier, quota);
  return globalTierManager;
}