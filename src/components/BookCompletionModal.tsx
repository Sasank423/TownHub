import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { StarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface BookCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (reservationId: string) => void;
  reservationId: string;
  bookId: string;
  bookTitle: string;
}

const BookCompletionModal: React.FC<BookCompletionModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  reservationId,
  bookId,
  bookTitle,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [readingTime, setReadingTime] = useState<number>(5); // Default 5 hours
  const [loading, setLoading] = useState<boolean>(false);
  
  // Direct function to handle the submit button click with improved logging
  const handleSubmitClick = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      console.log('SUBMIT BUTTON CLICKED - Processing book return:', reservationId);
      
      // STEP 1: Get the book copy ID from the reservation
      console.log('Fetching reservation details...');
      const { data: reservationData, error: fetchError } = await supabase
        .from('reservations')
        .select('item_id, title')
        .eq('id', reservationId)
        .single();
      
      if (fetchError) {
        console.error('DATABASE ERROR: Error fetching reservation:', fetchError);
        toast({
          title: 'Database Error',
          description: 'Could not find reservation details. Error: ' + fetchError.message,
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }
      
      if (!reservationData) {
        console.error('DATABASE ERROR: No reservation data found');
        toast({
          title: 'Database Error',
          description: 'No reservation data found',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }
      
      const bookCopyId = reservationData.item_id;
      console.log('SUCCESS: Found book copy ID:', bookCopyId);
      
      // STEP 2: Update book copy status to available FIRST
      console.log('Updating book copy status to available...');
      const { error: updateError } = await supabase
        .from('book_copies')
        .update({ status: 'available' })
        .eq('id', bookCopyId);
      
      if (updateError) {
        console.error('DATABASE ERROR: Failed to update book status:', updateError);
        toast({
          title: 'Database Error',
          description: 'Failed to update book availability. Error: ' + updateError.message,
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }
      
      console.log('SUCCESS: Book copy updated to available');
      
      // STEP 3: Delete the reservation AFTER updating book status
      console.log('Deleting reservation with ID:', reservationId);
      
      // Make sure we're deleting the correct reservation (owned by this user)
      const { error: deleteError } = await supabase
        .from('reservations')
        .delete()
        .match({ id: reservationId, user_id: user.id });
      
      if (deleteError) {
        console.error('DATABASE ERROR: Failed to delete reservation:', deleteError);
        toast({
          title: 'Database Error',
          description: 'Failed to delete reservation. Error: ' + deleteError.message,
          variant: 'destructive'
        });
        // Continue anyway since the book is already available
      } else {
        console.log('SUCCESS: Reservation deleted successfully');
      }
      
      // STEP 4: Record the return in activities table
      console.log('Recording activity...');
      try {
        await supabase
          .from('activities')
          .insert({
            user_id: user.id,
            action: 'return',
            description: `returned book "${bookTitle || reservationData.title}"`,
            timestamp: new Date().toISOString(),
            item_id: bookId,
            item_type: 'book',
            user_name: user.user_metadata?.name || user.email || 'User'
          });
        console.log('SUCCESS: Activity recorded');
      } catch (activityError) {
        console.error('Non-critical error recording activity:', activityError);
        // Continue anyway
      }
      
      // STEP 5: Record book completion in activities table for analytics tracking
      console.log('Recording book completion for analytics...');
      try {
        // Create a special activity entry to track book completion for analytics
        const { error: analyticsError } = await supabase
          .from('activities')
          .insert({
            user_id: user.id,
            action: 'completed_reading',  // Special action type for analytics
            description: `completed reading book "${bookTitle || reservationData.title}"`,
            timestamp: new Date().toISOString(),
            item_id: bookId,
            item_type: 'book',
            user_name: user.user_metadata?.name || user.email || 'User',
            is_processed: false  // This flag allows analytics to count this later
          });
          
        if (analyticsError) {
          console.error('Error recording book completion for analytics:', analyticsError);
        } else {
          console.log('SUCCESS: Book completion recorded for analytics');
        }
      } catch (analyticsError) {
        console.error('Error recording book completion:', analyticsError);
        // Continue anyway - non-critical
      }
      
      // Success!
      console.log('OPERATION COMPLETE: Book return processed successfully');
      toast({
        title: 'Success',
        description: `${bookTitle || reservationData.title} has been returned successfully`
      });
      
      // Notify parent to update UI
      onComplete(reservationId);
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('CRITICAL ERROR processing book return:', error);
      // Log all details for debugging
      console.error('Error details:', {
        reservationId,
        bookId,
        bookTitle,
        userId: user?.id,
        error: error instanceof Error ? error.message : String(error)
      });
      
      toast({
        title: 'Operation Failed',
        description: 'There was a problem processing your return. Please try again or contact support.',
        variant: 'destructive'
      });
      
      // Try to notify parent component anyway to refresh the UI
      try {
        onComplete(reservationId);
      } catch (e) {
        console.error('Failed to notify parent component:', e);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Simple function to handle the skip button click
  const handleSkipClick = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      // Same core functionality as submit, just without saving review data
      await handleSubmitClick();
    } catch (error) {
      console.error('Error processing skip:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // New direct implementation for book return
  const completeBookReturn = async (skipReview = false) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to complete a book return',
        variant: 'destructive'
      });
      setLoading(false);
      return;
    }
    
    try {
      console.log('Processing book return with direct implementation', { reservationId, bookId });
      
      // STEP 1: Get the book copy ID from the reservation
      const { data: reservationData, error: fetchError } = await supabase
        .from('reservations')
        .select('item_id')
        .eq('id', reservationId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching reservation:', fetchError);
        toast({
          title: 'Database Error',
          description: 'Could not find reservation details',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }
      
      const bookCopyId = reservationData.item_id;
      console.log('Found book copy ID:', bookCopyId);
      
      // STEP 2: Delete the reservation first
      const { error: deleteError } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservationId);
      
      if (deleteError) {
        console.error('Error deleting reservation:', deleteError);
        toast({
          title: 'Database Error',
          description: 'Failed to delete reservation',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }
      
      console.log('Successfully deleted reservation');
      
      // STEP 3: Update book copy status to available
      const { error: bookUpdateError } = await supabase
        .from('book_copies')
        .update({ status: 'available' })
        .eq('id', bookCopyId);
      
      if (bookUpdateError) {
        console.error('Error updating book status:', bookUpdateError);
        toast({
          title: 'Database Error',
          description: 'Failed to update book availability',
          variant: 'destructive'
        });
        // Continue anyway since the reservation is already deleted
      } else {
        console.log('Successfully updated book copy status to available');
      }
      
      // STEP 4: Record reading data if not skipping
      if (!skipReview) {
        try {
          // Record reading session
          await supabase
            .from('reading_sessions' as any)
            .insert({
              user_id: user.id,
              book_id: bookId,
              start_time: new Date(Date.now() - readingTime * 60 * 60 * 1000).toISOString(),
              end_time: new Date().toISOString(),
              pages_read: null,
              notes: review
            });
          
          console.log('Successfully recorded reading session');
          
          // Record rating if provided
          if (rating > 0) {
            await supabase
              .from('book_ratings' as any)
              .insert({
                user_id: user.id,
                book_id: bookId,
                rating: rating,
                review: review,
                created_at: new Date().toISOString()
              });
            
            console.log('Successfully recorded book rating');
          }
        } catch (error) {
          console.error('Error recording reading data:', error);
          // Non-critical, continue anyway
        }
      }
      
      // STEP 5: Record activity
      try {
        await supabase
          .from('activities')
          .insert({
            user_id: user.id,
            action: 'return',
            description: `returned "${bookTitle}"`,
            timestamp: new Date().toISOString(),
            item_id: bookId,
            item_type: 'book',
            user_name: user.user_metadata?.name || user.email || 'User'
          });
        
        console.log('Successfully recorded activity');
      } catch (error) {
        console.error('Error recording activity:', error);
        // Non-critical, continue anyway
      }
      
      // Success! Notify parent and close modal
      console.log('Book return processed successfully');
      toast({
        title: 'Success',
        description: `${bookTitle} has been returned successfully`
      });
      
      // Notify parent component to update UI
      onComplete(reservationId);
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error processing book return:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong processing your return',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Original submit handler (keeping for reference)
  const handleSubmit = async (skipReview = false) => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('Processing book return...', { reservationId, bookId, bookTitle });
      
      // Step 1: Get the book copy ID from the reservation
      const { data: reservationData, error: fetchError } = await supabase
        .from('reservations')
        .select('item_id')
        .eq('id', reservationId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching reservation:', fetchError);
        toast({
          title: 'Error',
          description: 'Could not find reservation details',
          variant: 'destructive'
        });
        return;
      }
      
      const bookCopyId = reservationData.item_id;
      console.log('Found book copy ID:', bookCopyId);
      
      // Step 2: Update book copy status to available
      // The book copy ID in the reservation is actually the book copy ID, not the book ID
      const { error: bookUpdateError } = await supabase
        .from('book_copies')
        .update({ status: 'available' })
        .eq('id', bookCopyId);
        
      console.log(`Updated book copy (ID: ${bookCopyId}) status to available`);
      
      if (bookUpdateError) {
        console.error('Error updating book status:', bookUpdateError);
        toast({
          title: 'Error',
          description: 'Failed to update book availability',
          variant: 'destructive'
        });
        return;
      }
      
      console.log('Updated book copy status to available');
      
      // Step 3: Delete the reservation
      const { error: deleteError } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservationId);
      
      if (deleteError) {
        console.error('Error deleting reservation:', deleteError);
        toast({
          title: 'Error',
          description: 'Failed to remove reservation',
          variant: 'destructive'
        });
        return;
      }
      
      console.log('Deleted reservation successfully');
      
      // Step 4: Record reading data if not skipping
      if (!skipReview) {
        // Record reading session
        const { error: sessionError } = await supabase
          .from('reading_sessions' as any)
          .insert({
            user_id: user.id,
            book_id: bookId,
            start_time: new Date(Date.now() - readingTime * 60 * 60 * 1000).toISOString(),
            end_time: new Date().toISOString(),
            pages_read: null,
            notes: review
          });
        
        if (sessionError) {
          console.error('Error recording reading session:', sessionError);
          // Non-critical, continue
        }
        
        // Record rating if provided
        if (rating > 0) {
          const { error: ratingError } = await supabase
            .from('book_ratings' as any)
            .insert({
              user_id: user.id,
              book_id: bookId,
              rating: rating,
              review: review,
              created_at: new Date().toISOString()
            });
          
          if (ratingError) {
            console.error('Error recording book rating:', ratingError);
            // Non-critical, continue
          }
        }
      }
      
      // Step 5: Record activity
      await supabase
        .from('activities')
        .insert({
          user_id: user.id,
          action: 'return',
          description: `returned "${bookTitle}"`,
          timestamp: new Date().toISOString(),
          item_id: bookId,
          item_type: 'book',
          user_name: user.user_metadata?.name || user.email || 'User'
        });
      
      // Success! Notify parent and close modal
      console.log('Book return processed successfully');
      toast({
        title: 'Success',
        description: `${bookTitle} has been returned successfully`
      });
      
      // Notify parent component to update UI
      onComplete(reservationId);
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error processing book return:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (open === false && !loading) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Completed</DialogTitle>
          <DialogDescription>
            Tell us about your experience reading "{bookTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">How would you rate this book?</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <StarIcon
                    className={`h-6 w-6 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Approximately how many hours did you spend reading?</label>
            <div className="space-y-2">
              <Slider
                value={[readingTime]}
                min={1}
                max={50}
                step={1}
                onValueChange={(value) => setReadingTime(value[0])}
              />
              <div className="text-sm text-right">{readingTime} hours</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="review" className="text-sm font-medium">
              Share your thoughts (optional)
            </label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write a short review..."
              className="h-24"
            />
          </div>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSkipClick}
            disabled={loading}
            type="button"
            className="min-w-[80px]"
          >
            {loading ? 'Processing...' : 'Skip'}
          </Button>
          <Button 
            onClick={handleSubmitClick}
            disabled={loading}
            type="button"
            className="min-w-[80px] bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Processing...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookCompletionModal;
