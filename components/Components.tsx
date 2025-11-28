import React from 'react';
import { Palette, Pencil, Shapes, Puzzle, Dices, Search, ArrowLeft, Mic, Eraser, Trash2, Save, Wand2 } from 'lucide-react';

export const Icons = {
  Palette, Pencil, Shapes, Puzzle, Dices, Search, ArrowLeft, Mic, Eraser, Trash2, Save, Wand2
};

interface GameCardProps {
  title?: string;
  icon: keyof typeof Icons;
  color: string;
  onClick: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ icon, color, onClick }) => {
  const IconComponent = Icons[icon];
  return (
    <button
      onClick={onClick}
      className={`
        ${color} w-full aspect-square rounded-[2rem] 
        transform transition-all duration-200 
        hover:scale-105 active:scale-95 active:translate-y-2
        flex items-center justify-center 
        border-4 border-white 
        shadow-[0_8px_0_rgba(0,0,0,0.15)] active:shadow-none
        relative overflow-hidden group
      `}
    >
      {/* Background decoration circle */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -mr-10 -mt-10 pointer-events-none group-hover:scale-150 transition-transform"/>
      
      <IconComponent size={90} className="text-white drop-shadow-md z-10" strokeWidth={2.5} />
    </button>
  );
};

interface IconButtonProps {
  icon: keyof typeof Icons;
  onClick: () => void;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, onClick, color = 'bg-white', size = 'md', active = false }) => {
  const IconComponent = Icons[icon];
  // Size logic
  const p = size === 'sm' ? 'p-2' : size === 'lg' ? 'p-5' : 'p-3';
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 40 : 28;
  const shadowSize = size === 'sm' ? 'shadow-[0_4px_0_rgba(0,0,0,0.1)]' : 'shadow-[0_6px_0_rgba(0,0,0,0.15)]';
  const borderSize = size === 'sm' ? 'border-2' : 'border-4';

  return (
    <button
      onClick={onClick}
      className={`
        ${color} ${p} rounded-2xl 
        ${borderSize} border-gray-100
        ${shadowSize} active:shadow-none active:translate-y-1
        transition-all 
        ${active ? 'ring-4 ring-kid-yellow scale-110' : ''} 
        flex items-center justify-center
        group
      `}
    >
      <IconComponent 
        size={iconSize} 
        className={`${active ? 'text-kid-orange' : 'text-gray-600'} group-hover:scale-110 transition-transform`} 
        strokeWidth={3}
      />
    </button>
  );
};