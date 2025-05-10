import React, { useState } from 'react';
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

interface HistoryItem {
  id: string;
  title: string;
  type: 'book' | 'room';
  startDate: string;
  endDate: string;
  returnDate?: string;
  status: 'Completed' | 'Overdue' | 'Returned' | 'Active';
  userId: string;
  userName: string;
}

// Sample history data
const mockHistoryData: HistoryItem[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    type: 'book',
    startDate: '2025-04-10',
    endDate: '2025-04-24',
    returnDate: '2025-04-22',
    status: 'Returned',
    userId: '1',
    userName: 'John Doe'
  },
  {
    id: '2',
    title: 'Study Room A',
    type: 'room',
    startDate: '2025-04-15T13:00',
    endDate: '2025-04-15T15:00',
    status: 'Completed',
    userId: '2',
    userName: 'Jane Smith'
  },
  {
    id: '3',
    title: '1984',
    type: 'book',
    startDate: '2025-04-01',
    endDate: '2025-04-15',
    status: 'Overdue',
    userId: '3',
    userName: 'Robert Johnson'
  },
  {
    id: '4',
    title: 'Conference Room B',
    type: 'room',
    startDate: '2025-05-01T10:00',
    endDate: '2025-05-01T12:00',
    status: 'Active',
    userId: '1',
    userName: 'John Doe'
  },
  {
    id: '5',
    title: 'To Kill a Mockingbird',
    type: 'book',
    startDate: '2025-04-05',
    endDate: '2025-04-19',
    returnDate: '2025-04-18',
    status: 'Returned',
    userId: '2',
    userName: 'Jane Smith'
  }
];

export const ReservationHistory: React.FC = () => {
  const [historyData, setHistoryData] = useState<HistoryItem[]>(mockHistoryData);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingItem, setProcessingItem] = useState<HistoryItem | null>(null);
  const { toast } = useToast();

  const handleProcessReturn = (item: HistoryItem) => {
    setProcessingItem(item);
  };
  
  const confirmReturn = () => {
    if (!processingItem) return;
    
    setHistoryData(prev => 
      prev.map(item => 
        item.id === processingItem.id 
          ? { ...item, status: 'Returned', returnDate: format(new Date(), 'yyyy-MM-dd') }
          : item
      )
    );
    
    toast({
      title: "Item returned",
      description: `${processingItem.title} has been successfully returned.`,
    });
    
    setProcessingItem(null);
  };

  const handleScanBarcode = () => {
    if (!barcodeInput) {
      toast({
        title: "Empty barcode",
        description: "Please enter a valid barcode or ID",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    // Simulate processing delay
    setTimeout(() => {
      const matchedItem = historyData.find(
        item => item.id === barcodeInput && (item.status === 'Active' || item.status === 'Overdue')
      );
      
      if (matchedItem) {
        setProcessingItem(matchedItem);
      } else {
        toast({
          title: "Item not found",
          description: "No active or overdue item found with this barcode",
          variant: "destructive",
        });
      }
      setIsProcessing(false);
      setBarcodeInput('');
    }, 500);
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
                <Button onClick={confirmReturn}>Confirm Return</Button>
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
      </div>
    </div>
  );
};
