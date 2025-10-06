import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hover?: boolean;
  responsive?: boolean;
}

const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className = "",
  title,
  subtitle,
  actions,
  variant = 'default',
  padding = 'md',
  rounded = '2xl',
  shadow = 'lg',
  hover = false,
  responsive = true
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getVariantClasses = () => {
    const variants = {
      default: "bg-white border border-slate-200",
      elevated: "bg-white border border-slate-200 shadow-lg",
      outlined: "bg-transparent border-2 border-slate-300",
      glass: "bg-white/80 backdrop-blur-lg border border-white/20",
      gradient: "bg-gradient-to-br from-slate-50 via-white to-slate-100 border border-slate-200"
    };
    return variants[variant];
  };

  const getPaddingClasses = () => {
    if (responsive) {
      const responsivePaddings = {
        none: "",
        sm: "p-3 sm:p-4",
        md: "p-4 sm:p-6",
        lg: "p-6 sm:p-8",
        xl: "p-8 sm:p-10",
        '2xl': "p-10 sm:p-12"
      };
      return responsivePaddings[padding];
    } else {
      const staticPaddings = {
        none: "",
        sm: "p-3",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
        '2xl': "p-12"
      };
      return staticPaddings[padding];
    }
  };

  const getRoundedClasses = () => {
    if (responsive) {
      const responsiveRounded = {
        sm: "rounded-lg sm:rounded-xl",
        md: "rounded-xl sm:rounded-2xl",
        lg: "rounded-2xl sm:rounded-3xl",
        xl: "rounded-3xl",
        '2xl': "rounded-2xl sm:rounded-3xl",
        '3xl': "rounded-3xl"
      };
      return responsiveRounded[rounded];
    } else {
      const staticRounded = {
        sm: "rounded-lg",
        md: "rounded-xl",
        lg: "rounded-2xl",
        xl: "rounded-3xl",
        '2xl': "rounded-2xl",
        '3xl': "rounded-3xl"
      };
      return staticRounded[rounded];
    }
  };

  const getShadowClasses = () => {
    const shadows = {
      none: "",
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
      xl: "shadow-xl",
      '2xl': "shadow-2xl"
    };
    return shadows[shadow];
  };

  const getHoverClasses = () => {
    if (!hover) return "";
    if (responsive) {
      return "hover:shadow-xl hover:scale-[1.02] transition-all duration-300";
    }
    return "hover:shadow-xl hover:scale-[1.03] transition-all duration-300";
  };

  const getTitleSize = () => {
    if (responsive) {
      return "text-lg sm:text-xl lg:text-2xl";
    }
    return "text-xl";
  };

  const getSubtitleSize = () => {
    if (responsive) {
      return "text-sm sm:text-base";
    }
    return "text-sm";
  };

  const getResponsiveClasses = () => {
    if (responsive) {
      const responsiveClasses = [
        "transition-all duration-300",
        getVariantClasses(),
        getPaddingClasses(),
        getRoundedClasses(),
        getShadowClasses(),
        getHoverClasses()
      ].filter(Boolean);
      return responsiveClasses.join(' ');
    } else {
      const staticClasses = [
        "transition-all duration-300",
        getVariantClasses(),
        getPaddingClasses(),
        getRoundedClasses(),
        getShadowClasses(),
        getHoverClasses()
      ].filter(Boolean);
      return staticClasses.join(' ');
    }
  };

  const cardClasses = [
    getResponsiveClasses(),
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {(title || subtitle || actions) && (
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <div>
            {title && (
              <h3 className={`font-semibold text-slate-900 mb-1 ${getTitleSize()}`}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={`text-slate-500 ${getSubtitleSize()}`}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="text-slate-700">{children}</div>
    </div>
  );
};

export default ResponsiveCard;