import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Users, Shield, Package, CheckCircle, XCircle, 
  Clock, Search, Eye, AlertCircle, TrendingUp, Loader2, Home, Menu, LogOut, X
} from 'lucide-react';

// Configuration Supabase
const supabase = createClient(
  "https://nvcgijtnwnbgxzuclbhy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52Y2dpanRud25iZ3h6dWNsYmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTM4MjEsImV4cCI6MjA3MjU4OTgyMX0.vybd5mCZUKZccLN2toyzz9z6yoQs0FXWEaYPb4S2nck"
);

// Hook d'authentification
function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await checkAdminStatus(user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminStatus = async (userId: string) => {
    try {
      console.log('🔍 Vérification admin pour:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
      
      console.log('📊 Résultat:', { data, error });
      
      if (error) {
        console.error('❌ Erreur:', error.message);
        setIsAdmin(false);
      } else {
        const isAdminUser = data?.is_admin === true;
        console.log('✅ Est admin:', isAdminUser);
        setIsAdmin(isAdminUser);
      }
    } catch (error: any) {
      console.error('❌ Exception:', error.message);
      setIsAdmin(false);
    } finally {
      console.log('🏁 Fin du chargement');
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  return { user, isAdmin, loading, signIn, signOut };
}

function App() {
  const { user, isAdmin, loading: authLoading, signIn, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingVerifications: 0,
    pendingEquipments: 0,
    totalEquipments: 0
  });
  const [users, setUsers] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rejectionReason, setRejectionReason] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin]);

  const loadData = async () => {
    await Promise.all([
      loadStats(),
      loadUsers(),
      loadVerifications(),
      loadEquipments()
    ]);
  };

  const loadStats = async () => {
    const [usersRes, verificationsRes, equipmentsRes, pendingEquipmentsRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('identity_verifications').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
      supabase.from('equipments').select('id', { count: 'exact', head: true }),
      supabase.from('equipments').select('id', { count: 'exact', head: true }).eq('moderation_status', 'pending')
    ]);

    setStats({
      totalUsers: usersRes.count || 0,
      pendingVerifications: verificationsRes.count || 0,
      totalEquipments: equipmentsRes.count || 0,
      pendingEquipments: pendingEquipmentsRes.count || 0
    });
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setUsers(data || []);
  };

  const loadVerifications = async () => {
    const { data } = await supabase
      .from('identity_verifications')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          email,
          phone_number
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);
    setVerifications(data || []);
  };

  const loadEquipments = async () => {
    const { data } = await supabase
      .from('equipments')
      .select(`
        *,
        profiles:owner_id (
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);
    setEquipments(data || []);
  };

  const handleVerificationAction = async (id: string, status: string, reason?: string) => {
    const updates: any = {
      verification_status: status,
      verified_at: status === 'approved' ? new Date().toISOString() : null,
      verified_by: user?.id,
      rejection_reason: reason
    };

    const { error } = await supabase
      .from('identity_verifications')
      .update(updates)
      .eq('id', id);

    if (!error) {
      if (status === 'approved') {
        const verification = verifications.find(v => v.id === id);
        if (verification) {
          await supabase
            .from('profiles')
            .update({ is_verified: true })
            .eq('id', verification.user_id);
        }
      }
      
      await loadData();
      setSelectedItem(null);
      setRejectionReason('');
    }
  };

  const handleEquipmentAction = async (id: string, status: string, feedback?: string) => {
    const updates = {
      moderation_status: status,
      moderated_at: new Date().toISOString(),
      moderated_by: user?.id,
      moderation_feedback: feedback ? { comment: feedback } : null,
      status: status === 'approved' ? 'available' : 'pending'
    };

    const { error } = await supabase
      .from('equipments')
      .update(updates)
      .eq('id', id);

    if (!error) {
      await loadData();
      setSelectedItem(null);
      setFeedback('');
    }
  };

  const handleLogin = async () => {
    setLoginError('');
    setIsLoggingIn(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      setLoginError(error.message === 'Invalid login credentials' 
        ? 'Email ou mot de passe incorrect' 
        : error.message);
    }
    
    setIsLoggingIn(false);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-2xl">3W</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">3W-LOC Admin</h1>
            <p className="text-gray-600 mt-2">Connectez-vous pour administrer la plateforme</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                placeholder="admin@3wloc.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {loginError}
              </div>
            )}

            {!isAdmin && user && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
                Vous n'avez pas les permissions d'administrateur.
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoggingIn ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navigation = [
    { id: 'dashboard', name: 'Tableau de bord', icon: Home },
    { id: 'users', name: 'Utilisateurs', icon: Users },
    { id: 'verifications', name: 'Vérifications', icon: Shield },
    { id: 'equipments', name: 'Équipements', icon: Package }
  ];

  const currentNav = navigation.find(n => n.id === activeTab);

  return (
    <div className="flex h-screen bg-gray-50">
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">3W</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900">3W-LOC</h1>
                <p className="text-xs text-gray-500">Administration</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500">Administrateur</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 overflow-auto">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="px-4 lg:px-8 py-4">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
              {currentNav?.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Gérez votre plateforme de location
            </p>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {activeTab === 'dashboard' && <Dashboard stats={stats} onTabChange={setActiveTab} />}
          {activeTab === 'users' && <UsersTab users={users} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
          {activeTab === 'verifications' && (
            <VerificationsTab 
              verifications={verifications}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onAction={handleVerificationAction}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              rejectionReason={rejectionReason}
              setRejectionReason={setRejectionReason}
            />
          )}
          {activeTab === 'equipments' && (
            <EquipmentsTab
              equipments={equipments}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onAction={handleEquipmentAction}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              feedback={feedback}
              setFeedback={setFeedback}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// Reste du code dans le prochain message (Dashboard, UsersTab, VerificationsTab, EquipmentsTab)

function Dashboard({ stats, onTabChange }: any) {
  const cards = [
    { title: 'Utilisateurs totaux', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-blue-600', trend: null },
    { title: 'Vérifications en attente', value: stats.pendingVerifications, icon: Clock, color: 'from-yellow-500 to-orange-500', urgent: stats.pendingVerifications > 0, onClick: () => onTabChange('verifications') },
    { title: 'Équipements en attente', value: stats.pendingEquipments, icon: AlertCircle, color: 'from-red-500 to-pink-500', urgent: stats.pendingEquipments > 0, onClick: () => onTabChange('equipments') },
    { title: 'Équipements totaux', value: stats.totalEquipments, icon: Package, color: 'from-green-500 to-emerald-600', trend: null }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            onClick={card.onClick}
            className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 ${card.onClick ? 'cursor-pointer' : ''}`}
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

function UsersTab({ users, searchTerm, setSearchTerm }: any) {
  const filteredUsers = users.filter((u: any) =>
    u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Localisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone_number || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.city || '-'}</div>
                    <div className="text-sm text-gray-500">{user.country || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.is_verified ? (
                      <span className="px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Vérifié
                      </span>
                    ) : (
                      <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Non vérifié
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function VerificationsTab({ verifications, statusFilter, setStatusFilter, onAction, selectedItem, setSelectedItem, rejectionReason, setRejectionReason }: any) {
  const filtered = verifications.filter((v: any) =>
    statusFilter === 'all' || v.verification_status === statusFilter
  );

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'all': return 'Tous';
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvés';
      case 'rejected': return 'Rejetés';
      default: return status;
    }
  };

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
        {filtered.map((v: any) => (
          <div key={v.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {v.profiles?.first_name} {v.profiles?.last_name}
                </h3>
                <p className="text-sm text-gray-500">{v.profiles?.email}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                v.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                v.verification_status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {getStatusLabel(v.verification_status)}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-sm"><span className="font-medium text-gray-700">Type:</span> {v.document_type}</p>
              <p className="text-sm"><span className="font-medium text-gray-700">Date:</span> {new Date(v.created_at).toLocaleDateString('fr-FR')}</p>
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
                    onClick={() => onAction(v.id, 'approved')}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Vérification d'identité</h3>
                <button onClick={() => { setSelectedItem(null); setRejectionReason(''); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {selectedItem.profiles?.first_name} {selectedItem.profiles?.last_name}
                  </h4>
                  <p className="text-sm text-gray-600">{selectedItem.profiles?.email}</p>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <img src={selectedItem.document_url} alt="Document" className="w-full rounded-lg" />
                </div>
                {selectedItem.verification_status === 'pending' && (
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
                        onClick={() => onAction(selectedItem.id, 'approved')}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Approuver</span>
                      </button>
                      <button
                        onClick={() => onAction(selectedItem.id, 'rejected', rejectionReason)}
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
      )}
    </div>
  );
}

function EquipmentsTab({ equipments, statusFilter, setStatusFilter, searchTerm, setSearchTerm, onAction, selectedItem, setSelectedItem, feedback, setFeedback }: any) {
  const filtered = equipments.filter((e: any) =>
    (statusFilter === 'all' || e.moderation_status === statusFilter) &&
    (e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     e.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'all': return 'Tous';
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvés';
      case 'rejected': return 'Rejetés';
      default: return status;
    }
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((e: any) => (
          <div key={e.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 line-clamp-1">{e.title}</h3>
                <p className="text-sm text-gray-500">Par {e.profiles?.first_name} {e.profiles?.last_name}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                e.moderation_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                e.moderation_status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {getStatusLabel(e.moderation_status)}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600 line-clamp-2">{e.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-green-600">{e.daily_price} FCFA/jour</span>
                <span className="text-gray-500">{e.category}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedItem(e)}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm">Voir</span>
              </button>
              {e.moderation_status === 'pending' && (
                <>
                  <button
                    onClick={() => onAction(e.id, 'approved')}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedItem(e)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Détails de l'équipement</h3>
                <button onClick={() => { setSelectedItem(null); setFeedback(''); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg mb-1">{selectedItem.title}</h4>
                  <p className="text-sm text-gray-600">
                    Propriétaire: {selectedItem.profiles?.first_name} {selectedItem.profiles?.last_name}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Prix journalier</p>
                    <p className="text-lg font-bold text-green-600">{selectedItem.daily_price} FCFA</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Caution</p>
                    <p className="text-lg font-bold text-gray-900">{selectedItem.deposit_amount} FCFA</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Catégorie</p>
                    <p className="text-gray-900">{selectedItem.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Localisation</p>
                    <p className="text-gray-900">{selectedItem.city}, {selectedItem.country}</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                  <p className="text-gray-600">{selectedItem.description}</p>
                </div>
                {selectedItem.moderation_status === 'pending' && (
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
                        onClick={() => onAction(selectedItem.id, 'approved', feedback)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Approuver</span>
                      </button>
                      <button
                        onClick={() => onAction(selectedItem.id, 'rejected', feedback)}
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
      )}
    </div>
  );
}

export default App;