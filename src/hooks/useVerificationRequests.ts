import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VerificationRequest {
  id: string;
  entity_id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  service_product_name?: string;
  service_date?: string;
  verification_token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
}

export interface CreateVerificationRequestData {
  entity_id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  service_product_name?: string;
  service_date?: string;
}

export const useVerificationRequests = (entityId: string) => {
  return useQuery({
    queryKey: ['verification-requests', entityId],
    queryFn: async () => {
      // Using direct RPC call until table types are updated
      const { data, error } = await (supabase as any)
        .from('verification_requests')
        .select('*')
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as VerificationRequest[];
    },
  });
};

export const useCreateVerificationRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateVerificationRequestData) => {
      // Generate a unique verification token
      const verification_token = crypto.randomUUID();
      
      // Set expiration to 7 days from now
      const expires_at = new Date();
      expires_at.setDate(expires_at.getDate() + 7);

      const { data: result, error } = await (supabase as any)
        .from('verification_requests')
        .insert({
          ...data,
          verification_token,
          expires_at: expires_at.toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return result as VerificationRequest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['verification-requests', data.entity_id] });
      toast({
        title: 'Success',
        description: 'Verification request sent successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send verification request',
        variant: 'destructive',
      });
    },
  });
};

export const useResendVerificationRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (requestId: string) => {
      // Generate new token and extend expiration
      const verification_token = crypto.randomUUID();
      const expires_at = new Date();
      expires_at.setDate(expires_at.getDate() + 7);

      const { data, error } = await (supabase as any)
        .from('verification_requests')
        .update({
          verification_token,
          expires_at: expires_at.toISOString(),
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data as VerificationRequest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['verification-requests', data.entity_id] });
      toast({
        title: 'Success',
        description: 'Verification request resent successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resend verification request',
        variant: 'destructive',
      });
    },
  });
};

export const generateVerificationLink = (token: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/verify-client/${token}`;
};