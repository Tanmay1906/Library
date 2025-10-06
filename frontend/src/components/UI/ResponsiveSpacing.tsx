import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveSpacingProps {
  children: React.ReactNode;
  className?: string;
  p?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  py?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  px?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  pt?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  pb?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  pl?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  pr?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  m?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  my?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  mx?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  mt?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  mb?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  ml?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  mr?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  responsive?: boolean;
}

const ResponsiveSpacing: React.FC<ResponsiveSpacingProps> = ({
  children,
  className = '',
  p,
  py,
  px,
  pt,
  pb,
  pl,
  pr,
  m,
  my,
  mx,
  mt,
  mb,
  ml,
  mr,
  responsive = true
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getSpacingClasses = (type: string, value: string | undefined) => {
    if (!value) return '';
    
    if (responsive) {
      const responsiveSpacings = {
        none: '',
        sm: 'p-2 sm:p-4',
        md: 'p-4 sm:p-6',
        lg: 'p-4 sm:p-6 lg:p-8',
        xl: 'p-6 sm:p-8 lg:p-10',
        '2xl': 'p-8 sm:p-10 lg:p-12'
      };
      
      const responsivePaddingY = {
        none: '',
        sm: 'py-2 sm:py-4',
        md: 'py-4 sm:py-6',
        lg: 'py-4 sm:py-6 lg:py-8',
        xl: 'py-6 sm:py-8 lg:py-10',
        '2xl': 'py-8 sm:py-10 lg:py-12'
      };
      
      const responsivePaddingX = {
        none: '',
        sm: 'px-2 sm:px-4',
        md: 'px-4 sm:px-6',
        lg: 'px-4 sm:px-6 lg:px-8',
        xl: 'px-6 sm:px-8 lg:px-10',
        '2xl': 'px-8 sm:px-10 lg:px-12'
      };
      
      const responsiveMargin = {
        none: '',
        sm: 'm-2 sm:m-4',
        md: 'm-4 sm:m-6',
        lg: 'm-4 sm:m-6 lg:m-8',
        xl: 'm-6 sm:m-8 lg:m-10',
        '2xl': 'm-8 sm:m-10 lg:m-12'
      };
      
      const responsiveMarginY = {
        none: '',
        sm: 'my-2 sm:my-4',
        md: 'my-4 sm:my-6',
        lg: 'my-4 sm:my-6 lg:my-8',
        xl: 'my-6 sm:my-8 lg:my-10',
        '2xl': 'my-8 sm:my-10 lg:my-12'
      };
      
      const responsiveMarginX = {
        none: '',
        sm: 'mx-2 sm:mx-4',
        md: 'mx-4 sm:mx-6',
        lg: 'mx-4 sm:mx-6 lg:mx-8',
        xl: 'mx-6 sm:mx-8 lg:mx-10',
        '2xl': 'mx-8 sm:mx-10 lg:mx-12'
      };
      
      switch (type) {
        case 'p': return responsiveSpacings[value as keyof typeof responsiveSpacings];
        case 'py': return responsivePaddingY[value as keyof typeof responsivePaddingY];
        case 'px': return responsivePaddingX[value as keyof typeof responsivePaddingX];
        case 'm': return responsiveMargin[value as keyof typeof responsiveMargin];
        case 'my': return responsiveMarginY[value as keyof typeof responsiveMarginY];
        case 'mx': return responsiveMarginX[value as keyof typeof responsiveMarginX];
        default: return '';
      }
    } else {
      const staticSpacings = {
        none: '',
        sm: 'p-2',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
        '2xl': 'p-10'
      };
      
      const staticPaddingY = {
        none: '',
        sm: 'py-2',
        md: 'py-4',
        lg: 'py-6',
        xl: 'py-8',
        '2xl': 'py-10'
      };
      
      const staticPaddingX = {
        none: '',
        sm: 'px-2',
        md: 'px-4',
        lg: 'px-6',
        xl: 'px-8',
        '2xl': 'px-10'
      };
      
      const staticMargin = {
        none: '',
        sm: 'm-2',
        md: 'm-4',
        lg: 'm-6',
        xl: 'm-8',
        '2xl': 'm-10'
      };
      
      const staticMarginY = {
        none: '',
        sm: 'my-2',
        md: 'my-4',
        lg: 'my-6',
        xl: 'my-8',
        '2xl': 'my-10'
      };
      
      const staticMarginX = {
        none: '',
        sm: 'mx-2',
        md: 'mx-4',
        lg: 'mx-6',
        xl: 'mx-8',
        '2xl': 'mx-10'
      };
      
      switch (type) {
        case 'p': return staticSpacings[value as keyof typeof staticSpacings];
        case 'py': return staticPaddingY[value as keyof typeof staticPaddingY];
        case 'px': return staticPaddingX[value as keyof typeof staticPaddingX];
        case 'm': return staticMargin[value as keyof typeof staticMargin];
        case 'my': return staticMarginY[value as keyof typeof staticMarginY];
        case 'mx': return staticMarginX[value as keyof typeof staticMarginX];
        default: return '';
      }
    }
  };

  const getIndividualSpacing = (type: string, value: string | undefined) => {
    if (!value) return '';
    
    if (responsive) {
      const responsiveIndividual = {
        none: '',
        sm: 'p-2 sm:p-4',
        md: 'p-4 sm:p-6',
        lg: 'p-4 sm:p-6 lg:p-8',
        xl: 'p-6 sm:p-8 lg:p-10',
        '2xl': 'p-8 sm:p-10 lg:p-12'
      };
      
      const responsiveIndividualY = {
        none: '',
        sm: 'py-2 sm:py-4',
        md: 'py-4 sm:py-6',
        lg: 'py-4 sm:py-6 lg:py-8',
        xl: 'py-6 sm:py-8 lg:py-10',
        '2xl': 'py-8 sm:py-10 lg:py-12'
      };
      
      const responsiveIndividualX = {
        none: '',
        sm: 'px-2 sm:px-4',
        md: 'px-4 sm:px-6',
        lg: 'px-4 sm:px-6 lg:px-8',
        xl: 'px-6 sm:px-8 lg:px-10',
        '2xl': 'px-8 sm:px-10 lg:px-12'
      };
      
      switch (type) {
        case 'pt': return responsiveIndividualY[value as keyof typeof responsiveIndividualY];
        case 'pb': return responsiveIndividualY[value as keyof typeof responsiveIndividualY];
        case 'pl': return responsiveIndividualX[value as keyof typeof responsiveIndividualX];
        case 'pr': return responsiveIndividualX[value as keyof typeof responsiveIndividualX];
        case 'mt': return responsiveIndividualY[value as keyof typeof responsiveIndividualY];
        case 'mb': return responsiveIndividualY[value as keyof typeof responsiveIndividualY];
        case 'ml': return responsiveIndividualX[value as keyof typeof responsiveIndividualX];
        case 'mr': return responsiveIndividualX[value as keyof typeof responsiveIndividualX];
        default: return '';
      }
    } else {
      const staticIndividual = {
        none: '',
        sm: 'p-2',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
        '2xl': 'p-10'
      };
      
      const staticIndividualY = {
        none: '',
        sm: 'py-2',
        md: 'py-4',
        lg: 'py-6',
        xl: 'py-8',
        '2xl': 'py-10'
      };
      
      const staticIndividualX = {
        none: '',
        sm: 'px-2',
        md: 'px-4',
        lg: 'px-6',
        xl: 'px-8',
        '2xl': 'px-10'
      };
      
      switch (type) {
        case 'pt': return staticIndividualY[value as keyof typeof staticIndividualY];
        case 'pb': return staticIndividualY[value as keyof typeof staticIndividualY];
        case 'pl': return staticIndividualX[value as keyof typeof staticIndividualX];
        case 'pr': return staticIndividualX[value as keyof typeof staticIndividualX];
        case 'mt': return staticIndividualY[value as keyof typeof staticIndividualY];
        case 'mb': return staticIndividualY[value as keyof typeof staticIndividualY];
        case 'ml': return staticIndividualX[value as keyof typeof staticIndividualX];
        case 'mr': return staticIndividualX[value as keyof typeof staticIndividualX];
        default: return '';
      }
    }
  };

  const getResponsiveClasses = () => {
    if (responsive) {
      const responsiveClasses = [
        p && getSpacingClasses('p', p),
        py && getSpacingClasses('py', py),
        px && getSpacingClasses('px', px),
        pt && getIndividualSpacing('pt', pt),
        pb && getIndividualSpacing('pb', pb),
        pl && getIndividualSpacing('pl', pl),
        pr && getIndividualSpacing('pr', pr),
        m && getSpacingClasses('m', m),
        my && getSpacingClasses('my', my),
        mx && getSpacingClasses('mx', mx),
        mt && getIndividualSpacing('mt', mt),
        mb && getIndividualSpacing('mb', mb),
        ml && getIndividualSpacing('ml', ml),
        mr && getIndividualSpacing('mr', mr)
      ].filter(Boolean);
      return responsiveClasses.join(' ');
    } else {
      const staticClasses = [
        p && getSpacingClasses('p', p),
        py && getSpacingClasses('py', py),
        px && getSpacingClasses('px', px),
        pt && getIndividualSpacing('pt', pt),
        pb && getIndividualSpacing('pb', pb),
        pl && getIndividualSpacing('pl', pl),
        pr && getIndividualSpacing('pr', pr),
        m && getSpacingClasses('m', m),
        my && getSpacingClasses('my', my),
        mx && getSpacingClasses('mx', mx),
        mt && getIndividualSpacing('mt', mt),
        mb && getIndividualSpacing('mb', mb),
        ml && getIndividualSpacing('ml', ml),
        mr && getIndividualSpacing('mr', mr)
      ].filter(Boolean);
      return staticClasses.join(' ');
    }
  };

  const classes = [
    getResponsiveClasses(),
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export default ResponsiveSpacing;