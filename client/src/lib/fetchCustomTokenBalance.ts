import { ethers } from "ethers";


interface EtherscanResponse {
    status: string;
    message: string;
    result: string;
}

export async function fetchTokenBalance({
    walletAddress,
}: {walletAddress: string}): Promise<number> {

    const chainId = '11155111'; // Default to Sepolia testnet
    const contractAddress='0x2d30F31854999f7B86641EFEDD25CcD3DEA4F420';
    const apiKey='UTP3ZD99VQ46637RZ4GUBJMFUZ9W1G4BWT';
    const baseUrl = 'https://api.etherscan.io/v2/api';
    const url = new URL(baseUrl);

    // Add query parameters
    const params: Record<string, string> = {
        chainid: chainId,
        module: 'account',
        action: 'tokenbalance',
        contractaddress: contractAddress,
        address: walletAddress,
        tag: 'latest',
        apikey: apiKey
    };

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    try {
        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: EtherscanResponse = await response.json();

        if (data.status === '1') {
            // Convert balance to decimal number
            const balanceInWei = data.result;
            const balanceInEth = ethers.formatEther(balanceInWei);

            return parseFloat(balanceInEth);
        } else {
            throw new Error(`API Error: ${data.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error fetching token balance:', error);
        throw error;
    }
}

// Example usage:

// const params: TokenBalanceParams = {

//     walletAddress: '0x9e1747D602cBF1b1700B56678F4d8395a9755235',
// };

// try {
//     const balance = await fetchTokenBalance(params);
//     console.log(`Token balance: ${balance}`);
// } catch (error) {
//     console.error('Failed to fetch balance:', error);
// }
