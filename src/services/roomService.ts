
import { supabase } from '../integrations/supabase/client';
import { Room, RoomAmenity, TimeSlot } from '../types/models';
import { Json } from '../integrations/supabase/types';

export const getRooms = async (): Promise<Room[]> => {
  const { data: roomsData, error: roomsError } = await supabase
    .from('rooms')
    .select('*');

  if (roomsError) {
    console.error("Error fetching rooms:", roomsError);
    return [];
  }

  // Get availability for each room
  const rooms = await Promise.all(
    roomsData.map(async (room) => {
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('room_availability')
        .select('date, slots')
        .eq('room_id', room.id);

      if (availabilityError) {
        console.error(`Error fetching availability for room ${room.id}:`, availabilityError);
        return {
          id: room.id,
          name: room.name,
          description: room.description || '',
          capacity: room.capacity,
          location: room.location || '',
          amenities: room.amenities || [],
          images: room.images || ['https://images.pexels.com/photos/1329571/pexels-photo-1329571.jpeg'],
          availabilitySchedule: [],
          floorMapPosition: parseFloorMapPosition(room.floor_map_position)
        };
      }

      return {
        id: room.id,
        name: room.name,
        description: room.description || '',
        capacity: room.capacity,
        location: room.location || '',
        amenities: room.amenities || [],
        images: room.images || ['https://images.pexels.com/photos/1329571/pexels-photo-1329571.jpeg'],
        availabilitySchedule: availabilityData ? availabilityData.map(item => ({
          date: item.date,
          slots: parseSlots(item.slots)
        })) : [],
        floorMapPosition: parseFloorMapPosition(room.floor_map_position)
      };
    })
  );

  return rooms;
};

// Helper function to parse floor map position
const parseFloorMapPosition = (position: Json | null): { x: number; y: number } => {
  if (!position) {
    return { x: 0, y: 0 };
  }

  // If it's an object with x and y properties
  if (typeof position === 'object' && !Array.isArray(position) && position !== null) {
    const posObj = position as Record<string, any>;
    if (typeof posObj.x === 'number' && typeof posObj.y === 'number') {
      return { x: posObj.x, y: posObj.y };
    }
  }

  // Default fallback
  return { x: 0, y: 0 };
};

// Parse slots data from JSON to ensure it matches the TimeSlot[] type
const parseSlots = (slotsData: any): TimeSlot[] => {
  try {
    if (typeof slotsData === 'string') {
      const parsed = JSON.parse(slotsData);
      if (Array.isArray(parsed)) {
        return parsed.map(slot => ({
          startTime: slot.startTime || '',
          endTime: slot.endTime || '',
          isAvailable: !!slot.isAvailable
        }));
      }
    }
    if (Array.isArray(slotsData)) {
      return slotsData.map(slot => ({
        startTime: slot.startTime || '',
        endTime: slot.endTime || '',
        isAvailable: !!slot.isAvailable
      }));
    }
    return [];
  } catch (e) {
    console.error('Error parsing slots data:', e);
    return [];
  }
};

export const getRoomById = async (id: string): Promise<Room | null> => {
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .single();

  if (roomError) {
    console.error(`Error fetching room with id ${id}:`, roomError);
    return null;
  }

  const { data: availabilityData, error: availabilityError } = await supabase
    .from('room_availability')
    .select('date, slots')
    .eq('room_id', id);

  if (availabilityError) {
    console.error(`Error fetching availability for room ${id}:`, availabilityError);
    return {
      id: room.id,
      name: room.name,
      description: room.description || '',
      capacity: room.capacity,
      location: room.location || '',
      amenities: room.amenities || [],
      images: room.images || ['https://images.pexels.com/photos/1329571/pexels-photo-1329571.jpeg'],
      availabilitySchedule: [],
      floorMapPosition: parseFloorMapPosition(room.floor_map_position)
    };
  }

  return {
    id: room.id,
    name: room.name,
    description: room.description || '',
    capacity: room.capacity,
    location: room.location || '',
    amenities: room.amenities || [],
    images: room.images || ['https://images.pexels.com/photos/1329571/pexels-photo-1329571.jpeg'],
    availabilitySchedule: availabilityData ? availabilityData.map(item => ({
      date: item.date,
      slots: parseSlots(item.slots)
    })) : [],
    floorMapPosition: parseFloorMapPosition(room.floor_map_position)
  };
};

