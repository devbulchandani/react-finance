// backend/src/models/Product.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: string;
    merchantAddress: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: String, required: true },
        merchantAddress: { type: String, required: true, index: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IProduct>('Product', ProductSchema);