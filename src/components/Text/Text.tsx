import type { FC, CSSProperties } from 'react';
import './Text.css';

interface TextProps {
  text?: string;
  hometext?: string;
  padding?: CSSProperties['padding'];
  style?: CSSProperties;
}

export const Text: FC<TextProps> = ({ text, hometext, padding, style }) => {
  return (
    <div className="text" style={padding ? { padding } : undefined}>
      {text && <h1 className="text__text" style={style}>{text}</h1>}
      {hometext && <h1 className="text__hometext" style={style}>{hometext}</h1>}
    </div>
  );
};
