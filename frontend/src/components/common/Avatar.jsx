import { User } from 'lucide-react';
import { cn } from '../../utils/helpers';

const sizes = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

function Avatar({ src, alt, size = 'md', className }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt || 'Avatar'}
        className={cn(
          'rounded-full object-cover bg-bg-tertiary',
          sizes[size],
          className
        )}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-bg-tertiary flex items-center justify-center',
        sizes[size],
        className
      )}
    >
      <User className={cn('text-text-muted', iconSizes[size])} />
    </div>
  );
}

export default Avatar;
