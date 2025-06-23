import { useState, useCallback } from 'react';

interface ProgressStep {
  label: string;
  progress: number;
  duration?: number;
}

interface UseProgressStepsReturn {
  progress: number;
  progressStep: string;
  isRunning: boolean;
  startProgress: (steps: ProgressStep[]) => Promise<void>;
  resetProgress: () => void;
  setProgress: (progress: number, step?: string) => void;
}

export const useProgressSteps = (): UseProgressStepsReturn => {
  const [progress, setProgressState] = useState(0);
  const [progressStep, setProgressStep] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const setProgress = useCallback((newProgress: number, step?: string) => {
    setProgressState(newProgress);
    if (step) {
      setProgressStep(step);
    }
  }, []);

  const startProgress = useCallback(async (steps: ProgressStep[]) => {
    setIsRunning(true);
    
    try {
      for (const step of steps) {
        setProgressStep(step.label);
        setProgressState(step.progress);
        
        // Wait for the specified duration or default 300ms
        await new Promise(resolve => setTimeout(resolve, step.duration || 300));
      }
    } finally {
      setIsRunning(false);
    }
  }, []);

  const resetProgress = useCallback(() => {
    setProgressState(0);
    setProgressStep('');
    setIsRunning(false);
  }, []);

  return {
    progress,
    progressStep,
    isRunning,
    startProgress,
    resetProgress,
    setProgress
  };
};