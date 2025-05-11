import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { supabase } from '../integrations/supabase/client';
import { Room, RoomAmenity, TimeSlot } from '../types/models';
import { PostgrestError } from '@supabase/supabase-js';
import { Json } from '../integrations/supabase/types';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { CalendarIcon, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const RoomManagement = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availabilitySlots, setAvailabilitySlots] = useState<TimeSlot[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formState, setFormState] = useState<Partial<Room>>({
    name: '',
    description: '',
    capacity: 0,
    location: '',
    amenities: [],
    images: []
  });

  // Form state for editing/adding a room
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    setUploading(true);
    console.log('Starting image upload...');

    try {
      const file = event.target.files[0];
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Image size exceeds 2MB limit',
          variant: 'destructive',
        });
        setUploading(false);
        return;
      }
      
      console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `room_${uuidv4()}.${fileExt}`;
      const filePath = fileName;

      console.log('Uploading to path:', filePath);
      
      // Try to upload to Supabase storage
      let uploadedImageUrl = '';
      let uploadSuccess = false;
      
      // Instead of trying to upload to Supabase storage which might have permission issues,
      // we'll use a more reliable approach for this demo by using Base64 encoding
      
      // Read the file as a data URL (base64)
      const reader = new FileReader();
      
      // Create a promise to handle the FileReader async operation
      const readFileAsDataURL = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file as data URL'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      
      try {
        // Wait for the file to be read as a data URL
        const dataUrl = await readFileAsDataURL;
        console.log('File read as data URL successfully');
        
        // Use the data URL as the image source
        uploadedImageUrl = dataUrl;
        uploadSuccess = true;
        
        // For larger applications, you would upload to a storage service here
        // and use the returned URL instead of the data URL
      } catch (readError) {
        console.error('Error reading file:', readError);
        
        // Fallback to a placeholder image
        uploadedImageUrl = `https://placehold.co/600x400/9333ea/ffffff?text=${encodeURIComponent(formState.name || 'Room')}`;
        toast({
          title: 'Warning',
          description: 'Using placeholder image due to file reading issues',
          variant: 'default',
        });
      }
      
      // Update form state with the new image URL
      setFormState({
        ...formState,
        images: [uploadedImageUrl]
      });

      if (uploadSuccess) {
        toast({
          title: 'Success',
          description: 'Image uploaded successfully',
        });
      }
    } catch (error: any) {
      console.error('Error in image upload process:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // Available amenities
  const availableAmenities: RoomAmenity[] = [
    'wifi',
    'projector',
    'whiteboard',
    'computers',
    'videoconferencing',
    'printer',
    'study-pods',
    'silence'
  ];
  
  // Time slots for availability
  const timeSlots = [
    { startTime: '08:00', endTime: '10:00' },
    { startTime: '10:00', endTime: '12:00' },
    { startTime: '12:00', endTime: '14:00' },
    { startTime: '14:00', endTime: '16:00' },
    { startTime: '16:00', endTime: '18:00' },
    { startTime: '18:00', endTime: '20:00' },
  ];
  
  // Fetch all rooms
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*');
          
        if (error) throw error;
        
        if (data) {
          const roomsWithData: Room[] = data.map(room => ({
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
          setRooms(roomsWithData);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch rooms',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRooms();
  }, []);
  
  // Fetch availability for a specific room and date
  const fetchAvailability = async (roomId: string, date: Date) => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('room_availability')
        .select('*')
        .eq('room_id', roomId)
        .eq('date', formattedDate)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }
      
      if (data && data.slots) {
        let slots: TimeSlot[];
        if (typeof data.slots === 'string') {
          slots = JSON.parse(data.slots) as TimeSlot[];
        } else if (Array.isArray(data.slots)) {
          // Convert the JSON array to TimeSlot array with proper type checking
          slots = data.slots.map(item => {
            // Handle different possible structures of the slot data
            if (typeof item === 'object' && item !== null) {
              // Use type assertion and access with index notation for safety
              const itemObj = item as Record<string, any>;
              const startTime = typeof itemObj['startTime'] === 'string' ? itemObj['startTime'] : '';
              const endTime = typeof itemObj['endTime'] === 'string' ? itemObj['endTime'] : '';
              const isAvailable = Boolean(itemObj['isAvailable']);
              
              return { startTime, endTime, isAvailable };
            }
            // Default values if slot is not an object
            return { startTime: '', endTime: '', isAvailable: false };
          });
        } else {
          // Default to empty array if data structure is unexpected
          slots = [];
        }
        setAvailabilitySlots(slots);
      } else {
        // Initialize with default slots (all available)
        setAvailabilitySlots(timeSlots.map(slot => ({
          ...slot,
          isAvailable: true
        })));
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      // Initialize with default slots (all available)
      setAvailabilitySlots(timeSlots.map(slot => ({
        ...slot,
        isAvailable: true
      })));
    }
  };
  
  // Save availability for a room
  const saveAvailability = async () => {
    if (!selectedRoom) return;
    
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Convert TimeSlot[] to a JSON-compatible format
      // Create a plain object array that can be safely stored as JSON
      const slotsForStorage = JSON.stringify(availabilitySlots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable
      })));
      
      // Check if an entry already exists
      const { data: existingData, error: checkError } = await supabase
        .from('room_availability')
        .select('id')
        .eq('room_id', selectedRoom.id)
        .eq('date', formattedDate);
      
      if (checkError) throw checkError;
      
      if (existingData && existingData.length > 0) {
        // Update existing entry
        const { error } = await supabase
          .from('room_availability')
          .update({ slots: slotsForStorage })
          .eq('room_id', selectedRoom.id)
          .eq('date', formattedDate);
          
        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await supabase
          .from('room_availability')
          .insert({
            room_id: selectedRoom.id,
            date: formattedDate,
            slots: slotsForStorage
          });
          
        if (error) throw error;
      }
      
      toast({
        title: 'Success',
        description: 'Room availability updated successfully',
      });
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update room availability',
        variant: 'destructive',
      });
    }
  };
  
  // Handle editing a room
  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setFormState({
      name: room.name,
      description: room.description,
      capacity: room.capacity,
      location: room.location,
      amenities: room.amenities,
      images: room.images,
    });
  };
  
  // Handle adding a new room
  const handleAddRoom = () => {
    setIsAddingRoom(true);
    setFormState({
      name: '',
      description: '',
      capacity: 0,
      location: '',
      amenities: [],
      images: ['https://images.pexels.com/photos/1329571/pexels-photo-1329571.jpeg'],
    });
  };
  
  // Save room changes
  const saveRoomChanges = async () => {
    try {
      if (editingRoom) {
        // Update existing room
        const { error } = await supabase
          .from('rooms')
          .update({
            name: formState.name,
            description: formState.description,
            capacity: formState.capacity,
            location: formState.location,
            amenities: formState.amenities,
            images: formState.images
          })
          .eq('id', editingRoom.id);
          
        if (error) throw error;
        
        // Update local state
        setRooms(rooms.map(room => 
          room.id === editingRoom.id ? 
          { ...room, ...formState } : 
          room
        ));
        
        toast({
          title: 'Success',
          description: 'Room updated successfully',
        });
      } else if (isAddingRoom) {
        // Add new room
        const { data, error } = await supabase
          .from('rooms')
          .insert({
            name: formState.name,
            description: formState.description,
            capacity: formState.capacity,
            location: formState.location,
            amenities: formState.amenities,
            images: formState.images
          })
          .select();
          
        if (error) throw error;
        
        if (data && data[0]) {
          // Add to local state
          const newRoom: Room = {
            id: data[0].id,
            name: formState.name,
            description: formState.description,
            capacity: formState.capacity,
            location: formState.location,
            amenities: formState.amenities,
            images: formState.images,
            availabilitySchedule: [],
            floorMapPosition: { x: 0, y: 0 }
          };
          
          setRooms([...rooms, newRoom]);
          
          toast({
            title: 'Success',
            description: 'Room added successfully',
          });
        }
      }
    } catch (error) {
      console.error('Error saving room:', error);
      toast({
        title: 'Error',
        description: 'Failed to save room',
        variant: 'destructive',
      });
    } finally {
      setEditingRoom(null);
      setIsAddingRoom(false);
    }
  };
  
  // Delete a room
  const deleteRoom = async (roomId: string) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);
        
      if (error) throw error;
      
      // Update local state
      setRooms(rooms.filter(room => room.id !== roomId));
      
      toast({
        title: 'Success',
        description: 'Room deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting room:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete room',
        variant: 'destructive',
      });
    }
  };
  
  // Handle toggling a time slot's availability
  const toggleSlotAvailability = (index: number) => {
    const updatedSlots = [...availabilitySlots];
    updatedSlots[index] = {
      ...updatedSlots[index],
      isAvailable: !updatedSlots[index].isAvailable
    };
    setAvailabilitySlots(updatedSlots);
  };
  
  // Format amenity name for display
  const formatAmenityName = (amenity: RoomAmenity): string => {
    return amenity
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <DashboardLayout
      title="Room Management"
      breadcrumbs={[
        { label: 'Dashboard', path: '/librarian' },
        { label: 'Room Management' }
      ]}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Manage Rooms</h2>
          <Button onClick={handleAddRoom} className="flex items-center gap-2">
            <Plus size={16} />
            Add Room
          </Button>
        </div>
        
        <Tabs defaultValue="rooms" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>
          
          {/* Rooms Tab */}
          <TabsContent value="rooms" className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="h-20 bg-muted rounded-t-lg"></CardHeader>
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map(room => (
                  <Card key={room.id}>
                    {room.images && room.images[0] && (
                      <div className="relative h-48 w-full overflow-hidden">
                        <img 
                          src={room.images[0]} 
                          alt={room.name} 
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            // Fallback image if the URL is invalid
                            e.currentTarget.src = 'https://placehold.co/600x400/9333ea/ffffff?text=Room+Image';
                          }}
                        />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle>{room.name}</CardTitle>
                      <CardDescription>{room.location}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <p className="text-sm">{room.description}</p>
                        <p className="text-sm"><strong>Capacity:</strong> {room.capacity}</p>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.map((amenity, index) => (
                            <span 
                              key={index} 
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                            >
                              {formatAmenityName(amenity)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => handleEditRoom(room)}>
                        <Pencil size={16} className="mr-2" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteRoom(room.id)}>
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Availability Tab */}
          <TabsContent value="availability" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Room Availability</CardTitle>
                <CardDescription>
                  Manage when rooms are available for reservation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Room Selection */}
                  <div>
                    <Label htmlFor="room-select">Select Room</Label>
                    <Select 
                      value={selectedRoom?.id || ''}
                      onValueChange={(value) => {
                        const room = rooms.find(r => r.id === value);
                        if (room) {
                          setSelectedRoom(room);
                          fetchAvailability(room.id, selectedDate);
                        }
                      }}
                    >
                      <SelectTrigger id="room-select">
                        <SelectValue placeholder="Select a room" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map(room => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Date Selection */}
                  <div>
                    <Label>Select Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          disabled={!selectedRoom}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            if (date && selectedRoom) {
                              setSelectedDate(date);
                              fetchAvailability(selectedRoom.id, date);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {/* Save Button */}
                  <div className="flex items-end">
                    <Button 
                      onClick={saveAvailability} 
                      disabled={!selectedRoom || !selectedDate}
                      className="w-full"
                    >
                      <Save size={16} className="mr-2" />
                      Save Availability
                    </Button>
                  </div>
                </div>
                
                {/* Time Slots */}
                {selectedRoom && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Time Slots</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {availabilitySlots.map((slot, index) => (
                        <div 
                          key={index} 
                          className={cn(
                            "p-3 rounded-md border flex items-center justify-between",
                            slot.isAvailable ? "border-green-200 bg-green-50 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:bg-red-900/20"
                          )}
                        >
                          <span>
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`slot-${index}`}
                              checked={slot.isAvailable}
                              onCheckedChange={() => toggleSlotAvailability(index)}
                            />
                            <Label htmlFor={`slot-${index}`} className="text-sm">
                              {slot.isAvailable ? "Available" : "Unavailable"}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Room Edit/Add Dialog */}
      <Dialog open={!!editingRoom || isAddingRoom} onOpenChange={(open) => {
        if (!open) {
          setEditingRoom(null);
          setIsAddingRoom(false);
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingRoom ? `Edit ${editingRoom.name}` : 'Add New Room'}
            </DialogTitle>
            <DialogDescription>
              {editingRoom 
                ? 'Update the room details below.'
                : 'Fill in the details for the new room.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={formState.name}
                onChange={(e) => setFormState({...formState, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea
                id="description"
                value={formState.description}
                onChange={(e) => setFormState({...formState, description: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capacity" className="text-right">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formState.capacity}
                onChange={(e) => setFormState({...formState, capacity: parseInt(e.target.value) || 0})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">Location</Label>
              <Input
                id="location"
                value={formState.location}
                onChange={(e) => setFormState({...formState, location: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">Room Image</Label>
              <div className="col-span-3 space-y-2">
                {formState.images?.[0] && (
                  <div className="relative w-full h-32 mb-2 overflow-hidden rounded-md border">
                    <img 
                      src={formState.images[0]} 
                      alt="Room preview" 
                      className="object-cover w-full h-full"
                    />
                    <Button 
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => setFormState({...formState, images: []})}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                )}
                {!formState.images?.[0] && (
                  <>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <p className="text-xs text-muted-foreground">Uploading image...</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Upload an image of the room (max 2MB)</p>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Amenities</Label>
              <div className="col-span-3 grid grid-cols-2 gap-2">
                {availableAmenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`amenity-${amenity}`}
                      checked={formState.amenities.includes(amenity)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormState({
                            ...formState,
                            amenities: [...formState.amenities, amenity]
                          });
                        } else {
                          setFormState({
                            ...formState,
                            amenities: formState.amenities.filter(a => a !== amenity)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`amenity-${amenity}`}>{formatAmenityName(amenity)}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditingRoom(null);
              setIsAddingRoom(false);
            }}>
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button onClick={saveRoomChanges}>
              <Save size={16} className="mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default RoomManagement;
