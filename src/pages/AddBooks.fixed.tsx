import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookPlus, BookOpen, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';

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

const AddBooks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [genreInput, setGenreInput] = useState('');
  
  const [bookData, setBookData] = useState<BookFormData>({
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

  // Redirect if not a librarian
  React.useEffect(() => {
    if (user && user.role !== 'librarian') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookData(prev => ({
      ...prev,
      [name]: name === 'page_count' || name === 'publication_year' ? parseInt(value) || 0 : value
    }));
  };

  const addGenre = () => {
    if (genreInput.trim() && !bookData.genres.includes(genreInput.trim())) {
      setBookData(prev => ({
        ...prev,
        genres: [...prev.genres, genreInput.trim()]
      }));
      setGenreInput('');
    }
  };

  const removeGenre = (genre: string) => {
    setBookData(prev => ({
      ...prev,
      genres: prev.genres.filter(g => g !== genre)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // Always prevent default form submission behavior
    e.preventDefault();
    
    if (!bookData.title || !bookData.author) {
      toast.error('Title and author are required');
      return;
    }

    try {
      setLoading(true);
      
      // Insert book into database
      const { data, error } = await supabase
        .from('books')
        .insert([
          {
            title: bookData.title,
            author: bookData.author,
            cover_image: bookData.cover_image || null,
            description: bookData.description || null,
            page_count: bookData.page_count || null,
            publication_year: bookData.publication_year || null,
            publisher: bookData.publisher || null,
            genres: bookData.genres.length > 0 ? bookData.genres : null,
            isbn: bookData.isbn || null,
            language: bookData.language || 'English'
          }
        ])
        .select();
      
      if (error) throw error;
      
      // Add a default book copy
      if (data && data[0]) {
        const { error: copyError } = await supabase
          .from('book_copies')
          .insert([
            {
              book_id: data[0].id,
              status: 'available',
              location: 'Main Library',
              condition: 'New'
            }
          ]);
        
        if (copyError) throw copyError;
      }
      
      toast.success('Book added successfully!');
      
      // Reset form
      setBookData({
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
      
    } catch (error: any) {
      console.error('Error adding book:', error);
      toast.error(`Failed to add book: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Add Books" breadcrumbs={[{ label: 'Dashboard', path: '/librarian' }, { label: 'Add Books' }]}>
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-primary/10">
                <BookPlus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Add New Book</CardTitle>
                <CardDescription>Add a new book to the library catalog</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit(e);
                return false;
              }} 
              className="space-y-6"
              id="add-book-form"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="required">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={bookData.title}
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
                    value={bookData.author}
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
                    value={bookData.isbn}
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
                    value={bookData.publisher}
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
                    value={bookData.publication_year}
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
                    value={bookData.page_count}
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
                    value={bookData.language}
                    onChange={handleInputChange}
                    placeholder="Book language"
                  />
                </div>
                
                {/* Cover Image URL */}
                <div className="space-y-2">
                  <Label htmlFor="cover_image">Cover Image URL</Label>
                  <Input
                    id="cover_image"
                    name="cover_image"
                    value={bookData.cover_image}
                    onChange={handleInputChange}
                    placeholder="URL to cover image"
                  />
                </div>
              </div>
              
              {/* Genres */}
              <div className="space-y-2">
                <Label htmlFor="genres">Genres</Label>
                <div className="flex space-x-2">
                  <Input
                    id="genre-input"
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    placeholder="Add a genre"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addGenre();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={(e) => {
                      e.preventDefault();
                      addGenre();
                    }} 
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                
                {bookData.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {bookData.genres.map((genre, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{genre}</span>
                        <button 
                          type="button" 
                          onClick={() => removeGenre(genre)}
                          className="ml-1 h-4 w-4 rounded-full hover:bg-secondary/80 inline-flex items-center justify-center"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={bookData.description}
                  onChange={handleInputChange}
                  placeholder="Book description"
                  rows={4}
                />
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  className="w-full md:w-auto" 
                  disabled={loading}
                  onClick={(e) => handleSubmit(e as any)}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Book...
                    </>
                  ) : (
                    <>
                      <BookPlus className="mr-2 h-4 w-4" />
                      Add Book
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Books added will be immediately available in the catalog with one copy.</p>
          <p>You can manage copies and availability from the book details page.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddBooks;
