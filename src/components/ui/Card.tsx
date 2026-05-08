import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ className, variant = 'default', padding = 'md', children, ...props }: CardProps) {
  const variants = {
    default: 'bg-white shadow-card',
    elevated: 'bg-white shadow-card-hover',
    bordered: 'bg-white border border-gray-200',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/50 shadow-card',
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={cn(
        'rounded-2xl',
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
