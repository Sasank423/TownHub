import { supabase } from '../integrations/supabase/client';
import { Book, BookStatus } from '../types/models';

export const getBooks = async (): Promise<Book[]> => {
  const { data, error } = await supabase
    .from('books')
    .select(`
      id,
      title,
      author,
      cover_image,
      description,
      page_count,
      publication_year,
      publisher,
      genres,
      isbn,
      language,
      rating,
      added_date
    `)
    .order('title');

  if (error) {
    console.error("Error fetching books:", error);
    return [];
  }

  // Get book copies in a separate query
  const { data: copiesData, error: copiesError } = await supabase
    .from('book_copies')
    .select('*');

  if (copiesError) {
    console.error("Error fetching book copies:", copiesError);
    return [];
  }

  // Map the data to match our Book interface
  return data.map(book => ({
    id: book.id,
    title: book.title,
    author: book.author,
    coverImage: book.cover_image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format',
    description: book.description || '',
    pageCount: book.page_count || 0,
    publicationYear: book.publication_year || 0,
    publisher: book.publisher || '',
    genres: book.genres || [],
    isbn: book.isbn || '',
    language: book.language || '',
    rating: book.rating || 0,
    addedDate: book.added_date,
    copies: copiesData.filter(copy => copy.book_id === book.id).map(copy => ({
      id: copy.id,
      bookId: copy.book_id,
      status: copy.status,
      location: copy.location || '',
      condition: copy.condition || ''
    }))
  }));
};

export const getBookById = async (id: string): Promise<Book | null> => {
  const { data, error } = await supabase
    .from('books')
    .select(`
      id,
      title,
      author,
      cover_image,
      description,
      page_count,
      publication_year,
      publisher,
      genres,
      isbn,
      language,
      rating,
      added_date
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching book with id ${id}:`, error);
    return null;
  }

  // Get book copies
  const { data: copiesData, error: copiesError } = await supabase
    .from('book_copies')
    .select('*')
    .eq('book_id', id);

  if (copiesError) {
    console.error(`Error fetching copies for book ${id}:`, copiesError);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    author: data.author,
    coverImage: data.cover_image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format',
    description: data.description || '',
    pageCount: data.page_count || 0,
    publicationYear: data.publication_year || 0,
    publisher: data.publisher || '',
    genres: data.genres || [],
    isbn: data.isbn || '',
    language: data.language || '',
    rating: data.rating || 0,
    addedDate: data.added_date,
    copies: copiesData.map(copy => ({
      id: copy.id,
      bookId: copy.book_id,
      status: copy.status,
      location: copy.location || '',
      condition: copy.condition || ''
    }))
  };
};

export const searchBooks = async (
  query: string,
  filters: {
    genres?: string[];
    availability?: string;
    sortBy?: 'title' | 'author' | 'publicationYear' | 'addedDate';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<Book[]> => {
  let booksQuery = supabase
    .from('books')
    .select(`
      id,
      title,
      author,
      cover_image,
      description,
      page_count,
      publication_year,
      publisher,
      genres,
      isbn,
      language,
      rating,
      added_date
    `);

  // Apply search query
  if (query) {
    booksQuery = booksQuery.or(`title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%,isbn.ilike.%${query}%`);
  }

  // Apply genre filter
  if (filters.genres && filters.genres.length > 0) {
    booksQuery = booksQuery.contains('genres', filters.genres);
  }

  // Apply sorting
  if (filters.sortBy) {
    const column = filters.sortBy === 'title' ? 'title' : 
                  filters.sortBy === 'author' ? 'author' :
                  filters.sortBy === 'publicationYear' ? 'publication_year' : 'added_date';
    
    booksQuery = booksQuery.order(column, { ascending: filters.sortOrder !== 'desc' });
  } else {
    booksQuery = booksQuery.order('title');
  }

  const { data, error } = await booksQuery;

  if (error) {
    console.error("Error searching books:", error);
    return [];
  }

  // Get all book copies
  const { data: copiesData, error: copiesError } = await supabase
    .from('book_copies')
    .select('*');

  if (copiesError) {
    console.error("Error fetching book copies:", copiesError);
    return [];
  }

  // Transform the data
  const books = data.map(book => ({
    id: book.id,
    title: book.title,
    author: book.author,
    coverImage: book.cover_image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format',
    description: book.description || '',
    pageCount: book.page_count || 0,
    publicationYear: book.publication_year || 0,
    publisher: book.publisher || '',
    genres: book.genres || [],
    isbn: book.isbn || '',
    language: book.language || '',
    rating: book.rating || 0,
    addedDate: book.added_date,
    copies: copiesData
      .filter(copy => copy.book_id === book.id)
      .map(copy => ({
        id: copy.id,
        bookId: copy.book_id,
        status: copy.status,
        location: copy.location || '',
        condition: copy.condition || ''
      }))
  }));

  // Filter by availability if needed
  if (filters.availability) {
    return books.filter(book => 
      book.copies.some(copy => copy.status === filters.availability)
    );
  }

  return books;
};

export const getAllGenres = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('books')
    .select('genres');

  if (error) {
    console.error("Error fetching genres:", error);
    return [];
  }

  // Flatten and deduplicate the genres
  const genresSet = new Set<string>();
  data.forEach(book => {
    if (book.genres) {
      book.genres.forEach((genre: string) => genresSet.add(genre));
    }
  });

  return Array.from(genresSet).sort();
};

export const getAvailableBookCopiesCount = async (bookId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('book_copies')
    .select('id')
    .eq('book_id', bookId)
    .eq('status', 'available');

  if (error) {
    console.error(`Error fetching available copies for book ${bookId}:`, error);
    return 0;
  }

  return data.length;
};
