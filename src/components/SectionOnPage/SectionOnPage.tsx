import type { FC, ReactNode } from 'react';
import './SectionOnPage.css';

interface SectionOnPageProps {
  children: ReactNode;
}

export const SectionOnPage: FC<SectionOnPageProps> = ({ children }) => {
  return (
    <div className="section-on-page">
      {children}
    </div>
  );
};
