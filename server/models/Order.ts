import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    productId: { type: String, required: true },
    merchantAddress: { type: String, required: true },
    userAddress: { type: String, required: true },
    amount: { type: String, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'],
        default: 'PENDING'
    },
    transactionHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const Order = mongoose.model('Order', OrderSchema);