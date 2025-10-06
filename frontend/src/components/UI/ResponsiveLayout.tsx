import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  container?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  background?: 'none' | 'gradient' | 'glass' | 'solid' | 'pattern';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  border?: boolean;
  responsive?: boolean;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className = '',
  container = true,
  maxWidth = '7xl',
  padding = 'lg',
  background = 'none',
  rounded = 'none',
  shadow = 'none',
  border = false,
  responsive = true
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

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

  const getPaddingClasses = () => {
    if (responsive) {
      const responsivePaddings = {
        none: '',
        sm: 'p-2 sm:p-4',
        md: 'p-4 sm:p-6',
        lg: 'p-4 sm:p-6 lg:p-8',
        xl: 'p-6 sm:p-8 lg:p-10',
        '2xl': 'p-8 sm:p-10 lg:p-12'
      };
      return responsivePaddings[padding];
    } else {
      const staticPaddings = {
        none: '',
        sm: 'p-2',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
        '2xl': 'p-10'
      };
      return staticPaddings[padding];
    }
  };

  const getBackgroundClasses = () => {
    const backgrounds = {
      none: '',
      gradient: 'bg-gradient-to-br from-slate-50 via-white to-slate-100',
      glass: 'bg-white/80 backdrop-blur-lg',
      solid: 'bg-white',
      pattern: 'bg-gradient-to-br from-slate-50 via-white to-slate-100 bg-grid-pattern'
    };
    return backgrounds[background];
  };

  const getRoundedClasses = () => {
    if (responsive) {
      const responsiveRounded = {
        none: '',
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
        none: '',
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
      return 'border border-slate-200';
    }
    return '';
  };

  const getContainerClasses = () => {
    if (container) {
      return [
        'mx-auto',
        getMaxWidthClasses(),
        getPaddingClasses()
      ].filter(Boolean).join(' ');
    }
    return '';
  };

  const getResponsiveClasses = () => {
    if (responsive) {
      const responsiveClasses = [
        'w-full',
        getContainerClasses(),
        getBackgroundClasses(),
        getRoundedClasses(),
        getShadowClasses(),
        getBorderClasses()
      ].filter(Boolean);
      return responsiveClasses.join(' ');
    } else {
      const staticClasses = [
        'w-full',
        getContainerClasses(),
        getBackgroundClasses(),
        getRoundedClasses(),
        getShadowClasses(),
        getBorderClasses()
      ].filter(Boolean);
      return staticClasses.join(' ');
    }
  };

  const layoutClasses = [
    getResponsiveClasses(),
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={layoutClasses}>
      {children}
    </div>
  );
};

export default ResponsiveLayout;