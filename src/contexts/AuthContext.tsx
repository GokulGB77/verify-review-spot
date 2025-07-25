
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import PseudonymModal from '@/components/PseudonymModal';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogleCredential: (id_token: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPseudonymModal, setShowPseudonymModal] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<User | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle Google sign-in pseudonym requirement with setTimeout to avoid deadlock
        if (event === 'SIGNED_IN' && session?.user) {
          const isGoogleProvider = session.user.app_metadata?.provider === 'google';
          
          if (isGoogleProvider) {
            // Defer the profile check to avoid blocking the auth state change
            setTimeout(async () => {
              try {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('pseudonym, pseudonym_set')
                  .eq('id', session.user.id)
                  .single();

                if (!profile?.pseudonym_set) {
                  setPendingGoogleUser(session.user);
                  setShowPseudonymModal(true);
                }
              } catch (error) {
                console.error('Error checking profile:', error);
              }
            }, 0);
          }
        }

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          setShowPseudonymModal(false);
          setPendingGoogleUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  

  const signInWithGoogleCredential = async (id_token: string) => {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: id_token,
    });
    return { error };
  };

  const signOut = async () => {
    console.log('Signing out...');
    
    // Clear local state immediately
    setUser(null);
    setSession(null);
    setShowPseudonymModal(false);
    setPendingGoogleUser(null);
    
    // Clear any localStorage data manually since we're not using Supabase auth
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('Sign out successful');
  };

  const handlePseudonymComplete = () => {
    setShowPseudonymModal(false);
    setPendingGoogleUser(null);
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogleCredential,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showPseudonymModal && pendingGoogleUser && (
        <PseudonymModal
          open={showPseudonymModal}
          user={pendingGoogleUser}
          onComplete={handlePseudonymComplete}
        />
      )}
    </AuthContext.Provider>
  );
};
