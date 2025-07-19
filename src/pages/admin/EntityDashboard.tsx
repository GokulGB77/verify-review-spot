
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEntity } from '@/hooks/useEntities';
import { useReviews } from '@/hooks/useReviews';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, TrendingUp, MessageSquare, Users, Edit, Save, Code, Copy, ExternalLink, Key, Reply } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useParams } from 'react-router-dom';

const EntityDashboard = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: entity, isLoading: entityLoading } = useEntity(id!);
  const { data: reviews, isLoading: reviewsLoading } = useReviews(id);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    industry: '',
    tagline: ''
  });

  React.useEffect(() => {
    if (entity) {
      // Safely extract contact and location data
      const contactData = entity.contact as any || {};
      const locationData = entity.location as any || {};
      
      setFormData({
        name: entity.name || '',
        description: entity.description || '',
        phone: contactData.phone || '',
        email: contactData.email || '',
        website: contactData.website || '',
        address: locationData.address || '',
        city: locationData.city || '',
        industry: entity.industry || '',
        tagline: entity.tagline || ''
      });
    }
  }, [entity]);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('entities')
        .update({
          name: formData.name,
          description: formData.description,
          industry: formData.industry,
          tagline: formData.tagline,
          contact: {
            phone: formData.phone,
            email: formData.email,
            website: formData.website
          },
          location: {
            address: formData.address,
            city: formData.city
          },
          updated_at: new Date().toISOString()
        })
        .eq('entity_id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Entity profile updated successfully',
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update entity profile',
        variant: 'destructive',
      });
    }
  };

  const handleRespond = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setResponseText('');
    setResponseDialogOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedReviewId || !responseText.trim()) return;

    console.log('Submitting response:', { selectedReviewId, responseText });

    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          business_response: responseText,
          business_response_date: new Date().toISOString()
        })
        .eq('id', selectedReviewId)
        .select();

      console.log('Response submission result:', { data, error });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Response submitted successfully',
      });
      
      setResponseDialogOpen(false);
      setSelectedReviewId(null);
      setResponseText('');
      
      // Force refresh of reviews data
      window.location.reload();
    } catch (error) {
      console.error('Response submission error:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit response',
        variant: 'destructive',
      });
    }
  };

  if (entityLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Entity Not Found</CardTitle>
            <CardDescription>The entity you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/businesses')} className="w-full">
              Browse Entities
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const averageRating = entity.average_rating || 0;
  const totalReviews = reviews?.length || 0;
  const recentReviews = reviews?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{entity.name} Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your entity profile and reviews</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Verification Status</p>
                  <Badge variant={entity.is_verified ? 'default' : 'secondary'}>
                    {entity.is_verified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reviews?.filter(r => new Date(r.created_at).getMonth() === new Date().getMonth()).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Entity Profile</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="api">API Access</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Entity Information</CardTitle>
                  <CardDescription>Manage your entity profile and contact information</CardDescription>
                </div>
                <Button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className="ml-4"
                >
                  {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Entity Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={formData.tagline}
                    onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    disabled={!isEditing}
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>View and respond to customer feedback</CardDescription>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="text-center py-8">Loading reviews...</div>
                ) : recentReviews.length > 0 ? (
                  <div className="space-y-4">
                    {recentReviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex">
                              {Array.from({length: 5}).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <Badge variant="outline">
                            {review.custom_verification_tag || 'Unverified User'}
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-3">{review.content}</p>
                        {review.business_response ? (
                          <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                            <div className="flex items-center mb-2">
                              <Reply className="w-4 h-4 text-blue-600 mr-2" />
                              <span className="text-sm font-medium text-blue-600">Business Response</span>
                              <span className="ml-2 text-xs text-gray-500">
                                {new Date(review.business_response_date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{review.business_response}</p>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRespond(review.id)}
                          >
                            <Reply className="w-4 h-4 mr-2" />
                            Respond
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No reviews yet. Encourage customers to leave reviews!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Review Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = reviews?.filter(r => r.rating === rating).length || 0;
                      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                      return (
                        <div key={rating} className="flex items-center space-x-3">
                          <span className="text-sm font-medium w-3">{rating}</span>
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Average Rating:</span>
                      <span className="font-semibold">{averageRating.toFixed(1)}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Reviews:</span>
                      <span className="font-semibold">{totalReviews}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Response Rate:</span>
                      <span className="font-semibold">
                        {totalReviews > 0 ? 
                          Math.round((reviews?.filter(r => r.business_response).length || 0) / totalReviews * 100) : 0
                        }%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    API Access
                  </CardTitle>
                  <CardDescription>
                    Access your entity's API endpoints and integration tools for your website
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Widget API */}
                  <div className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Review Widget API
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Embed reviews directly on your website with our widget API
                        </p>
                      </div>
                      <Badge variant="outline">REST API</Badge>
                    </div>
                    
                    <div className="bg-muted p-3 rounded font-mono text-sm">
                      https://hsympreltgeoellhzvus.supabase.co/functions/v1/widget-api?entityId={id}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const url = `https://hsympreltgeoellhzvus.supabase.co/functions/v1/widget-api?entityId=${id}`;
                          navigator.clipboard.writeText(url);
                          toast({
                            title: "API URL Copied",
                            description: "Widget API URL has been copied to clipboard",
                          });
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          window.open(`https://hsympreltgeoellhzvus.supabase.co/functions/v1/widget-api?entityId=${id}`, '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Test API
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          window.open('/widget-api/docs/API.md', '_blank');
                        }}
                      >
                        <Code className="h-4 w-4 mr-2" />
                        Documentation
                      </Button>
                    </div>
                  </div>

                  {/* Entity Data API */}
                  <div className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Entity Data API
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Get your entity information and basic statistics
                        </p>
                      </div>
                      <Badge variant="outline">REST API</Badge>
                    </div>
                    
                    <div className="bg-muted p-3 rounded font-mono text-sm">
                      https://hsympreltgeoellhzvus.supabase.co/rest/v1/entities?entity_id=eq.{id}&select=*
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const url = `https://hsympreltgeoellhzvus.supabase.co/rest/v1/entities?entity_id=eq.${id}&select=*`;
                          navigator.clipboard.writeText(url);
                          toast({
                            title: "API URL Copied",
                            description: "Entity Data API URL has been copied to clipboard",
                          });
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          window.open(`https://hsympreltgeoellhzvus.supabase.co/rest/v1/entities?entity_id=eq.${id}&select=*`, '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Test API
                      </Button>
                    </div>
                  </div>

                  {/* Reviews API */}
                  <div className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Reviews API
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Access all reviews for your entity
                        </p>
                      </div>
                      <Badge variant="outline">REST API</Badge>
                    </div>
                    
                    <div className="bg-muted p-3 rounded font-mono text-sm">
                      https://hsympreltgeoellhzvus.supabase.co/rest/v1/reviews?business_id=eq.{id}&select=*
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const url = `https://hsympreltgeoellhzvus.supabase.co/rest/v1/reviews?business_id=eq.${id}&select=*`;
                          navigator.clipboard.writeText(url);
                          toast({
                            title: "API URL Copied",
                            description: "Reviews API URL has been copied to clipboard",
                          });
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          window.open(`https://hsympreltgeoellhzvus.supabase.co/rest/v1/reviews?business_id=eq.${id}&select=*`, '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Test API
                      </Button>
                    </div>
                  </div>

                  {/* API Key Information */}
                  <div className="border rounded-lg p-6 space-y-4 bg-blue-50 dark:bg-blue-950">
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                        API Authentication
                      </h3>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      For public APIs (entity data, reviews), no authentication is required. 
                      For widget API, use the public anonymous key:
                    </p>
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded font-mono text-sm">
                      apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzeW1wcmVsdGdlb2VsbGh6dnVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzAzOTksImV4cCI6MjA2NTgwNjM5OX0.k-eoqqv9MC7TbztMttuUaAMImgsr1h1npr7OKtLB85k
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzeW1wcmVsdGdlb2VsbGh6dnVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzAzOTksImV4cCI6MjA2NTgwNjM5OX0.k-eoqqv9MC7TbztMttuUaAMImgsr1h1npr7OKtLB85k";
                        navigator.clipboard.writeText(apiKey);
                        toast({
                          title: "API Key Copied",
                          description: "Anonymous API key has been copied to clipboard",
                        });
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy API Key
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Response Dialog */}
        <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Respond to Review</DialogTitle>
              <DialogDescription>
                Write a professional response to this customer review. Your response will be visible to all users.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Textarea
                placeholder="Type your response here..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setResponseDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitResponse}
                disabled={!responseText.trim()}
              >
                Submit Response
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EntityDashboard;
