import { Order } from "../models/Order";

export async function createOrder(orderData: {
  userEmail: string;
  productId: string;
  merchantAddress: string;
  userAddress: string;
  amount: string;
  transactionHash: string;
}) {
  try {
    const order = new Order({
      ...orderData,
      status: 'PENDING'
    });
    return await order.save();
  } catch (error) {
    throw new Error(`Failed to create order: ${error}`);
  }
}

export async function getUserOrders(userEmail: string) {
  try {
    return await Order.find({ userEmail }).sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Failed to fetch user orders: ${error}`);
  }
}

export async function getMerchantOrders(merchantAddress: string) {
  try {
    const orders = await Order.find({ merchantAddress })
      .sort({ createdAt: -1 })
      .populate('productId'); // This will populate product details
    return orders;
  } catch (error) {
    throw new Error(`Failed to fetch merchant orders: ${error}`);
  }
}

