// frontend/src/components/ProductList.tsx
import React from 'react';
import { Product } from '../pages/MerchantDashboard';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ProductListProps {
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (productId: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete }) => {
    if (products.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-500">No products found</h3>
                <p className="mt-1 text-gray-400">Add your first product to get started</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
                <div
                    key={product._id}
                    className="bg-white rounded-lg shadow overflow-hidden flex flex-col"
                >
                    {product.imageUrl && (
                        <div className="h-48 bg-gray-200 overflow-hidden">
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Product+Image';
                                }}
                            />
                        </div>
                    )}

                    <div className="p-6 flex-grow">
                        <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
                        <p className="text-lg font-bold">{product.price} ETH</p>
                    </div>

                    <div className="p-4 bg-gray-50 border-t flex justify-between">
                        <button
                            onClick={() => onEdit(product)}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                        </button>

                        <button
                            onClick={() => onDelete(product._id)}
                            className="flex items-center text-red-600 hover:text-red-800"
                        >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductList;