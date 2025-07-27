
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

export const useEntity = (identifier: string, includeInactive = false) => {
  return useQuery({
    queryKey: ['entity', identifier, includeInactive],
    queryFn: async () => {
      // Check if identifier is a UUID or slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      
      let query = supabase
        .from('entities')
        .select('*');
      
      // Use entity_id for UUID, slug for slug
      if (isUUID) {
        query = query.eq('entity_id', identifier);
      } else {
        query = query.eq('slug', identifier);
      }
      
      // Only filter by active status if not including inactive entities
      if (!includeInactive) {
        query = query.eq('status', 'active');
      }
      
      const { data, error } = await query.single();
      
      if (error) throw error;
      return data as Entity;
    },
    enabled: !!identifier,
  });
};

// Keep the old hook names for backward compatibility
export const useBusinesses = useEntities;
export const useBusiness = useEntity;
export type Business = Entity;
