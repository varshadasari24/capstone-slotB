import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'success';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-semibold hover:from-cyan-400 hover:to-sky-500 shadow-lg shadow-cyan-500/20 active:scale-[0.98]',
  secondary:
    'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-[0.98]',
  success:
    'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20 active:scale-[0.98]',
  danger:
    'bg-gradient-to-r from-rose-600 to-red-600 text-white font-semibold hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-500/20 active:scale-[0.98]',
  outline:
    'bg-transparent border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 active:scale-[0.98]',
  ghost:
    'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 active:scale-[0.98]',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2 rounded-lg gap-2',
    lg: 'text-base px-6 py-2.5 rounded-xl gap-2.5',
  }[size];

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${sizeClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!isLoading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
