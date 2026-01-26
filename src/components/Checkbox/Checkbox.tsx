import { type FC } from 'react';
import './Checkbox.css';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
}

export const Checkbox: FC<CheckboxProps> = ({ checked, onChange }) => {
  return (
    <div className="custom-checkbox" onClick={onChange}>
      <div className={`checkbox-box ${checked ? 'checked' : ''}`}>
        {checked && (
          <svg viewBox="0 0 24 24" className="checkbox-icon">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        )}
      </div>
    </div>
  );
};
