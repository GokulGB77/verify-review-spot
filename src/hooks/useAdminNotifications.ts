import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminNotification {
  type: 'entity_addition_request' | 'pending_review_verification' | 'pending_pan_verification' | 'entity_registration';
  count: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export const useAdminNotifications = () => {
  return useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async (): Promise<AdminNotification[]> => {
      const notifications: AdminNotification[] = [];

      // Get pending entity addition requests
      const { data: entityRequests, error: entityRequestsError } = await supabase
        .from('entity_addition_requests')
        .select('id')
        .eq('status', 'pending');

      if (entityRequestsError) {
        console.error('Error fetching entity requests:', entityRequestsError);
      } else if (entityRequests && entityRequests.length > 0) {
        notifications.push({
          type: 'entity_addition_request',
          count: entityRequests.length,
          title: 'Entity Addition Requests',
          description: `${entityRequests.length} pending entity addition request${entityRequests.length > 1 ? 's' : ''}`,
          priority: 'medium'
        });
      }

      // Get pending review verifications (reviews with proof that need verification)
      const { data: pendingReviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('id')
        .eq('is_proof_submitted', true)
        .is('proof_verified', null);

      if (reviewsError) {
        console.error('Error fetching pending reviews:', reviewsError);
      } else if (pendingReviews && pendingReviews.length > 0) {
        notifications.push({
          type: 'pending_review_verification',
          count: pendingReviews.length,
          title: 'Review Verifications',
          description: `${pendingReviews.length} review${pendingReviews.length > 1 ? 's' : ''} pending verification`,
          priority: 'high'
        });
      }

      // Get pending PAN verifications
      const { data: pendingPanVerifications, error: panError } = await supabase
        .from('profiles')
        .select('id')
        .not('pan_number', 'is', null)
        .not('full_name_pan', 'is', null)
        .not('mobile', 'is', null)
        .eq('is_verified', false)
        .is('rejection_reason', null);

      if (panError) {
        console.error('Error fetching pending PAN verifications:', panError);
      } else if (pendingPanVerifications && pendingPanVerifications.length > 0) {
        notifications.push({
          type: 'pending_pan_verification',
          count: pendingPanVerifications.length,
          title: 'PAN Verifications',
          description: `${pendingPanVerifications.length} PAN verification${pendingPanVerifications.length > 1 ? 's' : ''} pending`,
          priority: 'high'
        });
      }

      // Get pending entity registrations
      const { data: entityRegistrations, error: registrationError } = await supabase
        .from('entity_registrations')
        .select('id')
        .eq('status', 'pending');

      if (registrationError) {
        console.error('Error fetching entity registrations:', registrationError);
      } else if (entityRegistrations && entityRegistrations.length > 0) {
        notifications.push({
          type: 'entity_registration',
          count: entityRegistrations.length,
          title: 'Entity Registrations',
          description: `${entityRegistrations.length} entity registration${entityRegistrations.length > 1 ? 's' : ''} pending approval`,
          priority: 'medium'
        });
      }

      // Sort by priority (high first, then medium, then low)
      const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
      return notifications.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useTotalAdminNotifications = () => {
  const { data: notifications = [] } = useAdminNotifications();
  return notifications.reduce((total, notification) => total + notification.count, 0);
};