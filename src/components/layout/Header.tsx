// import React from 'react';

import { Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  description: string;
  onMenuClick: () => void;
}

export function Header({ title, description, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="px-4 lg:px-8 py-4">
        <div className="flex items-center space-x-4">
          <button onClick={onMenuClick} className="lg:hidden text-gray-500 hover:text-gray-700">
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
        </div>
      </div>
    </header>
  );
}