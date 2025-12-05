import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../app/modules/auth/auth.model';

dotenv.config();

const DEMO_USERS_COUNT = 50;
const DEFAULT_PASSWORD = '12345678';

const firstNames = [
  'Rahim', 'Karim', 'Sadia', 'Nadia', 'Fahim', 'Tanvir', 'Mim', 'Riya',
  'Sakib', 'Tamim', 'Mushfiq', 'Afif', 'Mehidy', 'Liton', 'Shanto', 'Taskin',
  'Rubel', 'Mustafiz', 'Mahmudullah', 'Soumya', 'Naim', 'Yasir', 'Taijul',
  'Shoriful', 'Shohidul', 'Towhid', 'Ebadot', 'Nurul', 'Sabbir', 'Mominul',
  'Anika', 'Bristy', 'Purnima', 'Shirin', 'Farida', 'Sultana', 'Fatima',
  'Ayesha', 'Khadija', 'Mariam', 'Zainab', 'Rukhsana', 'Nasrin', 'Kulsum',
  'Rehana', 'Shabnaz', 'Dilruba', 'Nurjahan', 'Hosneara', 'Rokeya'
];

const lastNames = [
  'Rahman', 'Ahmed', 'Islam', 'Hossain', 'Khan', 'Ali', 'Akter', 'Begum',
  'Chowdhury', 'Uddin', 'Hassan', 'Hussain', 'Kamal', 'Amin', 'Haque',
  'Molla', 'Sheikh', 'Siddiqui', 'Talukder', 'Roy', 'Das', 'Paul', 'Barua'
];

const getRandomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const generateDemoUsers = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/microlearning-db');
    console.log('📊 Connected to database');

    // Hash password once (same for all users)
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    console.log('🔒 Password hashed');

    // Check how many demo users already exist
    const existingCount = await User.countDocuments({
      email: { $regex: /^\d+@gmail\.com$/ }
    });
    console.log(`📝 Found ${existingCount} existing demo users`);

    const usersToCreate: any[] = [];

    for (let i = 1; i <= DEMO_USERS_COUNT; i++) {
      const email = `${i}@gmail.com`;
      
      // Check if user already exists
      const exists = await User.findOne({ email });
      if (exists) {
        console.log(`⏭️  Skipping ${email} (already exists)`);
        continue;
      }

      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const name = `${firstName} ${lastName}`;

      usersToCreate.push({
        name,
        email,
        password: hashedPassword,
        role: 'learner',
        isVerified: true,
        profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200`,
        level: Math.floor(Math.random() * 10) + 1, // Level 1-10
        xp: Math.floor(Math.random() * 5000), // Random XP 0-5000
        bio: `Hi, I'm ${firstName}! Learning enthusiast on MicroLearning platform.`,
        badges: [],
        achievements: [],
        learningStreak: Math.floor(Math.random() * 30), // 0-30 days streak
        lastActive: new Date(),
      });
    }

    if (usersToCreate.length > 0) {
      await User.insertMany(usersToCreate);
      console.log(`✅ Created ${usersToCreate.length} demo users`);
    } else {
      console.log('ℹ️  All demo users already exist');
    }

    // Show summary
    const totalDemoUsers = await User.countDocuments({
      email: { $regex: /^\d+@gmail\.com$/ }
    });
    console.log(`\n📊 Total demo users in database: ${totalDemoUsers}`);
    console.log(`\n📧 Email format: 1@gmail.com to ${DEMO_USERS_COUNT}@gmail.com`);
    console.log(`🔑 Password for all: ${DEFAULT_PASSWORD}`);
    console.log('\n✨ Demo users seeded successfully!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo users:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

generateDemoUsers();
