// components/UserOrders.tsx
import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { getUserOrders } from '../apiClient';
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type Order = {
    _id: string;
    productId: string;
    merchantAddress: string;
    userAddress: string;
    amount: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    transactionHash: string;
    createdAt: string;
};

const statusColors = {
    PENDING: "bg-yellow-500",
    PROCESSING: "bg-blue-500",
    COMPLETED: "bg-green-500",
    FAILED: "bg-red-500",
    REFUNDED: "bg-purple-500"
};

export const UserOrders = () => {
    const { wallets } = useWallets();
    const {user} = usePrivy();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (wallets.length > 0) {
                try {
                    const userOrders = await getUserOrders(user?.email?.address || '');
                    setOrders(userOrders);
                } catch (error) {
                    console.error("Error fetching orders:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchOrders();
    }, [wallets]);

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Your Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center h-32">
                        Loading orders...
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (orders.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Your Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center h-32">
                        No orders found
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Orders</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount (ETH)</TableHead>
                            <TableHead>Merchant</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Transaction</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order._id}>
                                <TableCell>{formatDate(order.createdAt)}</TableCell>
                                <TableCell>{order.amount}</TableCell>
                                <TableCell>
                                    {truncateAddress(order.merchantAddress)}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        className={`${statusColors[order.status]} text-white`}
                                    >
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <a
                                        href={`https://sepolia.etherscan.io/tx/${order.transactionHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        {truncateAddress(order.transactionHash)}
                                    </a>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};