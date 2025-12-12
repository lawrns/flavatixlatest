/**
 * Layout Components
 * 
 * Unified layout system for consistent page structure and spacing.
 * 
 * Usage:
 * import { PageLayout, Container, Stack, Section } from '@/components/layout';
 */

export { Container } from './Container';
export type { ContainerSize } from './Container';

export { PageLayout } from './PageLayout';

export { Stack } from './Stack';

export { Section } from './Section';

// Re-export AppShell for backward compatibility (prefer PageLayout for new pages)
export { AppShell, AppShellContent, AppShellSection } from './AppShell';
