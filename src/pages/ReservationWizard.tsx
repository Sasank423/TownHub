
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Book,
  Home,
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Check, 
  Clock, 
  ChevronRight
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { getBookById, getRoomById } from '../utils/mockCatalogData';
import { useAuth } from '../contexts/AuthContext';
import { Reservation, ReservationType, Book as BookType, Room as RoomType } from '../types/models';

const ReservationWizard = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Data from URL params
  const initialDate = searchParams.get('date') 
    ? new Date(searchParams.get('date')!) 
    : new Date();
  const initialStartTime = searchParams.get('start') || '';
  const initialEndTime = searchParams.get('end') || '';
  
  // Get the item data
  const itemType = type === 'book' ? 'book' : 'room';
  const itemData = itemType === 'book' 
    ? getBookById(id || '')
    : getRoomById(id || '');
  
  // Wizard steps
  const [step, setStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  
  // Form state
  const [startDate, setStartDate] = useState<Date>(initialDate);
  const [endDate, setEndDate] = useState<Date>(
    itemType === 'book' ? addDays(initialDate, 14) : initialDate
  );
  const [startTime, setStartTime] = useState<string>(initialStartTime);
  const [endTime, setEndTime] = useState<string>(initialEndTime);
  const [notes, setNotes] = useState('');
  
  // Confirmation dialog
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Helper function to safely get item title/name
  const getItemTitle = () => {
    if (!itemData) return '';
    
    if (itemType === 'book') {
      return (itemData as BookType).title;
    } else {
      return (itemData as RoomType).name;
    }
  };
  
  // Mock reservation data
  const mockReservation: Reservation = {
    id: `reservation-${Date.now()}`,
    userId: user?.id || '',
    itemId: id || '',
    itemType: itemType as ReservationType,
    title: getItemTitle(),
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    status: 'Pending',
    notes,
    createdAt: new Date().toISOString(),
  };
  
  if (!itemData) {
    return (
      <DashboardLayout 
        title="Item Not Found" 
        breadcrumbs={[
          { label: 'Dashboard', path: '/member' },
          { label: 'Reservation', path: '/catalog' },
          { label: 'Not Found' }
        ]}
      >
        <div className="text-center py-16">
          {itemType === 'book' ? (
            <Book className="mx-auto h-16 w-16 text-muted-foreground" />
          ) : (
            <Home className="mx-auto h-16 w-16 text-muted-foreground" />
          )}
          <h2 className="text-2xl font-medium mt-4">Item Not Found</h2>
          <p className="text-muted-foreground mt-2">The item you're looking for doesn't exist or has been removed.</p>
          <Button 
            className="mt-6" 
            onClick={() => navigate(itemType === 'book' ? '/catalog' : '/rooms')}
          >
            Back to {itemType === 'book' ? 'Catalog' : 'Rooms'}
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  // Calculate available times for rooms
  const getAvailableTimes = () => {
    if (itemType === 'room' && itemData) {
      const dateString = format(startDate, 'yyyy-MM-dd');
      const room = itemData as RoomType;
      const availabilityForDate = room.availabilitySchedule.find(a => a.date === dateString);
      return availabilityForDate?.slots.filter(slot => slot.isAvailable) || [];
    }
    return [];
  };
  
  const availableTimes = getAvailableTimes();
  
  // Check if form is valid for current step
  const isStepValid = () => {
    switch (step) {
      case 1: // Date selection
        if (itemType === 'book') {
          return startDate && endDate;
        } else {
          return startDate && (startTime || availableTimes.length > 0);
        }
      case 2: // Time selection for rooms or review for books
        if (itemType === 'room') {
          return startTime && endTime;
        }
        return true;
      default:
        return true;
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Here we would normally submit the reservation to the backend
    setShowConfirmation(true);
    setIsComplete(true);
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return itemType === 'book' 
          ? renderBookDateSelection() 
          : renderRoomDateSelection();
      case 2:
        return itemType === 'book'
          ? renderBookReview()
          : renderRoomTimeSelection();
      case 3:
        return renderFinalReview();
      default:
        return null;
    }
  };
  
  const renderBookDateSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold">Select Loan Period</h2>
        <p className="text-muted-foreground">Choose when you'd like to pick up and return the book</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Pickup Date</CardTitle>
            <CardDescription>When would you like to pick up this book?</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => {
                if (date) {
                  setStartDate(date);
                  // Ensure end date is at least 1 day after start date
                  if (date >= endDate) {
                    setEndDate(addDays(date, 14));
                  }
                }
              }}
              disabled={(date) => {
                // Disable past dates and dates more than 30 days in the future
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const maxDate = addDays(today, 30);
                return date < today || date > maxDate;
              }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Return Date</CardTitle>
            <CardDescription>When will you return this book? (14 days maximum)</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => date && setEndDate(date)}
              disabled={(date) => {
                // Disable dates before start date and more than 14 days after
                const minDate = startDate;
                const maxDate = addDays(startDate, 14);
                return date < minDate || date > maxDate;
              }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-secondary/20 rounded-md p-4">
        <div className="flex items-start gap-2">
          <CalendarIcon size={20} className="text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">Reservation Summary</p>
            <p className="text-sm text-muted-foreground">
              You'll pick up the book on {format(startDate, 'MMMM d, yyyy')} and return it by {format(endDate, 'MMMM d, yyyy')}
            </p>
            <p className="text-sm text-muted-foreground">
              Total loan period: {Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderRoomDateSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold">Select Reservation Date</h2>
        <p className="text-muted-foreground">Choose when you'd like to use this room</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Reservation Date</CardTitle>
            <CardDescription>When would you like to reserve this room?</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => {
                if (date) {
                  setStartDate(date);
                  setEndDate(date);
                  // Reset time selection when date changes
                  setStartTime('');
                  setEndTime('');
                }
              }}
              disabled={(date) => {
                // Disable past dates and dates more than 30 days in the future
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const maxDate = addDays(today, 30);
                return date < today || date > maxDate;
              }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Available Times</CardTitle>
            <CardDescription>Preview of available time slots on selected date</CardDescription>
          </CardHeader>
          <CardContent>
            {availableTimes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableTimes.map((slot, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStartTime(slot.startTime);
                      setEndTime(slot.endTime);
                    }}
                    className={`text-xs ${startTime === slot.startTime ? 'border-primary bg-primary/10' : ''}`}
                  >
                    {slot.startTime} - {slot.endTime}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-secondary/20 rounded-md">
                <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">No available times on this date</p>
                <p className="text-sm text-muted-foreground">Please select a different date</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {startTime && (
        <div className="bg-secondary/20 rounded-md p-4">
          <div className="flex items-start gap-2">
            <CalendarIcon size={20} className="text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Reservation Preview</p>
              <p className="text-sm text-muted-foreground">
                You'll reserve {(itemData as RoomType).name} on {format(startDate, 'MMMM d, yyyy')} from {startTime} to {endTime}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  const renderRoomTimeSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold">Select Time Slot</h2>
        <p className="text-muted-foreground">Choose a time slot for your reservation</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Time Selection</CardTitle>
          <CardDescription>Select a start and end time for your reservation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <Select
                value={startTime}
                onValueChange={setStartTime}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((slot, index) => (
                    <SelectItem key={index} value={slot.startTime}>
                      {slot.startTime}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">End Time</label>
              <Select
                value={endTime}
                onValueChange={setEndTime}
                disabled={!startTime}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes
                    .filter(slot => {
                      // Only show end times that come after the selected start time
                      if (!startTime) return false;
                      return slot.startTime >= startTime;
                    })
                    .map((slot, index) => (
                      <SelectItem key={index} value={slot.endTime}>
                        {slot.endTime}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="pt-2">
            <label className="text-sm font-medium">Selected Date</label>
            <p className="text-muted-foreground text-sm">
              {format(startDate, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-secondary/20 rounded-md p-4">
        <div className="flex items-start gap-2">
          <Clock size={20} className="text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">Time Slot Summary</p>
            <p className="text-sm text-muted-foreground">
              You'll reserve {(itemData as RoomType).name} on {format(startDate, 'MMMM d, yyyy')} from {startTime} to {endTime}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderBookReview = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold">Review Reservation</h2>
        <p className="text-muted-foreground">Review the details of your book reservation</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Reservation Details</CardTitle>
          <CardDescription>Please verify your reservation information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-start">
            <img 
              src={(itemData as BookType).coverImage} 
              alt={`Cover of ${(itemData as BookType).title}`}
              className="w-20 h-30 object-cover rounded"
            />
            <div>
              <h3 className="font-medium">{(itemData as BookType).title}</h3>
              <p className="text-sm text-muted-foreground">by {(itemData as BookType).author}</p>
              
              <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pickup Date</p>
                  <p className="font-medium">{format(startDate, 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Return Date</p>
                  <p className="font-medium">{format(endDate, 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loan Period</p>
                  <p className="font-medium">
                    {Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (Optional)</label>
            <Textarea 
              placeholder="Add any notes about your reservation..." 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Include any special requests or information about this reservation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderFinalReview = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold">Final Review</h2>
        <p className="text-muted-foreground">Please confirm your reservation details</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{itemType === 'book' ? 'Book Reservation' : 'Room Reservation'}</CardTitle>
          <CardDescription>Review and confirm your reservation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-start">
            {itemType === 'book' ? (
              <img 
                src={(itemData as BookType).coverImage} 
                alt={`Cover of ${(itemData as BookType).title}`}
                className="w-20 h-30 object-cover rounded"
              />
            ) : (
              <img 
                src={(itemData as RoomType).images[0]} 
                alt={`Image of ${(itemData as RoomType).name}`}
                className="w-20 h-16 object-cover rounded"
              />
            )}
            <div>
              <h3 className="font-medium">
                {itemType === 'book' ? (itemData as BookType).title : (itemData as RoomType).name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {itemType === 'book' 
                  ? `by ${(itemData as BookType).author}` 
                  : (itemData as RoomType).location}
              </p>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                {itemType === 'book' ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Pickup Date</p>
                      <p className="font-medium">{format(startDate, 'MMMM d, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Return Date</p>
                      <p className="font-medium">{format(endDate, 'MMMM d, yyyy')}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Reservation Date</p>
                      <p className="font-medium">{format(startDate, 'MMMM d, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time Slot</p>
                      <p className="font-medium">{startTime} - {endTime}</p>
                    </div>
                  </>
                )}
                <div className="col-span-full mt-2">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="font-medium">{notes || 'No notes provided'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-secondary/20 rounded-md p-4 mt-6">
            <div className="flex items-start gap-2">
              <Clock size={20} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Reservation Status</p>
                <p className="text-sm text-muted-foreground">
                  Your reservation will be sent for approval. You'll receive a notification once it's approved.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full flex flex-col gap-2">
            <Button className="w-full" onClick={handleSubmit}>
              Submit Reservation
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setStep(prev => prev - 1)}>
              Go Back
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
  
  // Progress indicator
  const totalSteps = itemType === 'book' ? 3 : 3;
  const progressPercent = (step / totalSteps) * 100;
  
  return (
    <DashboardLayout 
      title={`Reserve ${itemType === 'book' ? 'Book' : 'Room'}`} 
      breadcrumbs={[
        { label: 'Dashboard', path: '/member' },
        { 
          label: itemType === 'book' ? 'Catalog' : 'Rooms', 
          path: itemType === 'book' ? '/catalog' : '/rooms' 
        },
        { 
          label: itemType === 'book' ? (itemData as BookType).title : (itemData as RoomType).name, 
          path: itemType === 'book' ? `/books/${id}` : `/rooms/${id}` 
        },
        { label: 'Reserve' }
      ]}
    >
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="pl-0 flex items-center gap-1"
          onClick={() => {
            if (step > 1) {
              setStep(prev => prev - 1);
            } else {
              navigate(itemType === 'book' ? `/books/${id}` : `/rooms/${id}`);
            }
          }}
        >
          <ArrowLeft size={16} />
          {step > 1 ? 'Previous Step' : 'Back to Details'}
        </Button>
      </div>
      
      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round(progressPercent)}% Complete</span>
        </div>
      </div>
      
      {/* Step content */}
      <div className="mb-8">
        {renderStepContent()}
      </div>
      
      {/* Navigation buttons */}
      {!isComplete && (
        <div className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => {
              if (step > 1) {
                setStep(prev => prev - 1);
              } else {
                navigate(itemType === 'book' ? `/books/${id}` : `/rooms/${id}`);
              }
            }}
          >
            {step > 1 ? 'Previous' : 'Cancel'}
          </Button>
          
          {step < totalSteps ? (
            <Button 
              onClick={() => setStep(prev => prev + 1)}
              disabled={!isStepValid()}
              className="gap-1"
            >
              Continue <ChevronRight size={16} />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={!isStepValid()}
              className="gap-1"
            >
              Submit Reservation <Check size={16} />
            </Button>
          )}
        </div>
      )}
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reservation Submitted</DialogTitle>
            <DialogDescription>
              Your reservation has been successfully submitted and is awaiting approval.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => navigate('/member')}
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ReservationWizard;
