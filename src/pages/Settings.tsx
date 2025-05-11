import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Moon, Sun, Globe, Eye, EyeOff, Shield, Volume2, VolumeX, Monitor } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserSettings {
  theme_preference: 'light' | 'dark' | 'system';
  notification_enabled: boolean;
  email_notifications: boolean;
  sound_enabled: boolean;
  language_preference: string;
  accessibility_high_contrast: boolean;
  privacy_profile_visibility: 'public' | 'private' | 'friends';
}

const defaultSettings: UserSettings = {
  theme_preference: 'system',
  notification_enabled: true,
  email_notifications: true,
  sound_enabled: true,
  language_preference: 'en',
  accessibility_high_contrast: false,
  privacy_profile_visibility: 'public'
};

const SETTINGS_STORAGE_KEY = 'library_user_settings';

// Import the translation hook
import { useTranslation, SupportedLanguage } from '../i18n';

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { themePreference, setThemePreference } = useTheme();
  const { language, setLanguage, t } = useTranslation();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user]);

  const fetchUserSettings = () => {
    try {
      setLoading(true);
      
      // Get settings from local storage
      const storedSettings = localStorage.getItem(`${SETTINGS_STORAGE_KEY}_${user.id}`);
      
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        // Use default settings for new user
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = () => {
    try {
      setSaving(true);
      
      // Save settings to local storage
      localStorage.setItem(`${SETTINGS_STORAGE_KEY}_${user.id}`, JSON.stringify(settings));

      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully.',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: 'Failed to update password. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title={t('settings.title')}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('settings.title')}>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">{t('settings.title')}</h1>
        
        <Tabs defaultValue="preferences" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-3">
            <TabsTrigger value="preferences">{t('settings.preferencesTab')}</TabsTrigger>
            <TabsTrigger value="account">{t('settings.accountTab')}</TabsTrigger>
            <TabsTrigger value="notifications">{t('settings.notificationsTab')}</TabsTrigger>
          </TabsList>
          
          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.appearance')}</CardTitle>
                <CardDescription>{t('settings.appearanceDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">{t('settings.theme')}</Label>
                  <div className="flex items-center space-x-4">
                    <Select 
                      value={themePreference}
                      onValueChange={(value) => {
                        // Update theme in ThemeContext
                        setThemePreference(value as 'light' | 'dark' | 'system');
                        // Also update in local settings
                        setSettings({...settings, theme_preference: value as 'light' | 'dark' | 'system'});
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            <span>{t('settings.light')}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            <span>{t('settings.dark')}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            <span>{t('settings.system')}</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">{t('settings.language')}</Label>
                  <Select 
                    value={language}
                    onValueChange={(value) => {
                      // Update language using the i18n system
                      setLanguage(value as SupportedLanguage);
                      // Also update in settings
                      setSettings({...settings, language_preference: value});
                      
                      // Show toast notification
                      toast({
                        title: t('common.success'),
                        description: t('settings.languageUpdated', 'Your language preference has been updated.'),
                      });
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">
                        <div className="flex items-center gap-2">
                          <span>🇺🇸</span>
                          <span>English</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="es">
                        <div className="flex items-center gap-2">
                          <span>🇪🇸</span>
                          <span>Spanish</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="fr">
                        <div className="flex items-center gap-2">
                          <span>🇫🇷</span>
                          <span>French</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="de">
                        <div className="flex items-center gap-2">
                          <span>🇩🇪</span>
                          <span>German</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="zh">
                        <div className="flex items-center gap-2">
                          <span>🇨🇳</span>
                          <span>Chinese</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="high-contrast">{t('settings.highContrast')}</Label>
                    <p className="text-sm text-muted-foreground">{t('settings.highContrastDesc')}</p>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={settings.accessibility_high_contrast}
                    onCheckedChange={(checked) => setSettings({...settings, accessibility_high_contrast: checked})}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.privacy')}</CardTitle>
                <CardDescription>{t('settings.privacyDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-visibility">{t('settings.profileVisibility')}</Label>
                  <Select 
                    value={settings.privacy_profile_visibility}
                    onValueChange={(value) => setSettings({...settings, privacy_profile_visibility: value as 'public' | 'private' | 'friends'})}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>{t('settings.public')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <EyeOff className="h-4 w-4" />
                          <span>{t('settings.private')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="friends">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <span>{t('settings.friendsOnly')}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button onClick={saveSettings} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </TabsContent>
          
          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.accountInfo')}</CardTitle>
                <CardDescription>{t('settings.accountInfoDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('settings.email')}</Label>
                  <Input id="email" value={user?.email || ''} disabled />
                  <p className="text-sm text-muted-foreground">{t('settings.emailDesc', 'Your email address is managed through your account settings.')}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">{t('settings.name')}</Label>
                  <Input id="name" value={user?.name || ''} disabled />
                  <p className="text-sm text-muted-foreground">{t('settings.nameDesc', 'Your name is managed through your profile settings.')}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">{t('settings.role')}</Label>
                  <Input id="role" value={user?.role || ''} disabled />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.password')}</CardTitle>
                <CardDescription>{t('settings.passwordDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">{t('settings.currentPassword')}</Label>
                  <div className="relative">
                    <Input 
                      id="current-password" 
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <button 
                      type="button" 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t('settings.newPassword')}</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t('settings.confirmPassword')}</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handlePasswordChange} 
                  disabled={!currentPassword || !newPassword || !confirmPassword || saving}
                  className="mt-2"
                >
                  {saving ? t('common.loading') : t('settings.updatePassword')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.notificationSettings')}</CardTitle>
                <CardDescription>{t('settings.notificationDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">{t('settings.enableNotifications')}</Label>
                    <p className="text-sm text-muted-foreground">{t('settings.notificationsDesc')}</p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={settings.notification_enabled}
                    onCheckedChange={(checked) => setSettings({...settings, notification_enabled: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">{t('settings.emailNotifications')}</Label>
                    <p className="text-sm text-muted-foreground">{t('settings.emailNotificationsDesc')}</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => setSettings({...settings, email_notifications: checked})}
                    disabled={!settings.notification_enabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sound">{t('settings.soundEffects')}</Label>
                    <p className="text-sm text-muted-foreground">{t('settings.soundEffectsDesc')}</p>
                  </div>
                  <Switch
                    id="sound"
                    checked={settings.sound_enabled}
                    onCheckedChange={(checked) => setSettings({...settings, sound_enabled: checked})}
                    disabled={!settings.notification_enabled}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button onClick={saveSettings} disabled={saving}>
                {saving ? t('common.loading') : t('settings.saveChanges')}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
