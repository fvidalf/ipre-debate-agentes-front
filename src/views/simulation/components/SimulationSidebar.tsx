'use client';

import { SimulationSidebarOption } from '@/types';
import { Play, ArrowLeft, Vote, ChartArea } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SimulationSidebarProps {
  activeOption: SimulationSidebarOption;
  onOptionChange: (option: SimulationSidebarOption) => void;
  simulationStatus: any;
}

export default function SimulationSidebar({ activeOption, onOptionChange, simulationStatus }: SimulationSidebarProps) {
  const router = useRouter();

  // Only show voting option when simulation is finished or stopped
  const isSimulationComplete = simulationStatus?.status === 'finished' || simulationStatus?.status === 'stopped';
  
  const sidebarItems = [
    { id: 'back' as const, icon: ArrowLeft, title: 'Back to My Debates' },
    { id: 'simulation' as const, icon: Play, title: 'Simulation' },
    ...(isSimulationComplete ? [{ id: 'voting' as const, icon: Vote, title: 'Voting' }] : []),
    ...(isSimulationComplete ? [{ id: 'visuals' as const, icon: ChartArea, title: 'Visuals' }] : []),
  ];

  const handleOptionClick = (option: SimulationSidebarOption) => {
    if (option === 'back') {
      router.push('/my-debates');
    } else {
      onOptionChange(option);
    }
  };

  return (
    <aside className="bg-[#f3f3f3] flex flex-col items-center py-4 gap-6">
      {sidebarItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => handleOptionClick(item.id)}
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