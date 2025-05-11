import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { Search, UserPlus, Users, Filter, RefreshCw, MoreVertical, Edit, Trash2, UserCheck, UserX, Mail, Clock, Calendar, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'librarian' | 'admin';
  created_at: string;
  updated_at: string;
  reading_preferences?: string[];
  notification_settings?: string;
  books_read?: number;
  active_reservations?: number;
}

const MemberManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'member' as 'member' | 'librarian' | 'admin',
    password: ''
  });

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Get all users from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
          
        if (error) throw error;
        
        // For each user, get their reading stats
        const usersWithStats = await Promise.all(data.map(async (user) => {
          // Get books read count
          const { count: booksRead } = await supabase
            .from('reservations')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'Completed')
            .eq('item_type', 'book');
            
          // Get active reservations count
          const { count: activeReservations } = await supabase
            .from('reservations')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .in('status', ['Pending', 'Approved']);
            
          return {
            ...user,
            books_read: booksRead || 0,
            active_reservations: activeReservations || 0
          };
        }));
        
        setUsers(usersWithStats);
        setFilteredUsers(usersWithStats);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Filter users based on search query and role filter
  useEffect(() => {
    let result = users;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(query) || 
        user.email.toLowerCase().includes(query)
      );
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(result);
  }, [searchQuery, roleFilter, users]);
  
  // Create new user
  const handleCreateUser = async () => {
    try {
      if (!newUser.name || !newUser.email || !newUser.password) {
        toast.error('Please fill all required fields');
        return;
      }
      
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Then create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            reading_preferences: [],
            notification_settings: 'all'
          });
          
        if (profileError) throw profileError;
        
        toast.success('User created successfully');
        setIsCreateDialogOpen(false);
        
        // Refresh user list
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
          
        if (error) throw error;
        setUsers(data);
        setFilteredUsers(data);
        
        // Reset new user form
        setNewUser({
          name: '',
          email: '',
          role: 'member',
          password: ''
        });
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(`Failed to create user: ${error.message}`);
    }
  };
  
  // Update user
  const handleUpdateUser = async () => {
    try {
      if (!selectedUser) return;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: selectedUser.name,
          role: selectedUser.role,
          updated_at: new Date().toISOString(),
          reading_preferences: selectedUser.reading_preferences || [],
          notification_settings: selectedUser.notification_settings || 'all'
        })
        .eq('id', selectedUser.id);
        
      if (error) throw error;
      
      toast.success('User updated successfully');
      setIsEditDialogOpen(false);
      
      // Update local state
      setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
      setFilteredUsers(filteredUsers.map(u => u.id === selectedUser.id ? selectedUser : u));
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(`Failed to update user: ${error.message}`);
    }
  };
  
  // Delete user
  const handleDeleteUser = async () => {
    try {
      if (!selectedUser) return;
      
      // First delete user from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);
        
      if (profileError) throw profileError;
      
      // Then delete user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(
        selectedUser.id
      );
      
      if (authError) throw authError;
      
      toast.success('User deleted successfully');
      setIsDeleteDialogOpen(false);
      
      // Update local state
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setFilteredUsers(filteredUsers.filter(u => u.id !== selectedUser.id));
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(`Failed to delete user: ${error.message}`);
    }
  };
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <DashboardLayout 
      title="Member Management" 
      breadcrumbs={[
        { label: 'Dashboard', path: '/librarian' }, 
        { label: 'Member Management' }
      ]}
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search members..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="member">Members</SelectItem>
                <SelectItem value="librarian">Librarians</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <UserPlus size={16} />
            Add New Member
          </Button>
        </div>
        
        {/* User List */}
        <Card>
          <CardHeader>
            <CardTitle>Library Members</CardTitle>
            <CardDescription>
              Manage library members, librarians, and administrators
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 rounded-md border p-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-10">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No members found</h3>
                <p className="text-muted-foreground mt-2">
                  {searchQuery || roleFilter !== 'all' ? 
                    'Try adjusting your search or filters' : 
                    'Start by adding a new member'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 rounded-md border p-4 transition-colors hover:bg-muted/50">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10 border border-primary/10">
                        <AvatarImage 
                          src={user.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=40` : undefined} 
                          alt={user.name} 
                        />
                        <AvatarFallback className="text-xs">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="h-3 w-3" /> {user.email}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                      <Badge variant={user.role === 'librarian' ? 'default' : user.role === 'admin' ? 'destructive' : 'outline'}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                      
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Joined {formatDate(user.created_at)}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-sm flex items-center gap-1" title="Books Read">
                          <BookOpen className="h-3 w-3 text-blue-500" />
                          <span>{user.books_read || 0}</span>
                        </div>
                        
                        <div className="text-sm flex items-center gap-1" title="Active Reservations">
                          <Calendar className="h-3 w-3 text-green-500" />
                          <span>{user.active_reservations || 0}</span>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setIsEditDialogOpen(true);
                          }}>
                            <Edit className="h-4 w-4 mr-2" /> Edit Member
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteDialogOpen(true);
                          }}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} members
            </div>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
              }, 500);
            }}>
              <RefreshCw className="h-3 w-3" /> Refresh
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update member details and permissions
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={selectedUser.email}
                  disabled
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={selectedUser.role} 
                  onValueChange={(value: 'member' | 'librarian' | 'admin') => 
                    setSelectedUser({...selectedUser, role: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="librarian">Librarian</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>Notification Settings</Label>
                <Select 
                  value={selectedUser.notification_settings || 'all'} 
                  onValueChange={(value) => 
                    setSelectedUser({...selectedUser, notification_settings: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Notification preferences" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Notifications</SelectItem>
                    <SelectItem value="important">Important Only</SelectItem>
                    <SelectItem value="none">No Notifications</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>Account Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="active-status" defaultChecked />
                  <Label htmlFor="active-status">Active Account</Label>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this member? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="flex items-center space-x-4 py-4">
              <Avatar className="h-10 w-10 border border-primary/10">
                <AvatarImage 
                  src={selectedUser.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&size=40` : undefined} 
                  alt={selectedUser.name} 
                />
                <AvatarFallback className="text-xs">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{selectedUser.name}</div>
                <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Delete Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
            <DialogDescription>
              Create a new library member account
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-name">Name</Label>
              <Input
                id="new-name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-password">Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-role">Role</Label>
              <Select 
                value={newUser.role} 
                onValueChange={(value) => 
                  setNewUser({...newUser, role: value as 'member' | 'librarian' | 'admin'})
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="librarian">Librarian</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateUser}>Create Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MemberManagement;
