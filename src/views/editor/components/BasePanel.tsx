'use client';

import { ReactNode } from 'react';

interface BasePanelProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function BasePanel({ title, children, className = '' }: BasePanelProps) {
  return (
    <nav className={`bg-[#f3f3f3] border-neutral-200 pl-6 py-6 w-80 h-screen flex flex-col ${className}`}>
      <h2 className="text-2xl font-bold mb-4 text-neutral-900">{title}</h2>
      <div className="flex-1 flex flex-col h-80">
        {children}
      </div>
    </nav>
  );
}
