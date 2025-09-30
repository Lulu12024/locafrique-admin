import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, Package, CheckCircle, XCircle, 
  Clock, Search, Eye, AlertCircle, TrendingUp, Loader2, Home, Menu, LogOut, X
} from 'lucide-react';

// Simuler Supabase pour la démo (vous remplacerez par le vrai import)
const supabase = {
  auth: {
    getUser: async () => ({ data: { user: { id: '1', email: 'admin@3wloc.com' } } }),
    signInWithPassword: async ({ email, password }: any) => {
      if (email === 'admin@3wloc.com' && password === 'admin123') {
        return { error: null };
      }
      return { error: { message: 'Identifiants incorrects' } };
    },
    signOut: async () => {},
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: (table: string) => ({
    select: (cols?: string, opts?: any) => ({
      eq: (col: string, val: any) => ({
        single: async () => ({ data: { is_admin: true } }),
        order: (col: string, opts: any) => ({
          then: async () => ({ data: [], count: 0 })
        })
      }),
      order: (col: string, opts: any) => ({ then: async () => ({ data: [] }) }),
      then: async () => ({ data: [], count: Math.floor(Math.random() * 100) })
    }),
    update: (data: any) => ({
      eq: (col: string, val: any) => ({ then: async () => ({ error: null }) })
    })
  })
};

interface Stats {
  totalUsers: number;
  pendingVerifications: number;
  pendingEquipments: number;
  totalEquipments: number;
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data
  const [stats, setStats] = useState<Stats>({
    totalUsers: 156,
    pendingVerifications: 8,
    pendingEquipments: 12,
    totalEquipments: 342
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
      setIsAdmin(data?.is_admin || false);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoginError('');
    setIsLoggingIn(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setLoginError(error.message);
    } else {
      await checkAuth();
    }
    
    setIsLoggingIn(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#C35A38] animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C35A38] via-[#FF8C00] to-[#1A5276] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#C35A38] to-[#FF8C00] rounded-2xl flex items-center justify-center mx-auto mb-4">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C35A38] focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C35A38] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {loginError}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-[#C35A38] to-[#FF8C00] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
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

            <p className="text-xs text-center text-gray-500 mt-4">
              Demo: admin@3wloc.com / admin123
            </p>
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
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#C35A38] to-[#FF8C00] rounded-lg flex items-center justify-center">
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
                      ? 'bg-gradient-to-r from-[#C35A38] to-[#FF8C00] text-white shadow-lg' 
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
              <div className="w-10 h-10 bg-gradient-to-br from-[#1A5276] to-[#2E7D32] rounded-full flex items-center justify-center">
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
              onClick={handleSignOut}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
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
          {activeTab === 'dashboard' && <Dashboard stats={stats} />}
          {activeTab === 'users' && <UsersTab searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
          {activeTab === 'verifications' && <VerificationsTab statusFilter={statusFilter} setStatusFilter={setStatusFilter} />}
          {activeTab === 'equipments' && <EquipmentsTab searchTerm={searchTerm} setSearchTerm={setSearchTerm} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ stats }: { stats: Stats }) {
  const cards = [
    { title: 'Utilisateurs totaux', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-blue-600', trend: '+12%' },
    { title: 'Vérifications en attente', value: stats.pendingVerifications, icon: Clock, color: 'from-yellow-500 to-orange-500', urgent: true },
    { title: 'Équipements en attente', value: stats.pendingEquipments, icon: AlertCircle, color: 'from-red-500 to-pink-500', urgent: true },
    { title: 'Équipements totaux', value: stats.totalEquipments, icon: Package, color: 'from-green-500 to-emerald-600', trend: '+8%' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
                {card.trend && (
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>{card.trend}</span>
                  </div>
                )}
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

function UsersTab({ searchTerm, setSearchTerm }: any) {
  const users = [
    { id: '1', first_name: 'Jean', last_name: 'Dupont', email: 'jean@example.com', phone: '+229 97 00 00 00', city: 'Cotonou', country: 'Bénin', is_verified: true, created_at: '2024-01-15' },
    { id: '2', first_name: 'Marie', last_name: 'Kouassi', email: 'marie@example.com', phone: '+229 96 00 00 00', city: 'Porto-Novo', country: 'Bénin', is_verified: false, created_at: '2024-02-20' },
  ];

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
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C35A38] focus:border-transparent"
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
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#C35A38] to-[#FF8C00] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">{user.first_name[0]}{user.last_name[0]}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.city}</div>
                    <div className="text-sm text-gray-500">{user.country}</div>
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

function VerificationsTab({ statusFilter, setStatusFilter }: any) {
  const verifications = [
    { id: '1', user: 'Jean Dupont', email: 'jean@example.com', type: 'CNI', status: 'pending', date: '2024-03-15' },
    { id: '2', user: 'Marie Kouassi', email: 'marie@example.com', type: 'Passeport', status: 'approved', date: '2024-03-10' },
  ];

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
                  ? 'bg-gradient-to-r from-[#C35A38] to-[#FF8C00] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Tous' : status === 'pending' ? 'En attente' : status === 'approved' ? 'Approuvés' : 'Rejetés'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {verifications.map((v) => (
          <div key={v.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{v.user}</h3>
                <p className="text-sm text-gray-500">{v.email}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                v.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                v.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {v.status === 'pending' ? 'En attente' : v.status === 'approved' ? 'Approuvé' : 'Rejeté'}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-sm"><span className="font-medium text-gray-700">Type:</span> {v.type}</p>
              <p className="text-sm"><span className="font-medium text-gray-700">Date:</span> {v.date}</p>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <Eye className="w-4 h-4" />
                <span className="text-sm">Voir</span>
              </button>
              {v.status === 'pending' && (
                <>
                  <button className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EquipmentsTab({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }: any) {
  const equipments = [
    { id: '1', title: 'Pelleteuse CAT 320', owner: 'Jean Dupont', description: 'Pelleteuse en excellent état', price: 50000, category: 'Construction', status: 'pending' },
    { id: '2', title: 'Tracteur John Deere', owner: 'Marie Kouassi', description: 'Tracteur agricole récent', price: 75000, category: 'Agriculture', status: 'approved' },
  ];

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
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C35A38] focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === status
                  ? 'bg-gradient-to-r from-[#C35A38] to-[#FF8C00] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Tous' : status === 'pending' ? 'En attente' : status === 'approved' ? 'Approuvés' : 'Rejetés'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipments.map((e) => (
          <div key={e.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{e.title}</h3>
                <p className="text-sm text-gray-500">Par {e.owner}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                e.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                e.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {e.status === 'pending' ? 'En attente' : e.status === 'approved' ? 'Approuvé' : 'Rejeté'}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">{e.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[#C35A38]">{e.price} FCFA/jour</span>
                <span className="text-gray-500">{e.category}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <Eye className="w-4 h-4" />
                <span className="text-sm">Voir</span>
              </button>
              {e.status === 'pending' && (
                <>
                  <button className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;