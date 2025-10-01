// import React from 'react';
import { Users,  Package, Clock, AlertCircle } from 'lucide-react';
import { useStats } from '../hooks/useStats';

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

export function Dashboard({ onTabChange }: DashboardProps) {
  const { stats, loading } = useStats();

  const cards = [
    {
      title: 'Utilisateurs totaux',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Vérifications en attente',
      value: stats.pendingVerifications,
      icon: Clock,
      color: 'from-yellow-500 to-orange-500',
      urgent: stats.pendingVerifications > 0,
      onClick: () => onTabChange('verifications')
    },
    {
      title: 'Équipements en attente',
      value: stats.pendingEquipments,
      icon: AlertCircle,
      color: 'from-red-500 to-pink-500',
      urgent: stats.pendingEquipments > 0,
      onClick: () => onTabChange('equipments')
    },
    {
      title: 'Équipements totaux',
      value: stats.totalEquipments,
      icon: Package,
      color: 'from-green-500 to-emerald-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            onClick={card.onClick}
            className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 ${
              card.onClick ? 'cursor-pointer' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
                {card.urgent && (
                  <div className="flex items-center text-sm text-orange-600 font-medium">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span>Action requise</span>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-br ${card.color}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}