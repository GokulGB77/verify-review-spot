
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

// Use the Entity type from useEntities
export type Business = Tables<'entities'>;

export const useBusinesses = () => {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Business[];
    },
  });
};

export const useBusiness = (id: string) => {
  return useQuery({
    queryKey: ['business', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('entity_id', id)
        .eq('status', 'active')
        .single();
      
      if (error) throw error;
      return data as Business;
    },
    enabled: !!id,
  });
};
