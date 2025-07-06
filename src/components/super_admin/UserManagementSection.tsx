import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Search, Eye, Edit, Ban, RefreshCcw, RefreshCw, Mail, Phone, Calendar, MapPin, User, Hash, Star, Award } from 'lucide-react';

// Updated dummy data to match the database schema
const dummyUsers = [
  {
    id: 1,
    full_name: 'John Doe',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    created_at: '2023-01-15T10:30:00Z',
    updated_at: '2024-01-05T14:22:00Z',
    email: 'john.doe@example.com',
    aadhaar_number: '1234-5678-9012',
    aadhaar_mobile: '+91-9876543210',
    is_verified: true,
    pan_number: 'ABCDE1234F',
    mobile: '+91-9876543210',
    full_name_pan: 'JOHN DOE',
    pan_image_url: 'https://example.com/pan/john.jpg',
    phone: '+91-9876543210',
    pseudonym: 'FoodieJohn',
    pseudonym_set: true,
    display_name_preference: 'pseudonym',
    main_badge: 'Verified Reviewer',
    rejection_reason: null
  },
  {
    id: 2,
    full_name: 'Sarah Johnson',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e1?w=100&h=100&fit=crop&crop=face',
    created_at: '2023-03-20T09:15:00Z',
    updated_at: '2024-01-06T11:45:00Z',
    email: 'sarah.johnson@example.com',
    aadhaar_number: '2345-6789-0123',
    aadhaar_mobile: '+91-9876543211',
    is_verified: true,
    pan_number: 'BCDEF2345G',
    mobile: '+91-9876543211',
    full_name_pan: 'SARAH JOHNSON',
    pan_image_url: 'https://example.com/pan/sarah.jpg',
    phone: '+91-9876543211',
    pseudonym: 'CafeSarah',
    pseudonym_set: true,
    display_name_preference: 'full_name',
    main_badge: 'Business Owner',
    rejection_reason: null
  },
  {
    id: 3,
    full_name: 'Mike Chen',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    created_at: '2023-02-10T16:20:00Z',
    updated_at: '2024-01-06T09:30:00Z',
    email: 'mike.chen@example.com',
    aadhaar_number: '3456-7890-1234',
    aadhaar_mobile: '+91-9876543212',
    is_verified: true,
    pan_number: 'CDEFG3456H',
    mobile: '+91-9876543212',
    full_name_pan: 'MIKE CHEN',
    pan_image_url: 'https://example.com/pan/mike.jpg',
    phone: '+91-9876543212',
    pseudonym: 'ModeratorMike',
    pseudonym_set: true,
    display_name_preference: 'pseudonym',
    main_badge: 'Community Moderator',
    rejection_reason: null
  },
  {
    id: 4,
    full_name: 'Emily Rodriguez',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    created_at: '2023-11-05T13:45:00Z',
    updated_at: '2023-12-20T18:15:00Z',
    email: 'emily.rodriguez@example.com',
    aadhaar_number: null,
    aadhaar_mobile: null,
    is_verified: false,
    pan_number: null,
    mobile: '+91-9876543213',
    full_name_pan: null,
    pan_image_url: null,
    phone: '+91-9876543213',
    pseudonym: null,
    pseudonym_set: false,
    display_name_preference: 'full_name',
    main_badge: null,
    rejection_reason: 'Incomplete documentation'
  },
  {
    id: 5,
    full_name: 'David Kim',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    created_at: '2022-08-12T08:00:00Z',
    updated_at: '2024-01-06T15:00:00Z',
    email: 'david.kim@example.com',
    aadhaar_number: '4567-8901-2345',
    aadhaar_mobile: '+91-9876543214',
    is_verified: true,
    pan_number: 'DEFGH4567I',
    mobile: '+91-9876543214',
    full_name_pan: 'DAVID KIM',
    pan_image_url: 'https://example.com/pan/david.jpg',
    phone: '+91-9876543214',
    pseudonym: 'AdminDave',
    pseudonym_set: true,
    display_name_preference: 'pseudonym',
    main_badge: 'Platform Admin',
    rejection_reason: null
  },
  {
    id: 6,
    full_name: 'Lisa Wang',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
    created_at: '2023-06-18T12:30:00Z',
    updated_at: '2024-01-05T20:45:00Z',
    email: 'lisa.wang@example.com',
    aadhaar_number: '5678-9012-3456',
    aadhaar_mobile: '+91-9876543215',
    is_verified: true,
    pan_number: 'EFGHI5678J',
    mobile: '+91-9876543215',
    full_name_pan: 'LISA WANG',
    pan_image_url: 'https://example.com/pan/lisa.jpg',
    phone: '+91-9876543215',
    pseudonym: 'TechLisa',
    pseudonym_set: true,
    display_name_preference: 'full_name',
    main_badge: 'Tech Entrepreneur',
    rejection_reason: null
  },
  {
    id: 7,
    full_name: 'Raj Patel',
    avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face',
    created_at: '2023-09-14T14:20:00Z',
    updated_at: '2023-10-20T16:30:00Z',
    email: 'raj.patel@example.com',
    aadhaar_number: '6789-0123-4567',
    aadhaar_mobile: '+91-9876543216',
    is_verified: false,
    pan_number: null,
    mobile: '+91-9876543216',
    full_name_pan: null,
    pan_image_url: null,
    phone: '+91-9876543216',
    pseudonym: 'RajReviews',
    pseudonym_set: true,
    display_name_preference: 'pseudonym',
    main_badge: null,
    rejection_reason: 'PAN verification pending'
  },
  {
    id: 8,
    full_name: 'Priya Sharma',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    created_at: '2023-04-10T11:45:00Z',
    updated_at: '2024-01-04T18:20:00Z',
    email: 'priya.sharma@example.com',
    aadhaar_number: '7890-1234-5678',
    aadhaar_mobile: '+91-9876543217',
    is_verified: true,
    pan_number: 'FGHIJ6789K',
    mobile: '+91-9876543217',
    full_name_pan: 'PRIYA SHARMA',
    pan_image_url: 'https://example.com/pan/priya.jpg',
    phone: '+91-9876543217',
    pseudonym: 'PriyaEats',
    pseudonym_set: true,
    display_name_preference: 'full_name',
    main_badge: 'Top Reviewer',
    rejection_reason: null
  }
];

const UserManagementSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [pseudonymFilter, setPseudonymFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [users, setUsers] = useState(dummyUsers);
  const [usersLoading] = useState(false);

  // Mock functions for user actions
  const toggleUserVerification = (userId: number) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, is_verified: !user.is_verified } : user
    ));
  };

  const filteredUsers = users?.filter(user => {
    const nameMatch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const pseudonymMatch = user.pseudonym?.toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = user.phone?.includes(searchTerm);
    const panMatch = user.pan_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || emailMatch || pseudonymMatch || phoneMatch || panMatch;
    
    const matchesVerification = verificationFilter === 'all' ||
                               (verificationFilter === 'verified' && user.is_verified) ||
                               (verificationFilter === 'unverified' && !user.is_verified);
    
    const matchesPseudonym = pseudonymFilter === 'all' ||
                            (pseudonymFilter === 'set' && user.pseudonym_set) ||
                            (pseudonymFilter === 'not_set' && !user.pseudonym_set);
    
    return matchesSearch && matchesVerification && matchesPseudonym;
  });

  const handleViewDialogClose = () => {
    setSelectedUser(null);
    setIsEditMode(false);
  };

  const handleEditSuccess = () => {
    setIsEditMode(false);
    console.log('User updated successfully');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDisplayName = (user: any) => {
    if (user.display_name_preference === 'pseudonym' && user.pseudonym) {
      return user.pseudonym;
    }
    return user.full_name;
  };

  const maskAadhaar = (aadhaar: string) => {
    if (!aadhaar) return 'N/A';
    return aadhaar.replace(/\d(?=\d{4})/g, '*');
  };

  const maskPAN = (pan: string) => {
    if (!pan) return 'N/A';
    return pan.substring(0, 3) + '***' + pan.substring(6);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage platform users, verification status, and user preferences</CardDescription>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <Label htmlFor="search-users">Search Users</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search-users"
                placeholder="Search by name, email, phone, PAN, or pseudonym..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-shrink-0">
            <Label htmlFor="verification-filter">Filter by Verification</Label>
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger id="verification-filter" className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-shrink-0">
            <Label htmlFor="pseudonym-filter">Filter by Pseudonym</Label>
            <Select value={pseudonymFilter} onValueChange={setPseudonymFilter}>
              <SelectTrigger id="pseudonym-filter" className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="set">Has Pseudonym</SelectItem>
                <SelectItem value="not_set">No Pseudonym</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {usersLoading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>PAN</TableHead>
                <TableHead>Pseudonym</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Badge</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {user.avatar_url && (
                        <img 
                          src={user.avatar_url} 
                          alt={user.full_name} 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{getDisplayName(user)}</div>
                        <div className="text-xs text-gray-500">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <span className="text-xs">{maskPAN(user.pan_number)}</span>
                  </TableCell>
                  <TableCell>
                    {user.pseudonym ? (
                      <Badge variant="outline">{user.pseudonym}</Badge>
                    ) : (
                      <span className="text-xs text-gray-500">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={user.is_verified || false}
                        onCheckedChange={() => toggleUserVerification(user.id)}
                        id={`verified-${user.id}`}
                      />
                      <Label htmlFor={`verified-${user.id}`} className="text-xs">
                        {user.is_verified ? 'Verified' : 'Unverified'}
                      </Label>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.main_badge ? (
                      <Badge variant="secondary" className="text-xs">
                        {user.main_badge}
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-500">None</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog onOpenChange={(open) => !open && handleViewDialogClose()}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              User Details
                              {!isEditMode && selectedUser && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setIsEditMode(true)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              )}
                            </DialogTitle>
                          </DialogHeader>
                          {selectedUser && (
                            <div className="space-y-4">
                              {isEditMode ? (
                                <div className="p-4 border rounded-lg">
                                  <p className="text-sm text-gray-600">
                                    Edit form would go here. In a real application, this would be a comprehensive form 
                                    for editing user details like name, email, phone, verification status, etc.
                                  </p>
                                  <div className="flex gap-2 mt-4">
                                    <Button size="sm" onClick={handleEditSuccess}>
                                      Save Changes
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setIsEditMode(false)}>
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    {selectedUser.avatar_url && (
                                      <img 
                                        src={selectedUser.avatar_url} 
                                        alt={selectedUser.full_name} 
                                        className="w-16 h-16 rounded-full object-cover"
                                      />
                                    )}
                                    <div>
                                      <h3 className="text-lg font-semibold">{selectedUser.full_name}</h3>
                                      <p className="text-sm text-gray-600">{selectedUser.email}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant={selectedUser.is_verified ? 'default' : 'secondary'}>
                                          {selectedUser.is_verified ? 'Verified' : 'Unverified'}
                                        </Badge>
                                        {selectedUser.main_badge && (
                                          <Badge variant="outline">{selectedUser.main_badge}</Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label className="font-semibold flex items-center gap-1">
                                        <Hash className="h-4 w-4" />
                                        User ID
                                      </Label>
                                      <p className="text-sm">{selectedUser.id}</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold flex items-center gap-1">
                                        <User className="h-4 w-4" />
                                        Full Name
                                      </Label>
                                      <p className="text-sm">{selectedUser.full_name}</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold flex items-center gap-1">
                                        <Mail className="h-4 w-4" />
                                        Email
                                      </Label>
                                      <p className="text-sm">{selectedUser.email}</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold flex items-center gap-1">
                                        <Phone className="h-4 w-4" />
                                        Phone
                                      </Label>
                                      <p className="text-sm">{selectedUser.phone || 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold flex items-center gap-1">
                                        <Phone className="h-4 w-4" />
                                        Mobile
                                      </Label>
                                      <p className="text-sm">{selectedUser.mobile || 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">PAN Number</Label>
                                      <p className="text-sm">{maskPAN(selectedUser.pan_number)}</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">PAN Name</Label>
                                      <p className="text-sm">{selectedUser.full_name_pan || 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">Aadhaar Number</Label>
                                      <p className="text-sm">{maskAadhaar(selectedUser.aadhaar_number)}</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">Aadhaar Mobile</Label>
                                      <p className="text-sm">{selectedUser.aadhaar_mobile || 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">Pseudonym</Label>
                                      <p className="text-sm">{selectedUser.pseudonym || 'Not set'}</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">Display Preference</Label>
                                      <p className="text-sm capitalize">{selectedUser.display_name_preference?.replace('_', ' ') || 'Full Name'}</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        Created At
                                      </Label>
                                      <p className="text-sm">{formatDate(selectedUser.created_at)}</p>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">Last Updated</Label>
                                      <p className="text-sm">{formatDate(selectedUser.updated_at)}</p>
                                    </div>
                                  </div>

                                  {selectedUser.main_badge && (
                                    <div>
                                      <Label className="font-semibold flex items-center gap-1">
                                        <Award className="h-4 w-4" />
                                        Main Badge
                                      </Label>
                                      <p className="text-sm mt-1">{selectedUser.main_badge}</p>
                                    </div>
                                  )}

                                  {selectedUser.rejection_reason && (
                                    <div>
                                      <Label className="font-semibold text-red-600">Rejection Reason</Label>
                                      <p className="text-sm mt-1 text-red-600">{selectedUser.rejection_reason}</p>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label className="font-semibold">Verification Status</Label>
                                      <div className="mt-1">
                                        <Badge variant={selectedUser.is_verified ? 'default' : 'secondary'}>
                                          {selectedUser.is_verified ? 'Verified' : 'Not Verified'}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="font-semibold">Pseudonym Set</Label>
                                      <div className="mt-1">
                                        <Badge variant={selectedUser.pseudonym_set ? 'default' : 'secondary'}>
                                          {selectedUser.pseudonym_set ? 'Yes' : 'No'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  {selectedUser.pan_image_url && (
                                    <div>
                                      <Label className="font-semibold">PAN Document</Label>
                                      <p className="text-sm text-blue-600 mt-1">
                                        <a href={selectedUser.pan_image_url} target="_blank" rel="noopener noreferrer">
                                          View PAN Image
                                        </a>
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {filteredUsers && filteredUsers.length === 0 && !usersLoading && (
          <div className="text-center py-8 text-gray-500">No users found matching your criteria.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserManagementSection;