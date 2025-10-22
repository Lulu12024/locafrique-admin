// admin/src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      try {
        // ✅ Utiliser getSession() au lieu de getUser()
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur session:', error);
          if (isMounted) {
            setUser(null);
            setIsAdmin(false);
            setLoading(false);
          }
          return;
        }

        if (session?.user && isMounted) {
          setUser(session.user);
          await checkAdminStatus(session.user.id);
        } else if (isMounted) {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erreur checkUser:', error);
        if (isMounted) {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    };

    const checkAdminStatus = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('Erreur admin status:', error);
          if (isMounted) {
            setIsAdmin(false);
            setLoading(false);
          }
          return;
        }
        
        if (isMounted) {
          setIsAdmin(data?.is_admin || false);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erreur checkAdminStatus:', error);
        if (isMounted) {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    };

    // Vérifier la session au démarrage
    checkUser();
    
    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth event:', event);
        
        if (!isMounted) return;

        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        } else if (session?.user) {
          setUser(session.user);
          await checkAdminStatus(session.user.id);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // ⚠️ Tableau vide pour éviter boucle infinie

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      return { error };
    } catch (error: any) {
      console.error('Erreur signIn:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Déconnexion en cours...');
      
      // 1. Déconnexion Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erreur signOut:', error);
      }

      // 2. Clear state
      setUser(null);
      setIsAdmin(false);

      // 3. Clear localStorage
      localStorage.clear();
      sessionStorage.clear();

      // 4. Recharger la page pour reset complet
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      
      // Forcer la déconnexion même en cas d'erreur
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  return { user, isAdmin, loading, signIn, signOut };
}