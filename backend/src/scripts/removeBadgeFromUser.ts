import mongoose from 'mongoose';
import User from '../app/modules/auth/auth.model';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

const removeBadgeFromUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    const userId = process.argv[2];
    const badgeId = process.argv[3];

    if (!userId || !badgeId) {
      console.log('❌ Usage: npm run remove-badge <userId> <badgeId>');
      process.exit(1);
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log(`🔍 User: ${user.name}`);
    console.log(`🔍 Current badges: ${user.badges.length}`);

    // Remove badge from array
    user.badges = user.badges.filter((b: any) => b.toString() !== badgeId);
    await user.save({ validateBeforeSave: false });

    console.log(`✅ Badge removed! New badge count: ${user.badges.length}`);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

removeBadgeFromUser();
