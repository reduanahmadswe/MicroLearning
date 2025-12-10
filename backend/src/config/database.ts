import mongoose from 'mongoose';

const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/microlearning';

    await mongoose.connect(mongoUri, {
      maxPoolSize: 50, // Maintain up to 50 socket connections
      minPoolSize: 10, // Maintain at least 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });


    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
    });

  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
};

export default connectDatabase;
