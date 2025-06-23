import { cn } from '@/lib/utils';

// Gradient utility classes
export const gradients = {
  primary: 'bg-gradient-to-r from-primary to-accent',
  secondary: 'bg-gradient-to-r from-secondary to-primary',
  accent: 'bg-gradient-to-r from-accent to-secondary',
  border: 'bg-gradient-to-r from-primary via-accent to-secondary',
  text: 'bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent'
} as const;

// Gradient hover states
export const gradientHovers = {
  primary: 'hover:from-primary/90 hover:to-accent/90',
  secondary: 'hover:from-secondary/90 hover:to-primary/90',
  accent: 'hover:from-accent/90 hover:to-secondary/90'
} as const;

// Glass/backdrop effects
export const glassEffects = {
  card: 'bg-white/90 backdrop-blur-xl',
  modal: 'bg-white/95 backdrop-blur-2xl',
  nav: 'bg-white/80 backdrop-blur-md',
  overlay: 'bg-black/20 backdrop-blur-sm'
} as const;

// Shadow utilities
export const shadows = {
  card: 'shadow-2xl',
  button: 'shadow-lg hover:shadow-xl',
  modal: 'shadow-3xl',
  floating: 'shadow-xl drop-shadow-lg'
} as const;

// Icon container variants
export const iconContainers = {
  sm: 'w-12 h-12 rounded-2xl',
  md: 'w-16 h-16 rounded-2xl',
  lg: 'w-20 h-20 rounded-3xl',
  xl: 'w-24 h-24 rounded-3xl'
} as const;

// Common layout patterns
export const layouts = {
  centeredContainer: 'min-h-screen flex items-center justify-center px-4 py-12 relative',
  pageContainer: 'w-full max-w-md relative z-10',
  formContainer: 'space-y-6 p-6',
  cardContainer: 'bg-white/90 backdrop-blur-xl shadow-2xl border-0 overflow-hidden relative rounded-xl'
} as const;

// Button size variants
export const buttonSizes = {
  sm: 'h-10 text-sm px-4',
  md: 'h-12 text-base px-6',
  lg: 'h-14 text-lg px-8'
} as const;

// Text variants
export const textVariants = {
  heading: 'text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent',
  subheading: 'text-xl font-semibold text-gray-800',
  body: 'text-base text-gray-600 leading-relaxed',
  caption: 'text-sm text-gray-500',
  label: 'text-sm font-medium text-gray-700'
} as const;

// Animation classes
export const animations = {
  fadeIn: 'animate-in fade-in duration-300',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-300',
  slideDown: 'animate-in slide-in-from-top-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  pulse: 'animate-pulse',
  spin: 'animate-spin'
} as const;

// Utility function to combine gradient classes
export const getGradientClasses = (
  variant: keyof typeof gradients,
  includeHover = true
) => {
  const baseGradient = gradients[variant];
  const hoverGradient = includeHover && variant in gradientHovers 
    ? gradientHovers[variant as keyof typeof gradientHovers]
    : '';
  
  return cn(baseGradient, hoverGradient);
};

// Utility function for glass card
export const getGlassCardClasses = (shadow: keyof typeof shadows = 'card') => {
  return cn(
    glassEffects.card,
    shadows[shadow],
    'border-0 overflow-hidden relative rounded-xl'
  );
};

// Utility function for gradient button
export const getGradientButtonClasses = (
  variant: keyof typeof gradients = 'primary',
  size: keyof typeof buttonSizes = 'lg'
) => {
  return cn(
    buttonSizes[size],
    getGradientClasses(variant),
    'font-semibold rounded-xl transition-all duration-300 relative overflow-hidden group',
    shadows.button
  );
};

// Utility function for icon container
export const getIconContainerClasses = (
  size: keyof typeof iconContainers = 'lg',
  variant: keyof typeof gradients = 'primary'
) => {
  return cn(
    iconContainers[size],
    getGradientClasses(variant, false),
    'flex items-center justify-center mx-auto shadow-xl relative'
  );
};

// Utility function for status colors
export const getStatusClasses = (status: 'success' | 'error' | 'warning' | 'info') => {
  const statusMap = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-700'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500',
      text: 'text-red-600'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      text: 'text-yellow-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-700'
    }
  };

  return statusMap[status];
};

// Common transition presets
export const transitions = {
  default: 'transition-all duration-300 ease-out',
  fast: 'transition-all duration-200 ease-out',
  slow: 'transition-all duration-500 ease-out',
  bounce: 'transition-all duration-300 ease-in-out'
} as const;