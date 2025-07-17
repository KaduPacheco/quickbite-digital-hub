
export interface Product {
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

export interface Category {
  id: string;
  nome: string;
  lanchonete_id: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  cliente_id: string | null;
  lanchonete_id: string;
  total: number;
  status: 'recebido' | 'preparo' | 'em_rota' | 'entregue';
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
  created_at: string;
  updated_at: string;
}

export interface CartItem {
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

export interface Promotion {
  id: string;
  lanchonete_id: string;
  titulo: string;
  codigo: string;
  tipo: 'percentual' | 'fixo';
  valor: number;
  validade: string;
  valor_minimo: number | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  tipo: 'admin' | 'funcionario' | 'cliente';
  lanchonete_id: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockItem {
  id: string;
  produto_id: string;
  quantidade: number;
  alerta_baixo: number;
  created_at: string;
  updated_at: string;
}
