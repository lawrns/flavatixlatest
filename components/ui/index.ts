/**
 * UI Components Index
 * 
 * Centralized exports for all UI components.
 */

export { default as Button } from './Button';
export { Card, CardHeader, CardContent, CardFooter } from './Card';
export { default as Combobox } from './Combobox';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as Input } from './Input';
export { default as LoadingSpinner } from './LoadingSpinner';
export { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';
export { default as OptimizedImage, Avatar, Thumbnail } from './OptimizedImage';
export { 
  LiveRegion, 
  LiveRegionProvider, 
  useLiveRegion,
  LoadingAnnouncement,
  ErrorAnnouncement,
  SuccessAnnouncement 
} from './LiveRegion';
export {
  FormStepper,
  FormStepperProvider,
  useFormStepper,
  StepperProgress,
  StepContent,
  StepperNavigation,
} from './FormStepper';
export type { Step } from './FormStepper';
export { LoadingState, InlineLoading, ButtonLoading } from './LoadingState';
export { FlavorPill, FLAVOR_COLORS, detectCategory } from './FlavorPill';
export { ScoreRing, ScoreBadge } from './ScoreRing';
export { EmptyState, NoTastingsEmpty, NoResultsEmpty, NoPostsEmpty } from './EmptyState';

export { default as CategoryStamp } from './CategoryStamp';
export { default as BottomSheet } from './BottomSheet';
