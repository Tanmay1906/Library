import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  responsive?: boolean;
}

const ResponsiveInput: React.FC<ResponsiveInputProps> = ({
  label,
  error,
  icon,
  rightIcon,
  variant = 'default',
  size = 'md',
  responsive = true,
  className = '',
  ...props
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getVariantClasses = () => {
    const variants = {
      default: "bg-white/80 border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500",
      filled: "bg-slate-100 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500",
      outlined: "bg-transparent border-2 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
    };
    return variants[variant];
  };

  const getSizeClasses = () => {
    if (responsive) {
      const responsiveSizes = {
        sm: "px-3 py-2 text-sm sm:px-4 sm:py-2.5 sm:text-base",
        md: "px-4 py-3 text-base sm:px-5 sm:py-3.5 sm:text-lg",
        lg: "px-5 py-4 text-lg sm:px-6 sm:py-5 sm:text-xl"
      };
      return responsiveSizes[size];
    } else {
      const staticSizes = {
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-3 text-base",
        lg: "px-5 py-4 text-lg"
      };
      return staticSizes[size];
    }
  };

  const getRoundedClasses = () => {
    if (responsive) {
      return "rounded-lg sm:rounded-xl";
    }
    return "rounded-xl";
  };

  const getIconSize = () => {
    if (responsive) {
      return isMobile ? 16 : isTablet ? 18 : 20;
    }
    return 20;
  };

  const getIconSpacing = () => {
    if (responsive) {
      return isMobile ? "left-3" : "left-4";
    }
    return "left-4";
  };

  const getRightIconSpacing = () => {
    if (responsive) {
      return isMobile ? "right-3" : "right-4";
    }
    return "right-4";
  };

  const getLabelSize = () => {
    if (responsive) {
      return "text-sm sm:text-base";
    }
    return "text-sm";
  };

  const getErrorSize = () => {
    if (responsive) {
      return "text-xs sm:text-sm";
    }
    return "text-sm";
  };

  const getResponsiveClasses = () => {
    if (responsive) {
      const responsiveClasses = [
        "w-full",
        getSizeClasses(),
        getRoundedClasses(),
        getVariantClasses(),
        "shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200",
        error && "border-red-300 focus:border-red-500 focus:ring-red-500",
        icon && "pl-10",
        rightIcon && "pr-10"
      ].filter(Boolean);
      return responsiveClasses.join(' ');
    } else {
      const staticClasses = [
        "w-full",
        getSizeClasses(),
        getRoundedClasses(),
        getVariantClasses(),
        "shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200",
        error && "border-red-300 focus:border-red-500 focus:ring-red-500",
        icon && "pl-10",
        rightIcon && "pr-10"
      ].filter(Boolean);
      return staticClasses.join(' ');
    }
  };

  const inputClasses = [
    getResponsiveClasses(),
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className={`block font-medium text-slate-700 ${getLabelSize()}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className={`absolute inset-y-0 left-0 ${getIconSpacing()} flex items-center pointer-events-none text-slate-400`}>
            {React.cloneElement(icon as React.ReactElement, { size: getIconSize() })}
          </div>
        )}
        <input
          className={inputClasses}
          {...props}
        />
        {rightIcon && (
          <div className={`absolute inset-y-0 right-0 ${getRightIconSpacing()} flex items-center pointer-events-none text-slate-400`}>
            {React.cloneElement(rightIcon as React.ReactElement, { size: getIconSize() })}
          </div>
        )}
      </div>
      {error && (
        <p className={`text-red-600 ${getErrorSize()}`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default ResponsiveInput;