import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    cryptoType: {
        type: String,
        enum: ['ETH', 'BTC', 'USDC'],
        default: 'ETH'
    },
    walletAddress: {
        type: String,
        required: true
    },
    billingCycle: {
        type: String,
        enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
        default: 'monthly'
    },
    nextPayment: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Pending Payout Verification'],
        default: 'Pending Payout Verification'
    },
    userEmail: {
        type: String,
        required: true
    },
    payoutWallet: {
        type: String
    },
    timeLeft: {
        type: Number
    }
}, {
    timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;