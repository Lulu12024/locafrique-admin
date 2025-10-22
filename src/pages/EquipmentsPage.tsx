import { useState } from 'react';
import { Search, Eye, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import { useEquipments } from '../hooks/useEquipments';
import { EquipmentModal } from '../components/modals/EquipmentModal';

export function EquipmentsPage() {
  const { equipments, loading, updateEquipment } = useEquipments();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const filteredEquipments = equipments.filter(
    (e) =>
      (statusFilter === 'all' || e.moderation_status === statusFilter) &&
      (e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleAction = async (id: string, status: string, feedback?: string) => {
    console.log('📝 Action reçue:', { id, status, feedback });
    try {
      await updateEquipment(id, status as 'approved' | 'rejected', feedback);
      setSelectedItem(null);
    } catch (error) {
      console.error('❌ Erreur lors de l\'action:', error);
    }
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
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un équipement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>
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

      {filteredEquipments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 text-lg">Aucun équipement trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipments.map((e) => {
            const primaryImage = e.images?.find((img: any) => img.is_primary)?.image_url;
            
            return (
              <div
                key={e.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                {primaryImage ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={primaryImage}
                      alt={e.title}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full ${
                        e.moderation_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : e.moderation_status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {getStatusLabel(e.moderation_status)}
                    </span>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{e.title}</h3>
                      <p className="text-sm text-gray-500">
                        Par {e.owner_first_name} {e.owner_last_name}
                      </p>
                    </div>
                    {!primaryImage && (
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          e.moderation_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : e.moderation_status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {getStatusLabel(e.moderation_status)}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{e.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-green-600">{e.daily_price} FCFA/jour</span>
                      <span className="text-gray-500 capitalize">{e.category}</span>
                    </div>
                    {e.images && e.images.length > 0 && (
                      <div className="flex items-center text-xs text-gray-500">
                        <ImageIcon className="w-3 h-3 mr-1" />
                        {e.images.length} photo{e.images.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedItem(e)}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Voir les détails</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedItem && (
        <EquipmentModal
          equipment={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}