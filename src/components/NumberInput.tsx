import React from 'react';
import { Input } from './Input';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  style?: React.CSSProperties;
}

export const NumberInput: React.FC<NumberInputProps> = ({ 
  value, 
  onChange, 
  min, 
  max, 
  placeholder,
  style 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^0-9]/g, '');
    
    if (inputValue === '') {
      onChange(min || 0);
      return;
    }
    
    let numValue = parseInt(inputValue);
    
    if (min !== undefined && numValue < min) {
      numValue = min;
    }
    if (max !== undefined && numValue > max) {
      numValue = max;
    }
    
    onChange(numValue);
  };

  return (
    <Input
      type="text"
      value={value.toString()}
      onChange={handleChange}
      placeholder={placeholder}
      style={style}
    />
  );
};