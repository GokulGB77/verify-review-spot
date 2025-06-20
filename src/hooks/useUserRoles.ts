
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'super_admin' | 'entity_admin' | 'user';

interface UserRoleData {
  role: UserRole;
  entity_id: string | null;
}

export const useUserRoles = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRoleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('get_user_roles', { check_user_id: user.id });

        if (error) {
          console.error('Error fetching user roles:', error);
          setRoles([]);
        } else {
          setRoles(data || []);
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [user]);

  const hasRole = (role: UserRole, entityId?: string): boolean => {
    return roles.some(userRole => {
      if (userRole.role !== role) return false;
      if (entityId && userRole.entity_id !== entityId) return false;
      return true;
    });
  };

  const isSuperAdmin = (): boolean => hasRole('super_admin');
  const isEntityAdmin = (entityId?: string): boolean => hasRole('entity_admin', entityId);
  const isUser = (): boolean => hasRole('user');

  const assignRole = async (userId: string, role: UserRole, entityId?: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
          entity_id: entityId || null,
          assigned_by: user?.id
        });

      if (error) throw error;
      
      // Refresh roles if assigning to current user
      if (userId === user?.id) {
        const { data } = await supabase
          .rpc('get_user_roles', { check_user_id: user.id });
        setRoles(data || []);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error assigning role:', error);
      return { success: false, error };
    }
  };

  return {
    roles,
    loading,
    hasRole,
    isSuperAdmin,
    isEntityAdmin,
    isUser,
    assignRole
  };
};
