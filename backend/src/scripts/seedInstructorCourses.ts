import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Course } from '../app/modules/course/course.model';
import User from '../app/modules/auth/auth.model';

dotenv.config();

const instructorEmail = 'instructor1@microlearning.com';

// Course data - 4 Free + 6 Paid
const coursesData = [
  // === FREE COURSES (4) ===
  {
    title: 'জাভাস্ক্রিপ্ট বেসিক টু অ্যাডভান্স',
    description: 'JavaScript এর সম্পূর্ণ গাইড। শুরু থেকে শেষ পর্যন্ত সব কিছু শিখুন। Variables, Functions, Objects, Arrays, ES6+, Async/Await, Promises এবং আরও অনেক কিছু। Real-world projects সহ হাতে-কলমে শেখার সুযোগ। এই কোর্সটি সম্পূর্ণ বাংলায় এবং নতুনদের জন্য perfect।',
    topic: 'JavaScript',
    difficulty: 'beginner',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800',
    estimatedDuration: 480, // 8 hours
    isPremium: false,
    price: 0,
    isPublished: true,
  },
  {
    title: 'HTML & CSS দিয়ে আধুনিক ওয়েবসাইট তৈরি',
    description: 'শূন্য থেকে শুরু করে professional ওয়েবসাইট তৈরি করা শিখুন। HTML5 এর সকল elements, CSS3 এর advanced styling, Flexbox, Grid Layout, Responsive Design, এবং modern CSS techniques। প্রতিটি lesson এ practical examples এবং projects। বাংলায় সহজ ভাষায় শেখার সুযোগ।',
    topic: 'Web Development',
    difficulty: 'beginner',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?w=800',
    estimatedDuration: 360, // 6 hours
    isPremium: false,
    price: 0,
    isPublished: true,
  },
  {
    title: 'Git & GitHub মাস্টারি কোর্স',
    description: 'Version control এর A to Z শিখুন। Git commands, branching, merging, conflict resolution, GitHub workflows, pull requests, collaboration, open source contribution, এবং professional Git practices। Developers দের জন্য must-have skill। Industry standard practices সহ।',
    topic: 'DevOps',
    difficulty: 'beginner',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800',
    estimatedDuration: 240, // 4 hours
    isPremium: false,
    price: 0,
    isPublished: true,
  },
  {
    title: 'প্রোগ্রামিং ফান্ডামেন্টালস',
    description: 'Programming এর মূল ভিত্তি শিখুন। Variables, Data Types, Operators, Conditionals, Loops, Functions, Arrays, Objects, এবং Problem Solving techniques। যেকোনো programming language শিখতে এই fundamentals দরকার। Logic building এবং algorithmic thinking develop করুন।',
    topic: 'Programming',
    difficulty: 'beginner',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800',
    estimatedDuration: 300, // 5 hours
    isPremium: false,
    price: 0,
    isPublished: true,
  },

  // === PAID COURSES (6) ===
  {
    title: 'React.js - দ্য কমপ্লিট মাস্টারক্লাস',
    description: 'Modern React development এর সম্পূর্ণ কোর্স। Components, Hooks, Context API, Redux Toolkit, React Router, Custom Hooks, Performance Optimization, Testing, এবং আরও অনেক কিছু। 10+ real-world projects সহ। Industry-ready skills অর্জন করুন। Next.js basics included। JWT authentication, API integration, এবং deployment strategies।',
    topic: 'React',
    difficulty: 'intermediate',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    estimatedDuration: 1200, // 20 hours
    isPremium: true,
    price: 2500,
    isPublished: true,
  },
  {
    title: 'Node.js & Express.js ব্যাকএন্ড ডেভেলপমেন্ট',
    description: 'Professional backend development শিখুন। Node.js fundamentals, Express.js framework, RESTful APIs, MongoDB, Mongoose, Authentication, Authorization, JWT, File Upload, Email Integration, Payment Gateway, Error Handling, Security best practices। Real production-level project তৈরি করুন। Microservices architecture introduction।',
    topic: 'Backend',
    difficulty: 'intermediate',
    thumbnailUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
    estimatedDuration: 1440, // 24 hours
    isPremium: true,
    price: 3000,
    isPublished: true,
  },
  {
    title: 'ফুলস্ট্যাক MERN ডেভেলপমেন্ট বুটক্যাম্প',
    description: 'MongoDB, Express, React, Node.js দিয়ে complete full-stack applications তৈরি করুন। 5টি major projects including E-commerce, Social Media, Blog Platform, Task Management, এবং Real-time Chat app। Redux, Socket.io, Payment Integration, AWS deployment, CI/CD, Docker basics, এবং professional development practices। Job-ready skills!',
    topic: 'Full Stack',
    difficulty: 'advanced',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    estimatedDuration: 2400, // 40 hours
    isPremium: true,
    price: 5000,
    isPublished: true,
  },
  {
    title: 'TypeScript প্রফেশনাল ডেভেলপমেন্ট',
    description: 'TypeScript এ expert হন। Type system, Interfaces, Generics, Decorators, Advanced Types, Type Guards, Utility Types, এবং best practices। React + TypeScript, Node.js + TypeScript projects। Enterprise-level code quality অর্জন করুন। Design patterns এবং SOLID principles implementation।',
    topic: 'TypeScript',
    difficulty: 'intermediate',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
    estimatedDuration: 900, // 15 hours
    isPremium: true,
    price: 2200,
    isPublished: true,
  },
  {
    title: 'Next.js 14 - সার্ভার কম্পোনেন্ট ও অ্যাপ রাউটার',
    description: 'Latest Next.js 14 দিয়ে modern web applications তৈরি করুন। App Router, Server Components, Server Actions, Streaming, Suspense, Route Handlers, Middleware, Image Optimization, Font Optimization, Metadata API, SEO best practices। Deploy to Vercel। Performance optimization techniques। Real e-commerce project।',
    topic: 'Next.js',
    difficulty: 'advanced',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800',
    estimatedDuration: 1080, // 18 hours
    isPremium: true,
    price: 3500,
    isPublished: true,
  },
  {
    title: 'MongoDB ডাটাবেস ডিজাইন ও অপটিমাইজেশন',
    description: 'Professional MongoDB database design এবং optimization শিখুন। Schema design patterns, Indexing strategies, Aggregation framework, Performance tuning, Replication, Sharding, Backup & Recovery, Security, Mongoose advanced features। Real-world data modeling scenarios। Atlas cloud deployment এবং monitoring।',
    topic: 'Database',
    difficulty: 'intermediate',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
    estimatedDuration: 720, // 12 hours
    isPremium: true,
    price: 2000,
    isPublished: true,
  },
];

