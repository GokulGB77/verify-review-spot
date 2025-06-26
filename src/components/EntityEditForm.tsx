
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Entity } from '@/hooks/useEntities';

interface EntityEditFormProps {
  entity: Entity;
  onCancel: () => void;
  onSuccess: () => void;
}

const EntityEditForm = ({ entity, onCancel, onSuccess }: EntityEditFormProps) => {
  // Extract data from JSONB fields with proper type checking
  const contactData = (entity.contact as any) || {};
  const locationData = (entity.location as any) || {};
  
  const [formData, setFormData] = useState({
    name: entity.name,
    legal_name: entity.legal_name || '',
    entity_type: entity.entity_type,
    description: entity.description || '',
    industry: entity.industry || '',
    sub_industry: entity.sub_industry || '',
    founded_year: entity.founded_year || '',
    number_of_employees: entity.number_of_employees || '',
    tagline: entity.tagline || '',
    is_verified: entity.is_verified || false,
    trust_level: entity.trust_level || 'basic',
    status: entity.status || 'active',
    // Contact info
    website: contactData.website || '',
    email: contactData.email || '',
    phone: contactData.phone || '',
    // Location info
    address: locationData.address || '',
    city: locationData.city || '',
    state: locationData.state || '',
    country: locationData.country || '',
    pincode: locationData.pincode || ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateEntity = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('entities')
        .update({
          name: data.name,
          legal_name: data.legal_name || null,
          entity_type: data.entity_type,
          description: data.description || null,
          industry: data.industry || null,
          sub_industry: data.sub_industry || null,
          founded_year: data.founded_year ? parseInt(data.founded_year.toString()) : null,
          number_of_employees: data.number_of_employees || null,
          tagline: data.tagline || null,
          is_verified: data.is_verified,
          trust_level: data.trust_level,
          status: data.status,
          contact: {
            website: data.website || '',
            email: data.email || '',
            phone: data.phone || ''
          },
          location: {
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            country: data.country || '',
            pincode: data.pincode || ''
          },
          updated_at: new Date().toISOString()
        })
        .eq('entity_id', entity.entity_id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      toast({
        title: "Entity updated",
        description: "The entity has been successfully updated.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update entity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEntity.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Entity Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="legal_name">Legal Name</Label>
          <Input
            id="legal_name"
            value={formData.legal_name}
            onChange={(e) => handleInputChange('legal_name', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="entity_type">Entity Type *</Label>
          <Select value={formData.entity_type} onValueChange={(value) => handleInputChange('entity_type', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="movie_theatre">Movie Theatre</SelectItem>
              <SelectItem value="institution">Institution</SelectItem>
              <SelectItem value="learning_platform">Learning Platform</SelectItem>
              <SelectItem value="ecommerce">E-commerce</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            value={formData.industry}
            onChange={(e) => handleInputChange('industry', e.target.value)}
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
          <Label htmlFor="number_of_employees">Employee Count</Label>
          <Input
            id="number_of_employees"
            value={formData.number_of_employees}
            onChange={(e) => handleInputChange('number_of_employees', e.target.value)}
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
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="is_verified">Verification Status</Label>
          <Select value={formData.is_verified.toString()} onValueChange={(value) => handleInputChange('is_verified', value === 'true')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Verified</SelectItem>
              <SelectItem value="false">Unverified</SelectItem>
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
        <Label htmlFor="tagline">Tagline</Label>
        <Input
          id="tagline"
          value={formData.tagline}
          onChange={(e) => handleInputChange('tagline', e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          rows={2}
        />
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
        <Button type="submit" disabled={updateEntity.isPending}>
          {updateEntity.isPending ? 'Updating...' : 'Update Entity'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default EntityEditForm;
