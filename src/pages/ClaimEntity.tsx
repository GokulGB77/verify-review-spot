import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinesses } from '@/hooks/useBusinesses';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

export default function ClaimEntity() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: entities, isLoading, error } = useBusinesses();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [claimData, setClaimData] = useState({
    role: '',
    relationship: '',
    contact_email: '',
    contact_phone: '',
    verification_documents: '',
    additional_info: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  // Filter entities based on search term - prioritize entity name
  const filteredEntities = entities?.filter(entity => {
    if (!searchTerm) return false; // Only show results when user is searching
    const searchLower = searchTerm.toLowerCase();
    return entity.name.toLowerCase().includes(searchLower) ||
           entity.description?.toLowerCase().includes(searchLower);
  }) || [];

  // Debug logging
  console.log('=== CLAIM ENTITY DEBUG ===');
  console.log('Search term:', searchTerm);
  console.log('Entities loading:', isLoading);
  console.log('Query error:', error);
  console.log('All entities count:', entities?.length);
  console.log('All entities:', entities);
  console.log('Filtered entities count:', filteredEntities.length);
  console.log('Filtered entities:', filteredEntities);
  console.log('========================');

  const handleEntitySelect = (entity: any) => {
    setSelectedEntity(entity);
    setClaimData(prev => ({
      ...prev,
      contact_email: user?.email || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to claim an entity.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!selectedEntity) {
      toast({
        title: "Entity Required",
        description: "Please select an entity to claim.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a claim request (you might want to create a separate table for this)
      const { error } = await supabase
        .from('entity_registrations')
        .insert({
          entity_name: selectedEntity.name,
          category: selectedEntity.industry || 'Other',
          contact_email: claimData.contact_email,
          contact_phone: claimData.contact_phone,
          description: `Claim request for existing entity. Role: ${claimData.role}. Relationship: ${claimData.relationship}. Additional info: ${claimData.additional_info}`,
          submitted_by: user.id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Claim Submitted",
        description: "Your entity claim has been submitted for review. We'll contact you within 2-3 business days.",
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit claim request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please log in to claim your business entity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/auth')} 
                className="w-full"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Claim Your Business</h1>
            <p className="text-muted-foreground text-lg">
              Are you the owner or authorized representative of a business listed on our platform? 
              Claim your profile to manage reviews and respond to customers.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Entity Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Find Your Business
                </CardTitle>
                <CardDescription>
                  Search for your business in our directory
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="search">Search by business name</Label>
                  <Input
                    id="search"
                    placeholder="Enter business name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {searchTerm && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {isLoading ? (
                      <p className="text-center text-muted-foreground">Searching...</p>
                    ) : filteredEntities.length > 0 ? (
                      filteredEntities.map((entity) => (
                        <div
                          key={entity.entity_id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedEntity?.entity_id === entity.entity_id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => handleEntitySelect(entity)}
                        >
                          <div className="flex items-start gap-3">
                            <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium">{entity.name}</h4>
                              {entity.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {entity.description}
                                </p>
                              )}
                              <div className="flex gap-2 mt-2">
                                {entity.claimed_by_business && (
                                  <Badge variant="secondary">Already Claimed</Badge>
                                )}
                                {entity.industry && (
                                  <Badge variant="outline">{entity.industry}</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground">
                        No businesses found. <br />
                        <Button variant="link" onClick={() => navigate('/register-entity')}>
                          Register a new business
                        </Button>
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Claim Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Claim Details
                </CardTitle>
                <CardDescription>
                  Provide verification information for your claim
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedEntity ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium">{selectedEntity.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedEntity.description}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="role">Your Role</Label>
                      <Select
                        onValueChange={(value) => setClaimData(prev => ({ ...prev, role: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Business Owner</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="authorized_representative">Authorized Representative</SelectItem>
                          <SelectItem value="marketing_team">Marketing Team</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="relationship">Relationship to Business</Label>
                      <Input
                        id="relationship"
                        placeholder="e.g., Founder, CEO, Marketing Manager"
                        value={claimData.relationship}
                        onChange={(e) => setClaimData(prev => ({ ...prev, relationship: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact_email">Contact Email</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={claimData.contact_email}
                        onChange={(e) => setClaimData(prev => ({ ...prev, contact_email: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact_phone">Contact Phone</Label>
                      <Input
                        id="contact_phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={claimData.contact_phone}
                        onChange={(e) => setClaimData(prev => ({ ...prev, contact_phone: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="additional_info">Additional Information</Label>
                      <Textarea
                        id="additional_info"
                        placeholder="Provide any additional information that can help verify your claim..."
                        value={claimData.additional_info}
                        onChange={(e) => setClaimData(prev => ({ ...prev, additional_info: e.target.value }))}
                        rows={4}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a business from the search results to proceed with your claim.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">What happens after I submit my claim?</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Our team will review your claim within 2-3 business days</li>
              <li>• We may contact you for additional verification</li>
              <li>• Once verified, you'll gain access to manage your business profile</li>
              <li>• You'll be able to respond to reviews and update business information</li>
            </ul>
          </div>
        </div>
      </main>

    </div>
  );
}