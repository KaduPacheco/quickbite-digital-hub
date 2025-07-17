
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/schema';
import { CartItem } from '@/types/schema';

export interface DbCartItem {
  id: string;
  session_id: string;
  user_id?: string | null;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string | null;
  quantity: number;
  variations: any;
  created_at: string;
}

// Generate a unique session ID for anonymous users
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now().toString() + '_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
};

// Convert database cart items to frontend cart items
export const dbCartItemsToCartItems = (dbItems: DbCartItem[]): CartItem[] => {
  return dbItems.map(item => ({
    product: {
      id: item.product_id,
      name: item.product_name,
      price: item.product_price,
      image: item.product_image || '',
      category: '',
      available: true,
      description: '',
    },
    quantity: item.quantity,
    variations: item.variations,
  }));
};

// Convert frontend cart items to database format
export const cartItemsToDbFormat = (
  items: CartItem[],
  userId: string | null = null
): Partial<DbCartItem>[] => {
  const sessionId = getSessionId();
  
  return items.map(item => ({
    session_id: sessionId,
    user_id: userId,
    product_id: item.product.id,
    product_name: item.product.name,
    product_price: item.product.price,
    product_image: item.product.image,
    quantity: item.quantity,
    variations: item.variations || null,
  }));
};

// Save cart to database
export const saveCart = async (
  items: CartItem[],
  userId: string | null = null
): Promise<{ success: boolean; error: any }> => {
  if (items.length === 0) {
    // Delete existing cart if empty
    return await clearCart(userId);
  }
  
  try {
    const sessionId = getSessionId();
    
    // First, clear the existing cart
    await supabase
      .from('cart_items')
      .delete()
      .match(userId ? { user_id: userId } : { session_id: sessionId });
    
    // Then insert new items
    const { error } = await supabase
      .from('cart_items')
      .insert(cartItemsToDbFormat(items, userId) as any[]);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error saving cart:', error);
    return { success: false, error };
  }
};

// Load cart from database
export const loadCart = async (
  userId: string | null = null
): Promise<{ items: CartItem[]; error: any }> => {
  try {
    const sessionId = getSessionId();
    
    let query = supabase
      .from('cart_items')
      .select('*');
    
    // Query by user_id if available, otherwise by session_id
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('session_id', sessionId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const cartItems = dbCartItemsToCartItems(data || []);
    return { items: cartItems, error: null };
  } catch (error) {
    console.error('Error loading cart:', error);
    return { items: [], error };
  }
};

// Clear cart from database
export const clearCart = async (
  userId: string | null = null
): Promise<{ success: boolean; error: any }> => {
  try {
    const sessionId = getSessionId();
    
    let query = supabase.from('cart_items').delete();
    
    // Delete by user_id if available, otherwise by session_id
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('session_id', sessionId);
    }
    
    const { error } = await query;
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, error };
  }
};

// Transfer session cart to user cart after login
export const transferCartToUser = async (userId: string): Promise<{ success: boolean; error: any }> => {
  try {
    const sessionId = getSessionId();
    
    // Update all cart items with the session_id to have the user_id
    const { error } = await supabase
      .from('cart_items')
      .update({ user_id: userId })
      .eq('session_id', sessionId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error transferring cart:', error);
    return { success: false, error };
  }
};
