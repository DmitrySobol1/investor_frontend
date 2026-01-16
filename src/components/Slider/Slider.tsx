import type { FC } from 'react';
import './Slider.css';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const Slider: FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="slider-wrapper">
      <div className="slider-container">
        <div
          className="slider-track"
          style={{
            background: `linear-gradient(to right, #31b663 ${percentage}%, rgba(49, 182, 99, 0.3) ${percentage}%)`
          }}
        />
        <input
          type="range"
          className="slider-input"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
        />
      </div>
      <div className="slider-value">{value}%</div>
    </div>
  );
};
