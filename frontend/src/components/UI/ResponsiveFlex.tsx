import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveFlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  responsiveDirection?: {
    default?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
    sm?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
    md?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
    lg?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
    xl?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  };
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  responsive?: boolean;
}

const ResponsiveFlex: React.FC<ResponsiveFlexProps> = ({
  children,
  className = '',
  direction = 'row',
  responsiveDirection,
  align = 'start',
  justify = 'start',
  wrap = 'nowrap',
  gap = 'md',
  responsive = true
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getDirectionClasses = () => {
    if (responsive && responsiveDirection) {
      const classes = [
        'flex',
        responsiveDirection.default && `flex-${responsiveDirection.default}`,
        responsiveDirection.sm && `sm:flex-${responsiveDirection.sm}`,
        responsiveDirection.md && `md:flex-${responsiveDirection.md}`,
        responsiveDirection.lg && `lg:flex-${responsiveDirection.lg}`,
        responsiveDirection.xl && `xl:flex-${responsiveDirection.xl}`
      ].filter(Boolean);
      return classes.join(' ');
    } else {
      return `flex flex-${direction}`;
    }
  };

  const getAlignClasses = () => {
    const aligns = {
      start: 'items-start',
      end: 'items-end',
      center: 'items-center',
      baseline: 'items-baseline',
      stretch: 'items-stretch'
    };
    return aligns[align];
  };

  const getJustifyClasses = () => {
    const justifies = {
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly'
    };
    return justifies[justify];
  };

  const getWrapClasses = () => {
    const wraps = {
      nowrap: 'flex-nowrap',
      wrap: 'flex-wrap',
      'wrap-reverse': 'flex-wrap-reverse'
    };
    return wraps[wrap];
  };

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

  const getResponsiveClasses = () => {
    if (responsive) {
      const responsiveClasses = [
        getDirectionClasses(),
        getAlignClasses(),
        getJustifyClasses(),
        getWrapClasses(),
        getGapClasses()
      ].filter(Boolean);
      return responsiveClasses.join(' ');
    } else {
      const staticClasses = [
        getDirectionClasses(),
        getAlignClasses(),
        getJustifyClasses(),
        getWrapClasses(),
        getGapClasses()
      ].filter(Boolean);
      return staticClasses.join(' ');
    }
  };

  const flexClasses = [
    getResponsiveClasses(),
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={flexClasses}>
      {children}
    </div>
  );
};

export default ResponsiveFlex;