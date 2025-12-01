import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../app/modules/auth/auth.model';

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/microlearning';
    await mongoose.connect(mongoUri);
    console.log('✅ Database connected successfully');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@microlearning.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Name:', existingAdmin.name);
      console.log('Role:', existingAdmin.role);
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const adminData = {
      email: 'admin@microlearning.com',
      password: 'admin123456', // Will be hashed automatically by pre-save hook
      name: 'System Administrator',
      role: 'admin',
      isActive: true,
      bio: 'Platform Administrator',
      xp: 10000,
      coins: 5000,
      level: 10,
      isPremium: true,
      preferences: {
        interests: ['Technology', 'Education', 'AI'],
        goals: ['Platform Management', 'User Support'],
        dailyLearningTime: 60,
        preferredDifficulty: 'advanced',
        language: 'en',
        learningStyle: 'visual',
      },
      streak: {
        current: 30,
        longest: 30,
        lastActivityDate: new Date(),
      },
    };

    const admin = await User.create(adminData);

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@microlearning.com');
    console.log('🔑 Password: admin123456');
    console.log('👤 Name:     System Administrator');
    console.log('🎖️  Role:     admin');
    console.log('🆔 ID:       ', admin._id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Please change the password after first login!');

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Database disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the seed function
seedAdmin();
