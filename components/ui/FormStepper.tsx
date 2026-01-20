/**
 * FormStepper Component
 *
 * Multi-step form wizard with progress indicator.
 * Provides navigation between steps with validation support.
 */

import React, { useState, useCallback, createContext, useContext, useMemo } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  isOptional?: boolean;
  validate?: () => boolean | Promise<boolean>;
}

interface FormStepperContextValue {
  currentStep: number;
  totalSteps: number;
  steps: Step[];
  goToStep: (step: number) => void;
  nextStep: () => Promise<boolean>;
  prevStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
  isStepComplete: (stepIndex: number) => boolean;
  markStepComplete: (stepIndex: number) => void;
  markStepIncomplete: (stepIndex: number) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const FormStepperContext = createContext<FormStepperContextValue | null>(null);

export function useFormStepper(): FormStepperContextValue {
  const context = useContext(FormStepperContext);
  if (!context) {
    throw new Error('useFormStepper must be used within a FormStepperProvider');
  }
  return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

interface FormStepperProviderProps {
  children: React.ReactNode;
  steps: Step[];
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
}

export const FormStepperProvider: React.FC<FormStepperProviderProps> = ({
  children,
  steps,
  initialStep = 0,
  onStepChange,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
        onStepChange?.(step);
      }
    },
    [totalSteps, onStepChange]
  );

  const nextStep = useCallback(async () => {
    const currentStepConfig = steps[currentStep];

    // Run validation if provided
    if (currentStepConfig.validate) {
      const isValid = await currentStepConfig.validate();
      if (!isValid) {
        return false;
      }
    }

    // Mark current step as complete
    setCompletedSteps((prev) => new Set(prev).add(currentStep));

    if (isLastStep) {
      onComplete?.();
      return true;
    }

    setCurrentStep((prev) => prev + 1);
    onStepChange?.(currentStep + 1);
    return true;
  }, [currentStep, steps, isLastStep, onComplete, onStepChange]);

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
      onStepChange?.(currentStep - 1);
    }
  }, [isFirstStep, currentStep, onStepChange]);

  const isStepComplete = useCallback(
    (stepIndex: number) => {
      return completedSteps.has(stepIndex);
    },
    [completedSteps]
  );

  const markStepComplete = useCallback((stepIndex: number) => {
    setCompletedSteps((prev) => new Set(prev).add(stepIndex));
  }, []);

  const markStepIncomplete = useCallback((stepIndex: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      newSet.delete(stepIndex);
      return newSet;
    });
  }, []);

  const value = useMemo<FormStepperContextValue>(
    () => ({
      currentStep,
      totalSteps,
      steps,
      goToStep,
      nextStep,
      prevStep,
      isFirstStep,
      isLastStep,
      canGoNext: !isLastStep,
      canGoPrev: !isFirstStep,
      isStepComplete,
      markStepComplete,
      markStepIncomplete,
    }),
    [
      currentStep,
      totalSteps,
      steps,
      goToStep,
      nextStep,
      prevStep,
      isFirstStep,
      isLastStep,
      isStepComplete,
      markStepComplete,
      markStepIncomplete,
    ]
  );

  return <FormStepperContext.Provider value={value}>{children}</FormStepperContext.Provider>;
};

// ============================================================================
// PROGRESS INDICATOR
// ============================================================================

interface StepperProgressProps {
  className?: string;
  variant?: 'dots' | 'numbers' | 'full';
  showLabels?: boolean;
}

