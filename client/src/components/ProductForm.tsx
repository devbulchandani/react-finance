import React, { useState } from 'react';
import { Product } from '../pages/MerchantDashboard';

interface ProductFormProps {
    onSubmit: (product: Omit<Product, '_id' | 'merchantAddress' | 'createdAt' | 'updatedAt'>) => void;
    initialValues?: Product;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, initialValues }) => {
    // Initialize form data with initial values or default empty strings
    const [formData, setFormData] = useState({
        name: initialValues?.name || '',
        description: initialValues?.description || '',
        price: initialValues?.price || '',
        imageUrl: initialValues?.imageUrl || '',
    });

    // State to manage validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Update form data
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error for the field being updated
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Validate form fields
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validate product name
        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required';
        }

        // Validate description
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        // Validate price
        if (!formData.price.trim()) {
            newErrors.price = 'Price is required';
        } else if (!/^([0-9]*[.])?[0-9]+$/.test(formData.price)) {
            newErrors.price = 'Price must be a valid number';
        }

        // Set errors and return validation status
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form before submission
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Name Field */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Product Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.name ? 'border-red-500' : ''
                        }`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Description Field */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.description ? 'border-red-500' : ''
                        }`}
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Price Field */}
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price (ETH)
                </label>
                <input
                    type="text"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g., 0.01"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.price ? 'border-red-500' : ''
                        }`}
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            {/* Image URL Field */}
            <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                    Image URL (optional)
                </label>
                <input
                    type="text"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    {initialValues ? 'Update Product' : 'Create Product'}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;