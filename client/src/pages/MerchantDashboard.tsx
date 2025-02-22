import React, { useEffect, useState } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import { toast } from 'sonner';
import {
    createProduct,
    getMerchantProducts,
    updateProduct,
    deleteProduct,
} from '../apiClient';
import { PencilIcon, TrashIcon, PlusIcon } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { MerchantOrders } from '@/components/MerchantOrders';

export type Product = {
    _id: string;
    name: string;
    description: string;
    price: string;
    merchantAddress: string;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
};

const MerchantDashboard: React.FC = () => {
    const { user, authenticated } = usePrivy();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    useEffect(() => {
        if (authenticated && user?.wallet?.address) {
            fetchMerchantProducts();
        }
    }, [authenticated, user]);

    const fetchMerchantProducts = async () => {
        try {
            setLoading(true);
            const merchantProducts = await getMerchantProducts(user?.wallet?.address || '');
            setProducts(merchantProducts);
        } catch (error) {
            console.error('Error fetching merchant products:', error);
            toast.error('Failed to load your products');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProduct = async (productData: Omit<Product, '_id' | 'merchantAddress' | 'createdAt' | 'updatedAt'>) => {
        try {
            await createProduct({
                ...productData,
                merchantAddress: user?.wallet?.address || "",
                price: parseFloat(productData.price)
            });
            toast.success('Product created successfully');
            setIsFormOpen(false);
            fetchMerchantProducts();
        } catch (error) {
            console.error('Error creating product:', error);
            toast.error('Failed to create product');
        }
    };

    const handleUpdateProduct = async (productId: string, productData: Partial<Product>) => {
        try {
            await updateProduct(productId, productData, user?.wallet?.address || '');
            toast.success('Product updated successfully');
            setIsFormOpen(false);
            setEditingProduct(null);
            fetchMerchantProducts();
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('Failed to update product');
        }
    };

    const handleDeleteProduct = async () => {
        if (!productToDelete) return;
        try {
            await deleteProduct(productToDelete._id, user?.wallet?.address || '');
            toast.success('Product deleted successfully');
            setIsDeleteDialogOpen(false);
            setProductToDelete(null);
            fetchMerchantProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        }
    };

    const ProductForm = ({ onSubmit, initialValues }: {
        onSubmit: (data: any) => void,
        initialValues?: Product
    }) => {
        const [formData, setFormData] = useState({
            name: initialValues?.name || '',
            description: initialValues?.description || '',
            price: initialValues?.price || '',
            imageUrl: initialValues?.imageUrl || '',
        });

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSubmit(formData);
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter product name"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter product description"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="price">Price (ETH)</Label>
                    <Input
                        id="price"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0.01"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL (optional)</Label>
                    <Input
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                    />
                </div>

                <DialogFooter>
                    <Button type="submit" className="w-full">
                        {initialValues ? 'Update Product' : 'Create Product'}
                    </Button>
                </DialogFooter>
            </form>
        );
    };

    if (!authenticated) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Card className="w-96">
                    <CardHeader>
                        <CardTitle>Authentication Required</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Please connect your wallet to access the merchant dashboard
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Merchant Dashboard</h1>
                <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Add New Product
                </Button>
            </div>

            <div className="mb-8">
                <MerchantOrders />
            </div>

            {loading ? (
                <div className="flex justify-center p-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.length === 0 ? (
                        <Card className="col-span-full">
                            <CardHeader>
                                <CardTitle>No Products Found</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Add your first product to get started</p>
                            </CardContent>
                        </Card>
                    ) : (
                        products.map((product) => (
                            <Card key={product._id}>
                                <CardHeader>
                                    <CardTitle>{product.name}</CardTitle>
                                </CardHeader>
                                {product.imageUrl && (
                                    <div className="h-48 overflow-hidden">
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/api/placeholder/400/200';
                                            }}
                                        />
                                    </div>
                                )}
                                <CardContent>
                                    <p className="text-muted-foreground mb-4 line-clamp-3">
                                        {product.description}
                                    </p>
                                    <p className="text-lg font-bold">{product.price} ETH</p>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setEditingProduct(product);
                                            setIsFormOpen(true);
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            setProductToDelete(product);
                                            setIsDeleteDialogOpen(true);
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                        Delete
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Product Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingProduct
                                ? 'Update your product details below'
                                : 'Fill in the details for your new product'}
                        </DialogDescription>
                    </DialogHeader>
                    <ProductForm
                        onSubmit={editingProduct
                            ? (data) => handleUpdateProduct(editingProduct._id, data)
                            : handleCreateProduct
                        }
                        initialValues={editingProduct || undefined}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteProduct}
                        >
                            Delete Product
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MerchantDashboard;