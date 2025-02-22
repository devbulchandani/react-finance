# Blockchain-Based Order Management System

## Overview
This application is a decentralized order management system that combines traditional e-commerce functionality with blockchain technology. It enables merchants to manage orders, handle payments, and track shipping status using smart contracts on the Ethereum Sepolia testnet.

## Features
- **Wallet Authentication**: Secure login using Privy wallet integration
- **Order Management**: Track and manage orders with real-time status updates
- **Blockchain Integration**: 
  - Smart contract interaction for shipping and delivery status
  - Automated payment processing on status changes
  - Sepolia testnet integration
- **Payment Handling**:
  - Secure ETH transfers to merchants upon order completion
  - Automated refund processing for failed orders
- **Status Tracking**:
  - PENDING: Initial order state
  - PROCESSING: Order is being prepared/shipped
  - COMPLETED: Order successfully delivered
  - FAILED: Order cannot be fulfilled
  - REFUNDED: Payment returned to customer

## Technical Stack
- **Frontend**: React with TypeScript
- **Blockchain**:
  - Ethereum (Sepolia Testnet)
  - ethers.js for blockchain interactions
  - Mock Oracle Contract for status tracking
- **Authentication**: Privy Wallet Integration
- **UI Components**: 
  - shadcn/ui component library
  - Tailwind CSS for styling
- **State Management**: React Hooks
- **Notifications**: Sonner toast notifications

## Smart Contracts
### Mock Oracle Contract
- **Address**: `0xF2D82330a6aD227C59604Cbd65AE522fbD352935`
- **Network**: Sepolia Testnet
- **Functions**:
  - `emitShipped(uint256 shipmentId)`: Update shipment status to shipped
  - `emitDelivered(uint256 shipmentId)`: Update shipment status to delivered

## Environment Setup
```env
INFURA_API_KEY=your_infura_api_key
```

## API Integration
The system interfaces with several backend endpoints:
- `fetchWallet`: Retrieve wallet information
- `getMerchantOrders`: Get orders for a specific merchant
- `sendServerTransaction`: Process payments
- `updateOrderStatus`: Update order status
- `getWalletBalance`: Check wallet balance

## Security Features
- Secure wallet authentication through Privy
- Server-side transaction processing
- Status-based payment releases
- Blockchain verification for shipping status

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
- Create a `.env` file
- Add required API keys and contract addresses

3. Start the development server:
```bash
npm run dev
```

## Component Usage
```tsx
import { MerchantOrders } from './components/MerchantOrders';

function App() {
  return <MerchantOrders />;
}
```

## Contributing
[Add contribution guidelines here]

## License
[Add license information here]

## Support
[Add support contact information here]

---

Note: This project uses the Sepolia testnet. Make sure you have test ETH before interacting with the contracts.
