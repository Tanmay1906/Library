import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  centered?: boolean;
  responsive?: boolean;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = '7xl',
  padding = 'lg',
  centered = true,
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
        sm: 'px-2 sm:px-4',
        md: 'px-4 sm:px-6',
        lg: 'px-4 sm:px-6 lg:px-8 xl:px-12',
        xl: 'px-6 sm:px-8 lg:px-10 xl:px-16',
        '2xl': 'px-8 sm:px-10 lg:px-12 xl:px-20'
      };
      return responsivePaddings[padding];
    } else {
      const staticPaddings = {
        none: '',
        sm: 'px-2',
        md: 'px-4',
        lg: 'px-6',
        xl: 'px-8',
        '2xl': 'px-10'
      };
      return staticPaddings[padding];
    }
  };

  const getCenteredClasses = () => {
    if (centered) {
      return 'mx-auto';
    }
    return '';
  };

  const getResponsiveClasses = () => {
    if (responsive) {
      const responsiveClasses = [
        'w-full',
        getMaxWidthClasses(),
        getCenteredClasses(),
        getPaddingClasses()
      ].filter(Boolean);
      return responsiveClasses.join(' ');
    } else {
      const staticClasses = [
        'w-full',
        getMaxWidthClasses(),
        getCenteredClasses(),
        getPaddingClasses()
      ].filter(Boolean);
      return staticClasses.join(' ');
    }
  };

  const containerClasses = [
    getResponsiveClasses(),
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;