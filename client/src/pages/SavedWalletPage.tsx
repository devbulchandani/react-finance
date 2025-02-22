import { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom, Hex, parseEther } from "viem";
import { sepolia } from "viem/chains";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { getWalletBalance } from "../lib/fetchWalletBalance";
import { fetchWallet, getSavedWallets, saveWallet, sendServerTransaction } from "../apiClient";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";

type SavedWallet = {
    nickname: string;
    address: string;
};

export type WalletBalance = {
    address: string;
    clientType?: string;
    balance: number;
};

const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const SavedWalletsPage = () => {
    const { wallets } = useWallets();
    const [savedWallets, setSavedWallets] = useState<SavedWallet[]>([]);
    const [selectedWallet, setSelectedWallet] = useState<WalletBalance | null>(
        null
    );
    const [openDialog, setOpenDialog] = useState(false);
    const [destinationAddress, setDestinationAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);
    const [isAddWalletDialogOpen, setIsAddWalletDialogOpen] = useState(false); // State for Add Wallet Dialog
    const [newWalletNickname, setNewWalletNickname] = useState(""); // State for nickname input
    const [newWalletAddress, setNewWalletAddress] = useState(""); //
    const [serverWallet, setServerWallet] = useState<{ address: string; balance: number } | null>(null);
    const { user } = usePrivy();


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

    const fetchSavedWallets = async () => {
        if (user?.email?.address) {
            const fetchedWallets = await getSavedWallets(user.email.address);
            setSavedWallets(fetchedWallets.wallets);
        }
    };
    console.log("Saved Wallets: ", JSON.stringify(savedWallets));

    useEffect(() => {
        fetchSavedWallets();
    }, [user?.email?.address]);

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
                }
            }
        };

        const fetchServerWalletData = async () => {
            try {
                const wallet = await fetchWallet(user?.email?.address!);
                const serverWalletAddress = wallet.wallet.address; // Replace with actual server wallet address
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

    // Save wallet address with nickname
    const handleSaveWallet = async () => {
        if (!newWalletNickname || !newWalletAddress) {
            toast.error("Nickname and address are required.");
            return;
        }

        try {
            const newWallet: SavedWallet = { nickname: newWalletNickname, address: newWalletAddress };
            if (user?.email?.address) {
                await saveWallet(user.email.address, newWallet.address, newWallet.nickname); // Call API to save wallet
            } else {
                toast.error("User email address is undefined.");
            }
            // setSavedWallets((prev) => [...prev, newWallet]);
            toast.success("Wallet saved successfully!");
            setIsAddWalletDialogOpen(false); // Close the dialog
            setNewWalletNickname(""); // Reset nickname input
            setNewWalletAddress(""); // Reset address input
        } catch (error) {
            console.error("Error saving wallet:", error);
            toast.error("Failed to save wallet.");
        }
    };

    // Send transaction
    const sendTransaction = async () => {
        if (!selectedWallet || !destinationAddress || !amount) return;


        try {
            if (selectedWallet.address === serverWallet?.address) {
                console.log("Server Wallet");
                const hash = await sendServerTransaction(user?.email?.address!, destinationAddress, amount);
                if (hash) {
                    toast.success("Server wallet transaction successful");
                    setOpenDialog(false)
                }
            } else {
                const wallet = wallets.find(
                    (wallet) => wallet.address === selectedWallet.address
                );
                if (!wallet) {
                    console.error("Wallet not found");
                    return;
                }

                await wallet.switchChain(sepolia.id);
                const provider = await wallet.getEthereumProvider();
                if (!provider) {
                    console.error("Ethereum provider is undefined");
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
                setOpenDialog(false);
                setDestinationAddress("");
                setAmount("");
                return hash;
            }

        } catch (error) {
            console.error("Error sending transaction:", error);
            toast.error("Error sending transaction");
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Saved Wallets</h1>

            {/* Add Wallet Button */}
            <Button onClick={() => setIsAddWalletDialogOpen(true)} className="mb-4">
                Add Wallet
            </Button>

            <Dialog open={isAddWalletDialogOpen} onOpenChange={setIsAddWalletDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Wallet</DialogTitle>
                        <DialogDescription>
                            Enter a nickname and wallet address to save the wallet.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Nickname</Label>
                            <Input
                                type="text"
                                value={newWalletNickname}
                                onChange={(e) => setNewWalletNickname(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Wallet Address</Label>
                            <Input
                                type="text"
                                value={newWalletAddress}
                                onChange={(e) => setNewWalletAddress(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddWalletDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveWallet}>Save Wallet</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Saved Wallets List */}
            <div className="space-y-2">
                {savedWallets.length > 0 ? (
                    savedWallets.map((wallet, index) => (
                        <div
                            key={index}
                            className="flex justify-between items-center border p-2 rounded"
                        >
                            <div>
                                <p className="font-semibold">{wallet.nickname}</p>
                                <p className="text-sm text-gray-500">
                                    {truncateAddress(wallet.address)}
                                </p>
                            </div>

                            {/* Dialog for Sending Transaction */}
                            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                                <DialogTrigger asChild>
                                    <Button
                                        onClick={() => {
                                            setDestinationAddress(wallet.address);
                                        }}
                                    >
                                        Send Transaction
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Send Transaction</DialogTitle>
                                        <DialogDescription>
                                            Enter the amount and select a wallet to send ETH.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label>From</Label>
                                            <Select onValueChange={(value) =>
                                                setSelectedWallet(
                                                    walletBalances.find(wallet => wallet.address === value) ||
                                                    (serverWallet?.address === value ? serverWallet : null)
                                                )
                                            }>
                                                <SelectTrigger className="w-full mt-1">
                                                    <SelectValue placeholder="Select a wallet" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {serverWallet && (
                                                        <SelectItem value={serverWallet.address}>
                                                            Server Wallet - ({serverWallet.balance.toFixed(4)} ETH)
                                                        </SelectItem>
                                                    )}
                                                    {walletBalances.map((wallet, index) => (
                                                        <SelectItem key={index} value={wallet.address}>
                                                            {getWalletName(wallet.clientType || '')} - {truncateAddress(wallet.address)} ({wallet.balance.toFixed(4)} ETH)
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Amount (ETH)</Label>
                                            <Input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => setOpenDialog(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button onClick={sendTransaction}>Send Transaction</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ))
                ) : (
                    <p>No wallets saved yet.</p>
                )}
            </div>
        </div>
    );
};

export default SavedWalletsPage;





