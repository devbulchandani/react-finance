// backend/src/controllers/productController.ts
import { Request, Response } from 'express';
import Product, { IProduct } from '../models/Product';
import { ethers, uuidV4 } from 'ethers';

// Create a new product
export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, price, merchantAddress } = req.body;

        if (!merchantAddress) {
            res.status(401).json({ message: 'Unauthorized: Merchant address required' });
            return;
        }

        const newProduct = new Product({
            id: uuidV4(ethers.randomBytes(16)),
            name,
            description,
            price,
            merchantAddress
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Failed to create product' });
    }
};

// Get all products
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products' });
    }
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Failed to fetch product' });
    }
}

// Get products by merchant
export const getMerchantProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const merchantAddress = req.params.merchantAddress;

        if (!merchantAddress) {
            res.status(400).json({ message: 'Merchant address is required' });
            return;
        }

        const products = await Product.find({ merchantAddress }).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching merchant products:', error);
        res.status(500).json({ message: 'Failed to fetch merchant products' });
    }
};

// Update a product
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {updates, merchantAddress} = req.body;

        if (!merchantAddress) {
            res.status(401).json({ message: 'Unauthorized: Merchant address required' });
            return;
        }

        // Find product and verify ownership
        const product = await Product.findOne({ _id: id, merchantAddress });

        if (!product) {
            res.status(404).json({ message: 'Product not found or you do not have permission' });
            return;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        );

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Failed to update product' });
    }
};

// Delete a product
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {merchantAddress} = req.body

        if (!merchantAddress) {
            res.status(401).json({ message: 'Unauthorized: Merchant address required' });
            return;
        }


        const product = await Product.findOne({ _id: id, merchantAddress });

        if (!product) {
            res.status(404).json({ message: 'Product not found or you do not have permission' });
            return;
        }

        await Product.findByIdAndDelete(id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Failed to delete product' });
    }
};