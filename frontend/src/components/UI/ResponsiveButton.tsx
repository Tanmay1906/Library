import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import { useResponsive } from '../../hooks/useResponsive';

type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "outline" | "ghost";
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ResponsiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  responsive?: boolean;
}

const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  icon,
  fullWidth = false,
  responsive = true,
  ...props
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl focus:ring-indigo-500",
    secondary: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl focus:ring-emerald-500",
    success: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl focus:ring-green-500",
    danger: "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl focus:ring-red-500",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-400 bg-transparent",
    ghost: "hover:bg-slate-100 text-slate-700 focus:ring-slate-500 bg-transparent"
  };

  const getSizeClasses = () => {
    if (responsive) {
      const responsiveSizes = {
        xs: "px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm",
        sm: "px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base",
        md: "px-4 py-2 text-base sm:px-6 sm:py-3 sm:text-lg",
        lg: "px-6 py-3 text-lg sm:px-8 sm:py-4 sm:text-xl",
        xl: "px-8 py-4 text-xl sm:px-10 sm:py-5 sm:text-2xl"
      };
      return responsiveSizes[size];
    } else {
      const staticSizes = {
        xs: "px-2 py-1 text-xs",
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
        xl: "px-8 py-4 text-xl"
      };
      return staticSizes[size];
    }
  };

  const getRoundedClasses = () => {
    if (responsive) {
      return "rounded-lg sm:rounded-xl lg:rounded-2xl";
    }
    return "rounded-xl";
  };

  const getGapClasses = () => {
    if (responsive) {
      return "gap-1 sm:gap-2";
    }
    return "gap-2";
  };

  const getResponsiveClasses = () => {
    if (responsive) {
      const responsiveClasses = [
        "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        getSizeClasses(),
        getRoundedClasses(),
        variantClasses[variant],
        fullWidth && "w-full",
        getGapClasses()
      ].filter(Boolean);
      return responsiveClasses.join(' ');
    } else {
      const staticClasses = [
        "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        getSizeClasses(),
        getRoundedClasses(),
        variantClasses[variant],
        fullWidth && "w-full",
        getGapClasses()
      ].filter(Boolean);
      return staticClasses.join(' ');
    }
  };

  const buttonClasses = [
    getResponsiveClasses(),
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      {...props}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {children}
    </button>
  );
};

export default ResponsiveButton;