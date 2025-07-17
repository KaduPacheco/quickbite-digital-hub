// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  variations?: ProductVariation[];
}

export interface ProductVariation {
  id: string;
  name: string;
  price: number;
}

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
  variations?: {
    selectedVariation?: any;
    selectedAdditionals?: any[];
  };
}

// Order types
export interface Order {
  id: string;
  cliente_id: string | null;
  lanchonete_id: string;
  total: number;
  status: "recebido" | "preparo" | "em_rota" | "entregue";
  endereco_entrega: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  pedido_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  variacoes: any;
}

// Category types
export interface Category {
  id: string;
  name: string;
  icon: string;
}

// Database types
export interface DbProduct {
  id: string;
  nome: string;
  descricao: string | null;
  preco_base: number;
  imagem_url: string | null;
  categoria_id: string | null;
  ativo: boolean;
  lanchonete_id: string;
  created_at: string;
  updated_at: string;
}

export interface DbCategory {
  id: string;
  nome: string;
  lanchonete_id: string;
  created_at: string;
  updated_at: string;
}

// Promotion types
export interface Promotion {
  id: string;
  title: string;
  code: string;
  type: "percentual" | "fixo";
  value: number;
  minimumValue?: number;
  active: boolean;
  validUntil: string;
}
