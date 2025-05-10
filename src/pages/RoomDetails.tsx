import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { getRoomById } from '../utils/mockCatalogData';
import { 
  ArrowLeft, 
  CalendarCheck, 
  Users, 
  MapPin, 
  Share2, 
  Home
} from 'lucide-react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { RoomAmenity } from '../types/models';

const RoomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadRoom = async () => {
      if (id) {
        setLoading(true);
        try {
          const roomData = await getRoomById(id);
          setRoom(roomData || null);
        } catch (error) {
          console.error("Error loading room:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadRoom();
  }, [id]);
  
  if (loading) {
    return (
      <DashboardLayout 
        title="Loading..." 
        breadcrumbs={[
          { label: 'Dashboard', path: '/member' },
          { label: 'Rooms', path: '/rooms' },
          { label: 'Loading...' }
        ]}
      >
        <div className="flex items-center justify-center h-64">
          <p>Loading room details...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!room) {
    return (
      <DashboardLayout 
        title="Room Not Found" 
        breadcrumbs={[
          { label: 'Dashboard', path: '/member' },
          { label: 'Rooms', path: '/rooms' },
          { label: 'Not Found' }
        ]}
      >
        <div className="text-center py-16">
          <Home className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-medium mt-4">Room Not Found</h2>
          <p className="text-muted-foreground mt-2">The room you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-6" onClick={() => navigate('/rooms')}>
            Back to Rooms
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  // Get availability for the selected date
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const availabilityForDate = room.availabilitySchedule.find((a: any) => a.date === dateString);
  const timeSlots = availabilityForDate?.slots || [];
  const availableSlots = timeSlots.filter((slot: any) => slot.isAvailable);
  
  // Get formatted amenity names
  const formatAmenityName = (amenity: RoomAmenity): string => {
    return amenity
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Get icons for amenities
  const getAmenityIcon = (amenity: RoomAmenity) => {
    switch (amenity) {
      case 'wifi': return '📶';
      case 'projector': return '📽️';
      case 'whiteboard': return '🖌️';
      case 'computers': return '💻';
      case 'videoconferencing': return '🎥';
      case 'printer': return '🖨️';
      case 'study-pods': return '👥';
      case 'silence': return '🔇';
      default: return '✓';
    }
  };
  
  return (
    <DashboardLayout 
      title={room.name} 
      breadcrumbs={[
        { label: 'Dashboard', path: '/member' },
        { label: 'Rooms', path: '/rooms' },
        { label: room.name }
      ]}
    >
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="pl-0 flex items-center gap-1"
          onClick={() => navigate('/rooms')}
        >
          <ArrowLeft size={16} />
          Back to Rooms
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2">
          <Carousel className="w-full">
            <CarouselContent>
              {room.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <div className="overflow-hidden rounded-xl aspect-[16/9]">
                      <img
                        src={image}
                        alt={`${room.name} - Image ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          
          <div className="mt-8 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-semibold">{room.name}</h1>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  <Users size={14} className="mr-1" /> {room.capacity} Capacity
                </Badge>
              </div>
              
              <div className="flex items-center mt-2 text-muted-foreground">
                <MapPin size={16} className="mr-1" /> 
                {room.location}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h2 className="text-xl font-medium mb-2">About this room</h2>
              <p className="text-muted-foreground">{room.description}</p>
            </div>
            
            <div>
              <h2 className="text-xl font-medium mb-3">Amenities</h2>
              <div className="grid grid-cols-2 gap-y-2">
                {room.amenities.map(amenity => (
                  <div key={amenity} className="flex items-center gap-2">
                    <span>{getAmenityIcon(amenity)}</span>
                    <span>{formatAmenityName(amenity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Reservation Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-medium mb-4">Reserve this room</h2>
                
                <div className="mb-4">
                  <h3 className="font-medium text-sm mb-2">Select a date:</h3>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => setSelectedDate(date || new Date())}
                    className="w-full border rounded-md"
                    disabled={(date) => {
                      // Disable past dates
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                </div>
                
                <div className="mb-4">
                  <h3 className="font-medium text-sm mb-2">
                    Available times on {format(selectedDate, 'MMMM d, yyyy')}:
                  </h3>
                  
                  {availableSlots.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {timeSlots.map((slot, index) => (
                        <Button
                          key={index}
                          variant={slot.isAvailable ? "outline" : "ghost"}
                          size="sm"
                          disabled={!slot.isAvailable}
                          className={`text-xs ${!slot.isAvailable && 'opacity-50'}`}
                        >
                          {slot.startTime} - {slot.endTime}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-secondary/20 rounded-md">
                      <p className="text-sm text-muted-foreground">No available slots on this date</p>
                    </div>
                  )}
                </div>
                
                <Button 
                  className="w-full gap-2"
                  disabled={availableSlots.length === 0}
                  onClick={() => navigate(`/reserve/room/${room.id}?date=${dateString}`)}
                >
                  <CalendarCheck size={16} />
                  {availableSlots.length > 0 ? 'Continue to Reservation' : 'No Available Times'}
                </Button>
                
                <Separator className="my-4" />
                
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    // TODO: Show toast
                  }}
                >
                  <Share2 size={16} />
                  Share Room Details
                </Button>
              </CardContent>
            </Card>
            
            {/* Room location */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-medium mb-2">Room Location</h2>
                <div className="bg-secondary/20 rounded-md p-4 h-[150px] flex items-center justify-center relative">
                  {/* This would be a proper SVG map in a real app */}
                  <div className="border-2 border-primary/30 rounded-md w-3/4 h-3/4 flex items-center justify-center text-sm relative">
                    <div className="absolute w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs" style={{
                      top: `${(room.floorMapPosition.y % 100) / 2}%`,
                      left: `${(room.floorMapPosition.x % 100) / 2}%`
                    }}>
                      X
                    </div>
                    <span className="text-muted-foreground">Floor Map</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {room.location}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RoomDetails;
