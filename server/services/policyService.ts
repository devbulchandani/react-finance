import canonicalize from 'canonicalize'; // For JSON canonicalization
import * as crypto from 'crypto'; // For cryptographic operations
import("node-fetch")

// Replace this with your private key from the Dashboard
const PRIVY_AUTHORIZATION_KEY: string = 'wallet-auth:MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiNhlIWPT9yr/XRmb3qgssVWSr91E4XX8X62HbPVAMi+hRANCAARx5wcOumvPh0Yweqsum+7NvlQoTC2qL1XoCio+JxBe8nL3fB4KorklityyACRqAdnd7sXoBr414dJbXBB5rBgm';

/**
 * Function to generate the authorization signature
 */
function getAuthorizationSignature({
    url,
    body,
}: {
    url: string;
    body: object;
}): string {
    const payload = {
        version: 1,
        method: 'POST',
        url,
        body,
        headers: {
            'privy-app-id': 'cm6m2x54x009tkqmmiupwl2eg'
            // If your request includes an idempotency key, include that header here as well
        },
    };

    // JSON-canonicalize the payload and convert it to a buffer
    const serializedPayload = canonicalize(payload);
    if (!serializedPayload) {
        throw new Error('Failed to canonicalize payload');
    }
    const serializedPayloadBuffer: Buffer = Buffer.from(serializedPayload);

    // Remove the 'wallet-auth:' prefix from the private key
    const privateKeyAsString: string = PRIVY_AUTHORIZATION_KEY.replace('wallet-auth:', '');

    // Convert the private key to PEM format
    const privateKeyAsPem: string = `-----BEGIN PRIVATE KEY-----\n${privateKeyAsString}\n-----END PRIVATE KEY-----`;

    // Instantiate a node crypto KeyObject for the private key
    const privateKey = crypto.createPrivateKey({
        key: privateKeyAsPem,
        format: 'pem',
    });

    // Sign the payload buffer with the private key and serialize the signature to a base64 string
    const signatureBuffer: Buffer = crypto.sign('sha256', serializedPayloadBuffer, privateKey);
    const signature: string = signatureBuffer.toString('base64');

    return signature;
}

/**
 * Function to create a policy
 */
export async function createPolicy(policy: object): Promise<any> {
    try {
        // URL for the Privy API
        const url = 'https://api.privy.io/v1/policies';

        // Generate the authorization signature
        const authorizationSignature = getAuthorizationSignature({
            url,
            body: policy,
        });

        // Make the POST request to the Privy API
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa("cm6m2x54x009tkqmmiupwl2eg:5x9hnFZ7NJhVhZkAidxABCfcewb6VQENdtHEZyPvcqwUcwRsEveVfpBc9svYD2i17ZKLKPKCyEk53HEQtV9s59ZU")}`,
                'privy-app-id': 'cm6m2x54x009tkqmmiupwl2eg',
                'privy-authorization-signature': authorizationSignature,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(policy),
        });

        // Parse the response
        const data: any = await response.json();

        // Check if the request was successful
        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, error: data.error || 'Failed to create policy' };
        }
    } catch (error) {
        console.error('Error creating policy:', error);
        return { success: false, error: 'Internal server error' };
    }
}

// Example usage of the createPolicy function
