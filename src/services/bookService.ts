
import { supabase } from '../integrations/supabase/client';
import { Book } from '../types/models';

export const getBooks = async (): Promise<Book[]> => {
  const { data, error } = await supabase
    .from('books')
    .select(`
      id,
      title,
      author,
      cover_image as coverImage,
      description,
      page_count as pageCount,
      publication_year as publicationYear,
      publisher,
      genres,
      isbn,
      language,
      rating,
      added_date as addedDate,
      book_copies:book_copies(
        id,
        status,
        location,
        condition
      )
    `)
    .order('title');

  if (error) {
    console.error("Error fetching books:", error);
    return [];
  }

  return data.map(book => ({
    ...book,
    copies: book.book_copies || [],
    coverImage: book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format'
  }));
};

export const getBookById = async (id: string): Promise<Book | null> => {
  const { data, error } = await supabase
    .from('books')
    .select(`
      id,
      title,
      author,
      cover_image as coverImage,
      description,
      page_count as pageCount,
      publication_year as publicationYear,
      publisher,
      genres,
      isbn,
      language,
      rating,
      added_date as addedDate,
      book_copies:book_copies(
        id,
        status,
        location,
        condition
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching book with id ${id}:`, error);
    return null;
  }

  return {
    ...data,
    copies: data.book_copies || [],
    coverImage: data.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format'
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
      cover_image as coverImage,
      description,
      page_count as pageCount,
      publication_year as publicationYear,
      publisher,
      genres,
      isbn,
      language,
      rating,
      added_date as addedDate,
      book_copies:book_copies(
        id,
        status,
        location,
        condition
      )
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

  // Transform and filter by availability if needed
  const books = data.map(book => ({
    ...book,
    copies: book.book_copies || [],
    coverImage: book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format'
  }));

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
