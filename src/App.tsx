import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { UsersPage } from './pages/UsersPage';
import { VerificationsPage } from './pages/VerificationsPage';
import { EquipmentsPage } from './pages/EquipmentsPage';

const navigation = [
  { id: 'dashboard', name: 'Tableau de bord', description: 'Vue d\'ensemble de la plateforme' },
  { id: 'users', name: 'Utilisateurs', description: 'Gérer les utilisateurs de la plateforme' },
  { id: 'verifications', name: 'Vérifications', description: 'Vérifier les identités des utilisateurs' },
  { id: 'equipments', name: 'Équipements', description: 'Modérer les équipements publiés' }
];

function App() {
  const { user, isAdmin, loading: authLoading, signIn, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
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

  const currentNav = navigation.find(n => n.id === activeTab);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        userEmail={user.email}
        onSignOut={signOut}
      />

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className="flex-1 lg:ml-64 overflow-auto">
        <Header
          title={currentNav?.name || ''}
          description={currentNav?.description || ''}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />

        <div className="p-4 lg:p-8">
          {activeTab === 'dashboard' && <Dashboard onTabChange={setActiveTab} />}
          {activeTab === 'users' && <UsersPage />}
          {activeTab === 'verifications' && <VerificationsPage />}
          {activeTab === 'equipments' && <EquipmentsPage />}
        </div>
      </main>
    </div>
  );
}

export default App;