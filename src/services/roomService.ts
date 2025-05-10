import { supabase } from '../integrations/supabase/client';
import { Room, RoomAmenity } from '../types/models';

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
          floorMapPosition: room.floor_map_position || { x: 0, y: 0 }
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
        availabilitySchedule: availabilityData || [],
        floorMapPosition: room.floor_map_position || { x: 0, y: 0 }
      };
    })
  );

  return rooms;
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
      floorMapPosition: room.floor_map_position || { x: 0, y: 0 }
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
    availabilitySchedule: availabilityData || [],
    floorMapPosition: room.floor_map_position || { x: 0, y: 0 }
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
          floorMapPosition: room.floor_map_position || { x: 0, y: 0 }
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
        availabilitySchedule: availabilityData || [],
        floorMapPosition: room.floor_map_position || { x: 0, y: 0 }
      };
    })
  );

  // Filter by date availability if needed
  if (filters.date) {
    return rooms.filter(room => {
      const availabilityForDate = room.availabilitySchedule.find(
        schedule => schedule.date === filters.date
      );
      return availabilityForDate && availabilityForDate.slots.some((slot: any) => slot.isAvailable);
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
