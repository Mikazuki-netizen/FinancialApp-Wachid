import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'default' | 'glow-blue' | 'glow-emerald' | 'glow-purple' | 'subtle';
  interactive?: boolean;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  interactive = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'glass-card',
    'glow-blue': 'glass-card border-blue-500/30 dark:border-blue-500/20 shadow-glow-blue',
    'glow-emerald': 'glass-card border-emerald-500/30 dark:border-emerald-500/20 shadow-glow-green',
    'glow-purple': 'glass-card border-purple-500/30 dark:border-purple-500/20 shadow-glow-purple',
    subtle: 'bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/40 dark:border-white/5',
  };

  return (
    <motion.div
      whileTap={interactive ? { scale: 0.985 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={clsx(
        'rounded-3xl p-5 relative overflow-hidden',
        variantStyles[variant],
        interactive && 'cursor-pointer hover:border-white/80 dark:hover:border-white/20 transition-colors',
        className
      )}
      {...props}
    >
      {/* Subtle top glare highlight for liquid glass depth */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
};
