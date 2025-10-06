
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', icon, leftIcon, helperText, ...props }) => {
    const iconToUse = leftIcon || icon;
    return (
      <div className="flex flex-col gap-1">
        {label && <label className="text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <div className="relative">
          {iconToUse && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              {iconToUse}
            </div>
          )}
          <input
            className={`w-full bg-white/80 border border-slate-300 rounded-xl px-4 py-3 shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${iconToUse ? 'pl-10' : ''} ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        {helperText && <p className="text-sm text-slate-500 mt-1">{helperText}</p>}
      </div>
    );
};

export default Input;