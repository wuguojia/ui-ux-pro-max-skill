/**
 * Button component - Version A (Without Knowledge Base)
 * Generated without KB context - may have inconsistencies
 */

import React from 'react';
import Button from './Button'; // Wrong import path

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  // Missing: variant, size, disabled props
}

export const CustomButton: React.FC<ButtonProps> = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: '#3b82f6',  // Hardcoded color
        color: '#ffffff',             // Hardcoded color
        padding: '8px 16px',          // Hardcoded size
        borderRadius: '4px',          // Hardcoded size
        fontSize: '14px',             // Hardcoded size
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
};

export default CustomButton;
