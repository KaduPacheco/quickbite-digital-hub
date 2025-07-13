-- Create ENUMs
CREATE TYPE public.usuario_tipo AS ENUM ('admin', 'funcionario', 'cliente');
CREATE TYPE public.pedido_status AS ENUM ('recebido', 'preparo', 'em_rota', 'entregue');
CREATE TYPE public.promocao_tipo AS ENUM ('percentual', 'fixo');

-- Create lanchonetes table
CREATE TABLE public.lanchonetes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    endereco TEXT,
    logo_url TEXT,
    horario_funcionamento TEXT,
    taxa_entrega NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create usuarios table
CREATE TABLE public.usuarios (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lanchonete_id UUID REFERENCES public.lanchonetes(id) ON DELETE CASCADE,
    tipo public.usuario_tipo NOT NULL DEFAULT 'cliente',
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categorias table
CREATE TABLE public.categorias (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lanchonete_id UUID NOT NULL REFERENCES public.lanchonetes(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create produtos table
CREATE TABLE public.produtos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lanchonete_id UUID NOT NULL REFERENCES public.lanchonetes(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco_base NUMERIC(10,2) NOT NULL,
    imagem_url TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create variacoes_produto table
CREATE TABLE public.variacoes_produto (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    adicional_preco NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pedidos table
CREATE TABLE public.pedidos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    lanchonete_id UUID NOT NULL REFERENCES public.lanchonetes(id) ON DELETE CASCADE,
    total NUMERIC(10,2) NOT NULL,
    status public.pedido_status NOT NULL DEFAULT 'recebido',
    endereco_entrega TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create itens_pedido table
CREATE TABLE public.itens_pedido (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unitario NUMERIC(10,2) NOT NULL,
    variacoes JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create estoque table
CREATE TABLE public.estoque (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE UNIQUE,
    quantidade INTEGER NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
    alerta_baixo INTEGER NOT NULL DEFAULT 5 CHECK (alerta_baixo >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create promocoes table
CREATE TABLE public.promocoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lanchonete_id UUID NOT NULL REFERENCES public.lanchonetes(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    codigo TEXT NOT NULL,
    tipo public.promocao_tipo NOT NULL,
    valor NUMERIC(10,2) NOT NULL CHECK (valor > 0),
    validade TIMESTAMP WITH TIME ZONE NOT NULL,
    valor_minimo NUMERIC(10,2) DEFAULT 0 CHECK (valor_minimo >= 0),
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(lanchonete_id, codigo)
);

-- Create config_lanchonete table
CREATE TABLE public.config_lanchonete (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lanchonete_id UUID NOT NULL REFERENCES public.lanchonetes(id) ON DELETE CASCADE UNIQUE,
    aceita_pix BOOLEAN NOT NULL DEFAULT false,
    chave_pix TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create entregadores table (for future expansion)
CREATE TABLE public.entregadores (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lanchonete_id UUID NOT NULL REFERENCES public.lanchonetes(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    telefone TEXT,
    veiculo TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for frequent searches
CREATE INDEX idx_usuarios_lanchonete_id ON public.usuarios(lanchonete_id);
CREATE INDEX idx_usuarios_tipo ON public.usuarios(tipo);
CREATE INDEX idx_categorias_lanchonete_id ON public.categorias(lanchonete_id);
CREATE INDEX idx_produtos_lanchonete_id ON public.produtos(lanchonete_id);
CREATE INDEX idx_produtos_categoria_id ON public.produtos(categoria_id);
CREATE INDEX idx_produtos_nome ON public.produtos(nome);
CREATE INDEX idx_produtos_ativo ON public.produtos(ativo);
CREATE INDEX idx_pedidos_lanchonete_id ON public.pedidos(lanchonete_id);
CREATE INDEX idx_pedidos_cliente_id ON public.pedidos(cliente_id);
CREATE INDEX idx_pedidos_status ON public.pedidos(status);
CREATE INDEX idx_pedidos_created_at ON public.pedidos(created_at);
CREATE INDEX idx_promocoes_lanchonete_id ON public.promocoes(lanchonete_id);
CREATE INDEX idx_promocoes_codigo ON public.promocoes(codigo);
CREATE INDEX idx_promocoes_validade ON public.promocoes(validade);

-- Enable Row Level Security on all tables
ALTER TABLE public.lanchonetes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variacoes_produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promocoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_lanchonete ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregadores ENABLE ROW LEVEL SECURITY;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_lanchonetes_updated_at BEFORE UPDATE ON public.lanchonetes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON public.categorias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON public.produtos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_variacoes_produto_updated_at BEFORE UPDATE ON public.variacoes_produto FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_itens_pedido_updated_at BEFORE UPDATE ON public.itens_pedido FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_estoque_updated_at BEFORE UPDATE ON public.estoque FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_promocoes_updated_at BEFORE UPDATE ON public.promocoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_config_lanchonete_updated_at BEFORE UPDATE ON public.config_lanchonete FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_entregadores_updated_at BEFORE UPDATE ON public.entregadores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Security definer function to get user's lanchonete_id
CREATE OR REPLACE FUNCTION public.get_user_lanchonete_id()
RETURNS UUID AS $$
  SELECT lanchonete_id FROM public.usuarios WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for lanchonetes
CREATE POLICY "Users can view their own lanchonete" ON public.lanchonetes
    FOR SELECT USING (id = public.get_user_lanchonete_id());

CREATE POLICY "Admins can update their lanchonete" ON public.lanchonetes
    FOR UPDATE USING (id = public.get_user_lanchonete_id());

-- RLS Policies for usuarios
CREATE POLICY "Users can view users from their lanchonete" ON public.usuarios
    FOR SELECT USING (lanchonete_id = public.get_user_lanchonete_id());

CREATE POLICY "Users can insert their own profile" ON public.usuarios
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.usuarios
    FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for categorias
CREATE POLICY "Users can view categories from their lanchonete" ON public.categorias
    FOR SELECT USING (lanchonete_id = public.get_user_lanchonete_id());

CREATE POLICY "Users can manage categories from their lanchonete" ON public.categorias
    FOR ALL USING (lanchonete_id = public.get_user_lanchonete_id());

-- RLS Policies for produtos
CREATE POLICY "Users can view products from their lanchonete" ON public.produtos
    FOR SELECT USING (lanchonete_id = public.get_user_lanchonete_id());

CREATE POLICY "Users can manage products from their lanchonete" ON public.produtos
    FOR ALL USING (lanchonete_id = public.get_user_lanchonete_id());

-- RLS Policies for variacoes_produto
CREATE POLICY "Users can view product variations from their lanchonete" ON public.variacoes_produto
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.produtos p 
        WHERE p.id = produto_id AND p.lanchonete_id = public.get_user_lanchonete_id()
    ));

CREATE POLICY "Users can manage product variations from their lanchonete" ON public.variacoes_produto
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.produtos p 
        WHERE p.id = produto_id AND p.lanchonete_id = public.get_user_lanchonete_id()
    ));

-- RLS Policies for pedidos
CREATE POLICY "Users can view orders from their lanchonete" ON public.pedidos
    FOR SELECT USING (lanchonete_id = public.get_user_lanchonete_id());

CREATE POLICY "Users can manage orders from their lanchonete" ON public.pedidos
    FOR ALL USING (lanchonete_id = public.get_user_lanchonete_id());

-- RLS Policies for itens_pedido
CREATE POLICY "Users can view order items from their lanchonete" ON public.itens_pedido
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.pedidos p 
        WHERE p.id = pedido_id AND p.lanchonete_id = public.get_user_lanchonete_id()
    ));

CREATE POLICY "Users can manage order items from their lanchonete" ON public.itens_pedido
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.pedidos p 
        WHERE p.id = pedido_id AND p.lanchonete_id = public.get_user_lanchonete_id()
    ));

-- RLS Policies for estoque
CREATE POLICY "Users can view stock from their lanchonete" ON public.estoque
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.produtos p 
        WHERE p.id = produto_id AND p.lanchonete_id = public.get_user_lanchonete_id()
    ));

CREATE POLICY "Users can manage stock from their lanchonete" ON public.estoque
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.produtos p 
        WHERE p.id = produto_id AND p.lanchonete_id = public.get_user_lanchonete_id()
    ));

-- RLS Policies for promocoes
CREATE POLICY "Users can view promotions from their lanchonete" ON public.promocoes
    FOR SELECT USING (lanchonete_id = public.get_user_lanchonete_id());

CREATE POLICY "Users can manage promotions from their lanchonete" ON public.promocoes
    FOR ALL USING (lanchonete_id = public.get_user_lanchonete_id());

-- RLS Policies for config_lanchonete
CREATE POLICY "Users can view config from their lanchonete" ON public.config_lanchonete
    FOR SELECT USING (lanchonete_id = public.get_user_lanchonete_id());

CREATE POLICY "Users can manage config from their lanchonete" ON public.config_lanchonete
    FOR ALL USING (lanchonete_id = public.get_user_lanchonete_id());

-- RLS Policies for entregadores
CREATE POLICY "Users can view delivery persons from their lanchonete" ON public.entregadores
    FOR SELECT USING (lanchonete_id = public.get_user_lanchonete_id());

CREATE POLICY "Users can manage delivery persons from their lanchonete" ON public.entregadores
    FOR ALL USING (lanchonete_id = public.get_user_lanchonete_id());