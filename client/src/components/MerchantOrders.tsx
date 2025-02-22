import React, { useEffect, useState } from 'react';
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from 'ethers';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { fetchWallet, getMerchantOrders, sendServerTransaction, updateOrderStatus } from '@/apiClient';
import { getWalletBalance } from '@/lib/fetchWalletBalance';
import { sep } from 'path';

// Blockchain Configuration
const INFURA_API_KEY = "00d918690e7246579fb6feabe829e5c8";
const network = "sepolia";
const MOCK_ORACLE_ADDRESS = "0xF2D82330a6aD227C59604Cbd65AE522fbD352935";

// Contract ABIs

const MockOracleABI = [
    { "type": "function", "name": "emitDelivered", "inputs": [{ "name": "shipmentId", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
    { "type": "function", "name": "emitShipped", "inputs": [{ "name": "shipmentId", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" }
];

type Order = {
    _id: string;
    userEmail: string;
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

export const MerchantOrders: React.FC = () => {
    const { user, ready, authenticated } = usePrivy();
    const {wallets} = useWallets();
    const wallet = wallets[1];
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [serverWallet, setServerWallet] = useState<{ address: string; balance: number } | null>(null);
    
    // Blockchain state
    const [providerSepolia, setProviderSepolia] = useState<ethers.BrowserProvider | null>(null);

    const [oracleContract, setOracleContract] = useState<any>(null);
    const [milestoneCount, setMilestoneCount] = useState("0");
    const [statusMessage, setStatusMessage] = useState("");

    // Initialize blockchain contracts
    const initializeContracts = async () => {
        try {
            if (!user?.wallet?.address) {
                throw new Error('Wallet not connected');
            }

            const sepoliaProvider = new ethers.BrowserProvider(window.ethereum);
            setProviderSepolia(sepoliaProvider);


            const signer = await providerSepolia?.getSigner();

            const sepoliaOracle = new ethers.Contract(MOCK_ORACLE_ADDRESS, MockOracleABI, signer);
            console.log("Sepolia Oracle: ",JSON.stringify(sepoliaOracle));

            setOracleContract(sepoliaOracle);



        } catch (error) {
            console.error('Blockchain connection error:', error);
            setStatusMessage('Failed to connect to blockchain');
        }
    };

    // Initialize data and contracts
    useEffect(() => {
        if (ready && authenticated && user?.wallet?.address) {
            fetchMerchantOrders();
            initializeContracts();
        }
    }, [ready, authenticated, user?.wallet?.address]);

    // Fetch server wallet data
    useEffect(() => {
        const fetchServerWalletData = async () => {
            try {
                const wallet = await fetchWallet(user?.email?.address!);
                const serverWalletAddress = wallet.wallet.address;
                const balance = await getWalletBalance(serverWalletAddress);
                setServerWallet({
                    address: serverWalletAddress,
                    balance: balance ? parseFloat(balance) : 0,
                });
            } catch (error) {
                console.error("Error fetching server wallet balance:", error);
            }
        };

        if (user?.email?.address) {
            fetchServerWalletData();
        }
    }, [user?.email?.address]);

    // Listen for blockchain events


    const fetchMerchantOrders = async () => {
        try {
            if (!user?.wallet?.address) return;
            const data = await getMerchantOrders(user.wallet.address);
            setOrders(data);
        } catch (error) {
            console.error('Error fetching merchant orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
        try {
            // Update status in database
            await updateOrderStatus(orderId, newStatus);
            
            const order = orders.find(o => o._id === orderId);
            if (!order) {
                throw new Error('Order not found');
            }

            // Handle transfers based on status
            if (newStatus === 'COMPLETED') {
                await transferToMerchant(order);
            } else if (newStatus === 'FAILED') {
                await refundToUser(order);
            }

            // Update blockchain status if contracts are initialized
            if (oracleContract) {
                try {
                    let tx;
                    switch (newStatus) {
                        case 'PROCESSING':
                            tx = await oracleContract.emitShipped(order._id);
                            await tx.wait();
                            break;
                        case 'COMPLETED':
                            tx = await oracleContract.emitDelivered(order._id);
                            await tx.wait();
                            break;
                    }
                } catch (error) {
                    console.error('Blockchain update error:', error);
                    toast.error('Failed to update blockchain status');
                }
            }

            // Update local state
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === orderId ? { ...order, status: newStatus } : order
                )
            );

            toast.success('Order status updated successfully');
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Failed to update order status');
        }
    };

    const transferToMerchant = async (order: Order) => {
        try {
            const hash = await sendServerTransaction(user?.email?.address!, order.merchantAddress, order.amount);
            if (hash) {
                toast.success("Payment transferred to merchant");
            }
        } catch (error) {
            console.error("Error transferring to merchant:", error);
            toast.error("Failed to transfer payment to merchant");
        }
    };

    const refundToUser = async (order: Order) => {
        try {
            const hash = await sendServerTransaction(user?.email?.address!, order.userAddress, order.amount);
            if (hash) {
                toast.success("Payment refunded to user");
            }
        } catch (error) {
            console.error("Error refunding to user:", error);
            toast.error("Failed to refund payment to user");
        }
    };

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
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (orders.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                        No orders received yet
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                {statusMessage && (
                    <div className="text-sm text-red-500">{statusMessage}</div>
                )}
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order._id}>
                                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                                    <TableCell>{order.productId}</TableCell>
                                    <TableCell>{truncateAddress(order.userAddress)}</TableCell>
                                    <TableCell>{order.amount} ETH</TableCell>
                                    <TableCell>
                                        <Badge className={`${statusColors[order.status]} text-white`}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={order.status}
                                            onValueChange={(value) => handleStatusUpdate(order._id, value as Order['status'])}
                                        >
                                            <SelectTrigger className="w-full mt-1">
                                                <SelectValue placeholder="Select Action" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                <SelectItem value="PROCESSING">Processing</SelectItem>
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                                <SelectItem value="FAILED">Failed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};