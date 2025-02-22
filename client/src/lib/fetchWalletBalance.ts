import { ethers } from "ethers";

const INFURA_API_KEY = "00d918690e7246579fb6feabe829e5c8"; // Replace with your Infura API Key
const network = "sepolia"; // or "goerli", "polygon", etc.

export async function getWalletBalance(address: string) {
    try {
        if (!ethers.isAddress(address)) {
            throw new Error("Invalid wallet address");
        }

        // Connect to Ethereum provider via Infura
        const provider = new ethers.JsonRpcProvider(`https://${network}.infura.io/v3/${INFURA_API_KEY}`);

        // Fetch the balance
        const balance = await provider.getBalance(address);

        // Convert from wei to ether
        const balanceInEther = ethers.formatEther(balance);

        console.log(`Balance of ${address}: ${balanceInEther} ETH`);
        return balanceInEther;
    } catch (error: any) {
        console.error("Error fetching balance:", error.message);
        return null;
    }
}
