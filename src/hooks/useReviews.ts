import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

export type Review = Tables<'reviews'> & {
  profiles?: {
    username?: string | null;
    full_name: string | null;
    pseudonym: string | null;
    display_name_preference: string | null;
    main_badge: string | null;
  } | null;
};

export const useReviews = (businessId?: string) => {
  return useQuery({
    queryKey: ['reviews', businessId],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          profiles (
            full_name,
            pseudonym,
            display_name_preference,
            main_badge
          )
        `)
        .order('created_at', { ascending: false });

      if (businessId) {
        query = query.eq('business_id', businessId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform the data to match our Review type
      return (data || []).map(item => ({
        ...item,
        profiles: item.profiles && typeof item.profiles === 'object' && !('error' in item.profiles) 
          ? item.profiles 
          : null
      })) as Review[];
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

export const useUserOriginalReviewForBusiness = (businessId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-original-review', user?.id, businessId],
    queryFn: async () => {
      if (!user?.id || !businessId) return null;
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)
        .eq('business_id', businessId)
        .is('parent_review_id', null)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!businessId,
  });
};

export const useUserReviewUpdatesForBusiness = (businessId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-review-updates', user?.id, businessId],
    queryFn: async () => {
      if (!user?.id || !businessId) return [];
      
      // First get the original review
      const { data: originalReview, error: originalError } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('business_id', businessId)
        .is('parent_review_id', null)
        .maybeSingle();
      
      if (originalError) throw originalError;
      if (!originalReview) return [];
      
      // Then get all updates for this review
      const { data: updates, error: updatesError } = await supabase
        .from('reviews')
        .select('*')
        .eq('parent_review_id', originalReview.id)
        .order('created_at', { ascending: true });
      
      if (updatesError) throw updatesError;
      return updates || [];
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
      review_specific_badge?: string;
      proof_provided?: boolean;
      proof_url?: string;
      is_update?: boolean;
    }) => {
      if (!user?.id) throw new Error('User must be authenticated');
      
      // Check if user already has an original review for this business
      const { data: existingOriginalReview } = await supabase
        .from('reviews')
        .select('id, update_number')
        .eq('user_id', user.id)
        .eq('business_id', review.business_id)
        .is('parent_review_id', null)
        .maybeSingle();
      
      if (existingOriginalReview && !review.is_update) {
        throw new Error('You already have a review for this business. You can only add updates.');
      }
      
      if (review.is_update && !existingOriginalReview) {
        throw new Error('Cannot create an update without an original review.');
      }
      
      if (review.is_update && existingOriginalReview) {
        // Get the current highest update number for this review chain
        const { data: latestUpdate } = await supabase
          .from('reviews')
          .select('update_number')
          .eq('parent_review_id', existingOriginalReview.id)
          .order('update_number', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        const nextUpdateNumber = (latestUpdate?.update_number || 0) + 1;
        
        // Create update review
        const { data, error } = await supabase
          .from('reviews')
          .insert([{
            ...review,
            user_id: user.id,
            parent_review_id: existingOriginalReview.id,
            is_update: true,
            update_number: nextUpdateNumber,
            user_badge: review.user_badge || 'Unverified User'
          }])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create original review
        const { data, error } = await supabase
          .from('reviews')
          .insert([{
            ...review,
            user_id: user.id,
            parent_review_id: null,
            is_update: false,
            update_number: 0,
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
      queryClient.invalidateQueries({ queryKey: ['user-original-review'] });
      queryClient.invalidateQueries({ queryKey: ['user-review-updates'] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['business', data.business_id] });
    },
  });
};
