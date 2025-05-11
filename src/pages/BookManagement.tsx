import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { BookPlus, Loader2, Upload, Image as ImageIcon, Book, Search, Edit, Trash2, Plus, Filter, RefreshCw, BookOpen, CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import { v4 as uuidv4 } from 'uuid';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface BookData {
  id: string;
  title: string;
  author: string;
  cover_image: string;
  description: string;
  page_count: number;
  publication_year: number;
  publisher: string;
  genres: string[];
  isbn: string;
  language: string;
  added_date: string;
  rating: number;
  copies_available?: number;
  total_copies?: number;
}

interface BookFormData {
  title: string;
  author: string;
  cover_image: string;
  description: string;
  page_count: number;
  publication_year: number;
  publisher: string;
  genres: string[];
  isbn: string;
  language: string;
}

const BookManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<BookData[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddBookDialogOpen, setIsAddBookDialogOpen] = useState(false);
  const [isEditBookDialogOpen, setIsEditBookDialogOpen] = useState(false);
  const [isDeleteBookDialogOpen, setIsDeleteBookDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookData | null>(null);
  const [selectedBookForAvailability, setSelectedBookForAvailability] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isBookAvailable, setIsBookAvailable] = useState<boolean>(true);
  const [newCopiesCount, setNewCopiesCount] = useState<number>(1);
  const [availableCopiesCount, setAvailableCopiesCount] = useState<number>(0);
  const [totalCopiesCount, setTotalCopiesCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  
  // Form state for adding/editing a book
  const [genreInput, setGenreInput] = useState('');
  const [bookFormData, setBookFormData] = useState<BookFormData>({
    title: '',
    author: '',
    cover_image: '',
    description: '',
    page_count: 0,
    publication_year: new Date().getFullYear(),
    publisher: '',
    genres: [],
    isbn: '',
    language: 'English'
  });
  
  const [uploading, setUploading] = useState(false);

  // Redirect if not a librarian
  React.useEffect(() => {
    if (user && user.role !== 'librarian') {
      navigate('/');
    }
  }, [user, navigate]);

  // Get all unique genres from books
  const allGenres = React.useMemo(() => {
    const genres = new Set<string>();
    books.forEach(book => {
      if (book.genres) {
        book.genres.forEach(genre => genres.add(genre));
      }
    });
    return Array.from(genres).sort();
  }, [books]);

  // Fetch all books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        
        // Get all books
        const { data: booksData, error: booksError } = await supabase
          .from('books')
          .select('*');
          
        if (booksError) throw booksError;
        
        if (booksData) {
          // For each book, get the count of available copies
          const booksWithCopies = await Promise.all(booksData.map(async (book) => {
            // Get total copies
            const { count: totalCopies } = await supabase
              .from('book_copies')
              .select('id', { count: 'exact', head: true })
              .eq('book_id', book.id);
              
            // Get available copies
            const { count: availableCopies } = await supabase
              .from('book_copies')
              .select('id', { count: 'exact', head: true })
              .eq('book_id', book.id)
              .eq('status', 'available');
              
            return {
              ...book,
              copies_available: availableCopies || 0,
              total_copies: totalCopies || 0
            } as BookData;
          }));
          
          setBooks(booksWithCopies);
          setFilteredBooks(booksWithCopies);
        }
      } catch (error) {
        console.error('Error fetching books:', error);
        toast.error('Failed to load books');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooks();
  }, []);
  
  // Filter books based on search query, genre filter, and availability filter
  useEffect(() => {
    let result = books;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(book => 
        book.title.toLowerCase().includes(query) || 
        book.author.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query)
      );
    }
    
    // Apply genre filter
    if (genreFilter !== 'all') {
      result = result.filter(book => 
        book.genres && book.genres.includes(genreFilter)
      );
    }
    
    // Apply availability filter
    if (availabilityFilter === 'available') {
      result = result.filter(book => 
        (book.copies_available || 0) > 0
      );
    } else if (availabilityFilter === 'unavailable') {
      result = result.filter(book => 
        (book.copies_available || 0) === 0
      );
    }
    
    setFilteredBooks(result);
  }, [searchQuery, genreFilter, availabilityFilter, books]);

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookFormData(prev => ({
      ...prev,
      [name]: name === 'page_count' || name === 'publication_year' ? parseInt(value) || 0 : value
    }));
  };

  // Add genre to form data
  const addGenre = () => {
    if (genreInput.trim() && !bookFormData.genres.includes(genreInput.trim())) {
      setBookFormData(prev => ({
        ...prev,
        genres: [...prev.genres, genreInput.trim()]
      }));
      setGenreInput('');
    }
  };

  // Remove genre from form data
  const removeGenre = (genre: string) => {
    setBookFormData(prev => ({
      ...prev,
      genres: prev.genres.filter(g => g !== genre)
    }));
  };

  // Initialize edit form with selected book data
  const initializeEditForm = (book: BookData) => {
    setBookFormData({
      title: book.title,
      author: book.author,
      cover_image: book.cover_image,
      description: book.description || '',
      page_count: book.page_count || 0,
      publication_year: book.publication_year || new Date().getFullYear(),
      publisher: book.publisher || '',
      genres: book.genres || [],
      isbn: book.isbn || '',
      language: book.language || 'English'
    });
  };
  
  // Fetch book copies information
  const fetchBookCopies = async (bookId: string) => {
    try {
      setLoading(true);
      
      // Get total copies
      const { count: totalCopies, error: totalError } = await supabase
        .from('book_copies')
        .select('id', { count: 'exact', head: true })
        .eq('book_id', bookId);
        
      if (totalError) throw totalError;
      
      // Fetch book copies
      const { data: copies, error } = await supabase
        .from('book_copies')
        .select('*')
        .eq('book_id', bookId);
        
      if (error) throw error;
      
      if (copies) {
        const totalCopies = copies.length;
        const availableCopies = copies.filter(copy => copy.status === 'available').length;
        
        setTotalCopiesCount(totalCopies);
        setAvailableCopiesCount(availableCopies);
      }
    } catch (error) {
      console.error('Error fetching book copies:', error);
      toast.error('Failed to fetch book copies');
    } finally {
      setLoading(false);
    }
  };
  
  // Interface for book availability
  interface BookAvailability {
    id: string;
    book_id: string;
    date: string;
    is_available: boolean;
  }

  // Fetch book availability
  const fetchBookAvailability = async (bookId: string) => {
    try {
      // Get book copies to determine availability
      const { data: copies, error } = await supabase
        .from('book_copies')
        .select('id, status')
        .eq('book_id', bookId);
        
      if (error) {
        console.error('Error fetching copies:', error);
        throw error;
      }
      
      if (copies && copies.length > 0) {
        // Check if any copies are available
        const availableCopies = copies.filter(copy => copy.status === 'available').length;
        setIsBookAvailable(availableCopies > 0);
        setTotalCopiesCount(copies.length);
        setAvailableCopiesCount(availableCopies);
      } else {
        // No copies exist
        setIsBookAvailable(false);
        setTotalCopiesCount(0);
        setAvailableCopiesCount(0);
      }
    } catch (error) {
      console.error('Error fetching book availability:', error);
      toast.error('Failed to fetch book availability');
    }
  };
  
  // Save book availability
  const saveBookAvailability = async () => {
    if (!selectedBookForAvailability) return;
    
    try {
      // Get all copies for the book
      const { data: copies, error: fetchError } = await supabase
        .from('book_copies')
        .select('id, status')
        .eq('book_id', selectedBookForAvailability);
        
      if (fetchError) throw fetchError;
      
      if (!copies || copies.length === 0) {
        toast.error('No copies available for this book');
        return;
      }
      
      const currentAvailable = copies.filter(copy => copy.status === 'available').length;
      
      // If we want the book to be available but there are no available copies
      if (isBookAvailable && currentAvailable === 0) {
        // Make one copy available
        const nonAvailableCopy = copies.find(copy => copy.status !== 'available');
        if (nonAvailableCopy) {
          const { error: updateError } = await supabase
            .from('book_copies')
            .update({ status: 'available' })
            .eq('id', nonAvailableCopy.id);
            
          if (updateError) throw updateError;
        } else {
          toast.error('No copies can be made available');
          return;
        }
      } 
      // If we want the book to be unavailable but there are available copies
      else if (!isBookAvailable && currentAvailable > 0) {
        // Make all copies unavailable
        const availableCopies = copies.filter(copy => copy.status === 'available');
        
        for (const copy of availableCopies) {
          const { error: updateError } = await supabase
            .from('book_copies')
            .update({ status: 'checked-out' })
            .eq('id', copy.id);
            
          if (updateError) throw updateError;
        }
      }
      
      toast.success('Book availability updated successfully');
    } catch (error) {
      console.error('Error saving book availability:', error);
      toast.error('Failed to update book availability');
    }
  };
  
  // Add new copies to a book
  const handleAddCopies = async () => {
    if (!selectedBookForAvailability || newCopiesCount <= 0) return;
    
    try {
      // Create an array of new copy objects
      const newCopies = Array.from({ length: newCopiesCount }, () => ({
        book_id: selectedBookForAvailability,
        status: 'available' as 'available' | 'reserved' | 'checked-out'
      }));
      
      // Insert new copies into the database
      const { error } = await supabase
        .from('book_copies')
        .insert(newCopies);
        
      if (error) throw error;
      
      // Update local state
      setTotalCopiesCount(prev => prev + newCopiesCount);
      setAvailableCopiesCount(prev => prev + newCopiesCount);
      
      // Update the book in the books list
      const updatedBooks = books.map(book => 
        book.id === selectedBookForAvailability ? {
          ...book,
          total_copies: (book.total_copies || 0) + newCopiesCount,
          copies_available: (book.copies_available || 0) + newCopiesCount
        } : book
      );
      
      setBooks(updatedBooks);
      setFilteredBooks(updatedBooks);
      
      toast.success(`Added ${newCopiesCount} new copies successfully`);
      setNewCopiesCount(1); // Reset the input
    } catch (error) {
      console.error('Error adding copies:', error);
      toast.error('Failed to add new copies');
    }
  };
  
  // Update available copies
  const handleUpdateAvailability = async () => {
    if (!selectedBookForAvailability) return;
    
    try {
      // Get all copies for the book
      const { data: copies, error: fetchError } = await supabase
        .from('book_copies')
        .select('id, status')
        .eq('book_id', selectedBookForAvailability);
        
      if (fetchError) throw fetchError;
      
      if (!copies) return;
      
      const currentAvailable = copies.filter(copy => copy.status === 'available').length;
      const currentTotal = copies.length;
      
      if (availableCopiesCount > currentTotal) {
        toast.error(`Cannot set available copies higher than total copies (${currentTotal})`);
        return;
      }
      
      // Determine how many copies to update
      if (availableCopiesCount > currentAvailable) {
        // Need to make more copies available
        const additionalAvailable = availableCopiesCount - currentAvailable;
        const unavailableCopies = copies.filter(copy => copy.status !== 'available');
        
        if (additionalAvailable > unavailableCopies.length) {
          toast.error('Not enough unavailable copies to update');
          return;
        }
        
        // Update the status of the required number of copies
        const copiesToUpdate = unavailableCopies.slice(0, additionalAvailable);
        
        for (const copy of copiesToUpdate) {
          await supabase
            .from('book_copies')
            .update({ status: 'available' })
            .eq('id', copy.id);
        }
      } else if (availableCopiesCount < currentAvailable) {
        // Need to make fewer copies available
        const reduceAvailable = currentAvailable - availableCopiesCount;
        const availableCopies = copies.filter(copy => copy.status === 'available');
        
        // Update the status of the required number of copies
        const copiesToUpdate = availableCopies.slice(0, reduceAvailable);
        
        for (const copy of copiesToUpdate) {
          await supabase
            .from('book_copies')
            .update({ status: 'checked-out' as 'available' | 'reserved' | 'checked-out' })
            .eq('id', copy.id);
        }
      }
      
      // Update the book in the books list
      const updatedBooks = books.map(book => 
        book.id === selectedBookForAvailability ? {
          ...book,
          copies_available: availableCopiesCount
        } : book
      );
      
      setBooks(updatedBooks);
      setFilteredBooks(updatedBooks);
      
      toast.success('Book availability updated successfully');
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  return (
    <DashboardLayout 
      title="Book Management" 
      breadcrumbs={[
        { label: 'Dashboard', path: '/librarian' }, 
        { label: 'Book Management' }
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
                placeholder="Search books..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {allGenres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Books</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button className="gap-2" asChild>
            <Link to="/add-books">
              <BookPlus size={16} />
              Add New Book
            </Link>
          </Button>
        </div>
        
        {/* Tabs for Books List and Availability */}
        <Tabs defaultValue="books" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>
          
          <TabsContent value="books">
            <Card>
          <CardHeader>
            <CardTitle>Library Books</CardTitle>
            <CardDescription>
              Manage library books and copies
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 rounded-md border p-4">
                    <div className="h-16 w-12 rounded bg-gray-200 animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-10">
                <Book className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No books found</h3>
                <p className="text-muted-foreground mt-2">
                  {searchQuery || genreFilter !== 'all' || availabilityFilter !== 'all' ? 
                    'Try adjusting your search or filters' : 
                    'Start by adding a new book'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBooks.map((book) => (
                  <div key={book.id} className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 rounded-md border p-4 transition-colors hover:bg-muted/50">
                    <div className="flex items-center space-x-4">
                      {book.cover_image ? (
                        <img 
                          src={book.cover_image} 
                          alt={`${book.title} cover`} 
                          className="h-16 w-12 object-cover rounded" 
                        />
                      ) : (
                        <div className="h-16 w-12 bg-muted flex items-center justify-center rounded">
                          <BookOpen className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{book.title}</div>
                        <div className="text-sm text-muted-foreground">by {book.author}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {book.genres && book.genres.slice(0, 2).map(genre => (
                            <Badge key={genre} variant="outline" className="text-xs">
                              {genre}
                            </Badge>
                          ))}
                          {book.genres && book.genres.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{book.genres.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                      <div className="text-sm text-muted-foreground">
                        {book.publication_year && <span>Published: {book.publication_year}</span>}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={book.copies_available && book.copies_available > 0 ? 'default' : 'destructive'}>
                          {book.copies_available}/{book.total_copies} Available
                        </Badge>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setSelectedBook(book);
                            initializeEditForm(book);
                            setIsEditBookDialogOpen(true);
                          }}>
                            <Edit className="h-4 w-4 mr-2" /> Edit Book
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedBook(book);
                            setIsDeleteBookDialogOpen(true);
                          }}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Book
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
              Showing {filteredBooks.length} of {books.length} books
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
          </TabsContent>
          
          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Book Availability</CardTitle>
                <CardDescription>
                  Manage when books are available for reservation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="select-book">Select Book</Label>
                      <Select value={selectedBookForAvailability} onValueChange={(value) => {
                        setSelectedBookForAvailability(value);
                        fetchBookAvailability(value);
                      }}>
                        <SelectTrigger id="select-book">
                          <SelectValue placeholder="Select a book" />
                        </SelectTrigger>
                        <SelectContent>
                          {books.map(book => (
                            <SelectItem key={book.id} value={book.id}>{book.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="select-date">Select Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  {selectedBookForAvailability && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Availability Status</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Is Available:</span>
                          <Switch 
                            checked={isBookAvailable} 
                            onCheckedChange={setIsBookAvailable} 
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button onClick={saveBookAvailability}>
                          Save Availability
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => {
                  if (selectedBookForAvailability) {
                    fetchBookAvailability(selectedBookForAvailability);
                  }
                }}>
                  <RefreshCw className="h-3 w-3" /> Refresh
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Book Dialog */}
      <Dialog open={isAddBookDialogOpen} onOpenChange={setIsAddBookDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
            <DialogDescription>
              Add a new book to the library catalog
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="required">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={bookFormData.title}
                  onChange={handleInputChange}
                  placeholder="Book title"
                  required
                />
              </div>
              
              {/* Author */}
              <div className="space-y-2">
                <Label htmlFor="author" className="required">Author</Label>
                <Input
                  id="author"
                  name="author"
                  value={bookFormData.author}
                  onChange={handleInputChange}
                  placeholder="Author name"
                  required
                />
              </div>
              
              {/* ISBN */}
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  name="isbn"
                  value={bookFormData.isbn}
                  onChange={handleInputChange}
                  placeholder="ISBN number"
                />
              </div>
              
              {/* Publisher */}
              <div className="space-y-2">
                <Label htmlFor="publisher">Publisher</Label>
                <Input
                  id="publisher"
                  name="publisher"
                  value={bookFormData.publisher}
                  onChange={handleInputChange}
                  placeholder="Publisher name"
                />
              </div>
              
              {/* Publication Year */}
              <div className="space-y-2">
                <Label htmlFor="publication_year">Publication Year</Label>
                <Input
                  id="publication_year"
                  name="publication_year"
                  type="number"
                  value={bookFormData.publication_year}
                  onChange={handleInputChange}
                  placeholder="Publication year"
                />
              </div>
              
              {/* Page Count */}
              <div className="space-y-2">
                <Label htmlFor="page_count">Page Count</Label>
                <Input
                  id="page_count"
                  name="page_count"
                  type="number"
                  value={bookFormData.page_count}
                  onChange={handleInputChange}
                  placeholder="Number of pages"
                />
              </div>
              
              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  name="language"
                  value={bookFormData.language}
                  onChange={handleInputChange}
                  placeholder="Book language"
                />
              </div>
              
              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={bookFormData.description}
                  onChange={handleInputChange}
                  placeholder="Book description"
                  className="min-h-[100px]"
                />
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setIsAddBookDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={async () => {
                try {
                  // Generate a new ID for the book
                  const newBookId = uuidv4();
                  
                  // Add book to Supabase database
                  const { error } = await supabase
                    .from('books')
                    .insert({
                      id: newBookId,
                      title: bookFormData.title,
                      author: bookFormData.author,
                      isbn: bookFormData.isbn,
                      publisher: bookFormData.publisher,
                      publication_year: bookFormData.publication_year,
                      page_count: bookFormData.page_count,
                      language: bookFormData.language,
                      description: bookFormData.description,
                      genres: bookFormData.genres,
                      cover_image: bookFormData.cover_image,
                      added_date: new Date().toISOString(),
                      rating: 0
                    });
                  
                  if (error) throw error;
                  
                  // Add a default number of copies (e.g., 5)
                  const totalCopies = 5;
                  for (let i = 0; i < totalCopies; i++) {
                    await supabase
                      .from('book_copies')
                      .insert({
                        book_id: newBookId,
                        status: 'available'
                      });
                  }
                  
                  // Add the new book to local state
                  const newBook = {
                    ...bookFormData,
                    id: newBookId,
                    copies_available: totalCopies,
                    total_copies: totalCopies,
                    added_date: new Date().toISOString(),
                    rating: 0
                  };
                  
                  setBooks([...books, newBook]);
                  setFilteredBooks([...books, newBook]);
                  toast.success('Book added successfully');
                  
                  // Reset form data
                  setBookFormData({
                    title: '',
                    author: '',
                    cover_image: '',
                    description: '',
                    page_count: 0,
                    publication_year: new Date().getFullYear(),
                    publisher: '',
                    genres: [],
                    isbn: '',
                    language: 'English'
                  });
                  
                  setIsAddBookDialogOpen(false);
                } catch (error) {
                  console.error('Error adding book:', error);
                  toast.error('Failed to add book');
                }
              }}>
                Add Book
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Book Dialog */}
      <Dialog open={isEditBookDialogOpen} onOpenChange={setIsEditBookDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
            <DialogDescription>
              Update book information in the library catalog
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="required">Title</Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={bookFormData.title}
                  onChange={handleInputChange}
                  placeholder="Book title"
                  required
                />
              </div>
              
              {/* Author */}
              <div className="space-y-2">
                <Label htmlFor="edit-author" className="required">Author</Label>
                <Input
                  id="edit-author"
                  name="author"
                  value={bookFormData.author}
                  onChange={handleInputChange}
                  placeholder="Author name"
                  required
                />
              </div>
              
              {/* ISBN */}
              <div className="space-y-2">
                <Label htmlFor="edit-isbn">ISBN</Label>
                <Input
                  id="edit-isbn"
                  name="isbn"
                  value={bookFormData.isbn}
                  onChange={handleInputChange}
                  placeholder="ISBN number"
                />
              </div>
              
              {/* Publisher */}
              <div className="space-y-2">
                <Label htmlFor="edit-publisher">Publisher</Label>
                <Input
                  id="edit-publisher"
                  name="publisher"
                  value={bookFormData.publisher}
                  onChange={handleInputChange}
                  placeholder="Publisher name"
                />
              </div>
              
              {/* Publication Year */}
              <div className="space-y-2">
                <Label htmlFor="edit-publication_year">Publication Year</Label>
                <Input
                  id="edit-publication_year"
                  name="publication_year"
                  type="number"
                  value={bookFormData.publication_year}
                  onChange={handleInputChange}
                  placeholder="Publication year"
                />
              </div>
              
              {/* Page Count */}
              <div className="space-y-2">
                <Label htmlFor="edit-page_count">Page Count</Label>
                <Input
                  id="edit-page_count"
                  name="page_count"
                  type="number"
                  value={bookFormData.page_count}
                  onChange={handleInputChange}
                  placeholder="Number of pages"
                />
              </div>
              
              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="edit-language">Language</Label>
                <Input
                  id="edit-language"
                  name="language"
                  value={bookFormData.language}
                  onChange={handleInputChange}
                  placeholder="Book language"
                />
              </div>
              
              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={bookFormData.description}
                  onChange={handleInputChange}
                  placeholder="Book description"
                  className="min-h-[100px]"
                />
              </div>
              
              {/* Copies Available */}
              <div className="space-y-2">
                <Label htmlFor="edit-copies_available">Copies Available</Label>
                <Input
                  id="edit-copies_available"
                  name="copies_available"
                  type="number"
                  value={selectedBook?.copies_available || 0}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              {/* Total Copies */}
              <div className="space-y-2">
                <Label htmlFor="edit-total_copies">Total Copies</Label>
                <Input
                  id="edit-total_copies"
                  name="total_copies"
                  type="number"
                  value={selectedBook?.total_copies || 0}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setIsEditBookDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={async () => {
                if (selectedBook) {
                  try {
                    // Update book in Supabase database
                    const { error } = await supabase
                      .from('books')
                      .update({
                        title: bookFormData.title,
                        author: bookFormData.author,
                        isbn: bookFormData.isbn,
                        publisher: bookFormData.publisher,
                        publication_year: bookFormData.publication_year,
                        page_count: bookFormData.page_count,
                        language: bookFormData.language,
                        description: bookFormData.description,
                        genres: bookFormData.genres
                      })
                      .eq('id', selectedBook.id);
                    
                    if (error) throw error;
                    
                    // Update local state
                    const updatedBooks = books.map(book => 
                      book.id === selectedBook.id ? {
                        ...book,
                        title: bookFormData.title,
                        author: bookFormData.author,
                        isbn: bookFormData.isbn,
                        publisher: bookFormData.publisher,
                        publication_year: bookFormData.publication_year,
                        page_count: bookFormData.page_count,
                        language: bookFormData.language,
                        description: bookFormData.description,
                        genres: bookFormData.genres
                      } : book
                    );
                    
                    setBooks(updatedBooks);
                    setFilteredBooks(updatedBooks);
                    toast.success('Book updated successfully');
                    setIsEditBookDialogOpen(false);
                  } catch (error) {
                    console.error('Error updating book:', error);
                    toast.error('Failed to update book');
                  }
                }
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Book Dialog */}
      <Dialog open={isDeleteBookDialogOpen} onOpenChange={setIsDeleteBookDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Book</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this book? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBook && (
            <div className="flex items-center space-x-4 py-4">
              {selectedBook.cover_image ? (
                <img 
                  src={selectedBook.cover_image} 
                  alt={`${selectedBook.title} cover`} 
                  className="h-16 w-12 object-cover rounded" 
                />
              ) : (
                <div className="h-16 w-12 bg-muted flex items-center justify-center rounded">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <div className="font-medium">{selectedBook.title}</div>
                <div className="text-sm text-muted-foreground">by {selectedBook.author}</div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteBookDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={async () => {
              if (selectedBook) {
                try {
                  // First delete all book copies from the database
                  const { error: copiesError } = await supabase
                    .from('book_copies')
                    .delete()
                    .eq('book_id', selectedBook.id);
                    
                  if (copiesError) throw copiesError;
                  
                  // Then delete the book from the database
                  const { error } = await supabase
                    .from('books')
                    .delete()
                    .eq('id', selectedBook.id);
                    
                  if (error) throw error;
                  
                  // Update local state
                  const updatedBooks = books.filter(book => book.id !== selectedBook.id);
                  setBooks(updatedBooks);
                  setFilteredBooks(updatedBooks);
                  toast.success('Book deleted successfully');
                  setIsDeleteBookDialogOpen(false);
                } catch (error) {
                  console.error('Error deleting book:', error);
                  toast.error('Failed to delete book');
                }
              }
            }}>
              Delete Book
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BookManagement;
