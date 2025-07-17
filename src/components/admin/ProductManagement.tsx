
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, Upload, Loader2, AlertCircle } from "lucide-react";
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
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  useSupabaseQuery, 
  useSupabaseInsert, 
  useSupabaseUpdate, 
  useSupabaseDelete
} from "@/hooks/useSupabase";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  nome: string;
  descricao: string | null;
  preco_base: number;
  imagem_url: string | null;
  categoria_id: string | null;
  ativo: boolean;
  lanchonete_id: string;
}

interface Category {
  id: string;
  nome: string;
  lanchonete_id: string;
}

interface EditingProduct {
  id?: string;
  nome?: string;
  descricao?: string;
  preco_base?: number;
  imagem_url?: string;
  categoria_id?: string;
  ativo?: boolean;
  lanchonete_id?: string;
}

export const ProductManagement = () => {
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();
  const { lanchoneteId } = useAuth();

  // Query products from Supabase
  const { 
    data: products, 
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts
  } = useSupabaseQuery<Product[]>(
    async () => {
      if (!lanchoneteId) return { data: null, error: new Error("Lanchonete ID not found") };
      
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('lanchonete_id', lanchoneteId);
        
      return { data, error };
    },
    [lanchoneteId]
  );

  // Query categories from Supabase
  const { data: categories } = useSupabaseQuery<Category[]>(
    async () => {
      if (!lanchoneteId) return { data: null, error: new Error("Lanchonete ID not found") };
      
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('lanchonete_id', lanchoneteId);
        
      return { data, error };
    },
    [lanchoneteId]
  );

  // Mutations for product operations
  const { insert: insertProduct, isLoading: isInserting } = useSupabaseInsert<Product>('produtos');
  const { update: updateProduct, isLoading: isUpdating } = useSupabaseUpdate<Product>('produtos');
  const { deleteRecord, isLoading: isDeleting } = useSupabaseDelete('produtos');

  const handleEdit = (product: Product) => {
    setEditingProduct({
      id: product.id,
      nome: product.nome,
      descricao: product.descricao || "",
      preco_base: product.preco_base,
      imagem_url: product.imagem_url,
      categoria_id: product.categoria_id,
      ativo: product.ativo,
      lanchonete_id: product.lanchonete_id
    });
    setImagePreview(product.imagem_url || "");
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct({
      nome: "",
      descricao: "",
      preco_base: 0,
      imagem_url: "",
      categoria_id: categories && categories.length > 0 ? categories[0].id : null,
      ativo: true,
      lanchonete_id: lanchoneteId || ""
    });
    setImagePreview("");
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a imagem",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSave = async () => {
    if (!editingProduct?.nome || !editingProduct?.preco_base) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      // Handle image upload if there's a new image
      let imageUrl = editingProduct.imagem_url;
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
        if (!imageUrl) return;
      }
      
      const productData = {
        ...editingProduct,
        imagem_url: imageUrl
      };
      
      if (editingProduct.id) {
        // Update existing product
        await updateProduct(editingProduct.id, productData);
      } else {
        // Add new product
        await insertProduct(productData);
      }
      
      // Refresh products list
      refetchProducts();
      
      // Close dialog and reset state
      setIsDialogOpen(false);
      setEditingProduct(null);
      setImagePreview("");
      setImageFile(null);
      
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o produto",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRecord(id);
      refetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      await updateProduct(id, { ativo: !currentStatus });
      refetchProducts();
    } catch (error) {
      console.error("Error toggling availability:", error);
    }
  };

  if (isLoadingProducts) {
    return (
      <Card className="w-full h-64 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando produtos...</p>
        </div>
      </Card>
    );
  }

  if (productsError) {
    return (
      <Card className="w-full p-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar produtos</h3>
          <p className="text-muted-foreground mb-4">
            Não foi possível carregar os produtos. Por favor, tente novamente.
          </p>
          <Button onClick={() => refetchProducts()}>Tentar novamente</Button>
        </div>
      </Card>
    );
  }

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
              {products && products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.imagem_url ? (
                        <img
                          src={product.imagem_url}
                          alt={product.nome}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">Sem imagem</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.nome}</TableCell>
                    <TableCell>
                      {categories && categories.find(c => c.id === product.categoria_id)?.nome || "Sem categoria"}
                    </TableCell>
                    <TableCell>R$ {product.preco_base.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAvailability(product.id, product.ativo)}
                        disabled={isUpdating}
                      >
                        <Badge variant={product.ativo ? "default" : "secondary"}>
                          {product.ativo ? "Disponível" : "Indisponível"}
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
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-muted-foreground" />
                      <p>Nenhum produto encontrado</p>
                      <Button variant="outline" size="sm" onClick={handleAdd}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Produto
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
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
                    value={editingProduct?.nome || ""}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome do produto"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={editingProduct?.descricao || ""}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descrição do produto"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Preço *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={editingProduct?.preco_base || ""}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, preco_base: parseFloat(e.target.value) }))}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <select
                    id="category"
                    className="w-full p-2 border border-input rounded-md"
                    value={editingProduct?.categoria_id || ""}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, categoria_id: e.target.value }))}
                  >
                    <option value="">Sem categoria</option>
                    {categories && categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nome}</option>
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
                            setImageFile(null);
                            setEditingProduct(prev => ({ ...prev, imagem_url: "" }));
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
                          onChange={handleImageChange}
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
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingProduct(null);
                  setImagePreview("");
                  setImageFile(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isInserting || isUpdating}
              >
                {(isInserting || isUpdating) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
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
