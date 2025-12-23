/**
 * UI/UX Property Tests
 * 
 * These tests validate the UI/UX properties defined in the ui-ux-audit spec.
 * They ensure consistent behavior across modals, navigation, viewport handling,
 * touch targets, dark mode, and accessibility features.
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

describe('UI/UX Property Tests', () => {
  
  describe('Property 1: Modal Z-Index Hierarchy', () => {
    it('should have modals with z-50 or higher', async () => {
      const modalFiles = (await findFiles('components/**/*Modal*.tsx')) || [];
      const issues: string[] = [];
      
      if (Array.isArray(modalFiles)) {
        for (const file of modalFiles) {
          const content = readFileContent(file);
          // Check for z-index usage in modals
          if (content.includes('fixed') && content.includes('inset-0')) {
            // Modal backdrop should have z-50
            if (!content.includes('z-50') && !content.includes('z-[')) {
              issues.push(`${file}: Modal may be missing z-50 class`);
            }
          }
        }
      }
      
      expect(issues).toEqual([]);
    });

    it('should have consistent z-index hierarchy (modals > dropdowns > headers)', async () => {
      // Z-index hierarchy: modals (z-50) > dropdowns (z-40) > headers (z-40) > content (z-0)
      const modalFiles = (await findFiles('components/**/*Modal*.tsx')) || [];
      
      // Verify modals use z-50
      if (Array.isArray(modalFiles)) {
        for (const file of modalFiles) {
          const content = readFileContent(file);
          if (content.includes('fixed') && content.includes('inset-0')) {
            expect(content).toMatch(/z-50|z-\[5[0-9]\]/);
          }
        }
      }
    });
  });

  describe('Property 2: Modal Centering', () => {
    it('should center modals using flex utilities', async () => {
      const modalFiles = (await findFiles('components/**/*Modal*.tsx')) || [];
      const issues: string[] = [];
      
      if (Array.isArray(modalFiles)) {
        for (const file of modalFiles) {
          const content = readFileContent(file);
          if (content.includes('fixed') && content.includes('inset-0')) {
            // Should use flex centering
            if (!content.includes('flex') || 
                (!content.includes('items-center') && !content.includes('items-end'))) {
              issues.push(`${file}: Modal may not be properly centered`);
            }
            if (!content.includes('justify-center')) {
              issues.push(`${file}: Modal may not be horizontally centered`);
            }
          }
        }
      }
      
      expect(issues).toEqual([]);
    });
  });

  describe('Property 3: Modal Backdrop', () => {
    it('should have semi-transparent backdrop', async () => {
      const modalFiles = (await findFiles('components/**/*Modal*.tsx')) || [];
      const issues: string[] = [];
      
      if (Array.isArray(modalFiles)) {
        for (const file of modalFiles) {
          const content = readFileContent(file);
          if (content.includes('fixed') && content.includes('inset-0')) {
            // Should have backdrop
            if (!content.includes('bg-black') && !content.includes('bg-opacity') && 
                !content.includes('bg-black/')) {
              issues.push(`${file}: Modal may be missing backdrop`);
            }
          }
        }
      }
      
      expect(issues).toEqual([]);
    });
  });

  describe('Property 7: Content Bottom Padding', () => {
    it('should have bottom padding on pages with bottom navigation', async () => {
      const pageFiles = (await findFiles('pages/**/*.tsx')) || [];
      const issues: string[] = [];
      
      // Pages that use BottomNavigation should have pb-20 or pb-24
      const pagesWithBottomNav = ['social.tsx', 'dashboard.tsx', 'my-tastings.tsx', 'sample.tsx'];
      
      if (Array.isArray(pageFiles)) {
        for (const file of pageFiles) {
          const fileName = path.basename(file);
          if (pagesWithBottomNav.includes(fileName)) {
            const content = readFileContent(file);
            // Should have bottom padding
            if (!content.includes('pb-20') && !content.includes('pb-24') && 
                !content.includes('pb-28') && !content.includes('PageLayout')) {
              issues.push(`${file}: May be missing bottom padding for navigation`);
            }
          }
        }
      }
      
      expect(issues).toEqual([]);
    });
  });

  describe('Property 8: Full Height Layouts', () => {
    it('should use min-h-screen instead of h-screen for main containers', async () => {
      const pageFiles = (await findFiles('pages/**/*.tsx')) || [];
      const issues: string[] = [];
      
      if (Array.isArray(pageFiles)) {
        for (const file of pageFiles) {
          const content = readFileContent(file);
          // Check for h-screen usage (should be min-h-screen)
          const hScreenMatches = content.match(/className="[^"]*h-screen[^"]*"/g) || [];
          
          for (const match of hScreenMatches) {
            // Allow h-screen if it's part of a modal or overlay
            if (!match.includes('fixed') && !match.includes('absolute')) {
              // Check if it's a flex container that should use min-h-screen
              if (match.includes('flex') && !match.includes('min-h-screen')) {
                issues.push(`${file}: Uses h-screen without min-h-screen - may cause mobile viewport issues`);
              }
            }
          }
        }
      }
      
      expect(issues).toEqual([]);
    });
  });

  describe('Property 11: Touch Target Minimum Size', () => {
    it('should have close buttons with minimum 44x44px touch targets', async () => {
      const modalFiles = (await findFiles('components/**/*Modal*.tsx')) || [];
      const issues: string[] = [];
      
      if (Array.isArray(modalFiles)) {
        for (const file of modalFiles) {
          const content = readFileContent(file);
          // Look for close buttons
          const closeButtonMatches = content.match(/onClick={[^}]*close[^}]*}[^>]*className="[^"]*"/gi) || [];
          
          for (const match of closeButtonMatches) {
            // Should have minimum 44px (w-11 h-11 or min-w-[44px] min-h-[44px])
            if (!match.includes('w-11') && !match.includes('min-w-[44px]') &&
                !match.includes('w-12') && !match.includes('min-w-[48px]')) {
              // Check if it's a small button
              if (match.includes('w-8') || match.includes('w-6') || match.includes('p-2')) {
                issues.push(`${file}: Close button may have insufficient touch target size`);
              }
            }
          }
        }
      }
      
      expect(issues).toEqual([]);
    });
  });

  describe('Property 15: Focus Trap in Modals', () => {
    it('should have focus management in modals', async () => {
      const modalFiles = (await findFiles('components/**/*Modal*.tsx')) || [];
      const issues: string[] = [];
      
      if (Array.isArray(modalFiles)) {
        for (const file of modalFiles) {
          const content = readFileContent(file);
          // Check for focus trap implementation
          if (content.includes('fixed') && content.includes('inset-0')) {
            // Should have role="dialog" and aria-modal="true"
            if (!content.includes('role="dialog"')) {
              issues.push(`${file}: Modal missing role="dialog"`);
            }
            if (!content.includes('aria-modal="true"')) {
              issues.push(`${file}: Modal missing aria-modal="true"`);
            }
          }
        }
      }
      
      expect(issues).toEqual([]);
    });
  });

  describe('Property 17: Escape Key Modal Dismissal', () => {
    it('should handle escape key in modals', async () => {
      const modalFiles = (await findFiles('components/**/*Modal*.tsx')) || [];
      const issues: string[] = [];
      
      if (Array.isArray(modalFiles)) {
        for (const file of modalFiles) {
          const content = readFileContent(file);
          // Check for escape key handling
          if (content.includes('fixed') && content.includes('inset-0')) {
            if (!content.includes('Escape') && !content.includes('keydown') && 
                !content.includes('onKeyDown')) {
              issues.push(`${file}: Modal may not handle Escape key`);
            }
          }
        }
      }
      
      expect(issues).toEqual([]);
    });
  });

  describe('Property 18: Dark Mode Coverage', () => {
    it('should have dark mode variants on key elements', async () => {
      const componentFiles = (await findFiles('components/**/*.tsx')) || [];
      const issues: string[] = [];
      
      if (Array.isArray(componentFiles)) {
        for (const file of componentFiles) {
          const content = readFileContent(file);
          // Check for background colors without dark variants
          const bgMatches = content.match(/bg-(white|zinc-[0-9]+|gray-[0-9]+)/g) || [];
          
          for (const match of bgMatches) {
            // Check if there's a corresponding dark: variant nearby
            const regex = new RegExp(`${match}[^"]*dark:bg-`);
            if (!regex.test(content) && !content.includes(`dark:${match}`)) {
              // This is a heuristic - may have false positives
              // Only flag if the file doesn't have any dark mode support
              if (!content.includes('dark:')) {
                issues.push(`${file}: May be missing dark mode support`);
                break; // Only report once per file
              }
            }
          }
        }
      }
      
      // Allow some files without dark mode (utility components, etc.)
      expect(issues.length).toBeLessThan(5);
    });
  });

  describe('Property 19: Reduced Motion Support', () => {
    it('should have reduced motion support in globals.css', () => {
      const globalsContent = readFileContent('styles/globals.css');
      
      expect(globalsContent).toContain('prefers-reduced-motion');
      // Just verify the prefers-reduced-motion rule exists
      expect(globalsContent.length).toBeGreaterThan(0);
    });
  });

  describe('Property 20: Navigation Consistency', () => {
    it('should have consistent bottom navigation height', () => {
      const bottomNavContent = readFileContent('components/navigation/BottomNavigation.tsx');
      
      // Should have consistent height (h-15 = 60px or similar)
      expect(bottomNavContent).toMatch(/h-1[45]|h-\[6[0-9]px\]|pb-safe/);
    });

    it('should have z-50 on bottom navigation', () => {
      const bottomNavContent = readFileContent('components/navigation/BottomNavigation.tsx');
      
      expect(bottomNavContent).toContain('z-50');
    });
  });

  describe('Property 21: Loading States', () => {
    it('should have loading states in data-fetching components', async () => {
      const pageFiles = (await findFiles('pages/**/*.tsx')) || [];
      let pagesWithLoading = 0;
      let pagesWithDataFetching = 0;
      
      if (Array.isArray(pageFiles)) {
        for (const file of pageFiles) {
          const content = readFileContent(file);
          // Check if page fetches data
          if (content.includes('useEffect') && 
              (content.includes('fetch') || content.includes('supabase') || content.includes('api'))) {
            pagesWithDataFetching++;
            // Should have loading state
            if (content.includes('loading') || content.includes('isLoading') || 
                content.includes('Loading') || content.includes('Skeleton')) {
              pagesWithLoading++;
            }
          }
        }
      }
      
      // At least 80% of data-fetching pages should have loading states
      if (pagesWithDataFetching > 0) {
        const ratio = pagesWithLoading / pagesWithDataFetching;
        expect(ratio).toBeGreaterThanOrEqual(0.8);
      }
    });
  });
});
