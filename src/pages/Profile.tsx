
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
import { Calendar, Clock, Book, User, Loader2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  reading_preferences?: string[];
  notification_settings?: string;
  books_read?: number;
  active_reservations?: number;
}

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    id: user?.id || '',
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'member',
    created_at: '',
    updated_at: '',
    reading_preferences: [],
    notification_settings: 'all',
    books_read: 0,
    active_reservations: 0
  });
  
  // Selected reading preferences for the UI
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  
  // Fetch complete profile data from database
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          throw profileError;
        }
        
        // Fetch completed book reservations (books read)
        const { data: booksData, error: booksError } = await supabase
          .from('reservations')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'Completed')
          .eq('item_type', 'book');
          
        if (booksError) {
          console.error('Error fetching reading activity:', booksError);
        }
        
        // Fetch active reservations
        const { data: reservationsData, error: reservationsError } = await supabase
          .from('reservations')
          .select('id')
          .eq('user_id', user.id)
          .in('status', ['Pending', 'Approved']);
          
        if (reservationsError) {
          console.error('Error fetching reservations:', reservationsError);
        }
        
        // Check if reading_preferences and notification_settings exist in the profile data
        // If not, we'll need to add them to the database
        const needsProfileUpdate = !profileData.hasOwnProperty('reading_preferences') || 
                                  !profileData.hasOwnProperty('notification_settings');
        
        if (needsProfileUpdate) {
          // Add missing fields to the profile
          await supabase
            .from('profiles')
            .update({
              reading_preferences: profileData.reading_preferences || [],
              notification_settings: profileData.notification_settings || 'all'
            })
            .eq('id', user.id);
        }
        
        setProfileData({
          ...profileData,
          id: user.id,
          name: profileData?.name || user?.name || '',
          email: user?.email || '',
          role: profileData?.role || user?.role || 'member',
          created_at: profileData?.created_at || new Date().toISOString(),
          updated_at: profileData?.updated_at || new Date().toISOString(),
          reading_preferences: profileData?.reading_preferences || [],
          notification_settings: profileData?.notification_settings || 'all',
          books_read: booksData?.length || 0,
          active_reservations: reservationsData?.length || 0
        });
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);
  
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
                
                <Button 
                  className="bg-primary text-primary-foreground"
                  onClick={async () => {
                    try {
                      setSaving(true);
                      
                      // Update profile in database
                      const { error } = await supabase
                        .from('profiles')
                        .update({
                          name: profileData.name,
                          // Only update fields that can be changed
                        })
                        .eq('id', user?.id);
                        
                      if (error) throw error;
                      
                      toast.success('Profile updated successfully');
                    } catch (error: any) {
                      console.error('Error updating profile:', error);
                      toast.error(`Failed to update profile: ${error.message}`);
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="preferences" className="space-y-4 pt-4">
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="notifications">Email Notifications</Label>
                    <select 
                      id="notifications" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={profileData.notification_settings}
                      onChange={(e) => setProfileData({...profileData, notification_settings: e.target.value})}
                    >
                      <option value="all">All notifications</option>
                      <option value="important">Important only</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Reading Preferences</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="fiction" 
                          checked={profileData.reading_preferences?.includes('Fiction')}
                          onCheckedChange={(checked) => {
                            const newPreferences = [...(profileData.reading_preferences || [])];
                            if (checked) {
                              if (!newPreferences.includes('Fiction')) newPreferences.push('Fiction');
                            } else {
                              const index = newPreferences.indexOf('Fiction');
                              if (index > -1) newPreferences.splice(index, 1);
                            }
                            setProfileData({...profileData, reading_preferences: newPreferences});
                          }}
                        />
                        <Label htmlFor="fiction" className="cursor-pointer">Fiction</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="non-fiction" 
                          checked={profileData.reading_preferences?.includes('Non-Fiction')}
                          onCheckedChange={(checked) => {
                            const newPreferences = [...(profileData.reading_preferences || [])];
                            if (checked) {
                              if (!newPreferences.includes('Non-Fiction')) newPreferences.push('Non-Fiction');
                            } else {
                              const index = newPreferences.indexOf('Non-Fiction');
                              if (index > -1) newPreferences.splice(index, 1);
                            }
                            setProfileData({...profileData, reading_preferences: newPreferences});
                          }}
                        />
                        <Label htmlFor="non-fiction" className="cursor-pointer">Non-Fiction</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="mystery" 
                          checked={profileData.reading_preferences?.includes('Mystery')}
                          onCheckedChange={(checked) => {
                            const newPreferences = [...(profileData.reading_preferences || [])];
                            if (checked) {
                              if (!newPreferences.includes('Mystery')) newPreferences.push('Mystery');
                            } else {
                              const index = newPreferences.indexOf('Mystery');
                              if (index > -1) newPreferences.splice(index, 1);
                            }
                            setProfileData({...profileData, reading_preferences: newPreferences});
                          }}
                        />
                        <Label htmlFor="mystery" className="cursor-pointer">Mystery</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="science" 
                          checked={profileData.reading_preferences?.includes('Science')}
                          onCheckedChange={(checked) => {
                            const newPreferences = [...(profileData.reading_preferences || [])];
                            if (checked) {
                              if (!newPreferences.includes('Science')) newPreferences.push('Science');
                            } else {
                              const index = newPreferences.indexOf('Science');
                              if (index > -1) newPreferences.splice(index, 1);
                            }
                            setProfileData({...profileData, reading_preferences: newPreferences});
                          }}
                        />
                        <Label htmlFor="science" className="cursor-pointer">Science</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="history" 
                          checked={profileData.reading_preferences?.includes('History')}
                          onCheckedChange={(checked) => {
                            const newPreferences = [...(profileData.reading_preferences || [])];
                            if (checked) {
                              if (!newPreferences.includes('History')) newPreferences.push('History');
                            } else {
                              const index = newPreferences.indexOf('History');
                              if (index > -1) newPreferences.splice(index, 1);
                            }
                            setProfileData({...profileData, reading_preferences: newPreferences});
                          }}
                        />
                        <Label htmlFor="history" className="cursor-pointer">History</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="biography" 
                          checked={profileData.reading_preferences?.includes('Biography')}
                          onCheckedChange={(checked) => {
                            const newPreferences = [...(profileData.reading_preferences || [])];
                            if (checked) {
                              if (!newPreferences.includes('Biography')) newPreferences.push('Biography');
                            } else {
                              const index = newPreferences.indexOf('Biography');
                              if (index > -1) newPreferences.splice(index, 1);
                            }
                            setProfileData({...profileData, reading_preferences: newPreferences});
                          }}
                        />
                        <Label htmlFor="biography" className="cursor-pointer">Biography</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="fantasy" 
                          checked={profileData.reading_preferences?.includes('Fantasy')}
                          onCheckedChange={(checked) => {
                            const newPreferences = [...(profileData.reading_preferences || [])];
                            if (checked) {
                              if (!newPreferences.includes('Fantasy')) newPreferences.push('Fantasy');
                            } else {
                              const index = newPreferences.indexOf('Fantasy');
                              if (index > -1) newPreferences.splice(index, 1);
                            }
                            setProfileData({...profileData, reading_preferences: newPreferences});
                          }}
                        />
                        <Label htmlFor="fantasy" className="cursor-pointer">Fantasy</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="self-help" 
                          checked={profileData.reading_preferences?.includes('Self-Help')}
                          onCheckedChange={(checked) => {
                            const newPreferences = [...(profileData.reading_preferences || [])];
                            if (checked) {
                              if (!newPreferences.includes('Self-Help')) newPreferences.push('Self-Help');
                            } else {
                              const index = newPreferences.indexOf('Self-Help');
                              if (index > -1) newPreferences.splice(index, 1);
                            }
                            setProfileData({...profileData, reading_preferences: newPreferences});
                          }}
                        />
                        <Label htmlFor="self-help" className="cursor-pointer">Self-Help</Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="bg-primary text-primary-foreground"
                  onClick={async () => {
                    try {
                      setSaving(true);
                      
                      // Update preferences in database
                      const { error } = await supabase
                        .from('profiles')
                        .update({
                          reading_preferences: profileData.reading_preferences,
                          notification_settings: profileData.notification_settings
                        })
                        .eq('id', user?.id);
                        
                      if (error) throw error;
                      
                      toast.success('Preferences saved');
                    } catch (error: any) {
                      console.error('Error saving preferences:', error);
                      toast.error(`Failed to save preferences: ${error.message}`);
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Preferences'
                  )}
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
                <div className="text-3xl font-bold text-primary">{profileData.books_read}</div>
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
                <div className="text-3xl font-bold text-primary">{profileData.active_reservations}</div>
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
                <div className="text-primary font-medium">
                  {profileData.created_at ? new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'May 2024'}
                </div>
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
