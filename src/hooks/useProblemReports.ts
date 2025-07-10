import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export type ProblemReport = Tables<'problem_reports'>;

export interface CreateProblemReportData {
  title: string;
  description: string;
  category: string;
  priority?: string;
  contact_email?: string;
}

export const useProblemReports = () => {
  return useQuery({
    queryKey: ['problem-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('problem_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProblemReport[];
    },
  });
};

export const useUserProblemReports = () => {
  return useQuery({
    queryKey: ['user-problem-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('problem_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProblemReport[];
    },
  });
};

export const useCreateProblemReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (reportData: CreateProblemReportData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('problem_reports')
        .insert({
          ...reportData,
          user_id: user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problem-reports'] });
      queryClient.invalidateQueries({ queryKey: ['user-problem-reports'] });
      toast({
        title: "Report submitted successfully",
        description: "We'll review your report and get back to you soon.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting report",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateProblemReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProblemReport> & { id: string }) => {
      const { data, error } = await supabase
        .from('problem_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problem-reports'] });
      toast({
        title: "Report updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating report",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};