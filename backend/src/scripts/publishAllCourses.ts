import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

const Course = require('../app/modules/course/course.model').Course;

const publishAllCourses = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/microlearning';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Update all courses to isPublished: true
    const result = await Course.updateMany(
      { isPublished: { $ne: true } },
      { $set: { isPublished: true } }
    );

    console.log(`✅ Updated ${result.modifiedCount} courses to published status`);

    // Show all courses with their publish status
    const courses = await Course.find({}, 'title isPublished author').populate('author', 'name');
    console.log('\n📚 All courses:');
    courses.forEach((course: any) => {
      console.log(`- ${course.title}: ${course.isPublished ? '✅ Published' : '❌ Unpublished'} (by ${course.author?.name})`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

publishAllCourses();
