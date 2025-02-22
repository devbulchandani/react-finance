import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom, parseEther } from "viem";
import { sepolia } from "viem/chains";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getWalletBalance } from "../lib/fetchWalletBalance";
import { createOrder, fetchWallet, getAllProducts, sendServerTransaction } from "../apiClient"; // Import the getAllProducts function
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Order, UserOrders } from '@/components/UserOrders';

type Product = {
    _id: string;
    name: string;
    description: string;
    price: string;
    merchantAddress: string;
};

type WalletBalance = {
    address: string;
    clientType?: string;
    balance: number;
};

const OrderPage = () => {
    const { wallets } = useWallets();
    const { user } = usePrivy();
    const [products, setProducts] = useState<Product[]>([]); // State for products
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState<WalletBalance | null>(null);
    const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);
    const [serverWallet, setServerWallet] = useState<{ address: string; balance: number } | null>(null);


    // Fetch wallet balances
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

        fetchWalletData();
    }, [wallets]);

    // Fetch all products dynamically
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const fetchedProducts = await getAllProducts(); // Fetch products from API
                setProducts(fetchedProducts);
            } catch (error) {
                console.error("Error fetching products:", error);
                toast.error("Failed to load products.");
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

        fetchProducts();
    }, []);

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

    const handleBuyNow = (product: Product) => {
        setSelectedProduct(product);
        setOpenDialog(true);
        console.log(selectedProduct);
    };

    const sendTransaction = async () => {
        if (!selectedProduct || !selectedWallet) {
            toast.error("Please select a wallet");
            return;
        }

        try {
            // Create order first

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
                account: wallet.address as `0x${string}`,
                chain: sepolia,
                transport: custom(provider),
            });

            const [address] = await walletClient.getAddresses();
            const hash = await walletClient.sendTransaction({
                account: address,
                to: serverWallet?.address as `0x${string}` || '',
                value: parseEther(selectedProduct.price),
            });

            await createOrder({
                userEmail: user?.email?.address || '', // Using wallet address as userId
                productId: selectedProduct._id,
                merchantAddress: selectedProduct.merchantAddress,
                userAddress: wallet.address,
                amount: selectedProduct.price,
                transactionHash: hash,
            });


            toast.success("Purchase successful!");
            setOpenDialog(false);
            return hash;
        } catch (error) {
            console.error("Error processing purchase:", error);
            toast.error("Error processing purchase");
        }
    };

   

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Available Products</h1>

            {/* Display products */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length > 0 ? (
                    products.map((product) => (
                        <Card key={product._id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="mt-4">{product.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">{product.description}</p>
                                <p className="text-lg font-bold mt-2">{product.price} ETH</p>
                            </CardContent>
                            <CardFooter className="mt-auto">
                                <Button
                                    className="w-full"
                                    onClick={() => handleBuyNow(product)}
                                >
                                    Buy Now
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <p>No products available.</p>
                )}
            </div>

            <div className="mt-12">
                <UserOrders/>
            </div>

            {/* Purchase Confirmation Modal */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete Purchase</DialogTitle>
                        <DialogDescription>
                            Select a wallet to pay {selectedProduct?.price} ETH for {selectedProduct?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Select Wallet</Label>
                            <Select
                                onValueChange={(value) =>
                                    setSelectedWallet(
                                        walletBalances.find(wallet => wallet.address === value) || null
                                    )
                                }
                            >
                                <SelectTrigger className="w-full mt-1">
                                    <SelectValue placeholder="Select a wallet" />
                                </SelectTrigger>
                                <SelectContent>
                                    {walletBalances.map((wallet, index) => (
                                        <SelectItem key={index} value={wallet.address}>
                                            {getWalletName(wallet.clientType || '')} - {truncateAddress(wallet.address)} ({wallet.balance.toFixed(4)} ETH)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={sendTransaction}>Complete Purchase</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default OrderPage;