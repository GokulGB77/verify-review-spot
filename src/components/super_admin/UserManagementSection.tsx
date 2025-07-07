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
import { Search, Eye, Edit, Ban, RefreshCcw, RefreshCw, Mail, Phone, Calendar, MapPin, User, Hash, Star, Award, Shield, ShieldOff } from 'lucide-react';
import { useProfiles, useUpdateProfile, useBlockUser } from '@/hooks/useProfiles';
import { useToast } from '@/hooks/use-toast';

const UserManagementSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [pseudonymFilter, setPseudonymFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const { data: users, isLoading: usersLoading } = useProfiles();
  const updateProfileMutation = useUpdateProfile();
  const blockUserMutation = useBlockUser();

  // User action functions
  const toggleUserVerification = (userId: string) => {
    const user = users?.find(u => u.id === userId);
    if (!user) return;
    
    updateProfileMutation.mutate({
      id: userId,
      updates: { is_verified: !user.is_verified }
    });
  };

  const handleBlockUser = (userId: string) => {
    const user = users?.find(u => u.id === userId);
    if (!user) return;
    
    const isCurrentlyBlocked = user.rejection_reason === 'Account blocked by admin';
    blockUserMutation.mutate({
      id: userId,
      blocked: !isCurrentlyBlocked
    });
  };

  const filteredUsers = users?.filter(user => {
    const nameMatch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const pseudonymMatch = user.pseudonym?.toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = user.phone?.includes(searchTerm);
    const matchesSearch = nameMatch || emailMatch || pseudonymMatch || phoneMatch;
    
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

  const handleEditSuccess = (updates: any) => {
    if (selectedUser) {
      updateProfileMutation.mutate({
        id: selectedUser.id,
        updates
      });
    }
    setIsEditMode(false);
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

  const isUserBlocked = (user: any) => {
    return user.rejection_reason === 'Account blocked by admin';
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
                <TableHead>Status</TableHead>
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
                    {isUserBlocked(user) ? (
                      <Badge variant="destructive" className="text-xs">Blocked</Badge>
                    ) : user.is_verified ? (
                      <Badge variant="default" className="text-xs">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Unverified</Badge>
                    )}
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
                        
                      <Button
                        variant={isUserBlocked(user) ? "default" : "destructive"}
                        size="sm"
                        onClick={() => handleBlockUser(user.id)}
                        disabled={blockUserMutation.isPending}
                      >
                        {isUserBlocked(user) ? (
                          <>
                            <Shield className="h-4 w-4 mr-1" />
                            Unblock
                          </>
                        ) : (
                          <>
                            <ShieldOff className="h-4 w-4 mr-1" />
                            Block
                          </>
                        )}
                      </Button>
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
                                     <Button 
                                       size="sm" 
                                       onClick={() => handleEditSuccess({
                                         full_name: selectedUser.full_name,
                                         email: selectedUser.email,
                                         phone: selectedUser.phone,
                                         pseudonym: selectedUser.pseudonym
                                       })}
                                       disabled={updateProfileMutation.isPending}
                                     >
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
                                       <Label className="font-semibold">User ID</Label>
                                       <p className="text-sm font-mono">{selectedUser.id}</p>
                                     </div>
                                     <div>
                                       <Label className="font-semibold">Account Status</Label>
                                       <div className="mt-1">
                                         {isUserBlocked(selectedUser) ? (
                                           <Badge variant="destructive">Blocked</Badge>
                                         ) : selectedUser.is_verified ? (
                                           <Badge variant="default">Active</Badge>
                                         ) : (
                                           <Badge variant="secondary">Unverified</Badge>
                                         )}
                                       </div>
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

                                   <div className="flex gap-2 mt-4">
                                     <Button
                                       variant={isUserBlocked(selectedUser) ? "default" : "destructive"}
                                       size="sm"
                                       onClick={() => handleBlockUser(selectedUser.id)}
                                       disabled={blockUserMutation.isPending}
                                     >
                                       {isUserBlocked(selectedUser) ? (
                                         <>
                                           <Shield className="h-4 w-4 mr-1" />
                                           Unblock User
                                         </>
                                       ) : (
                                         <>
                                           <ShieldOff className="h-4 w-4 mr-1" />
                                           Block User
                                         </>
                                       )}
                                     </Button>
                                   </div>
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