import { PrivyClient } from "@privy-io/server-auth";
import { createWalletClient, http, parseEther } from "viem";
import { createViemAccount } from '@privy-io/server-auth/viem';
import { sepolia } from 'viem/chains';
import { ethers } from "ethers";
import { User } from "../models/User";
import { createPolicy } from "./policyService";

const privy = new PrivyClient(
    'cm7eiidxa01iwk9lbfgtk2aar',
    '3tN16vXj2zQChDsutVK2hjD6M9d7W1Hev8gxyugZyQLbV1j25jXwSedTnPLn5DjbCzAwTyqnPakpFWnidBhiwRrg',
    {
        walletApi: {
            authorizationPrivateKey: 'wallet-auth:MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgnWgBYw4PZRvJNeuaRocg5i+GW1zvFT2Xqlz7Km7EAPChRANCAATzBc9j8zKszNRoRctji0NrsM3j9dO7jmwmvzsENgQInTDEc+CyMHy6N3UjDh+pZNzBZjNKcC0KRyHBc+aFSIZX'
        }
    }
);


const policy = {
    "version": "1.0",
    "name": "Max 0.01 ETH Transactions on Sepolia",
    "chain_type": "ethereum",
    "method_rules": [
        {
            "method": "eth_sendTransaction",
            "rules": [
                {
                    "name": "Limit transaction value to max 0.01 ETH",
                    "conditions": [
                        {
                            "field_source": "ethereum_transaction",
                            "field": "value",
                            "operator": "lte",
                            "value": "10000000000000000"  // 0.01 ETH in wei
                        }
                    ],
                    "action": "ALLOW"
                }
            ]
        }
    ],
    "default_action": "DENY"
}

const policyId = createPolicy(policy);


export async function createWallet(email: string): Promise<{ id: string; address: string; chainType: string }> {

    try {
        const user = await User.findOne({ email });
        console.log(email);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.serverWallet?.id) {
            throw new Error('User already has a server wallet');
        }
        const { id, address, chainType } = await privy.walletApi.create({
            chainType: 'ethereum',
            policyIds: [policyId]
        });


        user.serverWallet = {
            id,
            address,
            chainType
        };
        await user.save();
        return { id, address, chainType };
    } catch (error) {
        console.error('Error creating wallet:', error);
        throw error;
    }
}


export async function signMessage(
    email: string,
    message: string
): Promise<string> {
    try {
        const user = await User.findOne({ email });
        if (!user || !user.serverWallet) {
            throw new Error('User does not have a server wallet');
        }

        const { id: walletId, address } = user.serverWallet;

        const account = await createViemAccount({
            walletId,
            address: address as `0x${string}`,
            privy,
        });

        const client = createWalletClient({
            account,
            chain: sepolia,
            transport: http(),
        });

        const signature = await client.signMessage({
            message,
            account,
        });

        return signature;
    } catch (error) {
        console.error('Error signing message:', error);
        throw error;
    }
}


export async function sendTransaction(
    email: string,
    to: `0x${string}`,
    valueInEth: number
): Promise<`0x${string}`> {
    try {
        const user = await User.findOne({ email });
        if (!user || !user.serverWallet) {
            throw new Error('User does not have a server wallet');
        }
        const { id: walletId, address } = user.serverWallet;
        const valueInWei = parseEther(valueInEth.toString());


        const valueInHex = `0x${valueInWei.toString(16)}`;

        const data = await privy.walletApi.ethereum.sendTransaction({
            walletId: walletId,
            caip2: 'eip155:11155111',
            transaction: {
                to: to,
                value: valueInHex,
                chainId: 11155111,
            },
        });

        const { hash } = data;


        // const account = await createViemAccount({
        //     walletId,
        //     address: address as `0x${string}`,
        //     privy,
        // }); 
        // console.log(account);

        // const client = createWalletClient({
        //     account,
        //     chain: sepolia,
        //     transport: http(),
        // });
        // console.log(client);
        // const hash = await client.sendTransaction({
        //     to,
        //     value: parseEther(valueInEth.toString()),
        //     account,
        // });

        console.log('Transaction Sent:', hash);
        return hash as `0x${string}`;
    } catch (error) {
        console.error('Error sending transaction:', error);
        throw error;
    }
}


export async function fetchWallet(email: string): Promise<any> {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('No User ');
        }
        let wallet;
        if (!user.serverWallet?.id) {
            console.log("No server wallet");
            wallet = await createWallet(email);
        } else {
            console.log("Server wallet exists");
            console.log(user.serverWallet);
            const { id: walletId, address, chainType } = user.serverWallet!;
            wallet = { walletId, address, chainType };
        }
        return wallet;
    } catch (error: any) {
        console.error('Error fetching balance:', error.message);
        throw error;
    }
}
