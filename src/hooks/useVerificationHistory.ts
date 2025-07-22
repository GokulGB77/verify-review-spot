import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VerificationHistoryEntry {
  id: string;
  user_id: string;
  attempt_number: number;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  pan_number: string | null;
  full_name_pan: string | null;
  mobile: string | null;
  pan_image_url: string | null;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useVerificationHistory = (userId?: string) => {
  return useQuery({
    queryKey: ['verification-history', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('verification_history')
        .select('*')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data as VerificationHistoryEntry[];
    },
    enabled: !!userId,
  });
};

export const useUserVerificationStats = (userId?: string) => {
  return useQuery({
    queryKey: ['verification-stats', userId],
    queryFn: async () => {
      if (!userId) return { totalAttempts: 0, rejectedAttempts: 0, approvedAttempts: 0 };
      
      const { data, error } = await supabase
        .from('verification_history')
        .select('status')
        .eq('user_id', userId);

      if (error) throw error;
      
      const totalAttempts = data.length;
      const rejectedAttempts = data.filter(entry => entry.status === 'rejected').length;
      const approvedAttempts = data.filter(entry => entry.status === 'approved').length;
      
      return { totalAttempts, rejectedAttempts, approvedAttempts };
    },
    enabled: !!userId,
  });
};