import type { FC, ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'filled' | 'outline';
}

export const Button: FC<ButtonProps> = ({ children, variant = 'filled', className, ...props }) => {
  const buttonClass = variant === 'outline' ? 'button button--outline' : 'button';

  return (
    <button className={`${buttonClass} ${className || ''}`} {...props}>
      {children}
    </button>
  );
};
