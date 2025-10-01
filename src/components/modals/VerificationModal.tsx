import { useState } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';

interface VerificationModalProps {
  verification: any;
  onClose: () => void;
  onAction: (id: string, status: string, reason?: string) => void;
}

export function VerificationModal({ verification, onClose, onAction }: VerificationModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Vérification d'identité</h3>
            <button
              onClick={() => {
                onClose();
                setRejectionReason('');
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {verification.user_first_name} {verification.user_last_name}
              </h4>
              <p className="text-sm text-gray-600">{verification.user_email}</p>
              {verification.user_phone && (
                <p className="text-sm text-gray-600">{verification.user_phone}</p>
              )}
            </div>
            <div className="border-t border-gray-200 pt-4">
              <img
                src={verification.document_url}
                alt="Document"
                className="w-full rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%239ca3af"%3EDocument non disponible%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            {verification.verification_status === 'pending' && (
              <div className="border-t border-gray-200 pt-4">
                <textarea
                  placeholder="Raison du rejet (optionnel)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  rows={3}
                />
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => onAction(verification.id, 'approved')}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Approuver</span>
                  </button>
                  <button
                    onClick={() => onAction(verification.id, 'rejected', rejectionReason)}
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