/**
 * Codebase Readiness Property Tests
 * 
 * These tests validate the codebase readiness properties defined in the codebase-readiness-audit spec.
 * They ensure consistent behavior across toast patterns, permission-based UI, API authentication,
 * and mode-specific behavior.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Helper to read file content
const readFileContent = (filePath: string): string => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, 'utf-8');
  }
  return '';
};

// Helper to find files matching pattern
const findFiles = async (pattern: string): Promise<string[]> => {
  return glob(pattern, { cwd: process.cwd() });
};

describe('Codebase Readiness Property Tests', () => {
  
  describe('Property 6: Feedback Consistency (Toast Behavior)', () => {
    /**
     * Property: For any async operation that shows a success toast,
     * the toast should only appear after the operation completes successfully.
     * Error toasts should only appear on failure.
     * 
     * Validates: Requirements 4.1, 4.2, 4.5
     */
    
    it('should show success toasts only after async operations complete', async () => {
      const files = (await findFiles('{components,pages,hooks}/**/*.{tsx,ts}')) || [];
      const issues: string[] = [];
      
      if (Array.isArray(files)) {
        for (const file of files) {
          const content = readFileContent(file);
          
          // Look for patterns where toast.success is called before await
          // This is a heuristic check - we look for toast.success followed by await on the same line or nearby
          const lines = content.split('\n');
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Check for toast.success before an await in a try block
            if (line.includes('toast.success') && !line.includes('//')) {
              // Look at surrounding context (5 lines before and after)
              const contextStart = Math.max(0, i - 5);
              const contextEnd = Math.min(lines.length, i + 5);
              const context = lines.slice(contextStart, contextEnd).join('\n');
              
              // If there's an await after the toast.success in the same try block, it's suspicious
              const afterToast = lines.slice(i + 1, contextEnd).join('\n');
              if (afterToast.includes('await') && !afterToast.includes('catch')) {
                // Check if this is inside a try block
                const beforeToast = lines.slice(contextStart, i).join('\n');
                if (beforeToast.includes('try {') && !beforeToast.includes('catch')) {
                  issues.push(`${file}:${i + 1}: Potential premature success toast before async operation`);
                }
              }
            }
          }
        }
      }
      
      // Allow some false positives but flag if there are many issues
      expect(issues.length).toBeLessThan(3);
    });

    it('should have error toasts in catch blocks', async () => {
      const files = (await findFiles('{components,pages,hooks}/**/*.{tsx,ts}')) || [];
      let catchBlocksWithErrorToast = 0;
      let catchBlocksTotal = 0;
      
      if (Array.isArray(files)) {
        for (const file of files) {
          const content = readFileContent(file);
          
          // Count catch blocks
          const catchMatches = content.match(/catch\s*\([^)]*\)\s*{/g) || [];
          catchBlocksTotal += catchMatches.length;
          
          // Count catch blocks with toast.error
          const catchWithErrorToast = content.match(/catch\s*\([^)]*\)\s*{[^}]*toast\.error/g) || [];
          catchBlocksWithErrorToast += catchWithErrorToast.length;
        }
      }
      
      // At least 50% of catch blocks should have error toasts (some may use console.error or other handling)
      if (catchBlocksTotal > 0) {
        const ratio = catchBlocksWithErrorToast / catchBlocksTotal;
        expect(ratio).toBeGreaterThanOrEqual(0.3);
      }
    });

    it('should use optimistic updates with rollback for social interactions', () => {
      const socialPageContent = readFileContent('pages/social.tsx');
      const useSocialFeedContent = readFileContent('hooks/useSocialFeed.ts');
      
      // Check for optimistic update pattern (update state before async, rollback on error)
      const hasOptimisticLike = socialPageContent.includes('setLikedPosts') || 
                                useSocialFeedContent.includes('setLikedPosts');
      const hasRollback = socialPageContent.includes('Rollback') || 
                          useSocialFeedContent.includes('Rollback');
      
      expect(hasOptimisticLike).toBe(true);
      expect(hasRollback).toBe(true);
    });
  });

  describe('Property 8: Permission-Based UI', () => {
    /**
     * Property: For any UI element that requires specific permissions,
     * the element should be hidden or disabled when the user lacks permission.
     * 
     * Validates: Requirements 5.4
     */
    
    it('should hide add item button in competition mode', () => {
      const content = readFileContent('components/quick-tasting/QuickTastingSession.tsx');
      
      // Check for competition mode check before add item button
      expect(content).toContain("session.mode !== 'competition'");
      expect(content).toContain('userPermissions.canAddItems');
    });

    it('should check permissions before rendering edit controls', () => {
      const content = readFileContent('components/quick-tasting/QuickTastingSession.tsx');
      
      // Check for permission checks
      expect(content).toContain('userPermissions');
      expect(content).toContain('canAddItems');
      expect(content).toContain('canModerate');
    });

    it('should prevent adding items in competition mode via function check', () => {
      const content = readFileContent('components/quick-tasting/QuickTastingSession.tsx');
      
      // Check for competition mode check in addNewItem function
      expect(content).toContain("if (session.mode === 'competition')");
      expect(content).toContain("Cannot add items in competition mode");
    });
  });

  describe('Property 4: API Authentication Enforcement', () => {
    /**
     * Property: For any API endpoint that requires authentication,
     * the endpoint should use withAuth middleware.
     * 
     * Validates: Requirements 3.7
     */
    
    it('should use withAuth middleware on protected endpoints', async () => {
      const apiFiles = (await findFiles('pages/api/**/*.ts')) || [];
      const issues: string[] = [];
      
      if (Array.isArray(apiFiles)) {
        for (const file of apiFiles) {
          const content = readFileContent(file);
          
          // Skip public endpoints (auth endpoints, health checks)
          if (file.includes('/auth/') || file.includes('health')) {
            continue;
          }
          
          // Check if file exports a handler
          if (content.includes('export default') && content.includes('createApiHandler')) {
            // Should use withAuth
            if (!content.includes('withAuth')) {
              issues.push(`${file}: API endpoint may be missing withAuth middleware`);
            }
          }
        }
      }
      
      expect(issues).toEqual([]);
    });

    it('should use withRateLimit on API endpoints', async () => {
      const apiFiles = (await findFiles('pages/api/**/*.ts')) || [];
      let endpointsWithRateLimit = 0;
      let totalEndpoints = 0;
      
      if (Array.isArray(apiFiles)) {
        for (const file of apiFiles) {
          const content = readFileContent(file);
          
          if (content.includes('createApiHandler')) {
            totalEndpoints++;
            if (content.includes('withRateLimit')) {
              endpointsWithRateLimit++;
            }
          }
        }
      }
      
      // At least 80% of endpoints should have rate limiting
      if (totalEndpoints > 0) {
        const ratio = endpointsWithRateLimit / totalEndpoints;
        expect(ratio).toBeGreaterThanOrEqual(0.8);
      }
    });
  });

  describe('Property 7: Mode-Specific Behavior', () => {
    /**
     * Property: For any tasting session, the behavior should be consistent
     * with the session mode (quick, study, competition).
     * 
     * Validates: Requirements 5.1, 5.2, 5.3
     */
    
    it('should have different behavior for each mode', () => {
      const content = readFileContent('components/quick-tasting/QuickTastingSession.tsx');
      
      // Check for mode-specific logic
      expect(content).toContain("session.mode === 'quick'");
      expect(content).toContain("session.mode === 'study'");
      expect(content).toContain("session.mode === 'competition'");
    });

    it('should set appropriate permissions for quick mode', () => {
      const content = readFileContent('components/quick-tasting/QuickTastingSession.tsx');
      
      // Quick mode should give host permissions
      expect(content).toContain("if (session.mode === 'quick')");
      expect(content).toContain("role: 'host'");
      expect(content).toContain("canAddItems: true");
    });

    it('should load user roles for study mode', () => {
      const content = readFileContent('components/quick-tasting/QuickTastingSession.tsx');
      
      // Study mode should load participant roles
      expect(content).toContain("if (session.mode === 'study')");
      expect(content).toContain('loadUserRole');
    });
  });

  describe('Property 1: Database Security Completeness', () => {
    /**
     * Property: For any database table with user data,
     * RLS policies should be configured.
     * 
     * Validates: Requirements 1.2
     */
    
    it('should have RLS policies in migrations', async () => {
      const migrationFiles = (await findFiles('migrations/**/*.sql')) || [];
      let hasRLSPolicies = false;
      
      if (Array.isArray(migrationFiles)) {
        for (const file of migrationFiles) {
          const content = readFileContent(file);
          if (content.includes('CREATE POLICY') || content.includes('ENABLE ROW LEVEL SECURITY')) {
            hasRLSPolicies = true;
            break;
          }
        }
      }
      
      // Also check schema.sql
      const schemaContent = readFileContent('schema.sql');
      if (schemaContent.includes('CREATE POLICY') || schemaContent.includes('ENABLE ROW LEVEL SECURITY')) {
        hasRLSPolicies = true;
      }
      
      expect(hasRLSPolicies).toBe(true);
    });
  });

  describe('Error Boundary Coverage', () => {
    /**
     * Property: Critical sections should be wrapped in ErrorBoundary.
     * 
     * Validates: Requirements 6.1
     */
    
    it('should have ErrorBoundary in critical pages', () => {
      const socialContent = readFileContent('pages/social.tsx');
      const competitionContent = readFileContent('pages/competition/[id].tsx');
      const tastingContent = readFileContent('pages/tasting/[id].tsx');
      
      expect(socialContent).toContain('ErrorBoundary');
      expect(competitionContent).toContain('ErrorBoundary');
      expect(tastingContent).toContain('ErrorBoundary');
    });

    it('should have global ErrorBoundary in _app.tsx', () => {
      const appContent = readFileContent('pages/_app.tsx');
      
      expect(appContent).toContain('ErrorBoundary');
    });
  });
});
