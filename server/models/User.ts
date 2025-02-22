import mongoose, { Schema, Document } from 'mongoose';

// Define the Wallet interface
export interface IWallet {
    id: string; // Wallet ID from Privy
    address: string; // Wallet address
    chainType?: string;
    verifiedAt?: Date;
    firstVerifiedAt?: Date;
    latestVerifiedAt?: Date;
}

export interface IServerWallet {
    id: string; // Wallet ID from Privy
    address: string; // Wallet address
    chainType: string; // Blockchain type (e.g., Ethereum)
}

// Define the User interface
export interface IUser extends Document {
    email: string;
    wallets: IWallet[]; // User's personal wallets
    serverWallet?: IServerWallet; // Server-assigned wallet
}



// Define the User schema
const userSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    wallets: [
        {
            id: { type: String, },
            address: { type: String, },
            chainType: { type: String },
            verifiedAt: { type: Date },
            firstVerifiedAt: { type: Date },
            latestVerifiedAt: { type: Date },
        },
    ],
    serverWallet: {
        id: { type: String },
        address: { type: String }, 
        chainType: { type: String },
    },
});

// Export the User model
export const User = mongoose.model<IUser>('User', userSchema);