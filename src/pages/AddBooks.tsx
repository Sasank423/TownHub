import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookPlus, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import { v4 as uuidv4 } from 'uuid';

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
  
  const [uploading, setUploading] = useState(false);

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
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    setUploading(true);
    console.log('Starting book cover image upload...');

    try {
      const file = event.target.files[0];
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size exceeds 2MB limit');
        setUploading(false);
        return;
      }
      
      console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `book_cover_${uuidv4()}.${fileExt}`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file);
        
      if (error) {
        throw error;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);
        
      console.log('Image uploaded successfully. Public URL:', publicUrl);
      
      // Update book data with the image URL
      setBookData({
        ...bookData,
        cover_image: publicUrl
      });
      
      toast.success('Cover image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
      
      // Fallback to placeholder if upload fails
      const placeholderUrl = `https://placehold.co/400x600/1e293b/ffffff?text=${encodeURIComponent(bookData.title || 'Book Cover')}`;
      setBookData({
        ...bookData,
        cover_image: placeholderUrl
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAddBook = async () => {
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
            <div className="space-y-6">
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
                
                {/* Cover Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="cover_image">Cover Image</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="cover-image-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/40 hover:bg-muted/60 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {uploading ? (
                              <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                            ) : (
                              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                            )}
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG or WEBP (MAX. 2MB)
                            </p>
                          </div>
                          <input 
                            id="cover-image-upload" 
                            type="file" 
                            className="hidden" 
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                        </label>
                      </div>
                    </div>
                    
                    {/* Image Preview */}
                    <div className="flex items-center justify-center">
                      {bookData.cover_image ? (
                        <div className="relative group">
                          <img 
                            src={bookData.cover_image} 
                            alt="Book cover preview" 
                            className="h-40 object-contain rounded-md" 
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setBookData({...bookData, cover_image: ''})}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <ImageIcon className="w-8 h-8 mb-2" />
                          <p className="text-sm">No image uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
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
                  onClick={handleAddBook}
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
            </div>
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
