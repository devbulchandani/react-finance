import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, AlertCircle, Send } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom, Hex, parseEther } from "viem";
import { sepolia } from "viem/chains";
import { toast } from "sonner";
import { getWalletBalance } from "../lib/fetchWalletBalance";
import { fetchWallet, getSavedWallets, saveWallet, sendServerTransaction } from "../apiClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Subscription {
    id: number;
    name: string;
    amount: string;
    cryptoType: 'ETH' | 'BTC' | 'USDC';
    walletAddress: string;
    billingCycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    nextPayment: string;
    status: 'Active' | 'Inactive' | 'Pending Payout Verification';
    timeLeft: number;
    payoutWallet?: string;
}

interface WalletBalance {
    address: string;
    clientType?: string;
    balance: number;
}

interface SavedWallet {
    nickname: string;
    address: string;
}

const getWalletName = (clientType: string): string => {
    const walletTypes: Record<string, string> = {
        'metamask': 'MetaMask',
        'coinbase_wallet': 'Coinbase',
        'privy': 'Privy Embedded',
        'phantom': 'Phantom',
        'walletconnect': 'WalletConnect',
        'rainbow': 'Rainbow',
        'trust_wallet': 'Trust Wallet'
    };
    return walletTypes[clientType] || 'Unknown Wallet';
};
    const walletTypes: Record<string, string> = {
        'metamask': 'MetaMask',
        'coinbase_wallet': 'Coinbase',
        'privy': 'Privy Embedded',
        'phantom': 'Phantom',
        'walletconnect': 'WalletConnect',
        'rainbow': 'Rainbow',
        'trust_wallet': 'Trust Wallet'
    };

