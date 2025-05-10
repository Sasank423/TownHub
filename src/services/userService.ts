
import { supabase } from '../integrations/supabase/client';
import { User } from '../types/models';

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return data.map(profile => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    membershipStatus: 'Active', // This would need to be calculated based on your business logic
    joinDate: profile.created_at
  }));
};

export const getUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching user with id ${id}:`, error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    membershipStatus: 'Active', // This would need to be calculated based on your business logic
    joinDate: data.created_at
  };
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error("Error fetching current user profile:", error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    membershipStatus: 'Active', // This would need to be calculated based on your business logic
    joinDate: data.created_at
  };
};
