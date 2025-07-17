
-- Create cart_items table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_price NUMERIC NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  variations JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index on session_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON public.cart_items(session_id);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);

-- Enable Row Level Security
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Create policy for selecting cart items
CREATE POLICY "Users can view their own cart"
  ON public.cart_items
  FOR SELECT
  USING (user_id = auth.uid() OR session_id = current_setting('request.headers')::json->>'cart-session-id');

-- Create policy for inserting cart items
CREATE POLICY "Users can add items to their cart"
  ON public.cart_items
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR session_id = current_setting('request.headers')::json->>'cart-session-id');

-- Create policy for updating cart items
CREATE POLICY "Users can update their cart items"
  ON public.cart_items
  FOR UPDATE
  USING (user_id = auth.uid() OR session_id = current_setting('request.headers')::json->>'cart-session-id');

-- Create policy for deleting cart items
CREATE POLICY "Users can delete their cart items"
  ON public.cart_items
  FOR DELETE
  USING (user_id = auth.uid() OR session_id = current_setting('request.headers')::json->>'cart-session-id');

-- Add RLS for anonymous users with session ID
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
