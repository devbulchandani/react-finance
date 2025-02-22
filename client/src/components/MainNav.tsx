import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { UserCircle, WalletIcon } from "lucide-react"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { Button } from "./ui/button"
import { useCreateWallet } from '@privy-io/react-auth';
import { createWalletClient, custom, Hex, parseEther } from 'viem';
import { sepolia } from 'viem/chains';

export function MainNav() {
    const { linkWallet } = usePrivy();
    const { wallets } = useWallets()
    const { createWallet } = useCreateWallet();

    const sign = async () => {
        const wallet = wallets.find(wallet => wallet.walletClientType === 'privy');
        const provider = await wallet?.getEthereumProvider();
        const address = wallet?.address;
        const message = 'This is the message I am signing';
        const signature = await provider?.request({
            method: 'personal_sign',
            params: [message, address],
        });
        console.log(signature);
    }

    const transaction = async () => {
        const wallet = wallets.find(wallet => wallet.walletClientType === 'privy');
        await wallet?.switchChain(sepolia.id);

        const provider = await wallet?.getEthereumProvider();
        if (!provider) {
            console.error('Ethereum provider is undefined');
            return;
        }
        const walletClient = createWalletClient({
            account: wallet?.address as Hex,
            chain: sepolia,
            transport: custom(provider),
        });
        const [address] = await walletClient.getAddresses()

        const hash = await walletClient.sendTransaction({
            account: address,
            to: '0x1029BBd9B780f449EBD6C74A615Fe0c04B61679c',
            value: parseEther('0.0001')
        })

        console.log(hash);
    }

    return (
        <nav className="flex justify-between w-full px-2">
            <div className="flex items-center space-x-6">
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 bg-secondary px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors">
                        <WalletIcon className="h-5 w-5" />
                        <span>Wallets</span>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-fit px-4 py-2 bg-popover border-border">
                    <DropdownMenuItem>
                        <div className="flex flex-col space-y-1">
                            <span className="font-semibold text-foreground">Connected Wallets:</span>
                            {wallets.length > 0 ? (
                                wallets.map((wallet, index) => (
                                    <span key={index} className="text-sm text-muted-foreground">
                                        {wallet.walletClientType} -
                                        {wallet.address}
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm text-muted-foreground">No wallets connected</span>
                            )}
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={linkWallet}>
                        <Button variant="outline" className="w-full">Link Another Wallet</Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={createWallet}>
                        <Button variant="outline" className="w-full">Create Wallet</Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={sign}>
                        <Button className="w-full bg-primary hover:bg-primary/90">
                            Sign
                        </Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={transaction}>
                        <Button className="w-full bg-primary hover:bg-primary/90">
                            Send
                        </Button>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </nav>
    )
}