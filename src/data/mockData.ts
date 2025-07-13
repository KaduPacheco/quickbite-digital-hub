
import { Product } from "@/components/ProductCard";
import { Category } from "@/components/CategoryFilter";

export const categories: Category[] = [
  { id: "burgers", name: "Hambúrgueres", icon: "🍔" },
  { id: "pizzas", name: "Pizzas", icon: "🍕" },
  { id: "drinks", name: "Bebidas", icon: "🥤" },
  { id: "desserts", name: "Sobremesas", icon: "🍰" },
  { id: "snacks", name: "Petiscos", icon: "🍟" },
];

export const products: (Product & {
  variations?: { id: string; name: string; price: number }[];
  additionals?: { id: string; name: string; price: number }[];
})[] = [
  {
    id: "1",
    name: "Big Burger Clássico",
    description: "Hamburger artesanal com carne bovina, queijo cheddar, alface, tomate e molho especial",
    price: 28.90,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop",
    category: "burgers",
    available: true,
    variations: [
      { id: "burger-small", name: "Tradicional", price: 28.90 },
      { id: "burger-large", name: "Grande", price: 35.90 }
    ],
    additionals: [
      { id: "extra-cheese", name: "Queijo extra", price: 3.00 },
      { id: "extra-bacon", name: "Bacon", price: 5.00 },
      { id: "extra-egg", name: "Ovo", price: 2.50 }
    ]
  },
  {
    id: "2", 
    name: "Pizza Margherita",
    description: "Pizza tradicional com molho de tomate, mozzarella fresca, manjericão e azeite",
    price: 35.90,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop",
    category: "pizzas",
    available: true,
    variations: [
      { id: "pizza-small", name: "Pequena (4 pedaços)", price: 25.90 },
      { id: "pizza-medium", name: "Média (6 pedaços)", price: 35.90 },
      { id: "pizza-large", name: "Grande (8 pedaços)", price: 45.90 }
    ],
    additionals: [
      { id: "extra-cheese-pizza", name: "Queijo extra", price: 4.00 },
      { id: "extra-olives", name: "Azeitonas", price: 3.00 },
      { id: "extra-pepperoni", name: "Pepperoni", price: 6.00 }
    ]
  },
  {
    id: "3",
    name: "Refrigerante Cola",
    description: "Refrigerante gelado 350ml",
    price: 5.90,
    image: "https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400&h=400&fit=crop",
    category: "drinks",
    available: true,
    variations: [
      { id: "soda-350ml", name: "350ml", price: 5.90 },
      { id: "soda-600ml", name: "600ml", price: 8.90 },
      { id: "soda-2l", name: "2 Litros", price: 12.90 }
    ]
  },
  {
    id: "4",
    name: "Batata Frita Premium",
    description: "Batata frita crocante com temperos especiais e molho de queijo",
    price: 18.90,
    image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&h=400&fit=crop",
    category: "snacks",
    available: true,
    variations: [
      { id: "fries-small", name: "Pequena", price: 15.90 },
      { id: "fries-large", name: "Grande", price: 18.90 }
    ],
    additionals: [
      { id: "cheese-sauce", name: "Molho de queijo", price: 2.00 },
      { id: "bacon-bits", name: "Bacon em cubos", price: 4.00 },
      { id: "ketchup", name: "Ketchup", price: 1.00 }
    ]
  },
  {
    id: "5",
    name: "Brownie de Chocolate",
    description: "Brownie artesanal com chocolate belga e nozes",
    price: 15.90,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop",
    category: "desserts",
    available: true,
    additionals: [
      { id: "ice-cream", name: "Sorvete de baunilha", price: 3.00 },
      { id: "whipped-cream", name: "Chantilly", price: 2.00 }
    ]
  },
  {
    id: "6",
    name: "Burger Vegano",
    description: "Hambúrguer plant-based com queijo vegano, alface e tomate",
    price: 32.90,
    image: "https://images.unsplash.com/photo-1525059696034-4967a729002e?w=400&h=400&fit=crop",
    category: "burgers",
    available: true,
    variations: [
      { id: "vegan-small", name: "Tradicional", price: 32.90 },
      { id: "vegan-large", name: "Grande", price: 39.90 }
    ],
    additionals: [
      { id: "vegan-cheese", name: "Queijo vegano extra", price: 4.00 },
      { id: "avocado", name: "Abacate", price: 3.50 }
    ]
  },
  {
    id: "7",
    name: "Pizza Pepperoni",
    description: "Pizza com molho de tomate, mozzarella e pepperoni artesanal",
    price: 42.90,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=400&fit=crop",
    category: "pizzas",
    available: false,
    variations: [
      { id: "pepperoni-small", name: "Pequena (4 pedaços)", price: 32.90 },
      { id: "pepperoni-medium", name: "Média (6 pedaços)", price: 42.90 },
      { id: "pepperoni-large", name: "Grande (8 pedaços)", price: 52.90 }
    ]
  },
  {
    id: "8",
    name: "Suco Natural de Laranja",
    description: "Suco natural de laranja 400ml",
    price: 8.90,
    image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop",
    category: "drinks",
    available: true,
    variations: [
      { id: "juice-300ml", name: "300ml", price: 8.90 },
      { id: "juice-500ml", name: "500ml", price: 12.90 }
    ]
  },
];
