import { useState } from 'react';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { useVerifications } from '../hooks/useVerifications';
import { VerificationModal } from '../components/modals/VerificationModal';

export function VerificationsPage() {
  const { verifications, loading, updateVerification } = useVerifications();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const filteredVerifications = verifications.filter(
    (v) => statusFilter === 'all' || v.verification_status === statusFilter
  );

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'all': return 'Tous';
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvés';
      case 'rejected': return 'Rejetés';
      default: return status;
    }
  };

  const handleAction = async (id: string, status: string, reason?: string) => {
    const verification = verifications.find(v => v.id === id);
    await updateVerification(id, status, reason, verification?.user_id);
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === status
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVerifications.map((v) => (
          <div
            key={v.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {v.user_first_name} {v.user_last_name}
                </h3>
                <p className="text-sm text-gray-500">{v.user_email}</p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  v.verification_status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : v.verification_status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {getStatusLabel(v.verification_status)}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-sm">
                <span className="font-medium text-gray-700">Type:</span> {v.document_type}
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Date:</span>{' '}
                {new Date(v.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedItem(v)}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm">Voir</span>
              </button>
              {v.verification_status === 'pending' && (
                <>
                  <button
                    onClick={() => handleAction(v.id, 'approved')}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedItem(v)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <VerificationModal
          verification={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}