
import { useState } from "react";
import { Plus, Edit, Trash2, Save, X, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { products, categories } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

interface EditingProduct extends Partial<Product> {
  id?: string;
}

export const ProductManagement = () => {
  const [productsList, setProductsList] = useState(products);
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { toast } = useToast();

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setImagePreview(product.image);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct({
      name: "",
      description: "",
      price: 0,
      image: "",
      category: categories[0].id,
      available: true,
    });
    setImagePreview("");
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingProduct?.name || !editingProduct?.description || !editingProduct?.price) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (editingProduct.id) {
      // Update existing product
      setProductsList(prev => prev.map(p => 
        p.id === editingProduct.id ? { ...p, ...editingProduct } as Product : p
      ));
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso",
      });
    } else {
      // Add new product
      const newProduct: Product = {
        ...editingProduct,
        id: Date.now().toString(),
      } as Product;
      setProductsList(prev => [...prev, newProduct]);
      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso",
      });
    }

    setIsDialogOpen(false);
    setEditingProduct(null);
    setImagePreview("");
  };

  const handleDelete = (id: string) => {
    setProductsList(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Sucesso",
      description: "Produto removido com sucesso",
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setEditingProduct(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleAvailability = (id: string) => {
    setProductsList(prev => prev.map(p => 
      p.id === id ? { ...p, available: !p.available } : p
    ));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gerenciamento de Produtos</CardTitle>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsList.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {categories.find(c => c.id === product.category)?.name || product.category}
                  </TableCell>
                  <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAvailability(product.id)}
                    >
                      <Badge variant={product.available ? "default" : "secondary"}>
                        {product.available ? "Disponível" : "Indisponível"}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct?.id ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={editingProduct?.name || ""}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome do produto"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    value={editingProduct?.description || ""}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição do produto"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Preço *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={editingProduct?.price || ""}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <select
                    id="category"
                    className="w-full p-2 border border-input rounded-md"
                    value={editingProduct?.category || ""}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Imagem do Produto</Label>
                  <div className="mt-2">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview("");
                            setEditingProduct(prev => ({ ...prev, image: "" }));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Clique para fazer upload da imagem
                        </p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("image-upload")?.click()}
                        >
                          Selecionar Imagem
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
