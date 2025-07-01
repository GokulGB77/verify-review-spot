
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserBusinessConnection {
  id: string;
  user_id: string;
  business_id: string;
  connection_type: 'Verified Employee' | 'Verified Student';
  approved_at: string;
  approved_by: string | null;
  created_at: string;
}

export const useUserBusinessConnection = (businessId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-business-connection', user?.id, businessId],
    queryFn: async () => {
      if (!user?.id || !businessId) return null;
      
      const { data, error } = await supabase
        .from('user_business_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('business_id', businessId)
        .maybeSingle();
      
      if (error) throw error;
      return data as UserBusinessConnection | null;
    },
    enabled: !!user?.id && !!businessId,
  });
};

export const useCreateUserBusinessConnection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (connectionData: {
      user_id: string;
      business_id: string;
      connection_type: 'Verified Employee' | 'Verified Student';
      approved_by: string;
    }) => {
      const { data, error } = await supabase
        .from('user_business_connections')
        .insert([connectionData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-business-connection'] });
    },
  });
};
