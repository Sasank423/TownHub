import React, { useState, useEffect } from 'react';
import { Book, Home, History, Barcode, Check, AlertCircle, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '../integrations/supabase/client';
import { subscribeToTable } from '../utils/supabaseRealtime';
import { RealtimeChannel } from '@supabase/supabase-js';

interface HistoryItem {
  id: string;
  title: string;
  type: 'book' | 'room';
  startDate: string;
  endDate: string;
  returnDate?: string;
  status: 'Completed' | 'Overdue' | 'Returned' | 'Active' | 'Approved' | 'Pending' | 'Declined';
  userId: string;
  userName: string;
}

export const ReservationHistory: React.FC = () => {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingItem, setProcessingItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        // Fetch all reservations with user info
        const { data, error } = await supabase
          .from('reservations')
          .select(`
            id, 
            title, 
            item_id, 
            item_type, 
            start_date, 
            end_date, 
            status, 
            notes,
            user_id,
            profiles(name)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to match our HistoryItem interface
        const transformedData: HistoryItem[] = data.map(item => {
          // Map database status to UI status
          let uiStatus: HistoryItem['status'];
          const now = new Date();
          const endDate = new Date(item.end_date);
          
          if (item.status === 'Approved') {
            if (endDate < now) {
              uiStatus = 'Overdue';
            } else {
              uiStatus = 'Active';
            }
          } else if (item.status === 'Completed') {
            uiStatus = 'Returned';
          } else {
            uiStatus = item.status as HistoryItem['status'];
          }

          return {
            id: item.id,
            title: item.title,
            type: item.item_type,
            startDate: item.start_date,
            endDate: item.end_date,
            status: uiStatus,
            userId: item.user_id,
            userName: item.profiles?.name || 'Unknown User',
            // We don't have return_date in the database yet, so it's undefined for now
          };
        });

        setHistoryData(transformedData);
      } catch (error) {
        console.error("Error fetching reservations:", error);
        toast({
          title: "Error loading reservations",
          description: "Could not load reservation history.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
    
    // Set up real-time subscription for new reservations
    const channel = subscribeToTable('reservations', '*', async (payload) => {
      if (payload.eventType === 'INSERT') {
        // Fetch the complete reservation with user info
        const { data, error } = await supabase
          .from('reservations')
          .select(`
            id, 
            title, 
            item_id, 
            item_type, 
            start_date, 
            end_date, 
            status, 
            notes,
            user_id,
            profiles(name)
          `)
          .eq('id', payload.new.id)
          .single();

        if (!error && data) {
          const now = new Date();
          const endDate = new Date(data.end_date);
          
          let uiStatus: HistoryItem['status'];
          if (data.status === 'Approved') {
            if (endDate < now) {
              uiStatus = 'Overdue';
            } else {
              uiStatus = 'Active';
            }
          } else if (data.status === 'Completed') {
            uiStatus = 'Returned';
          } else {
            uiStatus = data.status as HistoryItem['status'];
          }

          const newItem: HistoryItem = {
            id: data.id,
            title: data.title,
            type: data.item_type,
            startDate: data.start_date,
            endDate: data.end_date,
            status: uiStatus,
            userId: data.user_id,
            userName: data.profiles?.name || 'Unknown User',
          };

          setHistoryData(prev => [newItem, ...prev]);
        }
      } else if (payload.eventType === 'UPDATE') {
        // Update the existing item in our state
        setHistoryData(prev => prev.map(item => {
          if (item.id === payload.new.id) {
            const now = new Date();
            const endDate = new Date(payload.new.end_date);
            
            let uiStatus: HistoryItem['status'];
            if (payload.new.status === 'Approved') {
              if (endDate < now) {
                uiStatus = 'Overdue';
              } else {
                uiStatus = 'Active';
              }
            } else if (payload.new.status === 'Completed') {
              uiStatus = 'Returned';
            } else {
              uiStatus = payload.new.status as HistoryItem['status'];
            }

            return {
              ...item,
              title: payload.new.title,
              startDate: payload.new.start_date,
              endDate: payload.new.end_date,
              status: uiStatus,
              returnDate: payload.new.status === 'Completed' ? format(new Date(), 'yyyy-MM-dd') : item.returnDate
            };
          }
          return item;
        }));
      } else if (payload.eventType === 'DELETE') {
        // Remove the deleted item from our state
        setHistoryData(prev => prev.filter(item => item.id !== payload.old.id));
      }
    });

    return () => {
      // Cleanup subscription
      supabase.removeChannel(channel);
    };
  }, [toast]);

  interface HistoryItem {
    id: string;
    title: string;
    type: 'book' | 'room';
    startDate: string;
    endDate: string;
    returnDate?: string;
    status: 'Completed' | 'Overdue' | 'Returned' | 'Active' | 'Approved' | 'Pending' | 'Declined';
    userId: string;
    userName: string;
  }

  const handleProcessReturn = (item: HistoryItem) => {
    setProcessingItem(item);
  };
  
  const confirmReturn = async () => {
    if (!processingItem) return;
    
    setIsProcessing(true);
    try {
      // Update the reservation status in the database
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'Completed' })
        .eq('id', processingItem.id);
        
      if (error) throw error;
      
      // If it's a book, also update the book copy status
      if (processingItem.type === 'book') {
        const { error: bookError } = await supabase
          .from('book_copies')
          .update({ status: 'available' })
          .eq('book_id', processingItem.id);
          
        if (bookError) console.error("Error updating book copy status:", bookError);
      }
      
      // Create an activity entry
      await supabase.from('activities').insert({
        user_id: processingItem.userId,
        action: 'return',
        description: `returned "${processingItem.title}"`,
        timestamp: new Date().toISOString(),
        item_id: processingItem.id,
        item_type: processingItem.type,
        user_name: processingItem.userName
      });
      
      // Local state update is handled by the realtime subscription
      
      toast({
        title: "Item returned",
        description: `${processingItem.title} has been successfully returned.`,
      });
    } catch (error) {
      console.error("Error processing return:", error);
      toast({
        title: "Error",
        description: "Failed to process return. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingItem(null);
    }
  };

  const handleScanBarcode = async () => {
    if (!barcodeInput) {
      toast({
        title: "Empty barcode",
        description: "Please enter a valid barcode or ID",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Try to find the reservation by ID
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id, 
          title, 
          item_id, 
          item_type, 
          start_date, 
          end_date, 
          status, 
          user_id,
          profiles(name)
        `)
        .eq('id', barcodeInput)
        .in('status', ['Approved'])
        .single();
        
      if (error) {
        // If not found by ID, try to find by item_id (book or room ID)
        const { data: itemData, error: itemError } = await supabase
          .from('reservations')
          .select(`
            id, 
            title, 
            item_id, 
            item_type, 
            start_date, 
            end_date, 
            status, 
            user_id,
            profiles(name)
          `)
          .eq('item_id', barcodeInput)
          .in('status', ['Approved'])
          .single();
          
        if (itemError || !itemData) {
          toast({
            title: "Item not found",
            description: "No active reservation found with this barcode",
            variant: "destructive",
          });
          return;
        }
        
        // Map data to HistoryItem
        const now = new Date();
        const endDate = new Date(itemData.end_date);
        
        const matchedItem: HistoryItem = {
          id: itemData.id,
          title: itemData.title,
          type: itemData.item_type,
          startDate: itemData.start_date,
          endDate: itemData.end_date,
          status: endDate < now ? 'Overdue' : 'Active',
          userId: itemData.user_id,
          userName: itemData.profiles?.name || 'Unknown User'
        };
        
        setProcessingItem(matchedItem);
      } else if (data) {
        // Map data to HistoryItem
        const now = new Date();
        const endDate = new Date(data.end_date);
        
        const matchedItem: HistoryItem = {
          id: data.id,
          title: data.title,
          type: data.item_type,
          startDate: data.start_date,
          endDate: data.end_date,
          status: endDate < now ? 'Overdue' : 'Active',
          userId: data.user_id,
          userName: data.profiles?.name || 'Unknown User'
        };
        
        setProcessingItem(matchedItem);
      }
    } catch (error) {
      console.error("Error scanning barcode:", error);
      toast({
        title: "Error",
        description: "An error occurred while processing the barcode",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setBarcodeInput('');
    }
  };

  const formatDate = (dateString: string) => {
    if (dateString.includes('T')) {
      return format(new Date(dateString), 'MMM d, h:mm a');
    }
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const getDaysOverdue = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = today.getTime() - end.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredHistory = historyData.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const activeItems = filteredHistory.filter(item => ['Active', 'Overdue'].includes(item.status));
  const completedItems = filteredHistory.filter(item => ['Returned', 'Completed'].includes(item.status));

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium flex items-center dark:text-white">
            <Barcode className="mr-2 h-5 w-5 text-primary" />
            Returns Processing
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Input
              placeholder="Scan or enter item barcode/ID..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="pl-3"
              onKeyDown={(e) => e.key === 'Enter' && handleScanBarcode()}
              disabled={isProcessing}
            />
          </div>
          <Button onClick={handleScanBarcode} disabled={isProcessing}>
            {isProcessing ? (
              <Clock className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Barcode className="h-4 w-4 mr-2" />
            )}
            Process Return
          </Button>
        </div>

        {/* Return dialog */}
        {processingItem && (
          <Dialog open={!!processingItem} onOpenChange={() => setProcessingItem(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Process Return</DialogTitle>
                <DialogDescription>
                  Confirm return of the following item:
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className={`p-2 rounded-lg ${processingItem.type === 'book' ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-purple-100 dark:bg-purple-900/20'}`}>
                    {processingItem.type === 'book' ? (
                      <Book className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    ) : (
                      <Home className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium dark:text-white">{processingItem.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Checked out by {processingItem.userName}
                    </p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Due {formatDate(processingItem.endDate)}
                      </span>
                    </div>
                    {processingItem.status === 'Overdue' && (
                      <Badge variant="destructive" className="mt-2">
                        {getDaysOverdue(processingItem.endDate)} days overdue
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setProcessingItem(null)}>Cancel</Button>
                <Button onClick={confirmReturn} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Confirm Return'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium flex items-center dark:text-white">
            <History className="mr-2 h-5 w-5 text-primary" />
            Reservation History
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search by title or member name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-3"
            />
          </div>
          <Button variant="outline">
            Export Records
          </Button>
        </div>

        {loading ? (
          <div className="py-8">
            <div className="flex justify-center">
              <Clock className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-center text-gray-500 dark:text-gray-400 mt-2">Loading reservations...</p>
          </div>
        ) : (
          <Tabs defaultValue="active">
            <TabsList className="mb-4">
              <TabsTrigger value="active">
                Active/Overdue
                <Badge variant="outline" className="ml-2 bg-gray-100 dark:bg-gray-800">
                  {activeItems.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                <Badge variant="outline" className="ml-2 bg-gray-100 dark:bg-gray-800">
                  {completedItems.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No active or overdue items
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {item.type === 'book' ? (
                              <Book className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                            ) : (
                              <Home className="h-4 w-4 mr-2 text-purple-500 dark:text-purple-400" />
                            )}
                            {item.title}
                          </div>
                        </TableCell>
                        <TableCell>{item.userName}</TableCell>
                        <TableCell>{formatDate(item.startDate)}</TableCell>
                        <TableCell>{formatDate(item.endDate)}</TableCell>
                        <TableCell>
                          {item.status === 'Overdue' ? (
                            <Badge variant="destructive">
                              {getDaysOverdue(item.endDate)} days overdue
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => handleProcessReturn(item)}>
                            Process Return
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="completed">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No completed reservations
                      </TableCell>
                    </TableRow>
                  ) : (
                    completedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {item.type === 'book' ? (
                              <Book className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                            ) : (
                              <Home className="h-4 w-4 mr-2 text-purple-500 dark:text-purple-400" />
                            )}
                            {item.title}
                          </div>
                        </TableCell>
                        <TableCell>{item.userName}</TableCell>
                        <TableCell>{formatDate(item.startDate)}</TableCell>
                        <TableCell>{formatDate(item.endDate)}</TableCell>
                        <TableCell>{item.returnDate ? formatDate(item.returnDate) : 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={item.status === 'Returned' ? 
                            'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' : 
                            'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                          }>
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};
