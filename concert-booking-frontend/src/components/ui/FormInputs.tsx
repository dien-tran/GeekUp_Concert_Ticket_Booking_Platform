import React from 'react';
import { clsx } from 'clsx';

// Search Input
interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  containerClassName?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onClear,
  containerClassName,
  className,
  ...props
}) => {
  return (
    <div className={clsx('relative flex items-center', containerClassName)}>
      <svg className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        className={clsx(
          'w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-gray-200',
          'bg-white placeholder-gray-400 text-gray-900',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
          'transition-all duration-200',
          className
        )}
        {...props}
      />
      {onClear && props.value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

// Form Input
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerClassName?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightElement,
  containerClassName,
  className,
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={clsx('w-full', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={clsx(
            'w-full py-2.5 text-sm rounded-xl border transition-all duration-200',
            'placeholder-gray-400 text-gray-900 bg-white',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
            leftIcon ? 'pl-10' : 'pl-4',
            rightElement ? 'pr-10' : 'pr-4',
            error ? 'border-red-400 focus:ring-red-300/30 focus:border-red-400' : 'border-gray-200',
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3">{rightElement}</div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
    </div>
  );
};

// Textarea Input
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label, error, helperText, containerClassName, className, id, ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={clsx('w-full', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        className={clsx(
          'w-full px-4 py-2.5 text-sm rounded-xl border transition-all duration-200 resize-y min-h-[100px]',
          'placeholder-gray-400 text-gray-900 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
          error ? 'border-red-400' : 'border-gray-200',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
    </div>
  );
};

// Select Input
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label, error, helperText, containerClassName, className, id, options, placeholder, ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={clsx('w-full', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={inputId}
        className={clsx(
          'w-full px-4 py-2.5 text-sm rounded-xl border transition-all duration-200 bg-white appearance-none',
          'text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
          error ? 'border-red-400' : 'border-gray-200',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
    </div>
  );
};
