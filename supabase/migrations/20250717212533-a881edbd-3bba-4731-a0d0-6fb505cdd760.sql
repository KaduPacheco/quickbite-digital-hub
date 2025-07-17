
-- Create cart_items table
CREATE TABLE public.cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    product_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    product_price NUMERIC NOT NULL,
    product_image TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    variations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_cart_items_session ON cart_items(session_id);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);

-- Enable RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can manage their own cart items"
ON public.cart_items
USING (
  (auth.uid() IS NULL AND session_id = current_setting('app.current_session_id', TRUE))
  OR 
  (auth.uid() = user_id)
);
