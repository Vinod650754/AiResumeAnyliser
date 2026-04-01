import mongoose from 'mongoose';

export const connectDatabase = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Create server/.env from server/.env.example and add your MongoDB Atlas connection string.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
};
