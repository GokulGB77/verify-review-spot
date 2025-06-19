
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

export type Review = Tables<'reviews'> & {
  profiles?: {
    username: string | null;
    full_name: string | null;
  };
};

export const useReviews = (businessId?: string) => {
  return useQuery({
    queryKey: ['reviews', businessId],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (businessId) {
        query = query.eq('business_id', businessId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Review[];
    },
  });
};

export const useUserReviews = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-reviews', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          businesses (
            name,
            category
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (review: {
      business_id: string;
      rating: number;
      content: string;
      user_badge?: string;
      proof_provided?: boolean;
    }) => {
      if (!user?.id) throw new Error('User must be authenticated');
      
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          ...review,
          user_id: user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['business', data.business_id] });
    },
  });
};
