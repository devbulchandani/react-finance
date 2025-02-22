import express, { Request, Response } from 'express';
import { User } from '../models/User';

const router = express.Router();

// POST /api/add-user
router.post(
    '/add-user',
    async (
        req: Request<{}, {}, { linkedAccounts: any[] }>,
        res: Response
    ): Promise<any> => {
        try {
            const { linkedAccounts } = req.body;

            const emailAccount = linkedAccounts.find(
                (account) => account.type === 'email'
            );
            if (!emailAccount || !emailAccount.address) {
                return res.status(400).json({ message: 'Email not found in linkedAccounts' });
            }

            const email = emailAccount.address;

            // Extract wallet details from linkedAccounts
            const wallets = linkedAccounts.filter(account => account.type === 'wallet');

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }


            const newUser = new User({ email, wallets });
            await newUser.save();


            res.status(201).json({ message: 'User added successfully', user: newUser });
        } catch (error) {
            console.error('Error adding user:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

export default router;