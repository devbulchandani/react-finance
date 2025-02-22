import express, { Request, Response } from 'express';
import { createWallet, fetchWallet, sendTransaction, signMessage } from '../services/walletService';
import { User } from '../models/User';

const router = express.Router();



router.post('/create-wallet', async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
    }
    try {
        const wallet = await createWallet(email);
        res.status(200).json({ success: true, serverWallet:wallet });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

router.post('/sign-message', async (req: Request, res: Response): Promise<any> => {
    const { email, message } = req.body;

    if (!email || !message) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        const signature = await signMessage(email, message);
        res.status(200).json({ success: true, signature });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

router.post('/send-transaction', async (req: Request, res: Response): Promise<any> => {
    const { email, to, valueInEth } = req.body;
    console.log(email, to, valueInEth);
    if (!email || !to || !valueInEth) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        const hash = await sendTransaction(email, to, valueInEth);
        res.status(200).json({ success: true, transactionHash: hash });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});


router.get('/fetch-wallet/:email', async (req: Request, res: Response): Promise<any> => {
    const { email } = req.params;

    if (!email) {
        return res.status(400).json({ success: false, error: 'Missing address' });
    }

    try {
        const wallet = await fetchWallet(email);
        res.status(200).json({ success: true, wallet });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

export default router;