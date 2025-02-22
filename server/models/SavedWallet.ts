// Import required modules
import mongoose, { Schema, Document } from 'mongoose';


export interface ISavedWallet extends Document {
    email: string;
    address: string;
    nickname: string;
}


const savedWalletSchema = new Schema<ISavedWallet>({
    email: { type: String, required: true },
    address: { type: String, required: true },
    nickname: { type: String },
});


export const SavedWallet = mongoose.model<ISavedWallet>('SavedWallet', savedWalletSchema);
