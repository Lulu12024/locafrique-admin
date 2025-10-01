import  { useState } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';

interface EquipmentModalProps {
  equipment: any;
  onClose: () => void;
  onAction: (id: string, status: string, feedback?: string) => void;
}

export function EquipmentModal({ equipment, onClose, onAction }: EquipmentModalProps) {
  const [feedback, setFeedback] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Détails de l'équipement</h3>
            <button
              onClick={() => {
                onClose();
                setFeedback('');
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 text-lg mb-1">{equipment.title}</h4>
              <p className="text-sm text-gray-600">
                Propriétaire: {equipment.owner_first_name} {equipment.owner_last_name}
              </p>
              <p className="text-sm text-gray-500">{equipment.owner_email}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Prix journalier</p>
                <p className="text-lg font-bold text-green-600">{equipment.daily_price} FCFA</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Caution</p>
                <p className="text-lg font-bold text-gray-900">{equipment.deposit_amount} FCFA</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Catégorie</p>
                <p className="text-gray-900">{equipment.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Localisation</p>
                <p className="text-gray-900">{equipment.city}, {equipment.country}</p>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
              <p className="text-gray-600">{equipment.description}</p>
            </div>
            {equipment.moderation_status === 'pending' && (
              <div className="border-t border-gray-200 pt-4">
                <textarea
                  placeholder="Commentaires de modération (optionnel)..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  rows={3}
                />
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => onAction(equipment.id, 'approved', feedback)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Approuver</span>
                  </button>
                  <button
                    onClick={() => onAction(equipment.id, 'rejected', feedback)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Rejeter</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}