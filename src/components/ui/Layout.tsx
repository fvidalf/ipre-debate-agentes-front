import { cn } from '@/lib/cn';

interface ViewLayoutProps {
  children: React.ReactNode;
  className?: string;
  background?: 'default' | 'neutral' | 'gradient';
}

export function ViewLayout({ children, className, background = 'default' }: ViewLayoutProps) {
  const backgrounds = {
    default: 'bg-white',
    neutral: 'bg-neutral-50',
    gradient: 'bg-gradient-to-br from-neutral-50 via-white to-primary-50',
  };

  return (
    <div className={cn('min-h-screen', backgrounds[background], className)}>
      {children}
    </div>
  );
}

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Container({ children, className, size = 'lg' }: ContainerProps) {
  const sizes = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={cn('container mx-auto px-4', sizes[size], className)}>
      {children}
    </div>
  );
}

interface StackProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  direction?: 'vertical' | 'horizontal';
}

export function Stack({ children, className, spacing = 'md', direction = 'vertical' }: StackProps) {
  const spacings = {
    xs: direction === 'vertical' ? 'space-y-2' : 'space-x-2',
    sm: direction === 'vertical' ? 'space-y-4' : 'space-x-4',
    md: direction === 'vertical' ? 'space-y-6' : 'space-x-6',
    lg: direction === 'vertical' ? 'space-y-8' : 'space-x-8',
    xl: direction === 'vertical' ? 'space-y-12' : 'space-x-12',
  };

  const flexDirection = direction === 'vertical' ? 'flex-col' : 'flex-row';

  return (
    <div className={cn('flex', flexDirection, spacings[spacing], className)}>
      {children}
    </div>
  );
}
