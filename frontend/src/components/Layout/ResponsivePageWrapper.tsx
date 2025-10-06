import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsivePageWrapperProps {
  children: React.ReactNode;
  className?: string;
  background?: 'gradient' | 'solid' | 'glass' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';
  centered?: boolean;
}

const ResponsivePageWrapper: React.FC<ResponsivePageWrapperProps> = ({
  children,
  className = '',
  background = 'gradient',
  padding = 'lg',
  maxWidth = '7xl',
  centered = true
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const backgroundClasses = {
    gradient: 'bg-gradient-to-br from-slate-100 via-indigo-50 to-emerald-50',
    solid: 'bg-white',
    glass: 'bg-white/80 backdrop-blur-lg',
    none: ''
  };

  const paddingClasses = {
    none: '',
    sm: 'py-4 sm:py-6',
    md: 'py-6 sm:py-8',
    lg: 'py-6 sm:py-8 lg:py-10',
    xl: 'py-8 sm:py-10 lg:py-12'
  };

  const maxWidthClasses = {
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

  const containerClasses = [
    'min-h-screen',
    'relative',
    backgroundClasses[background],
    paddingClasses[padding],
    centered && 'flex flex-col',
    className
  ].filter(Boolean).join(' ');

  const contentClasses = [
    'relative z-10',
    'flex-1',
    centered && 'flex flex-col justify-center',
    maxWidth !== 'full' && 'mx-auto',
    maxWidth !== 'full' && maxWidthClasses[maxWidth],
    maxWidth !== 'full' && 'px-4 sm:px-6 lg:px-8 xl:px-12'
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {/* Background Elements */}
      {background === 'gradient' && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl absolute top-0 left-0" />
          <div className="w-72 h-72 bg-emerald-200/30 rounded-full blur-2xl absolute bottom-0 right-0" />
        </div>
      )}
      
      <div className={contentClasses}>
        {children}
      </div>
    </div>
  );
};

export default ResponsivePageWrapper;
