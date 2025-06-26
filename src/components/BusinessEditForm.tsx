
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Business } from '@/hooks/useBusinesses';

interface BusinessEditFormProps {
  business: Business;
  onCancel: () => void;
  onSuccess: () => void;
}

const BusinessEditForm = ({ business, onCancel, onSuccess }: BusinessEditFormProps) => {
  const [formData, setFormData] = useState({
    name: business.name,
    category: business.category,
    description: business.description || '',
    location: business.location || '',
    website: business.website || '',
    phone: business.phone || '',
    email: business.email || '',
    founded_year: business.founded_year || '',
    employee_count: business.employee_count || '',
    verification_status: business.verification_status || 'Unverified',
    status: business.status || 'active'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateBusiness = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('businesses')
        .update({
          name: data.name,
          category: data.category,
          description: data.description || null,
          location: data.location || null,
          website: data.website || null,
          phone: data.phone || null,
          email: data.email || null,
          founded_year: data.founded_year ? parseInt(data.founded_year.toString()) : null,
          employee_count: data.employee_count || null,
          verification_status: data.verification_status,
          status: data.status
        })
        .eq('id', business.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast({
        title: "Business updated",
        description: "The business has been successfully updated.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update business. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusiness.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Business Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="founded_year">Founded Year</Label>
          <Input
            id="founded_year"
            type="number"
            value={formData.founded_year}
            onChange={(e) => handleInputChange('founded_year', e.target.value)}
            min="1800"
            max={new Date().getFullYear()}
          />
        </div>
        <div>
          <Label htmlFor="employee_count">Employee Count</Label>
          <Input
            id="employee_count"
            value={formData.employee_count}
            onChange={(e) => handleInputChange('employee_count', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="verification_status">Verification Status</Label>
          <Select value={formData.verification_status} onValueChange={(value) => handleInputChange('verification_status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Verified">Verified</SelectItem>
              <SelectItem value="Unverified">Unverified</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={updateBusiness.isPending}>
          {updateBusiness.isPending ? 'Updating...' : 'Update Business'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default BusinessEditForm;
