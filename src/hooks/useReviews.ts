import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

export type Review = Tables<'reviews'> & {
  profiles?: {
    username: string | null;
    full_name: string | null;
    pseudonym: string | null;
    display_name_preference: string | null;
    main_badge: string | null;
  } | null;
};

export const useReviews = (businessId?: string, includeEntity?: boolean) => {
  return useQuery({
    queryKey: ['reviews', businessId, includeEntity],
    queryFn: async () => {
      // If we need entity data and not filtering by business, use a join
      if (includeEntity && !businessId) {
        const { data: reviews, error } = await supabase
          .from('reviews')
          .select(`
            *, 
            updated_at, 
            created_at,
            entities!inner (
              entity_id,
              name,
              industry,
              location
            )
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (!reviews) return [];
        
        // Transform the data to flatten entity info
        const reviewsWithEntities = reviews.map(review => ({
          ...review,
          entity: review.entities
        }));
        
        // Get profile information for each review
        const reviewsWithProfiles = await Promise.all(
          reviewsWithEntities.map(async (review) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, pseudonym, display_name_preference, main_badge')
              .eq('id', review.user_id)
              .maybeSingle();
            
            return {
              ...review,
              profiles: profile ? {
                username: null,
                full_name: profile.full_name,
                pseudonym: profile.pseudonym,
                display_name_preference: profile.display_name_preference,
                main_badge: profile.main_badge,
              } : null
            };
          })
        );
        
        return reviewsWithProfiles as (Review & { entity: any })[];
      }
      
      // Original logic for other cases
      let query = supabase
        .from('reviews')
        .select('*, updated_at, created_at')
        .order('created_at', { ascending: false });

      if (businessId) {
        query = query.eq('business_id', businessId);
      }

      const { data: reviews, error } = await query;
      
      if (error) throw error;
      if (!reviews) return [];
      
      // Then get the profile information for each review
      const reviewsWithProfiles = await Promise.all(
        reviews.map(async (review) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, pseudonym, display_name_preference, main_badge')
            .eq('id', review.user_id)
            .maybeSingle();
          
          return {
            ...review,
            profiles: profile ? {
              username: null,
              full_name: profile.full_name,
              pseudonym: profile.pseudonym,
              display_name_preference: profile.display_name_preference,
              main_badge: profile.main_badge,
            } : null
          };
        })
      );
      
      return reviewsWithProfiles as Review[];
    },
  });
};

export const useReview = (reviewId: string) => {
  return useQuery({
    queryKey: ['review', reviewId],
    queryFn: async () => {
      if (!reviewId) return null;
      
      const { data: review, error } = await supabase
        .from('reviews')
        .select('*, updated_at, created_at')
        .eq('id', reviewId)
        .maybeSingle();
      
      if (error) throw error;
      return review;
    },
    enabled: !!reviewId,
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
          entities!inner (
            name,
            industry
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
    mutationFn: async (reviewData: {
      business_id: string;
      rating: number;
      content: string;
      user_badge?: string;
      review_specific_badge?: string;
      proof_url?: string;
      is_update?: boolean;
      is_proof_submitted?: boolean;
      is_verified?: boolean;
      custom_verification_tag?: string;
    }) => {
      if (!user?.id) throw new Error('User must be authenticated');
      
      // Check if user already has an original review for this business
      const { data: existingOriginalReview } = await supabase
        .from('reviews')
        .select('id, update_number')
        .eq('user_id', user.id)
        .eq('business_id', reviewData.business_id)
        .is('parent_review_id', null)
        .maybeSingle();
      
      if (existingOriginalReview && !reviewData.is_update) {
        throw new Error('You already have a review for this business. You can only add updates.');
      }
      
      if (reviewData.is_update && !existingOriginalReview) {
        throw new Error('Cannot create an update without an original review.');
      }
      
      if (reviewData.is_update && existingOriginalReview) {
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
            business_id: reviewData.business_id,
            rating: reviewData.rating,
            content: reviewData.content,
            user_id: user.id,
            parent_review_id: existingOriginalReview.id,
            is_update: true,
            update_number: nextUpdateNumber,
            proof_url: reviewData.proof_url || null,
            is_proof_submitted: reviewData.is_proof_submitted || false,
            is_verified: reviewData.is_verified || false,
            custom_verification_tag: reviewData.custom_verification_tag || null
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
            business_id: reviewData.business_id,
            rating: reviewData.rating,
            content: reviewData.content,
            user_id: user.id,
            parent_review_id: null,
            is_update: false,
            update_number: 0,
            proof_url: reviewData.proof_url || null,
            is_proof_submitted: reviewData.is_proof_submitted || false,
            is_verified: reviewData.is_verified || false,
            custom_verification_tag: reviewData.custom_verification_tag || null
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
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      queryClient.invalidateQueries({ queryKey: ['entity', data.business_id] });
    },
  });
};
