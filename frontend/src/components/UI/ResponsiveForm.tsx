import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveFormProps {
  children: React.ReactNode;
  className?: string;
  onSubmit?: (e: React.FormEvent) => void;
  background?: 'none' | 'white' | 'glass' | 'gradient';
  padding?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  border?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';
  responsive?: boolean;
}

const ResponsiveForm: React.FC<ResponsiveFormProps> = ({
  children,
  className = '',
  onSubmit,
  background = 'glass',
  padding = 'lg',
  rounded = '3xl',
  shadow = '2xl',
  border = true,
  maxWidth = 'lg',
  responsive = true
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getBackgroundClasses = () => {
    const backgrounds = {
      none: '',
      white: 'bg-white',
      glass: 'bg-white/70 backdrop-blur-xl',
      gradient: 'bg-gradient-to-br from-white/80 to-slate-50/80 backdrop-blur-xl'
    };
    return backgrounds[background];
  };

  const getPaddingClasses = () => {
    if (responsive) {
      const responsivePaddings = {
        sm: 'p-4 sm:p-6',
        md: 'p-6 sm:p-8',
        lg: 'p-6 sm:p-8 lg:p-10',
        xl: 'p-8 sm:p-10 lg:p-12',
        '2xl': 'p-10 sm:p-12 lg:p-16'
      };
      return responsivePaddings[padding];
    } else {
      const staticPaddings = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
        '2xl': 'p-12'
      };
      return staticPaddings[padding];
    }
  };

  const getRoundedClasses = () => {
    if (responsive) {
      const responsiveRounded = {
        sm: 'rounded-sm sm:rounded-md',
        md: 'rounded-md sm:rounded-lg',
        lg: 'rounded-lg sm:rounded-xl',
        xl: 'rounded-xl sm:rounded-2xl',
        '2xl': 'rounded-2xl sm:rounded-3xl',
        '3xl': 'rounded-3xl'
      };
      return responsiveRounded[rounded];
    } else {
      const staticRounded = {
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl'
      };
      return staticRounded[rounded];
    }
  };

  const getShadowClasses = () => {
    const shadows = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
      '2xl': 'shadow-2xl'
    };
    return shadows[shadow];
  };

  const getBorderClasses = () => {
    if (border) {
      return 'border border-white/20';
    }
    return '';
  };

  const getMaxWidthClasses = () => {
    const maxWidths = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '4xl': 'max-w-4xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl',
      full: 'max-w-full'
    };
    return maxWidths[maxWidth];
  };

  const getResponsiveClasses = () => {
    if (responsive) {
      const responsiveClasses = [
        'w-full',
        getMaxWidthClasses(),
        'mx-auto',
        getBackgroundClasses(),
        getPaddingClasses(),
        getRoundedClasses(),
        getShadowClasses(),
        getBorderClasses()
      ].filter(Boolean);
      return responsiveClasses.join(' ');
    } else {
      const staticClasses = [
        'w-full',
        getMaxWidthClasses(),
        'mx-auto',
        getBackgroundClasses(),
        getPaddingClasses(),
        getRoundedClasses(),
        getShadowClasses(),
        getBorderClasses()
      ].filter(Boolean);
      return staticClasses.join(' ');
    }
  };

  const formClasses = [
    getResponsiveClasses(),
    className
  ].filter(Boolean).join(' ');

  return (
    <form onSubmit={onSubmit} className={formClasses}>
      {children}
    </form>
  );
};

export default ResponsiveForm;