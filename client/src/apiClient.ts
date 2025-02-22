const API_URL = 'http://localhost:3001';

// User-related APIs
export const addUserToDatabase = async (user: any) => {
    try {
        const response = await fetch(`${API_URL}/api/add-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error adding user:', error);
    }
};

export const fetchWallet = async (email: string) => {
    try {
        const response = await fetch(`${API_URL}/api/fetch-wallet/${email}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching wallet:', error);
    }
};

export const sendServerTransaction = async (email: string, to: string, valueInEth: string) => {
    try {
        const response = await fetch(`${API_URL}/api/send-transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, to, valueInEth }),
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.log('Error sending transaction:', error);
    }
};

export const getSavedWallets = async (email: string) => {
    try {
        const response = await fetch(`${API_URL}/api/saved-wallets/${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.log("Error fetching saved wallets:", error);
    }
};

export const saveWallet = async (email: string, address: string, nickname: string) => {
    try {
        const response = await fetch(`${API_URL}/api/saved-wallets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, address, nickname }),
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.log("Error saving wallet:", error);
    }
};

// Product-related APIs
export const createProduct = async (productData: { name: string, description: string, price: number, merchantAddress: string }) => {
    try {
        const response = await fetch(`${API_URL}/api/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error creating product:', error);
    }
};

export const getAllProducts = async () => {
    try {
        const response = await fetch(`${API_URL}/api/products`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching all products:', error);
    }
};

export const getProductById = async (productId: string) => {
    try {
        const response = await fetch(`${API_URL}/api/products/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch product with ID ${productId}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        throw error;
    }
};

export const getMerchantProducts = async (merchantAddress: string) => {
    try {
        const response = await fetch(`${API_URL}/api/products/merchant/${merchantAddress}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching merchant products:', error);
    }
};

export const updateProduct = async (productId: string, updates: { [key: string]: any }, merchantAddress: string) => {
    try {
        const response = await fetch(`${API_URL}/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ updates, merchantAddress }),
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error updating product:', error);
    }
};

export const deleteProduct = async (productId: string, merchantAddress: string) => {
    try {
        const response = await fetch(`${API_URL}/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ merchantAddress }),
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error deleting product:', error);
    }
};

export const createOrder = async (orderData: {
    userEmail: string;
    productId: string;
    merchantAddress: string;
    userAddress: string;
    amount: string;
    transactionHash: string;
}) => {
    try {
        const response = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};


export const getUserOrders = async (userEmail: string) => {
    try {
        const response = await fetch(`${API_URL}/api/orders/user/${userEmail}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching user orders:', error);
        throw error;
    }
};

export const getMerchantOrders = async (merchantAddress: string) => {
    try {
        const response = await fetch(`${API_URL}/api/orders/merchant/${merchantAddress}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching merchant orders:', error);
        throw error;
    }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
    try {
        const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            throw new Error(`Failed to update order status: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};