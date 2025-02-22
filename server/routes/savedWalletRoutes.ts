import { User } from '../models/User'; // Import User model
import { SavedWallet } from '../models/SavedWallet'; // Import SavedWallet model
import express, {Request, Response} from 'express';
// Initialize Express app

const router = express.Router();

// Middleware setup

// API to fetch all saved wallets for a user
router.get('/saved-wallets/:email', async (req:Request, res:Response): Promise<any> => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    try {
        const savedWallets = await SavedWallet.find({ email });
        res.status(200).json({ wallets: savedWallets });
    } catch (error) {
        console.error('Error fetching saved wallets:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API to save a new wallet for a user
router.post('/saved-wallets', async (req:Request, res:Response): Promise<any> => {
    const { email, address, nickname } = req.body;

    if (!email || !address || !nickname) {
        return res.status(400).json({ message: 'Email, Wallet ID, and address are required' });
    }

    try {
        const wallet = await SavedWallet.findOne({ email, address });
        if (wallet) return res.status(400).json({ message: 'Wallet already saved' });
        const newSavedWallet = new SavedWallet({ email, address, nickname });
        await newSavedWallet.save();

        res.status(201).json({ message: 'Wallet saved successfully' });
    } catch (error) {
        console.error('Error saving wallet:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API to delete a saved wallet by ID
router.delete('/saved-wallets/:email/:walletId',async (req:Request, res:Response): Promise<any>=> {
    const { email, address } = req.params;

    try {
        const result = await SavedWallet.findOneAndDelete({ email, address });
        if (!result) return res.status(404).json({ message: 'Wallet not found' });

        res.status(200).json({ message: 'Wallet deleted successfully' });
    } catch (error) {
        console.error('Error deleting wallet:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
