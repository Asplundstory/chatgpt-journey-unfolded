import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useUserRoles, UserRole } from '@/hooks/useUserRoles';
import { Shield, UserPlus } from 'lucide-react';

export const AdminRoleManager = () => {
  const { isAdmin, loading: rolesLoading } = useUserRoles();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only show to admins
  if (rolesLoading || !isAdmin()) {
    return null;
  }

  const handleAddRole = async () => {
    // Basic client-side validation
    if (!email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    if (!email.includes('@')) {
      toast({
        title: "Validation Error", 
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Note: This is a simplified version. In a real app, you'd need an edge function
      // to look up users by email since client-side admin functions aren't available
      toast({
        title: "Feature Not Implemented",
        description: "User role assignment requires backend implementation",
        variant: "destructive",
      });

    } catch (error) {
      console.error('Error adding role:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add role',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Role Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="User email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleAddRole} 
            disabled={isSubmitting || !email}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add Role
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Add roles to users by their email address. Users must already be registered.
        </p>
      </CardContent>
    </Card>
  );
};