import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  closable?: boolean;
  centered?: boolean;
  className?: string;
  responsive?: boolean;
}

const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closable = true,
  centered = true,
  className = '',
  responsive = true
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closable, onClose]);

  if (!isOpen) return null;

  const getSizeClasses = () => {
    if (responsive) {
      const responsiveSizes = {
        sm: "max-w-sm sm:max-w-md",
        md: "max-w-md sm:max-w-lg lg:max-w-2xl",
        lg: "max-w-lg sm:max-w-xl lg:max-w-4xl",
        xl: "max-w-xl sm:max-w-2xl lg:max-w-6xl",
        '2xl': "max-w-2xl sm:max-w-4xl lg:max-w-7xl",
        full: "max-w-full"
      };
      return responsiveSizes[size];
    } else {
      const staticSizes = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        '2xl': "max-w-2xl",
        full: "max-w-full"
      };
      return staticSizes[size];
    }
  };

  const getPaddingClasses = () => {
    if (responsive) {
      return "p-4 sm:p-6 lg:p-8";
    }
    return "p-6";
  };

  const getTitleSize = () => {
    if (responsive) {
      return "text-lg sm:text-xl lg:text-2xl";
    }
    return "text-xl";
  };

  const getMaxHeight = () => {
    if (responsive) {
      return "max-h-[90vh] sm:max-h-[85vh] lg:max-h-[80vh]";
    }
    return "max-h-[90vh]";
  };

  const getResponsiveClasses = () => {
    if (responsive) {
      const responsiveClasses = [
        "w-full",
        getSizeClasses(),
        "bg-white rounded-2xl shadow-2xl",
        getMaxHeight(),
        "overflow-hidden"
      ].filter(Boolean);
      return responsiveClasses.join(' ');
    } else {
      const staticClasses = [
        "w-full",
        getSizeClasses(),
        "bg-white rounded-2xl shadow-2xl",
        getMaxHeight(),
        "overflow-hidden"
      ].filter(Boolean);
      return staticClasses.join(' ');
    }
  };

  const modalClasses = [
    getResponsiveClasses(),
    className
  ].filter(Boolean).join(' ');

  const backdropClasses = [
    "fixed inset-0 z-50 flex items-center justify-center p-4",
    centered ? "items-center" : "items-start pt-16",
    "bg-black/50 backdrop-blur-sm"
  ].filter(Boolean).join(' ');

  return (
    <div className={backdropClasses} onClick={closable ? onClose : undefined}>
      <div
        className={modalClasses}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200">
            <h2 className={`font-bold text-slate-900 ${getTitleSize()}`}>
              {title}
            </h2>
            {closable && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={24} className="text-slate-500" />
              </button>
            )}
          </div>
        )}
        <div className={`overflow-y-auto ${getMaxHeight()} ${getPaddingClasses()}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveModal;