import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { getWalletBalance } from "../lib/fetchWalletBalance";
import { Wallet2, CreditCard, Coins, Copy, Send, Wallet } from "lucide-react";
import { toast } from "sonner";

import { createWalletClient, custom, Hex, parseEther } from 'viem';
import { sepolia } from 'viem/chains';

import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { fetchWallet, sendServerTransaction } from "@/apiClient";

export type WalletBalance = {
    address: string;
    clientType?: string;
    balance: number;
};

const getWalletIcon = (clientType: string) => {
    switch (clientType.toLowerCase()) {
        case 'metamask':
            return <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJZaVpfhv3kgZA46GoqfVNIFhR6pXIdX4_Rg&s"
                alt="MetaMask"
                className="w-8 h-8" />;
        case 'coinbase_wallet':
            return <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 512 512" id="coinbase" className="w-8 h-8">
                <g clipPath="url(#clip0_84_15704)">
                    <rect width="512" height="512" fill="#0052FF" rx="60"></rect>
                    <path fill="#0052FF" d="M255.5 40C375.068 40 472 136.932 472 256.5C472 376.068 375.068 473 255.5 473C135.932 473 39 376.068 39 256.5C39 136.932 135.932 40 255.5 40Z"></path>
                    <path fill="#fff" d="M255.593 331.733C213.515 331.733 179.513 297.638 179.513 255.653C179.513 213.668 213.608 179.573 255.593 179.573C293.258 179.573 324.535 206.999 330.547 242.973H407.19C400.71 164.826 335.337 103.398 255.5 103.398C171.436 103.398 103.245 171.589 103.245 255.653C103.245 339.717 171.436 407.907 255.5 407.907C335.337 407.907 400.71 346.48 407.19 268.333H330.453C324.441 304.307 293.258 331.733 255.593 331.733Z"></path>
                </g>
                <defs>
                    <clipPath id="clip0_84_15704">
                        <rect width="512" height="512" fill="#fff"></rect>
                    </clipPath>
                </defs>
            </svg>;
        case 'privy':
            return <Wallet2 className="w-8 h-8 text-primary" />;
        default:
            return <CreditCard className="w-8 h-8 text-muted-foreground" />;
    }
};

const getWalletName = (clientType: string) => {
    switch (clientType.toLowerCase()) {
        case 'metamask':
            return "MetaMask";
        case 'coinbase_wallet':
            return "Coinbase"
        case 'privy':
            return "Privy Embedded";
        case 'phantom':
            return "Phantom";
    }
}

const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const Profile = () => {
    const { wallets } = useWallets();
    const { user } = usePrivy();
    const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);
    const [serverWallet, setServerWallet] = useState<{ address: string; balance: number } | null>(null);
    const [selectedWallet, setSelectedWallet] = useState<WalletBalance | undefined>(undefined);
    const [destinationAddress, setDestinationAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [open, setOpen] = useState(false);

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
                                balance: balance ? parseFloat(balance) : 0
                            };
                        })
                    );
                    setWalletBalances(balances);
                } catch (error) {
                    console.error("Error fetching wallet balances:", error);
                }
            }
        };

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

        fetchServerWalletData();
        fetchWalletData();
    }, [wallets]);

    const handleCopyAddress = async (address: string) => {
        try {
            await navigator.clipboard.writeText(address);
            toast.success("Address copied to clipboard");
        } catch (error) {
            console.error("Failed to copy address:", error);
            toast.error("Failed to copy address");
        }
    };

    const sendTransaction = async () => {
        if (!selectedWallet) return;

        try {
            if (selectedWallet.address === serverWallet?.address) {
                // Call server wallet transaction
                const hash = await sendServerTransaction(user?.email?.address!, destinationAddress, amount);
                if (hash) {
                    toast.success("Server wallet transaction successful");
                    setOpen(false)
                }
            } else{
                const wallet = wallets.find(wallet => wallet.address === selectedWallet.address);
                if (!wallet) {
                    console.error('Wallet not found');
                    return;
                }
    
                await wallet.switchChain(sepolia.id);
                const provider = await wallet.getEthereumProvider();
                if (!provider) {
                    console.error('Ethereum provider is undefined');
                    return;
                }
    
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
                setOpen(false)
                return hash;
            }
            
        } catch (error) {
            console.log("Error sending transaction:", error);
            toast.error("Error sending transaction");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Your Wallet Dashboard</h1>
                <p className="text-muted-foreground">Manage and monitor your connected wallets</p>
            </div>
            
            <div className="mb-8 bg-secondary rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-2 text-foreground">Server Wallet</h2>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Wallet2 className="w-8 h-8 text-primary" />
                        <div>
                            <p className="font-semibold text-foreground">{truncateAddress(serverWallet?.address || "N/A")}</p>
                            <p className="text-sm text-muted-foreground">Balance: {serverWallet?.balance.toFixed(4) || "0.0000"} ETH</p>
                        </div>
                    </div>
                    {serverWallet && (
                        <button onClick={() => handleCopyAddress(serverWallet.address)}>
                            <Copy className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
                        </button>
                    )}
                </div>
                {serverWallet && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => setSelectedWallet(serverWallet)}
                                className="mt-4"
                            >
                                Send Transaction
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Send Transaction</DialogTitle>
                                <DialogDescription>
                                    Send ETH to another wallet address. Please verify all details before confirming.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-6 py-4">
                                <div className="flex flex-col gap-2">
                                    <Label>From</Label>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Wallet className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-mono text-sm">
                                            {truncateAddress(selectedWallet?.address || "")}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="destination">
                                        Destination Address
                                    </Label>
                                    <Input
                                        id="destination"
                                        placeholder="0x..."
                                        value={destinationAddress}
                                        onChange={(e) => setDestinationAddress(e.target.value)}
                                        className="font-mono"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="amount">
                                        Amount (ETH)
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="0.0"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="pr-12"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                            ETH
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setOpen(false);
                                        setDestinationAddress("");
                                        setAmount("");
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={sendTransaction}
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Transaction
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {walletBalances.length > 0 ? (
                    walletBalances.map((wallet, index) => (
                        <div key={index}
                            className="bg-secondary rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-border">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    {getWalletIcon(wallet.clientType || '')}
                                    <div>
                                        <h3 className="font-semibold text-lg text-foreground capitalize">
                                            {getWalletName(wallet.clientType || '')} Wallet
                                        </h3>
                                        <p className="text-sm text-muted-foreground font-mono">
                                            {truncateAddress(wallet.address)}
                                        </p>
                                        <button onClick={() => handleCopyAddress(wallet.address)}>
                                            <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 bg-background/50 rounded-lg p-4">
                                <Coins className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Balance</p>
                                    <p className="font-semibold text-lg text-foreground">
                                        {wallet.balance.toFixed(4)} ETH
                                    </p>
                                </div>
                            </div>

                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        onClick={() => setSelectedWallet(wallet)}
                                        className="mt-4 w-full"
                                    >
                                        Send Transaction
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Send Transaction</DialogTitle>
                                        <DialogDescription>
                                            Send ETH to another wallet address. Please verify all details before confirming.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="grid gap-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            <Label>From</Label>
                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Wallet className="h-4 w-4 text-primary" />
                                                </div>
                                                <span className="font-mono text-sm">
                                                    {truncateAddress(selectedWallet?.address || "")}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="destination">
                                                Destination Address
                                            </Label>
                                            <Input
                                                id="destination"
                                                placeholder="0x..."
                                                value={destinationAddress}
                                                onChange={(e) => setDestinationAddress(e.target.value)}
                                                className="font-mono"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="amount">
                                                Amount (ETH)
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="amount"
                                                    type="number"
                                                    placeholder="0.0"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    className="pr-12"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                                    ETH
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setOpen(false);
                                                setDestinationAddress("");
                                                setAmount("");
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={sendTransaction}
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            Send Transaction
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center p-8 bg-secondary rounded-xl border-2 border-dashed border-border">
                        <Wallet2 className="w-12 h-12 text-primary mb-3" />
                        <h3 className="text-lg font-medium text-foreground mb-1">No Wallets Connected</h3>
                        <p className="text-muted-foreground">Connect a wallet to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;