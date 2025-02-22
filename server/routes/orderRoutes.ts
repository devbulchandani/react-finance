import express, { Request, Response } from 'express';
import { createOrder, getMerchantOrders, getUserOrders } from '../services/orderservice';
import { Order } from '../models/Order';


const router = express.Router();

router.post('/orders', async (req, res) => {
    try {
        const order = await createOrder(req.body);
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: `Failed to create order: ${error}` });
    }
});

router.get('/orders/user/:userEmail', async (req, res) => {
    try {
        const orders = await getUserOrders(req.params.userEmail);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch orders: ${error}` });
    }
});

router.get('/orders/merchant/:merchantAddress', async (req, res) => {
    try {
        const orders = await getMerchantOrders(req.params.merchantAddress);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch merchant orders: ${error}` });
    }
});

router.put('/orders/:orderId/status', async (req: Request, res: Response): Promise<any> => {
    try {
        const { orderId } = req.params; // Extract the order ID from the URL
        const { status } = req.body; // Extract the new status from the request body

        // Validate the status value
        const validStatuses = ['PROCESSING', 'COMPLETED', 'FAILED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        // Find the order by ID
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update the order status
        order.status = status;
        order.updatedAt = new Date(); // Update the updatedAt field
        await order.save();

        // Return the updated order
        return res.status(200).json(order);
    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({ error: 'Failed to update order status' });
    }
});


export default router;