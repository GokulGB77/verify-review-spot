
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

export type Review = Tables<'reviews'> & {
  profiles?: {
    username: string | null;
    full_name: string | null;
  } | null;
};

export const useReviews = (businessId?: string) => {
  return useQuery({
    queryKey: ['reviews', businessId],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select('*')
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

export const useUserReviewForBusiness = (businessId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-review', user?.id, businessId],
    queryFn: async () => {
      if (!user?.id || !businessId) return null;
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)
        .eq('business_id', businessId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!businessId,
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
      proof_url?: string;
    }) => {
      if (!user?.id) throw new Error('User must be authenticated');
      
      // First check if user already has a review for this business
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('business_id', review.business_id)
        .maybeSingle();
      
      if (existingReview) {
        // Update existing review
        const { data, error } = await supabase
          .from('reviews')
          .update({
            rating: review.rating,
            content: review.content,
            user_badge: review.user_badge || 'Unverified User',
            proof_provided: review.proof_provided || false,
            proof_url: review.proof_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingReview.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new review
        const { data, error } = await supabase
          .from('reviews')
          .insert([{
            ...review,
            user_id: user.id,
            user_badge: review.user_badge || 'Unverified User'
          }])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['user-review'] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['business', data.business_id] });
    },
  });
};