export const searchRooms = async (
  query: string,
  filters: {
    capacity?: number;
    amenities?: RoomAmenity[];
    date?: string;
  } = {}
): Promise<Room[]> => {
  console.log('Searching rooms with query:', query, 'and filters:', filters);
  
  let roomsQuery = supabase
    .from('rooms')
    .select('*');

  // Apply search query
  if (query) {
    roomsQuery = roomsQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`);
  }

  // Apply capacity filter
  if (filters.capacity) {
    roomsQuery = roomsQuery.gte('capacity', filters.capacity);
  }

  // Apply amenities filter - commenting out for now to get all rooms
  /* if (filters.amenities && filters.amenities.length > 0) {
    // Check if amenities is stored as an array or as a JSON string
    filters.amenities.forEach(amenity => {
      roomsQuery = roomsQuery.or(`amenities.cs.{${amenity}},amenities.cs.["${amenity}"]`);
    });
  } */

  // Execute the query and log results
  console.log('Executing Supabase query:', roomsQuery);
  const { data: roomsData, error: roomsError } = await roomsQuery;
  
  // Log the raw data for debugging
  console.log('Raw room data from Supabase:', roomsData);

  if (roomsError) {
    console.error("Error searching rooms:", roomsError);
    return [];
  }
  
  console.log('Found rooms data:', roomsData?.length || 0, 'rooms');
  
  // If no rooms found, try a simpler query to check if any rooms exist at all
  if (!roomsData || roomsData.length === 0) {
    console.log('No rooms found matching the current filters');
    
    // Check if there are any rooms in the database at all
    const { data: allRooms, error: allRoomsError } = await supabase
      .from('rooms')
      .select('count');
      
    if (allRoomsError) {
      console.error("Error checking room count:", allRoomsError);
    } else {
      const roomCount = allRooms?.[0]?.count || 0;
      console.log('Total rooms in database:', roomCount);
      
      // If no rooms exist at all, add sample rooms
      if (roomCount === 0) {
        console.log('No rooms found in database. Adding sample rooms...');
        await addSampleRooms();
        
        // Try fetching again after adding sample data
        const { data: newRooms } = await supabase.from('rooms').select('*');
        if (newRooms && newRooms.length > 0) {
          console.log('Successfully added and retrieved sample rooms:', newRooms.length);
          return formatRooms(newRooms);
        }
      }
    }
  }

  // Get availability for each room
  const rooms = await Promise.all(
    roomsData.map(async (room) => {
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('room_availability')
        .select('date, slots')
        .eq('room_id', room.id);

      if (availabilityError) {
        console.error(`Error fetching availability for room ${room.id}:`, availabilityError);
        return {
          id: room.id,
          name: room.name,
          description: room.description || '',
          capacity: room.capacity,
          location: room.location || '',
          amenities: room.amenities || [],
          images: room.images || ['https://images.pexels.com/photos/1329571/pexels-photo-1329571.jpeg'],
          availabilitySchedule: [],
          floorMapPosition: parseFloorMapPosition(room.floor_map_position)
        };
      }

      return {
        id: room.id,
        name: room.name,
        description: room.description || '',
        capacity: room.capacity,
        location: room.location || '',
        amenities: room.amenities || [],
        images: room.images || ['https://images.pexels.com/photos/1329571/pexels-photo-1329571.jpeg'],
        availabilitySchedule: availabilityData ? availabilityData.map(item => ({
          date: item.date,
          slots: parseSlots(item.slots)
        })) : [],
        floorMapPosition: parseFloorMapPosition(room.floor_map_position)
      };
    })
  );

  // Filter by date availability if needed
  if (filters.date) {
    return rooms.filter(room => {
      const availabilityForDate = room.availabilitySchedule.find(
        schedule => schedule.date === filters.date
      );
      // Check if any slot is available for this date
      return availabilityForDate && availabilityForDate.slots.some(slot => slot.isAvailable);
    });
  }

  return rooms;
};

// Format room data consistently
const formatRooms = (roomsData: any[]): Room[] => {
  return roomsData.map(room => ({
    id: room.id,
    name: room.name,
    description: room.description || '',
    capacity: room.capacity,
    location: room.location || '',
    amenities: room.amenities || [],
    images: room.images || ['https://images.pexels.com/photos/1329571/pexels-photo-1329571.jpeg'],
    availabilitySchedule: [],
    floorMapPosition: parseFloorMapPosition(room.floor_map_position)
  }));
};

// Add sample rooms to the database if none exist
const addSampleRooms = async (): Promise<void> => {
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

  for (const room of sampleRooms) {
    const { error } = await supabase.from('rooms').insert(room);
    if (error) {
      console.error('Error adding sample room:', error);
    }
  }
};

export const getAllAmenities = async (): Promise<RoomAmenity[]> => {
  console.log('Fetching all amenities');
  const { data, error } = await supabase
    .from('rooms')
    .select('amenities');

  if (error) {
    console.error("Error fetching amenities:", error);
    return [];
  }

  // Flatten and deduplicate the amenities
  const amenitiesSet = new Set<RoomAmenity>();
  data.forEach(room => {
    if (room.amenities) {
      room.amenities.forEach((amenity: RoomAmenity) => amenitiesSet.add(amenity));
    }
  });

  const amenities = Array.from(amenitiesSet).sort() as RoomAmenity[];
  console.log('Found amenities:', amenities);
  
  // If no amenities found, return default set
  if (amenities.length === 0) {
    return ['wifi', 'projector', 'whiteboard', 'computers', 'videoconferencing', 'printer', 'study-pods', 'silence'];
  }
  
  return amenities;
};
