import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  responsive?: boolean;
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  transform?: 'uppercase' | 'lowercase' | 'capitalize' | 'normal-case';
  decoration?: 'underline' | 'line-through' | 'no-underline';
  truncate?: boolean;
  clamp?: 1 | 2 | 3 | 4 | 5 | 6;
}

const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className = '',
  as: Component = 'p',
  size = 'base',
  responsive = true,
  weight = 'normal',
  color = 'text-slate-900',
  align = 'left',
  transform = 'normal-case',
  decoration = 'no-underline',
  truncate = false,
  clamp
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getSizeClasses = () => {
    if (responsive) {
      const responsiveSizes = {
        xs: 'text-xs sm:text-sm',
        sm: 'text-sm sm:text-base',
        base: 'text-base sm:text-lg',
        lg: 'text-lg sm:text-xl',
        xl: 'text-xl sm:text-2xl',
        '2xl': 'text-xl sm:text-2xl lg:text-3xl',
        '3xl': 'text-2xl sm:text-3xl lg:text-4xl',
        '4xl': 'text-3xl sm:text-4xl lg:text-5xl',
        '5xl': 'text-4xl sm:text-5xl lg:text-6xl',
        '6xl': 'text-5xl sm:text-6xl lg:text-7xl'
      };
      return responsiveSizes[size];
    } else {
      const staticSizes = {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl',
        '5xl': 'text-5xl',
        '6xl': 'text-6xl'
      };
      return staticSizes[size];
    }
  };

  const getWeightClasses = () => {
    const weights = {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
      black: 'font-black'
    };
    return weights[weight];
  };

  const getAlignClasses = () => {
    const aligns = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify'
    };
    return aligns[align];
  };

  const getTransformClasses = () => {
    const transforms = {
      uppercase: 'uppercase',
      lowercase: 'lowercase',
      capitalize: 'capitalize',
      'normal-case': 'normal-case'
    };
    return transforms[transform];
  };

  const getDecorationClasses = () => {
    const decorations = {
      underline: 'underline',
      'line-through': 'line-through',
      'no-underline': 'no-underline'
    };
    return decorations[decoration];
  };

  const getTruncateClasses = () => {
    if (truncate) return 'truncate';
    if (clamp) return `line-clamp-${clamp}`;
    return '';
  };

  const getResponsiveAlign = () => {
    if (responsive) {
      const responsiveAligns = {
        left: 'text-left',
        center: 'text-center sm:text-center',
        right: 'text-right',
        justify: 'text-justify'
      };
      return responsiveAligns[align];
    }
    return getAlignClasses();
  };

  const getResponsiveWeight = () => {
    if (responsive) {
      const responsiveWeights = {
        light: 'font-light sm:font-normal',
        normal: 'font-normal sm:font-medium',
        medium: 'font-medium sm:font-semibold',
        semibold: 'font-semibold sm:font-bold',
        bold: 'font-bold sm:font-extrabold',
        extrabold: 'font-extrabold sm:font-black',
        black: 'font-black'
      };
      return responsiveWeights[weight];
    }
    return getWeightClasses();
  };

  const getResponsiveClasses = () => {
    if (responsive) {
      const responsiveClasses = [
        getSizeClasses(),
        getResponsiveWeight(),
        getResponsiveAlign(),
        getTransformClasses(),
        getDecorationClasses(),
        getTruncateClasses(),
        color
      ].filter(Boolean);
      return responsiveClasses.join(' ');
    } else {
      const staticClasses = [
        getSizeClasses(),
        getWeightClasses(),
        getAlignClasses(),
        getTransformClasses(),
        getDecorationClasses(),
        getTruncateClasses(),
        color
      ].filter(Boolean);
      return staticClasses.join(' ');
    }
  };

  const textClasses = [
    getResponsiveClasses(),
    className
  ].filter(Boolean).join(' ');

  return (
    <Component className={textClasses}>
      {children}
    </Component>
  );
};

export default ResponsiveText;