export const StepperProgress: React.FC<StepperProgressProps> = ({
  className,
  variant = 'full',
  showLabels = true,
}) => {
  const { currentStep, steps, goToStep, isStepComplete } = useFormStepper();

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => goToStep(index)}
            aria-label={`Go to step ${index + 1}: ${step.title}`}
            aria-current={index === currentStep ? 'step' : undefined}
            className={cn(
              'w-3 h-3 rounded-full transition-[background-color,transform] duration-200',
              index === currentStep
                ? 'bg-primary scale-125'
                : isStepComplete(index)
                  ? 'bg-primary/60'
                  : 'bg-zinc-300 dark:bg-zinc-600'
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === 'numbers') {
    return (
      <div className={cn('flex items-center justify-center gap-4', className)}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() => goToStep(index)}
              aria-label={`Go to step ${index + 1}: ${step.title}`}
              aria-current={index === currentStep ? 'step' : undefined}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-[color,background-color] duration-200',
                index === currentStep
                  ? 'bg-primary text-white'
                  : isStepComplete(index)
                    ? 'bg-primary/20 text-primary'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
              )}
            >
              {isStepComplete(index) ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-8 transition-colors duration-200',
                  isStepComplete(index) ? 'bg-primary' : 'bg-zinc-200 dark:bg-zinc-700'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Full variant with labels
  return (
    <nav aria-label="Progress" className={cn('w-full', className)}>
      <ol className="flex items-center">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn('relative flex-1', index !== steps.length - 1 && 'pr-8 sm:pr-20')}
          >
            <button
              onClick={() => goToStep(index)}
              className="group flex flex-col items-center w-full"
              aria-current={index === currentStep ? 'step' : undefined}
            >
              {/* Step indicator */}
              <span
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-[color,background-color,border-color] duration-200 border-2',
                  index === currentStep
                    ? 'bg-primary text-white border-primary'
                    : isStepComplete(index)
                      ? 'bg-primary/10 text-primary border-primary'
                      : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-300 dark:border-zinc-600 group-hover:border-primary/50'
                )}
              >
                {isStepComplete(index) ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : step.icon ? (
                  step.icon
                ) : (
                  index + 1
                )}
              </span>

              {/* Step label */}
              {showLabels && (
                <span className="mt-2 text-center">
                  <span
                    className={cn(
                      'text-sm font-medium block',
                      index === currentStep
                        ? 'text-primary'
                        : isStepComplete(index)
                          ? 'text-zinc-700 dark:text-zinc-300'
                          : 'text-zinc-500 dark:text-zinc-400'
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 hidden sm:block">
                      {step.description}
                    </span>
                  )}
                  {step.isOptional && (
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">(Optional)</span>
                  )}
                </span>
              )}
            </button>

            {/* Connector line */}
            {index !== steps.length - 1 && (
              <div
                className={cn(
                  'absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2',
                  isStepComplete(index) ? 'bg-primary' : 'bg-zinc-200 dark:bg-zinc-700'
                )}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// ============================================================================
// STEP CONTENT
// ============================================================================

interface StepContentProps {
  children: React.ReactNode;
  className?: string;
}

export const StepContent: React.FC<StepContentProps> = ({ children, className }) => {
  const { currentStep, steps } = useFormStepper();
  const currentStepConfig = steps[currentStep];

  return (
    <div
      role="tabpanel"
      aria-labelledby={`step-${currentStepConfig.id}`}
      className={cn('py-6', className)}
    >
      {children}
    </div>
  );
};

// ============================================================================
// NAVIGATION BUTTONS
// ============================================================================

interface StepperNavigationProps {
  className?: string;
  nextLabel?: string;
  prevLabel?: string;
  completeLabel?: string;
  onNext?: () => void | Promise<void>;
  onPrev?: () => void;
  onComplete?: () => void | Promise<void>;
  isNextDisabled?: boolean;
  showPrev?: boolean;
}

export const StepperNavigation: React.FC<StepperNavigationProps> = ({
  className,
  nextLabel = 'Next',
  prevLabel = 'Back',
  completeLabel = 'Complete',
  onNext,
  onPrev,
  onComplete,
  isNextDisabled = false,
  showPrev = true,
}) => {
  const { nextStep, prevStep, isFirstStep, isLastStep } = useFormStepper();
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    setIsLoading(true);
    try {
      if (onNext) {
        await onNext();
      }
      if (isLastStep && onComplete) {
        await onComplete();
      }
      await nextStep();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrev = () => {
    onPrev?.();
    prevStep();
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-700',
        className
      )}
    >
      {showPrev && !isFirstStep ? (
        <button
          type="button"
          onClick={handlePrev}
          className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          ← {prevLabel}
        </button>
      ) : (
        <div />
      )}

      <button
        type="button"
        onClick={handleNext}
        disabled={isNextDisabled || isLoading}
        className={cn(
          'px-6 py-2 text-sm font-medium rounded-lg transition-[color,background-color,opacity] duration-200',
          'bg-primary text-white hover:bg-primary-600 active:bg-primary-700',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'min-h-[44px] min-w-[100px]'
        )}
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : isLastStep ? (
          completeLabel
        ) : (
          `${nextLabel} →`
        )}
      </button>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface FormStepperProps {
  steps: Step[];
  children: React.ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
  className?: string;
  progressVariant?: 'dots' | 'numbers' | 'full';
  showProgressLabels?: boolean;
}

export const FormStepper: React.FC<FormStepperProps> = ({
  steps,
  children,
  initialStep = 0,
  onStepChange,
  onComplete,
  className,
  progressVariant = 'full',
  showProgressLabels = true,
}) => {
  return (
    <FormStepperProvider
      steps={steps}
      initialStep={initialStep}
      onStepChange={onStepChange}
      onComplete={onComplete}
    >
      <div className={cn('w-full', className)}>
        <StepperProgress variant={progressVariant} showLabels={showProgressLabels} />
        {children}
      </div>
    </FormStepperProvider>
  );
};

export default FormStepper;
