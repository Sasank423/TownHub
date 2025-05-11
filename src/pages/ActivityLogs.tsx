import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { Search, Filter, RefreshCw, BookOpen, Calendar, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  item_id: string;
  item_type: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  is_processed: boolean;
}

const ActivityLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch all activity logs
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .order('timestamp', { ascending: false });

        if (error) throw error;

        if (data) {
          setLogs(data as ActivityLog[]);
          setFilteredLogs(data as ActivityLog[]);
        }
      } catch (error) {
        console.error('Error fetching activity logs:', error);
        toast.error('Failed to fetch activity logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Filter logs based on search query and filters
  useEffect(() => {
    let result = logs;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        log =>
          log.description.toLowerCase().includes(query) ||
          log.user_name.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query)
      );
    }

    // Apply action filter
    if (actionFilter !== 'all') {
      result = result.filter(log => log.action === actionFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(log => log.item_type === typeFilter);
    }

    setFilteredLogs(result);
  }, [logs, searchQuery, actionFilter, typeFilter]);

  // Get unique action types for filter
  const actionTypes = ['all', ...new Set(logs.map(log => log.action))];
  
  // Get unique item types for filter
  const itemTypes = ['all', ...new Set(logs.map(log => log.item_type))];

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return timestamp;
    }
  };

  // Get badge color based on action
  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'checkout':
        return 'bg-blue-500';
      case 'return':
        return 'bg-green-500';
      case 'reserve':
        return 'bg-purple-500';
      case 'cancel':
        return 'bg-red-500';
      case 'create':
        return 'bg-teal-500';
      case 'update':
        return 'bg-amber-500';
      case 'delete':
        return 'bg-rose-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Refresh logs
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (data) {
        setLogs(data as ActivityLog[]);
        setFilteredLogs(data as ActivityLog[]);
        toast.success('Activity logs refreshed');
      }
    } catch (error) {
      console.error('Error refreshing activity logs:', error);
      toast.error('Failed to refresh activity logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Activity Logs">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
          <Button variant="outline" size="sm" className="gap-1" onClick={handleRefresh}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Library Activity</CardTitle>
            <CardDescription>
              View all activity in the library including checkouts, returns, reservations, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search and filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search logs..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter by action" />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypes.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action === 'all' ? 'All Actions' : action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type === 'all' ? 'All Types' : type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Activity log list */}
              <div className="border rounded-md">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                    <p>Loading activity logs...</p>
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>No activity logs found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredLogs.map((log) => (
                      <div key={log.id} className="p-4 hover:bg-muted/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getActionBadgeColor(log.action)}>
                              {log.action}
                            </Badge>
                            <span className="font-medium">{log.description}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              {log.user_name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {formatTimestamp(log.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ActivityLogs;
