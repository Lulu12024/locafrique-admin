// // src/pages/AdminDashboard.tsx
// import React, { useState } from 'react';
// import { Sidebar } from '@/components/Sidebar';
// import DashboardStats from '@/components/admin/DashboardStats';
// import ContactsManager from '@/components/admin/ContactsManager';
// import PaymentsManager from '@/components/admin/PaymentsManager';
// import UsersManager from '@/components/admin/UsersManager';
// import VerificationsManager from '@/components/admin/VerificationsManager';
// import EquipmentsManager from '@/components/admin/EquipmentsManager';
// import { useAuth } from '@/hooks/auth';
// import { supabase } from '@/integrations/supabase/client';

// export default function AdminDashboard() {
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const { user } = useAuth();

//   const handleSignOut = async () => {
//     await supabase.auth.signOut();
//   };

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'dashboard':
//         return <DashboardStats />;
//       case 'contacts':
//         return <ContactsManager />;
//       case 'payments':
//         return <PaymentsManager />;
//       case 'users':
//         return <UsersManager />;
//       case 'verifications':
//         return <VerificationsManager />;
//       case 'equipments':
//         return <EquipmentsManager />;
//       default:
//         return <DashboardStats />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       <Sidebar
//         activeTab={activeTab}
//         setActiveTab={setActiveTab}
//         isMobileMenuOpen={isMobileMenuOpen}
//         setIsMobileMenuOpen={setIsMobileMenuOpen}
//         userEmail={user?.email}
//         onSignOut={handleSignOut}
//       />

//       {/* Main Content */}
//       <main className="flex-1 lg:ml-64 p-6">
//         <div className="max-w-7xl mx-auto">
//           {renderContent()}
//         </div>
//       </main>
//     </div>
//   );
// }