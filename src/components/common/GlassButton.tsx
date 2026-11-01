import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import { triggerHaptic } from '../../utils/haptics';

interface GlassButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'glass' | 'secondary' | 'danger' | 'emerald';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  hapticType?: 'light' | 'medium' | 'heavy' | 'success';
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'glass',
  size = 'md',
  fullWidth = false,
  icon,
  children,
  className = '',
  onClick,
  hapticType = 'light',
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      triggerHaptic(hapticType);
      onClick?.(e);
    }
  };

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 focus:outline-none select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-xl',
    md: 'text-sm px-4 py-2.5 gap-2 rounded-2xl',
    lg: 'text-base px-6 py-3.5 gap-2.5 rounded-2xl font-semibold',
    icon: 'p-2.5 rounded-2xl',
  };

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-glow-blue border border-blue-400/40',
    glass: 'bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/15 text-slate-800 dark:text-slate-100 backdrop-blur-xl border border-white/60 dark:border-white/15 shadow-sm',
    secondary: 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-transparent',
    emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-green border border-emerald-400/40',
    danger: 'bg-rose-500/90 hover:bg-rose-600 text-white border border-rose-400/30',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      onClick={handleClick}
      disabled={disabled}
      className={clsx(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && 'w-full',
        disabled && 'opacity-50 cursor-not-allowed filter grayscale',
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
    </motion.button>
  );
};
