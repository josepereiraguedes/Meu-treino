import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../utils';

interface CardProps extends React.ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  key?: React.Key | null | undefined;
}

export function Card({ children, className, noPadding = false, ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-card rounded-2xl overflow-hidden",
        !noPadding && "p-5",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Button({ className, variant = 'primary', size = 'md', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost', size?: 'sm' | 'md' | 'lg' | 'icon' }) {
  const variants = {
    primary: "bg-[#0A84FF] text-white hover:bg-[#007AFF] shadow-lg shadow-blue-500/20",
    secondary: "bg-[#2C2C35] text-white hover:bg-[#3A3A45]",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2",
  };

  return (
    <button
      className={cn(
        "rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full bg-[#1C1C22] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] transition-all",
        className
      )}
      {...props}
    />
  );
}
