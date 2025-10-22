// src/components/modals/EquipmentModal.tsx
import { useState } from 'react';
import { X, CheckCircle, XCircle, MapPin, DollarSign, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface EquipmentModalProps {
  equipment: any;
  onClose: () => void;
  onAction: (id: string, status: string, feedback?: string) => void;
}

export function EquipmentModal({ equipment, onClose, onAction }: EquipmentModalProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Préparer toutes les images (principale + autres)
  const allImages = equipment.images || [];
  const hasImages = allImages.length > 0;

  const handleApprove = () => {
    console.log('🟢 Approbation en cours...', equipment.id);
    onAction(equipment.id, 'approved');
    setShowApproveConfirm(false);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Veuillez indiquer une raison de rejet');
      return;
    }
    console.log('🔴 Rejet en cours...', equipment.id, rejectionReason);
    onAction(equipment.id, 'rejected', rejectionReason);
    setShowRejectForm(false);
    setRejectionReason('');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Détails de l'équipement</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Carrousel d'images */}
        {hasImages && (
          <div className="relative bg-gray-900">
            <div className="relative h-96 overflow-hidden">
              <img
                src={allImages[currentImageIndex].image_url}
                alt={`${equipment.title} - ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
              />
              
              {/* Badge Photo principale */}
              {allImages[currentImageIndex].is_primary && (
                <span className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Photo principale
                </span>
              )}

              {/* Navigation carrousel */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-900" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-900" />
                  </button>
                </>
              )}

              {/* Indicateur de position */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            </div>

            {/* Miniatures */}
            {allImages.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto bg-gray-800">
                {allImages.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex
                        ? 'border-green-500 scale-110'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt={`Miniature ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title and Status */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{equipment.title}</h3>
              <p className="text-gray-600">
                Par {equipment.owner_first_name} {equipment.owner_last_name}
              </p>
            </div>
            <span
              className={`px-4 py-2 text-sm font-semibold rounded-full ${
                equipment.moderation_status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : equipment.moderation_status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {equipment.moderation_status === 'pending'
                ? 'En attente'
                : equipment.moderation_status === 'approved'
                ? 'Approuvé'
                : 'Rejeté'}
            </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-medium">Prix journalier</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{equipment.daily_price} FCFA</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Caution</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{equipment.deposit_amount} FCFA</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Localisation</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {equipment.city}, {equipment.country}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Catégorie</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 capitalize">{equipment.category}</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{equipment.description}</p>
          </div>

          {/* Rejection Reason (if rejected) */}
          {equipment.moderation_status === 'rejected' && equipment.rejection_reason && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">Raison du rejet</h4>
              <p className="text-red-700">{equipment.rejection_reason}</p>
            </div>
          )}


        </div>

        {/* Actions (only for pending items) - TOUJOURS VISIBLES */}
        {equipment.moderation_status === 'pending' && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4">
            <button
              onClick={() => setShowApproveConfirm(true)}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold text-lg transition-all"
            >
              <CheckCircle className="w-6 h-6" />
              <span>Approuver</span>
            </button>
            <button
              onClick={() => setShowRejectForm(true)}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 font-semibold text-lg transition-all"
            >
              <XCircle className="w-6 h-6" />
              <span>Rejeter</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de confirmation d'approbation - PAR-DESSUS TOUT */}
      {showApproveConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center" 
          style={{ zIndex: 9999 }}
          onClick={() => setShowApproveConfirm(false)}
        >
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirmer l'approbation</h3>
              <p className="text-gray-600">
                Êtes-vous sûr de vouloir approuver cet équipement ? Il sera visible publiquement sur la plateforme.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all"
              >
                ✅ Oui, approuver
              </button>
              <button
                onClick={() => setShowApproveConfirm(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de rejet avec formulaire - PAR-DESSUS TOUT */}
      {showRejectForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center" 
          style={{ zIndex: 9999 }}
          onClick={() => setShowRejectForm(false)}
        >
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Rejeter l'équipement</h3>
              <p className="text-gray-600 text-center text-sm">
                Le propriétaire recevra un email avec ce motif. Soyez précis et constructif.
              </p>
            </div>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Exemple: Les photos sont floues et la description manque de détails sur l'état de l'équipement..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-all"
              >
                Confirmer le rejet
              </button>
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason('');
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    
  );
}