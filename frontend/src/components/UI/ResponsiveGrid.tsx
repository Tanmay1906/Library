import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  responsive?: boolean;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  cols = { default: 1, sm: 2, lg: 3 },
  gap = 'md',
  responsive = true
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getGapClasses = () => {
    if (responsive) {
      const responsiveGaps = {
        none: "",
        sm: "gap-2 sm:gap-4",
        md: "gap-4 sm:gap-6",
        lg: "gap-6 sm:gap-8",
        xl: "gap-8 sm:gap-10",
        '2xl': "gap-10 sm:gap-12"
      };
      return responsiveGaps[gap];
    } else {
      const staticGaps = {
        none: "",
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
        xl: "gap-8",
        '2xl': "gap-10"
      };
      return staticGaps[gap];
    }
  };

  const getColsClasses = () => {
    if (responsive) {
      const classes = [
        'grid',
        cols.default && `grid-cols-${cols.default}`,
        cols.sm && `sm:grid-cols-${cols.sm}`,
        cols.md && `md:grid-cols-${cols.md}`,
        cols.lg && `lg:grid-cols-${cols.lg}`,
        cols.xl && `xl:grid-cols-${cols.xl}`,
        cols['2xl'] && `2xl:grid-cols-${cols['2xl']}`
      ].filter(Boolean);
      return classes.join(' ');
    } else {
      const classes = [
        'grid',
        cols.default && `grid-cols-${cols.default}`,
        cols.sm && `sm:grid-cols-${cols.sm}`,
        cols.md && `md:grid-cols-${cols.md}`,
        cols.lg && `lg:grid-cols-${cols.lg}`,
        cols.xl && `xl:grid-cols-${cols.xl}`,
        cols['2xl'] && `2xl:grid-cols-${cols['2xl']}`
      ].filter(Boolean);
      return classes.join(' ');
    }
  };

  const getResponsiveClasses = () => {
    if (responsive) {
      const responsiveClasses = [
        getColsClasses(),
        getGapClasses()
      ].filter(Boolean);
      return responsiveClasses.join(' ');
    } else {
      const staticClasses = [
        getColsClasses(),
        getGapClasses()
      ].filter(Boolean);
      return staticClasses.join(' ');
    }
  };

  const gridClasses = [
    getResponsiveClasses(),
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;