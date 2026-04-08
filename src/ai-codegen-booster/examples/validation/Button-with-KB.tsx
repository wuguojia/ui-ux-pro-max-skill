/**
 * Button component - Version B (With Knowledge Base)
 * Generated with KB context - follows project conventions
 */

import React from 'react';
import { Button } from '@/components/ui/Button'; // Correct import path from KB

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const CustomButton: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} btn-${size}`}
      style={{
        backgroundColor: 'var(--color-primary)',    // Uses KB style variable
        color: 'var(--color-white)',                // Uses KB style variable
        padding: 'var(--spacing-md)',               // Uses KB style variable
        borderRadius: 'var(--radius-md)',           // Uses KB style variable
        fontSize: 'var(--font-size-base)',          // Uses KB style variable
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
};

export default CustomButton;
