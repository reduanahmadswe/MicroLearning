import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../app/modules/auth/auth.model';

// Load environment variables
dotenv.config();

const seedInstructor = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/microlearning';
    await mongoose.connect(mongoUri);
    console.log('✅ Database connected successfully');

    // Check if instructor already exists
    const existingInstructor = await User.findOne({ email: 'instructor@microlearning.com' });
    
    if (existingInstructor) {
      console.log('⚠️  Instructor user already exists');
      console.log('Email:', existingInstructor.email);
      console.log('Name:', existingInstructor.name);
      console.log('Role:', existingInstructor.role);
      await mongoose.disconnect();
      return;
    }

    // Create instructor user
    const instructorData = {
      email: 'instructor@microlearning.com',
      password: 'instructor123456', // Will be hashed automatically by pre-save hook
      name: 'John Instructor',
      role: 'instructor',
      isActive: true,
      bio: 'Expert instructor specializing in programming and technology',
      xp: 5000,
      coins: 2000,
      level: 8,
      isPremium: true,
      preferences: {
        interests: ['Programming', 'Web Development', 'AI', 'Database'],
        goals: ['Teaching', 'Content Creation', 'Student Engagement'],
        dailyLearningTime: 120,
        preferredDifficulty: 'advanced',
        language: 'en',
        learningStyle: 'visual',
      },
      streak: {
        current: 15,
        longest: 25,
        lastActivityDate: new Date(),
      },
    };

    const instructor = await User.create(instructorData);

    console.log('✅ Instructor user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    instructor@microlearning.com');
    console.log('🔑 Password: instructor123456');
    console.log('👤 Name:     John Instructor');
    console.log('🎖️  Role:     instructor');
    console.log('🆔 ID:       ', instructor._id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Please change the password after first login!');

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Database disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding instructor:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the seed function
seedInstructor();
