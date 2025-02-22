import { useState, useEffect } from "react";
import { useWallets } from "@privy-io/react-auth";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet2, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchTokenBalance } from "@/lib/fetchCustomTokenBalance";

type WalletBalance = {
    address: string;
    clientType?: string;
    balance: number;
};

const FlashLoan = () => {
    const { wallets } = useWallets();
    const [selectedWallet, setSelectedWallet] = useState<WalletBalance | null>(null);
    const [amount, setAmount] = useState("");
    const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getWalletName = (clientType: string) => {
        switch (clientType.toLowerCase()) {
            case 'metamask':
                return "MetaMask";
            case 'coinbase_wallet':
                return "Coinbase";
            case 'privy':
                return "Privy Embedded";
            case 'phantom':
                return "Phantom";
            default:
                return clientType;
        }
    };

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const handleRequestLoan = async () => {
        if (!selectedWallet || !amount) {
            toast.error("Please select a wallet and enter an amount");
            return;
        }

        try {
            setIsLoading(true);
            // This is where the flash loan logic will be implemented
            console.log("Requesting flash loan:", {
                walletAddress: selectedWallet.address,
                amount: amount
            });
            
            toast.success("Flash loan request submitted");
            setAmount("");
        } catch (error) {
            console.error("Error requesting flash loan:", error);
            toast.error("Failed to request flash loan");
        } finally {
            setIsLoading(false);
        }
    };

    const loadWalletBalances = async () => {
        try {
            setIsLoading(true);
            const balances = await Promise.all(
                wallets.map(async (wallet) => {
                    const balance = await fetchTokenBalance({ walletAddress: wallet.address });
                    console.log("Balance:", balance);
                    return {
                        address: wallet.address,
                        clientType: wallet.walletClientType,
                        balance: balance ? parseFloat(balance.toString()) : 0,
                    };
                })
            );
            setWalletBalances(balances);
        } catch (error) {
            console.error("Error fetching wallet balances:", error);
            toast.error("Failed to load wallet balances");
        } finally {
            setIsLoading(false);
        }
    };

    // Load balances when component mounts
    useEffect(() => {
        loadWalletBalances();
    }, [wallets]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                        Flash Loan Portal
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Access instant liquidity through our flash loan service. Borrow assets without collateral for atomic transactions.
                    </p>
                </div>

                {/* Wallet Selection */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">Select Wallet</Label>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadWalletBalances}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh Balances
                        </Button>
                    </div>
                    <select
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => {
                            const wallet = walletBalances.find(
                                (w) => w.address === e.target.value
                            );
                            setSelectedWallet(wallet || null);
                        }}
                        value={selectedWallet?.address || ""}
                    >
                        <option value="">Select a wallet</option>
                        {walletBalances.map((wallet, index) => (
                            <option key={index} value={wallet.address}>
                                {getWalletName(wallet.clientType || '')} -
                                {truncateAddress(wallet.address)} (
                                {wallet.balance.toFixed(4)} ETH)
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet2 className="h-5 w-5" />
                                Available Balance
                            </CardTitle>
                            <CardDescription>
                                Your connected wallet's current balance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {selectedWallet ? `${selectedWallet.balance.toFixed(4)} ETH` : "-- ETH"}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ArrowRight className="h-5 w-5" />
                                Request Loan
                            </CardTitle>
                            <CardDescription>
                                Enter amount and request flash loan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium">Loan Amount (ETH)</Label>
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="mt-1"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <Button 
                                onClick={handleRequestLoan}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                disabled={!selectedWallet || !amount || isLoading}
                            >
                                {isLoading ? 'Processing...' : 'Request Loan'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <Alert className="mb-8">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Flash loans must be borrowed and repaid within the same transaction block.
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    );
};

export default FlashLoan;