const seedInstructorCourses = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/microlearning-db');
    console.log('📊 Connected to database');

    // Find instructor
    const instructor = await User.findOne({ email: instructorEmail });
    if (!instructor) {
      console.error('❌ Instructor not found with email:', instructorEmail);
      process.exit(1);
    }

    console.log(`👨‍🏫 Found instructor: ${instructor.name} (${instructor.email})`);

    // Check existing courses
    const existingCourses = await Course.find({ author: instructor._id });
    console.log(`📚 Existing courses: ${existingCourses.length}`);

    if (existingCourses.length > 0) {
      console.log('\n⚠️  Instructor already has courses. Delete them? (This will create fresh courses)');
      // For safety, we'll skip if courses exist
      console.log('ℹ️  Skipping course creation. Delete existing courses first if you want to recreate.');
      process.exit(0);
    }

    const createdCourses = [];

    // Create courses
    for (const courseData of coursesData) {
      const course = await Course.create({
        ...courseData,
        author: instructor._id,
        rating: Math.random() * 2 + 3, // Random rating between 3-5
        ratingCount: Math.floor(Math.random() * 500) + 50, // 50-550 ratings
        enrolledCount: Math.floor(Math.random() * 1000) + 100, // 100-1100 enrolled
      });

      createdCourses.push(course);
      console.log(`✅ Created: ${course.title} (${course.isPremium ? '৳' + course.price : 'FREE'})`);
    }

    // Summary
    const freeCourses = createdCourses.filter(c => !c.isPremium);
    const paidCourses = createdCourses.filter(c => c.isPremium);

    console.log('\n📊 Course Creation Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👨‍🏫 Instructor: ${instructor.name}`);
    console.log(`📧 Email: ${instructor.email}`);
    console.log(`📚 Total Courses: ${createdCourses.length}`);
    console.log(`🆓 Free Courses: ${freeCourses.length}`);
    console.log(`💰 Paid Courses: ${paidCourses.length}`);
    
    console.log('\n🆓 Free Courses:');
    freeCourses.forEach(c => {
      console.log(`   • ${c.title} (${c.difficulty})`);
    });
    
    console.log('\n💰 Paid Courses:');
    paidCourses.forEach(c => {
      console.log(`   • ${c.title} (৳${c.price}) - ${c.difficulty}`);
    });

    const totalRevenuePotential = paidCourses.reduce((sum, c) => sum + ((c.price || 0) * c.enrolledCount), 0);
    console.log(`\n💵 Total Revenue Potential: ৳${totalRevenuePotential.toLocaleString()}`);
    console.log('\n✨ All courses created successfully!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedInstructorCourses();
