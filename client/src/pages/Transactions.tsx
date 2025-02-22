import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Card } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Skeleton } from "../components/ui/skeleton";
import { ScrollArea } from "../components/ui/scroll-area";
import { WalletIcon, ArrowRightIcon, LampIcon as GasPumpIcon, ClockIcon, HashIcon, ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";
import { fetchWallet } from "../apiClient";

// Interfaces
interface Transaction {
    hash: string;
    nonce: string;
    from: string;
    to: string;
    value: string;
    gasPrice: string;
    gasUsed: string;
    fee: string;
    timestamp: string;
}

interface TransactionResponse {
    hash: string;
    nonce: string;
    from_address: string;
    to_address: string;
    value: string;
    gas: string;
    gas_price: string;
    receipt_gas_used: string;
    transaction_fee: string;
    block_timestamp: string;
}

const TransactionPage = () => {
    const [selectedWallet, setSelectedWallet] = useState<string>("");
    const [serverWallet, setServerWallet] = useState<string>("");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isLoadingWallet, setIsLoadingWallet] = useState<boolean>(true);
    const { wallets } = useWallets();
    const { user } = usePrivy();

    useEffect(() => {
        const fetchServerWalletData = async () => {
            if (!user?.email?.address) {
                setIsLoadingWallet(false);
                return;
            }

            try {
                const response = await fetchWallet(user.email.address);
                setServerWallet(response.wallet.address);
            } catch (error) {
                console.error("Error fetching server wallet:", error);
                toast.error("Failed to fetch server wallet");
            } finally {
                setIsLoadingWallet(false);
            }
        };

        fetchServerWalletData();
    }, [user?.email?.address]);

    const fetchTransactions = async () => {
        if (!selectedWallet) {
            toast.error("Please select a wallet to view transactions");
            return;
        }

        setLoading(true);
        try {
            const provider = new ethers.JsonRpcProvider(
                'https://site1.moralis-nodes.com/sepolia/9efa625d2a0d4ec2b8f138ecce8da119'
            );

            // Get the last 50 blocks
            const currentBlock = await provider.getBlockNumber();
            const transactions: Transaction[] = [];

            // Fetch transactions for the selected address
            const history = await provider.send("eth_getLogs", [{
                fromBlock: ethers.toBeHex(currentBlock - 50),
                toBlock: "latest",
                address: selectedWallet
            }]);

            // Process and format transactions
            for (const log of history) {
                const tx = await provider.getTransaction(log.transactionHash);
                if (tx) {
                    const receipt = await provider.getTransactionReceipt(log.transactionHash);
                    const block = await provider.getBlock(tx.blockNumber!);
                    
                    transactions.push({
                        hash: tx.hash,
                        nonce: tx.nonce.toString(),
                        from: tx.from,
                        to: tx.to || '',
                        value: ethers.formatEther(tx.value),
                        gasPrice: ethers.formatUnits(tx.gasPrice || 0, "gwei"),
                        gasUsed: receipt ? receipt.gasUsed.toString() : '0',
                        fee: receipt ? ethers.formatEther(receipt.gasUsed * tx.gasPrice!) : '0',
                        timestamp: block ? new Date(block.timestamp * 1000).toLocaleString() : '',
                    });
                }
            }

            setTransactions(transactions);
            toast.success(`Found ${transactions.length} transactions`);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            toast.error("Failed to fetch transactions. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const getEtherscanLink = (hash: string) => {
        return `https://sepolia.etherscan.io/tx/${hash}`;
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Transaction Explorer</h1>
                    <p className="text-muted-foreground">
                        View and analyze your wallet transactions on the Sepolia network
                    </p>
                </div>

                <Card className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex-1 w-full">
                            <Select 
                                value={selectedWallet} 
                                onValueChange={setSelectedWallet}
                                disabled={isLoadingWallet}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={isLoadingWallet ? "Loading wallets..." : "Select a wallet"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {serverWallet && (
                                        <SelectItem key={serverWallet} value={serverWallet}>
                                            <div className="flex items-center gap-2">
                                                <WalletIcon className="h-4 w-4" />
                                                <span>{truncateAddress(serverWallet)}</span>
                                                <span className="text-muted-foreground text-sm">
                                                    (Server Wallet)
                                                </span>
                                            </div>
                                        </SelectItem>
                                    )}
                                    {wallets.map((wallet) => (
                                        <SelectItem key={wallet.address} value={wallet.address}>
                                            <div className="flex items-center gap-2">
                                                <WalletIcon className="h-4 w-4" />
                                                <span>{truncateAddress(wallet.address)}</span>
                                                <span className="text-muted-foreground text-sm">
                                                    ({wallet.walletClientType})
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={fetchTransactions}
                            disabled={loading || !selectedWallet || isLoadingWallet}
                            className="w-full sm:w-auto"
                        >
                            {loading ? "Loading..." : "Fetch Transactions"}
                        </Button>
                    </div>
                </Card>

                <Card className="relative">
                    <ScrollArea className="h-[600px] rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead><div className="flex items-center gap-2"><HashIcon className="h-4 w-4" /> Hash</div></TableHead>
                                    <TableHead>From</TableHead>
                                    <TableHead>To</TableHead>
                                    <TableHead>Value (ETH)</TableHead>
                                    <TableHead><div className="flex items-center gap-2"><GasPumpIcon className="h-4 w-4" /> Gas (Gwei)</div></TableHead>
                                    <TableHead>Fee (ETH)</TableHead>
                                    <TableHead><div className="flex items-center gap-2"><ClockIcon className="h-4 w-4" /> Timestamp</div></TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array(8).fill(0).map((_, j) => (
                                                <TableCell key={j}>
                                                    <Skeleton className="h-4 w-full" />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            {selectedWallet 
                                                ? "No transactions found for this wallet" 
                                                : "Select a wallet to view transactions"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.map((tx, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-mono text-sm">
                                                {truncateAddress(tx.hash)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {truncateAddress(tx.from)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
                                                    {truncateAddress(tx.to)}
                                                </div>
                                            </TableCell>
                                            <TableCell>{parseFloat(tx.value).toFixed(6)}</TableCell>
                                            <TableCell>{parseFloat(tx.gasPrice).toFixed(2)}</TableCell>
                                            <TableCell>{parseFloat(tx.fee).toFixed(6)}</TableCell>
                                            <TableCell>{tx.timestamp}</TableCell>
                                            <TableCell>
                                                <a
                                                    href={getEtherscanLink(tx.hash)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:text-blue-600"
                                                >
                                                    <ExternalLinkIcon className="h-4 w-4" />
                                                </a>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </Card>
            </div>
        </div>
    );
};

export default TransactionPage;