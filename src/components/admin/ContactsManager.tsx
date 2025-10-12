// src/components/admin/ContactsManager.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Search, Calendar, User, Phone, Mail, MessageCircle, Eye, Check, X } from 'lucide-react';

export default function ContactsManager() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger les réservations
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          renter:profiles!bookings_renter_id_fkey(id, first_name, last_name, phone_number),
          equipment:equipments(
            id, 
            title,
            owner:profiles!equipments_owner_id_fkey(id, first_name, last_name, phone_number)
          )
        `)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Charger les messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, first_name, last_name),
          receiver:profiles!messages_receiver_id_fkey(id, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      setBookings(bookingsData || []);
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', bookingId);

    if (!error) loadData();
  };

  const handleReject = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (!error) loadData();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contacts & Réservations</h1>
        <p className="text-gray-600">Gérez les réservations et messages</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmé</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Total Réservations</div>
          <div className="text-2xl font-bold">{bookings.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">En attente</div>
          <div className="text-2xl font-bold text-yellow-600">
            {bookings.filter(b => b.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Confirmées</div>
          <div className="text-2xl font-bold text-green-600">
            {bookings.filter(b => b.status === 'confirmed').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Messages</div>
          <div className="text-2xl font-bold">{messages.length}</div>
        </div>
      </div>

      {/* Liste des réservations */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Réservations récentes</h2>
        {bookings.slice(0, 10).map((booking) => (
          <div key={booking.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{booking.equipment?.title}</h3>
                  <p className="text-sm text-gray-500">{formatDate(booking.created_at)}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Locataire</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  {booking.renter?.first_name} {booking.renter?.last_name}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Phone className="h-4 w-4" />
                  {booking.renter?.phone_number || 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Propriétaire</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  {booking.equipment?.owner?.first_name} {booking.equipment?.owner?.last_name}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Phone className="h-4 w-4" />
                  {booking.equipment?.owner?.phone_number || 'N/A'}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium">
                Montant: <span className="text-green-600 font-bold">{booking.total_price?.toLocaleString()} FCFA</span>
              </p>
            </div>

            {booking.status === 'pending' && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleApprove(booking.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Check className="h-4 w-4" />
                  Approuver
                </button>
                <button
                  onClick={() => handleReject(booking.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <X className="h-4 w-4" />
                  Refuser
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Messages récents */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Messages récents</h2>
        <div className="space-y-4">
          {messages.slice(0, 5).map((msg) => (
            <div key={msg.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {msg.sender?.first_name} {msg.sender?.last_name} → {msg.receiver?.first_name} {msg.receiver?.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(msg.created_at)}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${msg.read ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-600'}`}>
                  {msg.read ? 'Lu' : 'Non lu'}
                </span>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{msg.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}