// Simple JavaScript script to publish all courses
const mongoose = require('mongoose');
require('dotenv').config();

const courseSchema = new mongoose.Schema({}, { strict: false });
const Course = mongoose.model('Course', courseSchema);

async function publishAllCourses() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/microlearning';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Count before
    const unpublished = await Course.countDocuments({ isPublished: { $ne: true } });
    console.log(`📊 Found ${unpublished} unpublished courses`);

    // Update all courses
    const result = await Course.updateMany(
      { isPublished: { $ne: true } },
      { $set: { isPublished: true } }
    );

    console.log(`✅ Updated ${result.modifiedCount} courses to published`);

    // Show all courses
    const allCourses = await Course.find({}, 'title isPublished').lean();
    console.log('\n📚 All courses status:');
    allCourses.forEach(course => {
      console.log(`  ${course.isPublished ? '✅' : '❌'} ${course.title}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

publishAllCourses();
