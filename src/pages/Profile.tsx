
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/sonner';
import { Calendar, Clock, Book, User } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  return (
    <DashboardLayout 
      title="My Profile" 
      breadcrumbs={[
        { label: 'Dashboard', path: user?.role === 'librarian' ? '/librarian' : '/member' }, 
        { label: 'Profile' }
      ]}
    >
      <div className="space-y-6 animate-fade-in">
        <Card className="shadow-md transition-all duration-300 hover:shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary/20">
                <AvatarImage 
                  src={profileData.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&size=200` : undefined} 
                  alt={profileData.name} 
                />
                <AvatarFallback className="text-2xl bg-primary/30 text-primary-foreground">
                  {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profileData.name}</CardTitle>
                <CardDescription>{user?.role === 'librarian' ? 'Librarian' : 'Member'}</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account" className="space-y-4 pt-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Input 
                      id="role"
                      value={user?.role === 'librarian' ? 'Librarian' : 'Member'}
                      disabled
                    />
                  </div>
                </div>
                
                <Button onClick={() => toast.success('Profile updated successfully')}>
                  Save Changes
                </Button>
              </TabsContent>
              
              <TabsContent value="preferences" className="space-y-4 pt-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="notifications">Email Notifications</Label>
                    <select 
                      id="notifications" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="all">All notifications</option>
                      <option value="important">Important only</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Reading Preferences</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="justify-start">
                        <Book className="mr-2 h-4 w-4" /> Fiction
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Book className="mr-2 h-4 w-4" /> Non-Fiction
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Book className="mr-2 h-4 w-4" /> Mystery
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Book className="mr-2 h-4 w-4" /> Science
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button onClick={() => toast.success('Preferences saved')}>
                  Save Preferences
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Book className="h-4 w-4 mr-2 text-primary" />
                Reading Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-primary">24</div>
                <p className="text-sm text-muted-foreground">Books read</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-primary" />
                Active Reservations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-primary">3</div>
                <p className="text-sm text-muted-foreground">Current reservations</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-4 w-4 mr-2 text-primary" />
                Member Since
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-primary font-medium">May 2024</div>
                <p className="text-sm text-muted-foreground">Active member</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
