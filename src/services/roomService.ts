
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

  // Apply amenities filter
  if (filters.amenities && filters.amenities.length > 0) {
    filters.amenities.forEach(amenity => {
      roomsQuery = roomsQuery.contains('amenities', [amenity]);
    });
  }

  const { data: roomsData, error: roomsError } = await roomsQuery;

  if (roomsError) {
    console.error("Error searching rooms:", roomsError);
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

export const getAllAmenities = async (): Promise<RoomAmenity[]> => {
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

  return Array.from(amenitiesSet).sort() as RoomAmenity[];
};
