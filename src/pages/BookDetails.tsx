
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookStatus } from '../types/models';
import { getBookById } from '../utils/mockCatalogData';
import { ArrowLeft, BookOpen, Calendar, Clock, Share2, CalendarCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showModal, setShowModal] = React.useState(false);
  
  const book = id ? getBookById(id) : undefined;
  
  if (!book) {
    return (
      <DashboardLayout 
        title="Book Not Found" 
        breadcrumbs={[
          { label: 'Dashboard', path: '/member' },
          { label: 'Catalog', path: '/catalog' },
          { label: 'Not Found' }
        ]}
      >
        <div className="text-center py-16">
          <BookOpen className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-medium mt-4">Book Not Found</h2>
          <p className="text-muted-foreground mt-2">The book you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-6" onClick={() => navigate('/catalog')}>
            Back to Catalog
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  const availableCopiesCount = book.copies.filter(c => c.status === 'available').length;
  const reservedCopiesCount = book.copies.filter(c => c.status === 'reserved').length;
  const checkedOutCopiesCount = book.copies.filter(c => c.status === 'checked-out').length;
  
  const getStatusColor = (status: BookStatus) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-amber-100 text-amber-800';
      case 'checked-out': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <DashboardLayout 
      title={book.title} 
      breadcrumbs={[
        { label: 'Dashboard', path: '/member' },
        { label: 'Catalog', path: '/catalog' },
        { label: book.title }
      ]}
    >
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="pl-0 flex items-center gap-1"
          onClick={() => navigate('/catalog')}
        >
          <ArrowLeft size={16} />
          Back to Catalog
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="mb-6 flex justify-center lg:justify-start">
              <div className="relative max-w-xs">
                <img 
                  src={book.coverImage} 
                  alt={`Cover of ${book.title}`} 
                  className="rounded-lg shadow-md max-h-96 object-contain"
                />
                {availableCopiesCount > 0 && (
                  <div className="absolute top-3 right-3">
                    <Badge className={getStatusColor('available')}>
                      {availableCopiesCount} Available
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <Button 
                className="w-full gap-2"
                onClick={() => setShowModal(true)}
                disabled={availableCopiesCount === 0}
              >
                <Calendar size={16} />
                {availableCopiesCount > 0 ? 'Reserve Book' : 'Currently Unavailable'}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  // TODO: Show toast
                }}
              >
                <Share2 size={16} />
                Share
              </Button>
            </div>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Book Information */}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {book.genres.map(genre => (
                <Badge key={genre} variant="secondary">{genre}</Badge>
              ))}
            </div>
            
            <h1 className="text-3xl font-semibold mb-1">{book.title}</h1>
            <p className="text-lg text-muted-foreground">by {book.author}</p>
            
            <div className="flex items-center mt-4">
              <div className="flex items-center">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(book.rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2l2.5 5 5.5 0.75-4 4 1 5.5-5-3-5 3 1-5.5-4-4 5.5-0.75z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm text-muted-foreground">
                  {book.rating} out of 5
                </span>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-medium mb-2">Description</h2>
                <p className="text-muted-foreground">{book.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Publication Year</h3>
                  <p>{book.publicationYear}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Publisher</h3>
                  <p>{book.publisher}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">ISBN</h3>
                  <p>{book.isbn}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Pages</h3>
                  <p>{book.pageCount}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Language</h3>
                  <p>{book.language}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Added to Library</h3>
                  <p>{new Date(book.addedDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Availability Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-medium mb-4">Availability Status</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-semibold text-green-600">{availableCopiesCount}</p>
                  <p className="text-sm text-green-600">Available</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <p className="text-2xl font-semibold text-amber-600">{reservedCopiesCount}</p>
                  <p className="text-sm text-amber-600">Reserved</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-semibold text-red-600">{checkedOutCopiesCount}</p>
                  <p className="text-sm text-red-600">Checked Out</p>
                </div>
              </div>
              
              <h3 className="font-medium mb-2">Copy Details</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-sm font-medium text-muted-foreground p-2">ID</th>
                      <th className="text-left text-sm font-medium text-muted-foreground p-2">Status</th>
                      <th className="text-left text-sm font-medium text-muted-foreground p-2">Location</th>
                      <th className="text-left text-sm font-medium text-muted-foreground p-2">Condition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {book.copies.map((copy, index) => (
                      <tr key={copy.id} className={index % 2 === 0 ? 'bg-secondary/20' : ''}>
                        <td className="p-2 text-sm">{copy.id.substring(copy.id.length - 6)}</td>
                        <td className="p-2">
                          <Badge className={getStatusColor(copy.status)}>
                            {copy.status.charAt(0).toUpperCase() + copy.status.slice(1).replace('-', ' ')}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm">{copy.location}</td>
                        <td className="p-2 text-sm">{copy.condition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {book.copies.some(copy => copy.status === 'available') && (
                <div className="text-center mt-4">
                  <Button onClick={() => setShowModal(true)}>
                    Reserve Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Reservation Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Quick Reservation</DialogTitle>
          </DialogHeader>
          
          <div className="my-4 flex items-center gap-4">
            <img
              src={book.coverImage}
              alt={`Cover of ${book.title}`}
              className="w-16 h-24 object-cover rounded"
            />
            <div>
              <h3 className="font-medium">{book.title}</h3>
              <p className="text-sm text-muted-foreground">by {book.author}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              {availableCopiesCount} {availableCopiesCount === 1 ? 'copy' : 'copies'} available for reservation
            </p>
            
            <p className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Standard loan period: 14 days
            </p>
            
            <div className="text-center space-y-2">
              <Button 
                className="w-full gap-2"
                onClick={() => {
                  navigate(`/reserve/book/${book.id}`);
                  setShowModal(false);
                }}
              >
                <CalendarCheck className="h-4 w-4" />
                Proceed to Full Reservation
              </Button>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BookDetails;
