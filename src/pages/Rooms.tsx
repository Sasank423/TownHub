
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { searchRooms, getAllAmenities } from '../services/roomService';
import { Room, RoomAmenity, TimeSlot } from '../types/models';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Home, 
  Wifi, 
  Monitor, 
  Printer, 
  PenTool, 
  Video, 
  Users,
  Calendar as CalendarIcon 
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '../integrations/supabase/client';

// Format amenity name for display
const formatAmenityName = (amenity: RoomAmenity): string => {
  return amenity
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get icon for amenity
const getAmenityIcon = (amenity: RoomAmenity) => {
  switch (amenity) {
    case 'wifi': return <Wifi size={16} />;
    case 'projector': return <Monitor size={16} />;
    case 'whiteboard': return <PenTool size={16} />;
    case 'computers': return <Monitor size={16} />;
    case 'videoconferencing': return <Video size={16} />;
    case 'printer': return <Printer size={16} />;
    case 'study-pods': return <Users size={16} />;
    case 'silence': return <span className="text-xs">🔇</span>;
    default: return null;
  }
};

const Rooms = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<RoomAmenity[]>([]);
  const [minCapacity, setMinCapacity] = useState<number | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'map'>('list');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [allAmenities, setAllAmenities] = useState<RoomAmenity[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const amenities = await getAllAmenities();
        setAllAmenities(amenities);
      } catch (error) {
        console.error("Error fetching amenities:", error);
      }
    };
    
    fetchAmenities();
  }, []);
  
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        console.log('Fetching rooms with filters:', {
          searchQuery,
          amenities: selectedAmenities,
          capacity: minCapacity,
          date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined
        });
        
        // Format the selected date for querying availability
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        console.log('Formatted date for availability check:', formattedDate);
        
        // First try direct query to Supabase to check if rooms exist
        const { data: directRoomsData, error: directError } = await supabase
          .from('rooms')
          .select('*');
          
        console.log('Direct Supabase query results:', directRoomsData?.length || 0, 'rooms');
        console.log('Direct query error:', directError);
        
        // Fetch room availability data from room_availability table
        const { data: availabilityData, error: availabilityError } = await supabase
          .from('room_availability')
          .select('*')
          .eq('date', formattedDate);
          
        console.log('Room availability data:', availabilityData?.length || 0, 'records');
        console.log('Availability error:', availabilityError);
        
        // If no rooms found, try to add sample rooms
        if (!directRoomsData || directRoomsData.length === 0) {
          console.log('No rooms found, adding sample rooms...');
          
          const sampleRooms = [
            {
              name: 'Study Room A',
              description: 'A quiet study room for individual or small group study sessions.',
              capacity: 4,
              location: 'First Floor, East Wing',
              amenities: ['wifi', 'whiteboard', 'silence'] as RoomAmenity[],
              images: ['https://images.pexels.com/photos/1329571/pexels-photo-1329571.jpeg']
            },
            {
              name: 'Collaboration Space',
              description: 'Open space designed for group projects and collaborative work.',
              capacity: 12,
              location: 'Second Floor, Central Area',
              amenities: ['wifi', 'projector', 'whiteboard', 'videoconferencing'] as RoomAmenity[],
              images: ['https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg']
            },
            {
              name: 'Computer Lab',
              description: 'Room equipped with desktop computers and specialized software.',
              capacity: 20,
              location: 'First Floor, West Wing',
              amenities: ['wifi', 'computers', 'printer'] as RoomAmenity[],
              images: ['https://images.pexels.com/photos/267507/pexels-photo-267507.jpeg']
            }
          ];
          
          // Try to add each room
          for (const room of sampleRooms) {
            const { error: insertError } = await supabase.from('rooms').insert(room);
            if (insertError) {
              console.error(`Error adding room ${room.name}:`, insertError);
            } else {
              console.log(`Added room: ${room.name}`);
            }
          }
          
          // Query again to get the newly added rooms
          const { data: newRoomsData } = await supabase.from('rooms').select('*');
          if (newRoomsData && newRoomsData.length > 0) {
            console.log('Successfully added and retrieved sample rooms:', newRoomsData.length);
            // Create a new array with the fetched data instead of reassigning the const variable
            const updatedRoomsData = newRoomsData;
            
            // Convert the direct data to Room objects
            const directRooms = updatedRoomsData.map(room => ({
              id: room.id,
              name: room.name,
              description: room.description || '',
              capacity: room.capacity,
              location: room.location || '',
              amenities: room.amenities || [],
              images: room.images || ['https://images.pexels.com/photos/1329571/pexels-photo-1329571.jpeg'],
              availabilitySchedule: [],
              floorMapPosition: { x: 0, y: 0 }
            }));
            
            console.log('Direct rooms processed:', directRooms.length);
            setFilteredRooms(directRooms);
            setLoading(false);
            return; // Exit early since we've set the rooms
          }
        }
        
        if (directRoomsData && directRoomsData.length > 0) {
          // Process availability data
          const availabilityMap = new Map();
          if (availabilityData && availabilityData.length > 0) {
            availabilityData.forEach(avail => {
              // Parse the slots data
              let slots = [];
              try {
                if (typeof avail.slots === 'string') {
                  slots = JSON.parse(avail.slots);
                } else if (Array.isArray(avail.slots)) {
                  slots = avail.slots;
                }
              } catch (e) {
                console.error('Error parsing slots:', e);
              }
              
              availabilityMap.set(avail.room_id, {
                date: avail.date,
                slots: slots
              });
            });
          }
          
          console.log('Availability map created with', availabilityMap.size, 'entries');
          
          // Convert the direct data to Room objects with availability info
          const directRooms = directRoomsData.map(room => {
            // Get availability for this room
            const roomAvailability = availabilityMap.get(room.id);
            const availabilitySchedule = roomAvailability ? [roomAvailability] : [];
            
            return {
              id: room.id,
              name: room.name,
              description: room.description || '',
              capacity: room.capacity,
              location: room.location || '',
              amenities: room.amenities || [],
              images: room.images || ['https://images.pexels.com/photos/1329571/pexels-photo-1329571.jpeg'],
              availabilitySchedule: availabilitySchedule,
              floorMapPosition: { x: 0, y: 0 }
            };
          });
          
          console.log('Direct rooms processed with availability:', directRooms.length);
          setFilteredRooms(directRooms);
        } else {
          // Fall back to the regular search function
          const rooms = await searchRooms(searchQuery, {
            amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
            capacity: minCapacity ? Number(minCapacity) : undefined,
            date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined
          });
          
          console.log('Rooms fetched via searchRooms:', rooms.length);
          console.log('Room data:', JSON.stringify(rooms, null, 2));
          setFilteredRooms(rooms);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRooms();
  }, [searchQuery, selectedAmenities, minCapacity, selectedDate]);
  
  // Handle amenity toggle
  const toggleAmenity = (amenity: RoomAmenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setSelectedAmenities([]);
    setMinCapacity('');
  };
  
  return (
    <DashboardLayout 
      title="Reading Rooms" 
      breadcrumbs={[
        { label: 'Dashboard', path: '/member' },
        { label: 'Rooms' }
      ]}
    >
      <div className="space-y-6">
        {/* Search and View Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search rooms..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              {(selectedAmenities.length > 0 || minCapacity) && (
                <Badge variant="secondary" className="ml-1">
                  {selectedAmenities.length + (minCapacity ? 1 : 0)}
                </Badge>
              )}
            </Button>
            
            <Tabs 
              defaultValue="list" 
              value={viewMode}
              onValueChange={(value) => setViewMode(value as 'list' | 'calendar' | 'map')}
              className="w-fit"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="map">Map</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <Card className="animate-fade-in">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Amenities Filter */}
                <div>
                  <h3 className="font-medium mb-2">Amenities</h3>
                  {loading ? (
                    <div className="grid grid-cols-2 gap-2">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="flex items-center space-x-2">
                          <Skeleton className="h-4 w-4 rounded" />
                          <Skeleton className="h-4 w-24 rounded" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {allAmenities.map(amenity => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`amenity-${amenity}`}
                            checked={selectedAmenities.includes(amenity)}
                            onCheckedChange={() => toggleAmenity(amenity)}
                          />
                          <label
                            htmlFor={`amenity-${amenity}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
                          >
                            {getAmenityIcon(amenity)}
                            {formatAmenityName(amenity)}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Capacity Filter */}
                <div>
                  <h3 className="font-medium mb-2">Minimum Capacity</h3>
                  <Select
                    value={minCapacity.toString()}
                    onValueChange={(value) => setMinCapacity(value ? parseInt(value) : '')}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any capacity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any capacity</SelectItem>
                      <SelectItem value="1">1 person</SelectItem>
                      <SelectItem value="2">2+ people</SelectItem>
                      <SelectItem value="5">5+ people</SelectItem>
                      <SelectItem value="10">10+ people</SelectItem>
                      <SelectItem value="20">20+ people</SelectItem>
                    </SelectContent>
                  </Select>
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
        
        {/* View Tabs Content */}
        <div className="space-y-6">
          {viewMode === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="aspect-video">
                      <Skeleton className="h-full w-full" />
                    </div>
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-3" />
                      <Skeleton className="h-3 w-full mb-2" />
                      <Skeleton className="h-3 w-5/6 mb-3" />
                      <div className="flex flex-wrap gap-1">
                        {[1, 2, 3, 4].map(j => (
                          <Skeleton key={j} className="h-6 w-6 rounded" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredRooms.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <Home className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No rooms found</h3>
                  <p className="mt-1 text-muted-foreground">Try adjusting your search or filters</p>
                  {(searchQuery || selectedAmenities.length > 0 || minCapacity) && (
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
                filteredRooms.map(room => (
                  <RoomCard key={room.id} room={room} selectedDate={selectedDate} />
                ))
              )}
            </div>
          )}
          
          {viewMode === 'calendar' && (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 bg-card rounded-lg p-4 shadow-sm">
                <h3 className="font-medium mb-4">Select a date</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setSelectedDate(date || new Date())}
                  className="rounded-md border w-full"
                  disabled={(date) => {
                    // Disable past dates
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                />
                
                <div className="mt-4">
                  <p className="text-sm font-medium">
                    Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Showing rooms available on this date
                  </p>
                </div>
              </div>
              
              <div className="md:w-2/3 space-y-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-12 h-12 rounded-md" />
                            <div>
                              <Skeleton className="h-5 w-40 mb-1" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-9 w-20" />
                        </div>
                        <div className="border rounded-md p-2 bg-secondary/10">
                          <Skeleton className="h-5 w-64 mb-2" />
                          <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 8 }).map((_, j) => (
                              <Skeleton key={j} className="h-8 w-20" />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : filteredRooms.length > 0 ? (
                  filteredRooms.map(room => (
                    <RoomTimeTable 
                      key={room.id} 
                      room={room} 
                      selectedDate={selectedDate}
                    />
                  ))
                ) : (
                  <div className="text-center py-16 bg-card rounded-lg p-6">
                    <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No available rooms</h3>
                    <p className="mt-1 text-muted-foreground">
                      There are no rooms available on {format(selectedDate, 'MMMM d, yyyy')}
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4" 
                      onClick={() => {
                        // Set date to tomorrow
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        setSelectedDate(tomorrow);
                      }}
                    >
                      Try tomorrow instead
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {viewMode === 'map' && (
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="font-medium mb-4">Library Floor Map</h3>
              
              <div className="relative w-full h-[500px] bg-secondary/30 rounded-lg border overflow-hidden">
                {/* This would ideally be a proper SVG map of the library layout */}
                <div className="absolute inset-0 p-8">
                  <div className="border-2 border-muted-foreground/30 rounded-lg h-full w-full relative">
                    <div className="absolute top-6 left-6 h-40 w-60 border-2 border-muted-foreground/30 rounded bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">
                      Main Entrance
                    </div>
                    
                    <div className="absolute bottom-12 right-20 h-32 w-40 border-2 border-muted-foreground/30 rounded bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">
                      Library Stacks
                    </div>
                    
                    {/* Plot rooms on the map */}
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <div 
                          key={i}
                          className="absolute"
                          style={{ 
                            top: `${100 + i * 70}px`, 
                            left: `${150 + i * 50}px` 
                          }}
                        >
                          <Skeleton className="h-16 w-16 rounded-full" />
                        </div>
                      ))
                    ) : (
                      filteredRooms.map(room => (
                        <Link
                          key={room.id}
                          to={`/rooms/${room.id}`}
                          className="absolute group"
                          style={{ 
                            top: `${room.floorMapPosition.y}px`, 
                            left: `${room.floorMapPosition.x}px` 
                          }}
                        >
                          <div className={`
                            h-16 w-16 rounded-full bg-primary/10 border-2 border-primary 
                            flex flex-col items-center justify-center transition-transform 
                            group-hover:scale-110 group-hover:shadow-md cursor-pointer
                          `}>
                            <span className="text-xs font-medium">{room.name.split(' ')[0]}</span>
                            <span className="text-[10px] text-muted-foreground">Room</span>
                          </div>
                          <div className="invisible group-hover:visible absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white p-2 rounded shadow-md z-10 w-48">
                            <p className="font-medium text-sm">{room.name}</p>
                            <p className="text-xs text-muted-foreground">Capacity: {room.capacity}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {room.amenities.slice(0, 3).map(amenity => (
                                <Badge key={amenity} variant="outline" className="text-[10px]">
                                  {formatAmenityName(amenity)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
                
                <div className="absolute bottom-4 right-4 bg-card p-2 rounded shadow-sm text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-3 w-3 rounded-full bg-primary/10 border border-primary"></div>
                    <span>Room Location</span>
                  </div>
                  <p className="text-muted-foreground">Click on a room to see details</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

interface RoomCardProps {
  room: Room;
  selectedDate: Date;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, selectedDate }) => {
  // Get availability for the selected date
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const availabilityForDate = room.availabilitySchedule.find(a => a.date === dateString);
  const availableSlots = availabilityForDate?.slots.filter(slot => slot.isAvailable) || [];
  const isAvailableToday = availableSlots.length > 0;
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/rooms/${room.id}`} className="flex flex-col h-full">
        <div className="aspect-video overflow-hidden relative">
          <img 
            src={room.images[0]} 
            alt={`Image of ${room.name}`}
            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
          />
          <div className={`absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-medium ${
            isAvailableToday ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isAvailableToday ? `${availableSlots.length} slots available` : 'No availability'}
          </div>
        </div>
        <CardContent className="p-4 flex-grow flex flex-col">
          <h3 className="font-medium" title={room.name}>{room.name}</h3>
          <div className="flex items-center mt-1">
            <Users size={14} className="text-muted-foreground mr-1" />
            <p className="text-sm text-muted-foreground">Capacity: {room.capacity}</p>
          </div>
          <p className="text-sm line-clamp-2 mt-2">{room.description}</p>
          <div className="mt-auto pt-2">
            <div className="flex flex-wrap gap-1">
              {room.amenities.map(amenity => (
                <div 
                  key={amenity} 
                  className="p-1 rounded bg-secondary/40 flex items-center justify-center"
                  title={formatAmenityName(amenity)}
                >
                  {getAmenityIcon(amenity)}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

interface RoomTimeTableProps {
  room: Room;
  selectedDate: Date;
}

const RoomTimeTable: React.FC<RoomTimeTableProps> = ({ room, selectedDate }) => {
  // Get availability for the selected date
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const availabilityForDate = room.availabilitySchedule.find(a => a.date === dateString);
  const timeSlots = availabilityForDate?.slots || [];
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img 
              src={room.images[0]} 
              alt={`Image of ${room.name}`}
              className="w-12 h-12 rounded-md object-cover"
            />
            <div>
              <h3 className="font-medium">{room.name}</h3>
              <p className="text-sm text-muted-foreground">{room.location}</p>
            </div>
          </div>
          <Link to={`/rooms/${room.id}`}>
            <Button size="sm" variant="outline">Details</Button>
          </Link>
        </div>
        
        <div className="border rounded-md p-2 bg-secondary/10">
          <div className="text-sm font-medium mb-2">
            {format(selectedDate, 'EEEE, MMMM d')} - Available Time Slots
          </div>
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((slot, index) => (
              <Button
                key={index}
                variant={slot.isAvailable ? "outline" : "ghost"}
                size="sm"
                disabled={!slot.isAvailable}
                className={`text-xs ${!slot.isAvailable && 'opacity-50'}`}
                onClick={(e) => {
                  e.preventDefault();
                  // Navigate to reservation wizard when clicked
                  if (slot.isAvailable) {
                    window.location.href = `/reserve/room/${room.id}?date=${dateString}&start=${slot.startTime}&end=${slot.endTime}`;
                  }
                }}
              >
                {slot.startTime} - {slot.endTime}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Rooms;
