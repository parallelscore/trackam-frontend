// Design System Components
export { AuthFormCard } from './AuthFormCard';
export { GradientButton } from './GradientButton';
export { AnimatedBackground } from './AnimatedBackground';
export { ParticleEffect } from './ParticleEffect';
export { StatusIndicator } from './StatusIndicator';
export { CenteredContainer } from './CenteredContainer';

// Design System Utilities
export * from '@/lib/designSystem';
export * from '@/lib/animationVariants';

// Hooks
export { useProgressSteps } from '@/hooks/useProgressSteps';
export { usePhoneForm } from '@/hooks/usePhoneForm';
export { useAuthRedirect, useAuthenticatedRedirect, useUnauthenticatedRedirect, useRoleBasedRedirect } from '@/hooks/useAuthRedirect';

// Existing UI Components
export { Button } from './button';
export { Card, CardHeader, CardTitle, CardContent } from './card';
export { Input } from './input';
export { Badge } from './badge';
export { Alert } from './alert';
export { Dialog } from './dialog';
export { Tabs } from './tabs';
export { ProgressBar, CircularProgress, StepProgress, LoadingSpinner, UploadProgress, IndeterminateProgress } from './progress';
export { Skeleton } from './skeleton';
export { Tooltip } from './tooltip';
export { DropdownMenu } from './dropdown-menu';
export { Table } from './table';
export { Form } from './form';
export { default as OptimizedImage } from './OptimizedImage';
export { default as VirtualizedList } from './VirtualizedList';