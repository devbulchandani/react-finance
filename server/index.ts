import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import { User, IUser } from './models/User';
import dotenv from 'dotenv';
import orderRoutes from './routes/orderRoutes';


import userRoutes from './routes/userRoutes';
import serverWalletRoutes from './routes/serverWalletRoutes'
import savedWalletRoutes from './routes/savedWalletRoutes';
import productRoutes from './routes/productRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

dotenv.config();

app.use(cors());
app.use(bodyParser.json()); 

console.log('Attempting to connect to MongoDB...');
if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not defined in environment variables');
    process.exit(1);
}

const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
};

mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));


app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Plutus Backend' });
});



app.use('/api', userRoutes);
app.use('/api', serverWalletRoutes);
app.use('/api', savedWalletRoutes); 
app.use('/api/products', productRoutes);
app.use('/api', orderRoutes);


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 