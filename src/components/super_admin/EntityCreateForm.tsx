
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface EntityCreateFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const EntityCreateForm = ({ onCancel, onSuccess }: EntityCreateFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    legal_name: '',
    entity_type: 'business',
    description: '',
    industry: '',
    sub_industry: '',
    founded_year: '',
    number_of_employees: '',
    revenue_range: '',
    tagline: '',
    is_verified: false,
    trust_level: 'basic',
    status: 'active',
    // Contact info
    website: '',
    email: '',
    phone: '',
    // Location info
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    // Additional fields
    logo_url: '',
    cover_image_url: '',
    founders: '',
    category_tags: '',
    keywords: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createEntity = useMutation({
    mutationFn: async (data: typeof formData) => {
      const foundersArray = data.founders ? data.founders.split(',').map(f => f.trim()).filter(f => f) : [];
      const categoryTagsArray = data.category_tags ? data.category_tags.split(',').map(t => t.trim()).filter(t => t) : [];
      const keywordsArray = data.keywords ? data.keywords.split(',').map(k => k.trim()).filter(k => k) : [];

      const { error } = await supabase
        .from('entities')
        .insert({
          name: data.name,
          legal_name: data.legal_name || null,
          entity_type: data.entity_type as any,
          description: data.description || null,
          industry: data.industry || null,
          sub_industry: data.sub_industry || null,
          founded_year: data.founded_year ? parseInt(data.founded_year.toString()) : null,
          number_of_employees: data.number_of_employees || null,
          revenue_range: data.revenue_range || null,
          tagline: data.tagline || null,
          is_verified: data.is_verified,
          trust_level: data.trust_level as any,
          status: data.status,
          logo_url: data.logo_url || null,
          cover_image_url: data.cover_image_url || null,
          founders: foundersArray.length > 0 ? foundersArray : null,
          category_tags: categoryTagsArray.length > 0 ? categoryTagsArray : null,
          keywords: keywordsArray.length > 0 ? keywordsArray : null,
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
          }
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      toast({
        title: "Entity created",
        description: "The entity has been successfully created.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create entity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEntity.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Create New Entity</CardTitle>
          <CardDescription>Add a new entity to the platform with all relevant details</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
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
                <Label htmlFor="sub_industry">Sub Industry</Label>
                <Input
                  id="sub_industry"
                  value={formData.sub_industry}
                  onChange={(e) => handleInputChange('sub_industry', e.target.value)}
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
                  placeholder="e.g., 10-50, 100+, etc."
                />
              </div>
              <div>
                <Label htmlFor="revenue_range">Revenue Range</Label>
                <Input
                  id="revenue_range"
                  value={formData.revenue_range}
                  onChange={(e) => handleInputChange('revenue_range', e.target.value)}
                  placeholder="e.g., $1M-$5M, $10M+, etc."
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) => handleInputChange('tagline', e.target.value)}
                placeholder="Brief tagline for the entity"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                placeholder="Detailed description of the entity"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1-234-567-8900"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contact@example.com"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pin Code</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={2}
                placeholder="Full address"
              />
            </div>
          </div>

          {/* Media & Additional Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Media & Additional Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) => handleInputChange('logo_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <Label htmlFor="cover_image_url">Cover Image URL</Label>
                <Input
                  id="cover_image_url"
                  value={formData.cover_image_url}
                  onChange={(e) => handleInputChange('cover_image_url', e.target.value)}
                  placeholder="https://example.com/cover.jpg"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="founders">Founders (comma-separated)</Label>
              <Input
                id="founders"
                value={formData.founders}
                onChange={(e) => handleInputChange('founders', e.target.value)}
                placeholder="John Doe, Jane Smith"
              />
            </div>
            
            <div>
              <Label htmlFor="category_tags">Category Tags (comma-separated)</Label>
              <Input
                id="category_tags"
                value={formData.category_tags}
                onChange={(e) => handleInputChange('category_tags', e.target.value)}
                placeholder="technology, software, web development"
              />
            </div>
            
            <div>
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                placeholder="software, development, consulting"
              />
            </div>
          </div>

          {/* Status & Verification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status & Verification</h3>
            <div className="grid grid-cols-3 gap-4">
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
                <Label htmlFor="trust_level">Trust Level</Label>
                <Select value={formData.trust_level} onValueChange={(value) => handleInputChange('trust_level', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
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
          </div>

          <div className="flex gap-4 pt-6">
            <Button type="submit" disabled={createEntity.isPending}>
              {createEntity.isPending ? 'Creating...' : 'Create Entity'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EntityCreateForm;
