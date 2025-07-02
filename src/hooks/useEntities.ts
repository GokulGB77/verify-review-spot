
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Entity = Tables<'entities'>;

export const useEntities = () => {
  return useQuery({
    queryKey: ['entities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Entity[];
    },
  });
};

export const useEntity = (id: string) => {
  return useQuery({
    queryKey: ['entity', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('entity_id', id)
        .eq('status', 'active')
        .single();
      
      if (error) throw error;
      return data as Entity;
    },
    enabled: !!id,
  });
};

// Keep the old hook names for backward compatibility
export const useBusinesses = useEntities;
export const useBusiness = useEntity;
export type Business = Entity;
