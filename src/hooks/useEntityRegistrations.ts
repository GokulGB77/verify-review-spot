
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EntityRegistrationData {
  entityName: string;
  category: string;
  website: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  registrationNumber: string;
  taxId: string;
  ownerName: string;
  ownerEmail: string;
}

export interface EntityRegistration {
  id: string;
  entity_name: string;
  category: string;
  website: string | null;
  description: string | null;
  contact_email: string;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  registration_number: string | null;
  tax_id: string | null;
  owner_name: string | null;
  owner_email: string | null;
  status: string;
  rejection_reason: string | null;
  submitted_by: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useEntityRegistrations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<EntityRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, [user]);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('entity_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitRegistration = async (formData: EntityRegistrationData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a registration.",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      const { error } = await supabase
        .from('entity_registrations')
        .insert({
          entity_name: formData.entityName,
          category: formData.category,
          website: formData.website || null,
          description: formData.description || null,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone || null,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          zip_code: formData.zipCode || null,
          registration_number: formData.registrationNumber || null,
          tax_id: formData.taxId || null,
          owner_name: formData.ownerName || null,
          owner_email: formData.ownerEmail || null,
          submitted_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Registration Submitted",
        description: "Your entity registration has been submitted for review. We'll contact you within 2-3 business days.",
      });

      await fetchRegistrations();
      return { success: true };
    } catch (error) {
      console.error('Error submitting registration:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your registration. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const updateRegistrationStatus = async (
    registrationId: string, 
    status: 'approved' | 'rejected', 
    rejectionReason?: string
  ) => {
    if (!user) return { success: false };

    try {
      const updateData: any = {
        status,
        reviewed_by: user.id,
        updated_at: new Date().toISOString(),
      };

      if (status === 'rejected' && rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from('entity_registrations')
        .update(updateData)
        .eq('id', registrationId);

      if (error) throw error;

      // If approved, create the business entity
      if (status === 'approved') {
        const registration = registrations.find(r => r.id === registrationId);
        if (registration) {
          const { error: businessError } = await supabase
            .from('businesses')
            .insert({
              name: registration.entity_name,
              category: registration.category,
              website: registration.website,
              description: registration.description,
              email: registration.contact_email,
              phone: registration.contact_phone,
              location: [registration.address, registration.city, registration.state, registration.zip_code]
                .filter(Boolean)
                .join(', ') || null,
              verification_status: 'Verified',
            });

          if (businessError) throw businessError;
        }
      }

      toast({
        title: `Registration ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        description: status === 'approved' 
          ? "The entity has been approved and added to the directory."
          : "The registration has been rejected.",
      });

      await fetchRegistrations();
      return { success: true };
    } catch (error) {
      console.error('Error updating registration:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the registration status.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  return {
    registrations,
    loading,
    submitRegistration,
    updateRegistrationStatus,
    refetch: fetchRegistrations,
  };
};