const SubscriptionManager: React.FC = () => {
    const { wallets } = useWallets();
    const { user } = usePrivy();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [newSubscription, setNewSubscription] = useState<Omit<Subscription, 'id' | 'nextPayment' | 'status' | 'timeLeft' | 'payoutWallet'>>({
        name: '',
        amount: '',
        cryptoType: 'ETH',
        walletAddress: '',
        billingCycle: 'monthly'
    });
    const [error, setError] = useState<string>('');
    const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);
    const [serverWallet, setServerWallet] = useState<{ address: string; balance: number } | null>(null);
    const [savedWallets, setSavedWallets] = useState<SavedWallet[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState<WalletBalance | null>(null);
    const [destinationAddress, setDestinationAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

    // Validate wallet address
    const validateWalletAddress = (address: string): boolean => {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    };

    // Select payout wallet based on amount
    const selectPayoutWallet = (amount: number): string | undefined => {
        const eligibleWallets = [...walletBalances, ...(serverWallet ? [serverWallet] : [])]
            .filter(wallet => wallet.balance >= amount)
            .sort((a, b) => b.balance - a.balance);
        
        return eligibleWallets[0]?.address;
    };

    // Handle subscription deletion
    const handleDeleteSubscription = (id: number) => {
        setSubscriptions(subs => subs.filter(sub => sub.id !== id));
    };

    const fetchSavedWallets = async () => {
        if (user?.email?.address) {
            try {
                const fetchedWallets = await getSavedWallets(user.email.address);
                setSavedWallets(fetchedWallets.wallets);
            } catch (error) {
                console.error("Error fetching saved wallets:", error);
                toast.error("Failed to fetch saved wallets");
            }
        }
    };

    const handleAddSubscription = async (): Promise<void> => {
        setError('');
        if (!newSubscription.name || !newSubscription.amount || !newSubscription.walletAddress) {
            setError('Please fill in all required fields');
            return;
        }
        if (!validateWalletAddress(newSubscription.walletAddress)) {
            setError('Invalid wallet address format');
            return;
        }

        const amount = parseFloat(newSubscription.amount);
        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        const payoutWallet = selectPayoutWallet(amount);

        const subscription: Subscription = {
            ...newSubscription,
            id: Date.now(),
            nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: payoutWallet ? 'Active' : 'Pending Payout Verification',
            timeLeft: 30 * 24 * 60 * 60 * 1000,
            payoutWallet: payoutWallet
        };

        setSubscriptions(prev => [...prev, subscription]);
        setNewSubscription({
            name: '',
            amount: '',
            cryptoType: 'ETH',
            walletAddress: '',
            billingCycle: 'monthly'
        });

        if (!payoutWallet) {
            toast.warning('No eligible wallet found. Please add funds to proceed.');
        } else {
            toast.success('Subscription added successfully');
        }
    };

    // Fetch wallet balances and server wallet data
    useEffect(() => {
        const fetchWalletData = async () => {
            if (wallets.length > 0) {
                try {
                    const balances = await Promise.all(
                        wallets.map(async (wallet) => {
                            const balance = await getWalletBalance(wallet.address);
                            return {
                                address: wallet.address,
                                clientType: wallet.walletClientType,
                                balance: balance ? parseFloat(balance) : 0,
                            };
                        })
                    );
                    setWalletBalances(balances);
                } catch (error) {
                    console.error("Error fetching wallet balances:", error);
                    toast.error("Failed to fetch wallet balances");
                }
            }
        };

        const fetchServerWalletData = async () => {
            try {
                if (user?.email?.address) {
                    const wallet = await fetchWallet(user.email.address);
                    const serverWalletAddress = wallet.wallet.address;
                    const balance = await getWalletBalance(serverWalletAddress);
                    setServerWallet({
                        address: serverWalletAddress,
                        balance: balance ? parseFloat(balance) : 0,
                    });
                }
            } catch (error) {
                console.error("Error fetching server wallet balance:", error);
                toast.error("Failed to fetch server wallet");
            }
        };

        fetchServerWalletData();
        fetchWalletData();
    }, [wallets, user?.email?.address]);

    useEffect(() => {
        fetchSavedWallets();
    }, [user?.email?.address]);

    const handleTransaction = async () => {
        if (!selectedWallet || !destinationAddress || !amount) {
            setError('Please fill in all transaction details');
            return;
        }

        try {
            if (selectedWallet.address === serverWallet?.address) {
                if (!user?.email?.address) {
                    throw new Error("User email not found");
                }
                const hash = await sendServerTransaction(user.email.address, destinationAddress, amount);
                if (hash) {
                    toast.success("Server wallet transaction successful");
                    updateSubscriptionStatus();
                }
            } else {
                const wallet = wallets.find(w => w.address === selectedWallet.address);
                if (!wallet) throw new Error("Wallet not found");

                await wallet.switchChain(sepolia.id);
                const provider = await wallet.getEthereumProvider();
                if (!provider) throw new Error("Ethereum provider is undefined");

                const walletClient = createWalletClient({
                    account: wallet.address as Hex,
                    chain: sepolia,
                    transport: custom(provider),
                });

                const [address] = await walletClient.getAddresses();
                const hash = await walletClient.sendTransaction({
                    account: address,
                    to: destinationAddress as `0x${string}`,
                    value: parseEther(amount),
                });
                
                toast.success("Transaction successful");
                updateSubscriptionStatus();
            }

            setOpenDialog(false);
            resetTransactionForm();
        } catch (error) {
            console.error('Transaction failed:', error);
            toast.error("Transaction failed. Please try again.");
        }
    };

    const resetTransactionForm = () => {
        setDestinationAddress('');
        setAmount('');
        setSelectedSubscription(null);
        setSelectedWallet(null);
    };

    const updateSubscriptionStatus = () => {
        if (selectedSubscription) {
            setSubscriptions(subs =>
                subs.map(sub =>
                    sub.id === selectedSubscription.id
                        ? { 
                            ...sub, 
                            status: 'Active', 
                            nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
                        }
                        : sub
                )
            );
        }
    };

    const handlePayNow = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setDestinationAddress(subscription.walletAddress);
        setAmount(subscription.amount);
        setOpenDialog(true);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Crypto Subscription Manager</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            placeholder="Service Name"
                            value={newSubscription.name}
                            onChange={(e) => setNewSubscription(prev => ({ ...prev, name: e.target.value }))}
                        />
                        <Input
                            type="number"
                            placeholder="Amount"
                            value={newSubscription.amount}
                            onChange={(e) => setNewSubscription(prev => ({ ...prev, amount: e.target.value }))}
                            min="0"
                            step="0.000001"
                        />
                        <Input
                            placeholder="Wallet Address (0x...)"
                            value={newSubscription.walletAddress}
                            onChange={(e) => setNewSubscription(prev => ({ ...prev, walletAddress: e.target.value }))}
                        />
                        <Select
                            value={newSubscription.billingCycle}
                            onValueChange={(value: 'weekly' | 'monthly' | 'quarterly' | 'yearly') => 
                                setNewSubscription(prev => ({ ...prev, billingCycle: value }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select billing cycle" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button 
                            className="md:col-span-2 flex items-center justify-center gap-2" 
                            onClick={handleAddSubscription}
                        >
                            <Plus size={16} /> Add Subscription
                        </Button>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            <div className="space-y-4">
                {subscriptions.map((subscription) => (
                    <Card key={subscription.id}>
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-lg">{subscription.name}</h3>
                                    <p className="text-gray-600">
                                        {subscription.amount} {subscription.cryptoType} ({subscription.billingCycle})
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Next payment: {new Date(subscription.nextPayment).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-500">Status: {subscription.status}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline"
                                        onClick={() => handlePayNow(subscription)}
                                        className="flex items-center gap-2"
                                    >
                                        <Send size={16} /> Pay Now
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        onClick={() => handleDeleteSubscription(subscription.id)}
                                        className="flex items-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Payment</DialogTitle>
                        <DialogDescription>
                            Select a wallet and confirm the payment details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>From</Label>
                            <Select
                                value={selectedWallet?.address}
                                onValueChange={(value) => setSelectedWallet(
                                    walletBalances.find(wallet => wallet.address === value) ||
                                    (serverWallet?.address === value ? serverWallet : null)
                                )}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a wallet" />
                                </SelectTrigger>
                                <SelectContent>
                                    {serverWallet && (
                                        <SelectItem value={serverWallet.address}>
                                            Server Wallet ({serverWallet.balance.toFixed(4)} ETH)
                                        </SelectItem>
                                    )}
                                   {walletBalances.map((wallet) => (
                                        <SelectItem key={wallet.address} value={wallet.address}>
                                            {getWalletName(wallet.clientType || '')} ({wallet.balance.toFixed(4)} ETH)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>To</Label>
                            <Input
                                type="text"
                                value={destinationAddress}
                                onChange={(e) => setDestinationAddress(e.target.value)}
                                disabled={!!selectedSubscription}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Amount (ETH)</Label>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={!!selectedSubscription}
                                min="0"
                                step="0.000001"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setOpenDialog(false);
                            resetTransactionForm();
                        }}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleTransaction}
                            disabled={!selectedWallet || !destinationAddress || !amount}
                        >
                            Send Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SubscriptionManager;