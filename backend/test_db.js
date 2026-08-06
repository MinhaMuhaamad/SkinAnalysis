import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
console.log('Testing connection to URI:', uri);

if (!uri) {
  console.error('❌ MONGODB_URI is not defined in the .env file.');
  process.exit(1);
}

const testConnection = async () => {
  try {
    console.log('Connecting...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Host:', conn.connection.host);
    console.log('Database Name:', conn.connection.name);
    await mongoose.disconnect();
    console.log('Disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB Connection Failure!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    process.exit(1);
  }
};

testConnection();
