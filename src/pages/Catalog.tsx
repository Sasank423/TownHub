
import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Book, BookStatus } from '../types/models';
import { searchBooks, getAllGenres, getAvailableBookCopiesCount } from '../utils/mockCatalogData';
import { LayoutList, LayoutGrid, Search, Filter, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

const ITEMS_PER_PAGE = 12;

const Catalog = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [availability, setAvailability] = useState<BookStatus | ''>('');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'publicationYear' | 'addedDate'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Get all available genres
  const allGenres = getAllGenres();
  
  // Search and filter books
  const filteredBooks = searchBooks(searchQuery, {
    genres: selectedGenres.length > 0 ? selectedGenres : undefined,
    availability: availability as BookStatus || undefined,
    sortBy,
    sortOrder
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  // Handle genre toggle
  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Handle search input
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search change
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedGenres([]);
    setAvailability('');
    setSortBy('title');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  return (
    <DashboardLayout 
      title="Book Catalog" 
      breadcrumbs={[
        { label: 'Dashboard', path: '/member' },
        { label: 'Catalog' }
      ]}
    >
      <div className="space-y-6">
        {/* Search and View Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title, author, or genre..."
              className="pl-9"
              value={searchQuery}
              onChange={handleSearchInput}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              Filters
              {(selectedGenres.length > 0 || availability) && (
                <Badge variant="secondary" className="ml-1">
                  {selectedGenres.length + (availability ? 1 : 0)}
                </Badge>
              )}
            </Button>
            
            <div className="border rounded-md flex">
              <Button
                variant={view === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setView('grid')}
                className="rounded-none rounded-l-md"
                aria-label="Grid view"
              >
                <LayoutGrid size={18} />
              </Button>
              <Button
                variant={view === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setView('list')}
                className="rounded-none rounded-r-md"
                aria-label="List view"
              >
                <LayoutList size={18} />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <Card className="animate-fade-in">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Genre Filter */}
                <div>
                  <h3 className="font-medium mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {allGenres.map(genre => (
                      <Badge
                        key={genre}
                        variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                        className="cursor-pointer hover:bg-primary/90"
                        onClick={() => toggleGenre(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Availability Filter */}
                <div>
                  <h3 className="font-medium mb-2">Availability</h3>
                  <Select
                    value={availability}
                    onValueChange={(value) => {
                      setAvailability(value as BookStatus | '');
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any availability</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="checked-out">Checked Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Sort Options */}
                <div>
                  <h3 className="font-medium mb-2">Sort By</h3>
                  <div className="flex gap-2">
                    <Select
                      value={sortBy}
                      onValueChange={(value) => {
                        setSortBy(value as any);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="author">Author</SelectItem>
                        <SelectItem value="publicationYear">Publication Year</SelectItem>
                        <SelectItem value="addedDate">Date Added</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={sortOrder}
                      onValueChange={(value) => {
                        setSortOrder(value as 'asc' | 'desc');
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Reset Filters */}
              <div className="mt-4 text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredBooks.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredBooks.length)} of {filteredBooks.length} books
        </div>
        
        {/* Book Grid/List View */}
        {paginatedBooks.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No books found</h3>
            <p className="mt-1 text-muted-foreground">Try adjusting your search or filters</p>
            {(searchQuery || selectedGenres.length > 0 || availability) && (
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={resetFilters}
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className={`
            ${view === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-4'}
          `}>
            {paginatedBooks.map((book) => (
              <BookCard 
                key={book.id} 
                book={book} 
                viewMode={view} 
              />
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum: number;
                
                if (totalPages <= 5) {
                  // Show all pages if 5 or fewer
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  // Show 1, 2, 3, 4, ...
                  pageNum = i + 1;
                  if (i === 4) return (
                    <PaginationItem key={i}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                } else if (currentPage >= totalPages - 2) {
                  // Show ..., n-3, n-2, n-1, n
                  pageNum = totalPages - 4 + i;
                  if (i === 0) return (
                    <PaginationItem key={i}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                } else {
                  // Show ..., currentPage-1, currentPage, currentPage+1, ...
                  if (i === 0) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          onClick={() => setCurrentPage(1)}
                          isActive={currentPage === 1}
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (i === 1) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  } else if (i === 3) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  } else if (i === 4) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          onClick={() => setCurrentPage(totalPages)}
                          isActive={currentPage === totalPages}
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  
                  pageNum = currentPage + (i - 2);
                }
                
                return (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </DashboardLayout>
  );
};

// Book Card Component
interface BookCardProps {
  book: Book;
  viewMode: 'grid' | 'list';
}

const BookCard: React.FC<BookCardProps> = ({ book, viewMode }) => {
  const availableCopies = getAvailableBookCopiesCount(book.id);
  
  const getStatusColor = () => {
    if (availableCopies > 0) return 'bg-green-100 text-green-800';
    const hasReservedCopies = book.copies.some(copy => copy.status === 'reserved');
    return hasReservedCopies 
      ? 'bg-amber-100 text-amber-800' 
      : 'bg-red-100 text-red-800';
  };
  
  const getStatusText = () => {
    if (availableCopies > 0) {
      return `${availableCopies} Available`;
    }
    const hasReservedCopies = book.copies.some(copy => copy.status === 'reserved');
    return hasReservedCopies ? 'Reserved' : 'Checked Out';
  };
  
  if (viewMode === 'grid') {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <Link to={`/books/${book.id}`} className="flex flex-col h-full">
          <div className="aspect-[2/3] overflow-hidden relative">
            <img 
              src={book.coverImage} 
              alt={`Cover of ${book.title}`}
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
            />
            <div className={`absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </div>
          </div>
          <CardContent className="p-4 flex-grow flex flex-col">
            <h3 className="font-medium line-clamp-1" title={book.title}>{book.title}</h3>
            <p className="text-sm text-muted-foreground">by {book.author}</p>
            <div className="mt-auto pt-2 flex gap-1 flex-wrap">
              {book.genres.slice(0, 2).map(genre => (
                <Badge key={genre} variant="outline" className="text-xs">
                  {genre}
                </Badge>
              ))}
              {book.genres.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{book.genres.length - 2}
                </Badge>
              )}
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/books/${book.id}`} className="flex p-4">
        <div className="w-16 h-24 overflow-hidden mr-4 flex-shrink-0">
          <img 
            src={book.coverImage} 
            alt={`Cover of ${book.title}`}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex justify-between">
            <div>
              <h3 className="font-medium">{book.title}</h3>
              <p className="text-sm text-muted-foreground">by {book.author}</p>
            </div>
            <div className={`px-2 py-1 h-fit rounded text-xs font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </div>
          </div>
          <p className="text-sm line-clamp-2 mt-1">{book.description}</p>
          <div className="mt-auto pt-2 flex gap-1 flex-wrap">
            {book.genres.map(genre => (
              <Badge key={genre} variant="outline" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default Catalog;
