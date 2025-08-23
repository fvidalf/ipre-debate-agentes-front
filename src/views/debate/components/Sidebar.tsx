'use client';

import { SidebarOption } from '@/types';
import { Users, Wrench, Settings } from 'lucide-react';

interface SidebarProps {
  activeOption: SidebarOption;
  onOptionChange: (option: SidebarOption) => void;
}

const sidebarItems = [
  { id: 'people' as const, icon: Users, title: 'People' },
  { id: 'tools' as const, icon: Wrench, title: 'Tools' },
  { id: 'settings' as const, icon: Settings, title: 'Settings' },
];

export default function Sidebar({ activeOption, onOptionChange }: SidebarProps) {
  return (
    <aside className="bg-neutral-50 flex flex-col items-center py-4 gap-6">
      {sidebarItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onOptionChange(item.id)}
            title={item.title}
            className={`
              flex items-center justify-center
              transition-all duration-200 ease-out
              cursor-pointer
              text-neutral-600 hover:text-neutral-800
              ${activeOption === item.id 
                ? 'transform scale-125 text-neutral-900' 
                : 'hover:scale-110'
              }
            `}
          >
            <IconComponent 
              size={activeOption === item.id ? 28 : 24}
              strokeWidth={activeOption === item.id ? 2.5 : 2}
            />
          </button>
        );
      })}
    </aside>
  );
}
