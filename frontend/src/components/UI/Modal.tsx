
import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
  showClose?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className = '', size = 'md', title }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    modalRef.current.focus();
  }, [isOpen]);

  if (!isOpen) return null; 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className={`bg-white/90 rounded-2xl shadow-2xl p-8 min-w-[300px] ${sizeClasses[size]} w-full relative ${className}`}>
        {title && (
          <div className="border-b border-slate-200 pb-4 mb-6">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-blue-900 hover:text-red-500 text-xl font-bold focus:outline-none"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;