
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useUserRoles';

type UserRole = 'super_admin' | 'entity_admin' | 'user';

const RoleManagement = () => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [entityId, setEntityId] = useState('');
  const [loading, setLoading] = useState(false);
  const { assignRole } = useUserRoles();
  const { toast } = useToast();

  const handleRoleChange = (value: string) => {
    setSelectedRole(value as UserRole);
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !selectedRole) return;

    setLoading(true);
    
    try {
      // First, find the user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError) {
        // Try to find user in auth.users via RPC or edge function
        toast({
          title: 'User not found',
          description: 'Please make sure the user has signed up to the platform.',
          variant: 'destructive',
        });
        return;
      }

      const result = await assignRole(
        userData.id, 
        selectedRole, 
        selectedRole === 'entity_admin' ? entityId : undefined
      );

      if (result.success) {
        toast({
          title: 'Role assigned successfully',
          description: `User ${email} has been assigned the role ${selectedRole}`,
        });
        setEmail('');
        setEntityId('');
        setSelectedRole('user');
      } else {
        toast({
          title: 'Error assigning role',
          description: 'There was an error assigning the role. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Management</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAssignRole} className="space-y-4">
          <div>
            <Label htmlFor="email">User Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user email"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={selectedRole} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="entity_admin">Entity Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedRole === 'entity_admin' && (
            <div>
              <Label htmlFor="entityId">Entity ID (Business ID)</Label>
              <Input
                id="entityId"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                placeholder="Enter business ID for entity admin"
                required
              />
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Assigning...' : 'Assign Role'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RoleManagement;
