
import { supabase } from '@/integrations/supabase/client';

// This is just a helper function to create demo users in Supabase
// You should run this function once manually in development
export const createDemoUsers = async () => {
  try {
    // Create a demo member user
    const { data: memberData, error: memberError } = await supabase.auth.admin.createUser({
      email: 'john@example.com',
      password: 'password',
      email_confirm: true,
      user_metadata: {
        name: 'John Doe',
      }
    });
    
    if (memberError) throw memberError;
    
    // Create a demo librarian user
    const { data: librarianData, error: librarianError } = await supabase.auth.admin.createUser({
      email: 'jane@example.com',
      password: 'password',
      email_confirm: true,
      user_metadata: {
        name: 'Jane Smith',
      }
    });
    
    if (librarianError) throw librarianError;
    
    // Update the librarian's role in the profiles table
    if (librarianData.user) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'librarian' })
        .eq('id', librarianData.user.id);
        
      if (updateError) throw updateError;
    }
    
    console.log('Demo users created successfully');
    return { success: true };
  } catch (error) {
    console.error('Error creating demo users:', error);
    return { success: false, error };
  }
};

// Note: The admin functions like createUser require additional permissions
// and won't work with the client-side API. This is just for reference.
// You would need to create these users via the Supabase dashboard
// or through a secure server-side function.
