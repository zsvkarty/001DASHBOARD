import React from 'react';

interface ToggleSwitchProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className = ''
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`flex items-start justify-between ${className}`}>
      {/* Label and Description */}
      <div className="flex-1 mr-4">
        <label 
          htmlFor={id}
          className={`block text-sm font-medium cursor-pointer ${
            disabled 
              ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {label}
        </label>
        {description && (
          <p className={`text-sm mt-1 ${
            disabled 
              ? 'text-gray-400 dark:text-gray-500' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {description}
          </p>
        )}
      </div>

      {/* Toggle Switch */}
      <div
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        tabIndex={disabled ? -1 : 0}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer'
          }
          ${checked 
            ? 'bg-blue-600 dark:bg-blue-500' 
            : 'bg-gray-200 dark:bg-gray-600'
          }
        `}
      >
        {/* Toggle Button */}
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
          aria-hidden="true"
        />
      </div>

      {/* Hidden input for form compatibility */}
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={() => {}} // Controlled by the toggle
        disabled={disabled}
        className="sr-only"
        aria-hidden="true"
      />
    </div>
  );
};

export default ToggleSwitch;